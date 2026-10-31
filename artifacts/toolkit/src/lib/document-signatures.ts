export type SignatureCheck = {
  signature: number;
  integrity: "valid" | "invalid" | "unsupported";
  coverage: string;
  detail: string;
};
export function pdfSignatureRanges(bytes: Uint8Array) {
  if (bytes.length > 20 * 1024 * 1024)
    throw Error("Signature inspection is limited to 20 MB.");
  // Latin-1 conversion preserves byte offsets, including binary bytes above 127.
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  if (!text.startsWith("%PDF-")) throw Error("Choose a PDF file.");
  const matches = [
    ...text.matchAll(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/g),
  ];
  if (matches.length > 20) throw Error("Inspect up to 20 PDF signatures.");
  return matches.map((match) => {
    const [start, length, next, tail] = match.slice(1).map(Number);
    if (
      ![start, length, next, tail].every(Number.isSafeInteger) ||
      start !== 0 ||
      length <= 0 ||
      next <= length ||
      tail < 0 ||
      next + tail > bytes.length
    )
      throw Error("Invalid PDF signature byte range.");
    const gap = text.slice(length, next);
    if (
      !/^<[\da-fA-F\s]+>$/.test(gap) ||
      !/\/Contents\s*$/.test(text.slice(Math.max(0, length - 40), length))
    )
      throw Error(
        "Unsupported signature layout; excluded bytes are not a single signature value.",
      );
    const hex = gap.slice(1, -1).replace(/\s/g, "");
    if (hex.length % 2 || hex.length > 256000)
      throw Error("Invalid signature value.");
    const cms = Uint8Array.from(hex.match(/../g)!.map((h) => parseInt(h, 16))),
      signed = new Uint8Array(length + tail);
    signed.set(bytes.subarray(0, length));
    signed.set(bytes.subarray(next, next + tail), length);
    return { cms, signed, wholeFile: next + tail === bytes.length };
  });
}
export async function verifyPdfSignatures(
  file: File,
): Promise<SignatureCheck[]> {
  const ranges = pdfSignatureRanges(new Uint8Array(await file.arrayBuffer()));
  const [{ fromBER }, { ContentInfo, SignedData }] = await Promise.all([
    import("asn1js"),
    import("pkijs"),
  ]);
  const results: SignatureCheck[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i],
      coverage = range.wholeFile
        ? "Entire file except the signature value"
        : "Earlier signed revision only; later bytes are not covered";
    try {
      const parsed = fromBER(range.cms.buffer);
      if (parsed.offset < 0) throw Error("Invalid CMS");
      if (range.cms.subarray(parsed.offset).some((b) => b !== 0))
        throw Error("Unexpected signature padding");
      const cms = new ContentInfo({ schema: parsed.result });
      if (cms.contentType !== "1.2.840.113549.1.7.2")
        throw Error("Unsupported CMS content");
      const signed = new SignedData({ schema: cms.content });
      if (signed.signerInfos.length !== 1)
        throw Error("Unsupported signer count");
      const ok = await signed.verify({
        signer: 0,
        data: range.signed.buffer,
        checkChain: false,
      });
      results.push({
        signature: i + 1,
        integrity: ok ? "valid" : "invalid",
        coverage,
        detail: ok
          ? "Cryptographic signature matches the covered bytes. Certificate trust, revocation, timestamp validity and issuer identity have NOT been verified. This is not proof of document authenticity."
          : "Cryptographic verification failed for the covered bytes.",
      });
    } catch {
      results.push({
        signature: i + 1,
        integrity: "unsupported",
        coverage,
        detail:
          "Unable to validate this signature format or algorithm. Use a trusted PDF-signature validator; no authenticity conclusion is made.",
      });
    }
  }
  return results;
}
