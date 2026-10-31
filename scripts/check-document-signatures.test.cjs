const test = require("node:test"),
  assert = require("node:assert/strict"),
  path = require("node:path"),
  load = require("./load-ts-test.cjs");
const req = (n) =>
  require(require.resolve(n, { paths: [path.resolve("artifacts/toolkit")] }));
const asn1 = req("asn1js"),
  pki = req("pkijs"),
  crypto = require("node:crypto").webcrypto;
pki.setEngine(
  "test",
  crypto,
  new pki.CryptoEngine({ name: "test", crypto, subtle: crypto.subtle }),
);
const { pdfSignatureRanges, verifyPdfSignatures } = load(
  "artifacts/toolkit/src/lib/document-signatures.ts",
  { asn1js: asn1, pkijs: pki },
);
test("signature parser rejects unsafe ranges and never treats ordinary PDFs as signed", () => {
  assert.equal(
    pdfSignatureRanges(new TextEncoder().encode("%PDF-1.7\n%%EOF")).length,
    0,
  );
  assert.throws(() =>
    pdfSignatureRanges(
      new TextEncoder().encode("%PDF-1.7 /ByteRange [0 500 200 100]"),
    ),
  );
  assert.throws(() =>
    pdfSignatureRanges(
      new TextEncoder().encode("%PDF-1.7 /ByteRange [0 1 2 999999]"),
    ),
  );
});
test("local CMS verification detects modified signed bytes and identifies unsigned later revisions", async () => {
  const keys = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const cert = new pki.Certificate();
  cert.version = 2;
  cert.serialNumber = new asn1.Integer({ value: 1 });
  const common = new pki.AttributeTypeAndValue({
    type: "2.5.4.3",
    value: new asn1.Utf8String({ value: "Synthetic test signer" }),
  });
  cert.issuer.typesAndValues.push(common);
  cert.subject.typesAndValues.push(common);
  cert.notBefore.value = new Date(Date.now() - 86400000);
  cert.notAfter.value = new Date(Date.now() + 86400000);
  await cert.subjectPublicKeyInfo.importKey(keys.publicKey);
  await cert.sign(keys.privateKey, "SHA-256");
  let pdf =
    "%PDF-1.7\n1 0 obj << /Type /Sig /ByteRange [0000000000 1111111111 2222222222 3333333333] /Contents <" +
    "0".repeat(16384) +
    "> >> endobj\n%%EOF";
  const start = pdf.indexOf("<", pdf.indexOf("/Contents")),
    next = start + 16386;
  pdf = pdf
    .replace("1111111111", String(start).padStart(10, "0"))
    .replace("2222222222", String(next).padStart(10, "0"))
    .replace("3333333333", String(pdf.length - next).padStart(10, "0"));
  const bytes = new TextEncoder().encode(pdf),
    signed = new Uint8Array(start + bytes.length - next);
  signed.set(bytes.subarray(0, start));
  signed.set(bytes.subarray(next), start);
  const cms = new pki.SignedData({
    encapContentInfo: new pki.EncapsulatedContentInfo({
      eContentType: "1.2.840.113549.1.7.1",
    }),
    certificates: [cert],
    signerInfos: [
      new pki.SignerInfo({
        sid: new pki.IssuerAndSerialNumber({
          issuer: cert.issuer,
          serialNumber: cert.serialNumber,
        }),
      }),
    ],
  });
  await cms.sign(keys.privateKey, 0, "SHA-256", signed.buffer);
  const encoded = new Uint8Array(
    new pki.ContentInfo({
      contentType: "1.2.840.113549.1.7.2",
      content: cms.toSchema(true),
    })
      .toSchema()
      .toBER(false),
  );
  const hex = Buffer.from(encoded).toString("hex");
  assert.ok(hex.length < 16384);
  pdf = pdf.slice(0, start + 1) + hex.padEnd(16384, "0") + pdf.slice(next - 1);
  const file = (value) => ({
    arrayBuffer: async () => new TextEncoder().encode(value).buffer,
  });
  const valid = await verifyPdfSignatures(file(pdf));
  assert.equal(valid[0].integrity, "valid");
  assert.match(valid[0].detail, /NOT been verified/);
  const changed = await verifyPdfSignatures(
    file(pdf.replace("1 0 obj", "2 0 obj")),
  );
  assert.notEqual(changed[0].integrity, "valid");
  const appended = await verifyPdfSignatures(file(pdf + "\nLater revision"));
  assert.equal(appended[0].integrity, "valid");
  assert.match(appended[0].coverage, /Earlier signed revision/);
});
test("calendar reminders reject guessed dates and escape injected calendar properties", () => {
  const { documentReminder } = load(
    "artifacts/toolkit/src/lib/document-calendar.ts",
  );
  assert.throws(() =>
    documentReminder("2026-02-30", "Deadline", "Source", "abc"),
  );
  const text = documentReminder(
    "2026-10-28",
    "Review\nATTENDEE:someone@example.com",
    "₹850; amount",
    "abc",
    new Date("2026-10-01T00:00:00Z"),
  );
  assert.match(text, /DTSTART;VALUE=DATE:20261028/);
  assert.match(text, /DTEND;VALUE=DATE:20261029/);
  assert.doesNotMatch(text, /\r\nATTENDEE:/);
  assert.match(text, /\\nATTENDEE/);
});
