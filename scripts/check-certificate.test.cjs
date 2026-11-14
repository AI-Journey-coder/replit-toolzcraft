const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { X509Certificate: NativeCertificate } = require('node:crypto');
const { rootCertificates } = require('node:tls');
const ts = require('typescript');
const base = path.resolve(__dirname, '../artifacts/toolkit');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(base, 'src/lib/certificate.ts'), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, {
  exports: exportsObject, require: name => require(require.resolve(name, {paths:[base]})), Uint8Array, Array, Date, Error,
});
test('certificate decoder matches native SHA256 fingerprint and certificate dates', async () => {
  for (const pem of [rootCertificates[0], rootCertificates.find(p => new NativeCertificate(p).publicKey.asymmetricKeyType === 'ec')]) {
    assert.ok(pem);
    const native = new NativeCertificate(pem);
    const parsed = await exportsObject.decodeCertificate(pem);
    assert.equal(parsed.fingerprintSha256, native.fingerprint256);
    assert.equal(parsed.validFrom, new Date(native.validFrom).toISOString());
    assert.equal(parsed.validTo, new Date(native.validTo).toISOString());
    assert.ok(parsed.subject.length > 0);
    assert.ok(parsed.publicKeyAlgorithm.length > 0);
  }
});
test('certificate decoder rejects malformed and oversized input', async () => {
  await assert.rejects(exportsObject.decodeCertificate('not a certificate'));
  await assert.rejects(exportsObject.decodeCertificate('x'.repeat(100001)), /too large/);
});
