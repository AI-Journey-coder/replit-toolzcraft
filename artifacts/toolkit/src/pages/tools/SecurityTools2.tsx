import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, ShieldCheck, ShieldX } from "lucide-react";
import forge from "node-forge";

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

function CopyBtn({ text }: { text: string }) {
  const { copied, copy } = useCopy(text);
  return (
    <Button size="sm" variant="ghost" onClick={copy} className="h-7 px-2" disabled={!text}>
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

// ─── MD5 (standalone, no deps) ─────────────────────────────────────────────

function md5(str: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); const msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); }
  function bitRotateLeft(num: number, cnt: number) { return (num << cnt) | (num >>> (32 - cnt)); }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

  const m = unescape(encodeURIComponent(str));
  const l = m.length;
  const words: number[] = [];
  for (let i = 0; i < l; i++) { words[i >> 2] |= m.charCodeAt(i) << ((i % 4) * 8); }
  words[l >> 2] |= 0x80 << ((l % 4) * 8);
  words[(((l + 64) >>> 9) << 4) + 14] = l * 8;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < words.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d];
    a = md5ff(a, b, c, d, words[i], 7, -680876936); d = md5ff(d, a, b, c, words[i + 1], 12, -389564586); c = md5ff(c, d, a, b, words[i + 2], 17, 606105819); b = md5ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, words[i + 4], 7, -176418897); d = md5ff(d, a, b, c, words[i + 5], 12, 1200080426); c = md5ff(c, d, a, b, words[i + 6], 17, -1473231341); b = md5ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, words[i + 8], 7, 1770035416); d = md5ff(d, a, b, c, words[i + 9], 12, -1958414417); c = md5ff(c, d, a, b, words[i + 10], 17, -42063); b = md5ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, words[i + 12], 7, 1804603682); d = md5ff(d, a, b, c, words[i + 13], 12, -40341101); c = md5ff(c, d, a, b, words[i + 14], 17, -1502002290); b = md5ff(b, c, d, a, words[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, words[i + 1], 5, -165796510); d = md5gg(d, a, b, c, words[i + 6], 9, -1069501632); c = md5gg(c, d, a, b, words[i + 11], 14, 643717713); b = md5gg(b, c, d, a, words[i], 20, -373897302);
    a = md5gg(a, b, c, d, words[i + 5], 5, -701558691); d = md5gg(d, a, b, c, words[i + 10], 9, 38016083); c = md5gg(c, d, a, b, words[i + 15], 14, -660478335); b = md5gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, words[i + 9], 5, 568446438); d = md5gg(d, a, b, c, words[i + 14], 9, -1019803690); c = md5gg(c, d, a, b, words[i + 3], 14, -187363961); b = md5gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, words[i + 13], 5, -1444681467); d = md5gg(d, a, b, c, words[i + 2], 9, -51403784); c = md5gg(c, d, a, b, words[i + 7], 14, 1735328473); b = md5gg(b, c, d, a, words[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, words[i + 5], 4, -378558); d = md5hh(d, a, b, c, words[i + 8], 11, -2022574463); c = md5hh(c, d, a, b, words[i + 11], 16, 1839030562); b = md5hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, words[i + 1], 4, -1530992060); d = md5hh(d, a, b, c, words[i + 4], 11, 1272893353); c = md5hh(c, d, a, b, words[i + 7], 16, -155497632); b = md5hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, words[i + 13], 4, 681279174); d = md5hh(d, a, b, c, words[i], 11, -358537222); c = md5hh(c, d, a, b, words[i + 3], 16, -722521979); b = md5hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, words[i + 9], 4, -640364487); d = md5hh(d, a, b, c, words[i + 12], 11, -421815835); c = md5hh(c, d, a, b, words[i + 15], 16, 530742520); b = md5hh(b, c, d, a, words[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, words[i], 6, -198630844); d = md5ii(d, a, b, c, words[i + 7], 10, 1126891415); c = md5ii(c, d, a, b, words[i + 14], 15, -1416354905); b = md5ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, words[i + 12], 6, 1700485571); d = md5ii(d, a, b, c, words[i + 3], 10, -1894986606); c = md5ii(c, d, a, b, words[i + 10], 15, -1051523); b = md5ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, words[i + 8], 6, 1873313359); d = md5ii(d, a, b, c, words[i + 15], 10, -30611744); c = md5ii(c, d, a, b, words[i + 6], 15, -1560198380); b = md5ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, words[i + 4], 6, -145523070); d = md5ii(d, a, b, c, words[i + 11], 10, -1120210379); c = md5ii(c, d, a, b, words[i + 2], 15, 718787259); b = md5ii(b, c, d, a, words[i + 9], 21, -343485551);
    a = safeAdd(a, oa); b = safeAdd(b, ob); c = safeAdd(c, oc); d = safeAdd(d, od);
  }

  return [a, b, c, d].map(n => {
    const hex = (n >>> 0).toString(16).padStart(8, "0");
    return hex.match(/../g)!.reverse().join("");
  }).join("");
}

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── MD5 Hash Generator ─────────────────────────────────────────────────────

export function Md5Generator() {
  const [input, setInput] = useState("");
  const hash = input ? md5(input) : "";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>MD5 Hash Generator</CardTitle>
        <CardDescription>Generate the MD5 digest of any text, entirely in your browser</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea className="font-mono min-h-[120px]" placeholder="Enter text to hash..." value={input} onChange={e => setInput(e.target.value)} data-testid="textarea-input" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label>MD5 Digest</Label>
            <CopyBtn text={hash} />
          </div>
          <div className="p-3 bg-muted/50 rounded-md font-mono text-sm break-all border border-border/50 min-h-[2.5rem]" data-testid="text-hash">
            {hash || "Output appears here..."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SHA-256 Hash Generator ─────────────────────────────────────────────────

export function Sha256Generator() {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");

  const generate = async (val: string) => {
    setInput(val);
    setHash(val ? await sha256(val) : "");
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>SHA-256 Hash Generator</CardTitle>
        <CardDescription>Generate a SHA-256 digest using the browser's native Web Crypto API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea className="font-mono min-h-[120px]" placeholder="Enter text to hash..." value={input} onChange={e => generate(e.target.value)} data-testid="textarea-input" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label>SHA-256 Digest</Label>
            <CopyBtn text={hash} />
          </div>
          <div className="p-3 bg-muted/50 rounded-md font-mono text-sm break-all border border-border/50 min-h-[2.5rem]" data-testid="text-hash">
            {hash || "Output appears here..."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SSL Certificate Decoder ────────────────────────────────────────────────

interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  fingerprintSha256: string;
  san: string[];
  isExpired: boolean;
}

function decodeCertificate(pem: string): CertInfo {
  const cert = forge.pki.certificateFromPem(pem);
  const subject = cert.subject.attributes.map(a => `${a.shortName}=${a.value}`).join(", ");
  const issuer = cert.issuer.attributes.map(a => `${a.shortName}=${a.value}`).join(", ");
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const fingerprintSha256 = forge.md.sha256.create().update(der).digest().toHex().match(/../g)!.join(":").toUpperCase();
  let san: string[] = [];
  const ext = cert.getExtension("subjectAltName") as any;
  if (ext?.altNames) san = ext.altNames.map((n: any) => n.value);

  return {
    subject,
    issuer,
    validFrom: cert.validity.notBefore.toISOString(),
    validTo: cert.validity.notAfter.toISOString(),
    serialNumber: cert.serialNumber,
    signatureAlgorithm: cert.siginfo.algorithmOid,
    publicKeyAlgorithm: (cert.publicKey as any).n ? "RSA" : "EC",
    fingerprintSha256,
    san,
    isExpired: cert.validity.notAfter.getTime() < Date.now(),
  };
}

export function SslCertDecoder() {
  const [pem, setPem] = useState("");
  const [info, setInfo] = useState<CertInfo | null>(null);
  const [error, setError] = useState("");

  const decode = () => {
    setError("");
    setInfo(null);
    try {
      setInfo(decodeCertificate(pem.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse certificate. Make sure it's a valid PEM-encoded X.509 certificate.");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>SSL Certificate Decoder</CardTitle>
        <CardDescription>Paste a PEM-encoded certificate to inspect its details, all decoded locally</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>PEM Certificate</Label>
          <Textarea
            className="font-mono min-h-[160px] text-xs"
            placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
            value={pem}
            onChange={e => setPem(e.target.value)}
            data-testid="textarea-pem"
          />
        </div>
        <Button onClick={decode} disabled={!pem.trim()} data-testid="btn-decode">Decode Certificate</Button>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive" data-testid="text-error">{error}</div>
        )}

        {info && (
          <div className="space-y-3" data-testid="cert-info">
            <div className="flex items-center gap-2">
              {info.isExpired ? (
                <Badge variant="destructive" className="gap-1"><ShieldX className="h-3.5 w-3.5" /> Expired</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 text-green-600"><ShieldCheck className="h-3.5 w-3.5" /> Valid Period</Badge>
              )}
            </div>
            <Field label="Subject" value={info.subject} />
            <Field label="Issuer" value={info.issuer} />
            <Field label="Valid From" value={info.validFrom} />
            <Field label="Valid To" value={info.validTo} />
            <Field label="Serial Number" value={info.serialNumber} />
            <Field label="Signature Algorithm OID" value={info.signatureAlgorithm} />
            <Field label="Public Key Algorithm" value={info.publicKeyAlgorithm} />
            <Field label="SHA-256 Fingerprint" value={info.fingerprintSha256} mono />
            {info.san.length > 0 && <Field label="Subject Alt Names" value={info.san.join(", ")} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <CopyBtn text={value} />
      </div>
      <div className={`p-2.5 bg-muted/50 rounded-md text-sm break-all border border-border/50 ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

// ─── SAML Response Decoder ──────────────────────────────────────────────────

function prettyPrintXml(xml: string): string {
  const PADDING = "  ";
  const reg = /(>)(<)(\/*)/g;
  let formatted = xml.replace(reg, "$1\n$2$3");
  let pad = 0;
  return formatted.split("\n").map(line => {
    let indent = 0;
    if (/^<\/\w/.test(line)) { pad -= 1; }
    else if (/^<\w[^>]*[^\/]>.*$/.test(line)) { indent = 1; }
    const padding = PADDING.repeat(Math.max(pad, 0));
    pad += indent;
    return padding + line;
  }).join("\n");
}

export function SamlDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const decode = () => {
    setError("");
    setOutput("");
    try {
      const trimmed = input.trim();
      const decoded = atob(trimmed.replace(/\s/g, ""));
      setOutput(prettyPrintXml(decoded));
    } catch {
      setError("Could not base64-decode this input. Paste a raw SAMLRequest/SAMLResponse base64 value.");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>SAML Decoder</CardTitle>
        <CardDescription>Decode a base64 SAMLRequest/SAMLResponse into readable XML, locally in your browser</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Base64 SAML Payload</Label>
          <Textarea className="font-mono min-h-[140px] text-xs" placeholder="PHNhbWxwOlJlc3BvbnNlIC4uLg==" value={input} onChange={e => setInput(e.target.value)} data-testid="textarea-input" />
        </div>
        <Button onClick={decode} disabled={!input.trim()} data-testid="btn-decode">Decode</Button>
        {error && <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">{error}</div>}
        {output && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label>Decoded XML</Label>
              <CopyBtn text={output} />
            </div>
            <pre className="p-3 bg-muted/50 rounded-md font-mono text-xs overflow-auto border border-border/50 max-h-[400px]" data-testid="text-output">{output}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── IMEI Validator ─────────────────────────────────────────────────────────

function validateImei(imei: string): { valid: boolean; reason?: string; tac?: string; snr?: string; checkDigit?: string } {
  const clean = imei.replace(/[\s-]/g, "");
  if (!/^\d{15}$/.test(clean)) {
    return { valid: false, reason: "IMEI must be exactly 15 digits" };
  }
  const digits = clean.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = digits[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const computedCheck = (10 - (sum % 10)) % 10;
  const actualCheck = digits[14];
  const valid = computedCheck === actualCheck;
  return {
    valid,
    reason: valid ? undefined : `Check digit mismatch: expected ${computedCheck}, got ${actualCheck}`,
    tac: clean.slice(0, 8),
    snr: clean.slice(8, 14),
    checkDigit: clean.slice(14, 15),
  };
}

export function ImeiValidator() {
  const [input, setInput] = useState("");
  const result = input.trim() ? validateImei(input.trim()) : null;

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>IMEI Validator</CardTitle>
        <CardDescription>Validate a 15-digit IMEI number using the Luhn check-digit algorithm</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>IMEI Number</Label>
          <Input className="font-mono" placeholder="490154203237518" value={input} onChange={e => setInput(e.target.value)} data-testid="input-imei" maxLength={17} />
        </div>

        {result && (
          <div className="space-y-3" data-testid="result-imei">
            <div>
              {result.valid ? (
                <Badge variant="secondary" className="gap-1 text-green-600"><ShieldCheck className="h-3.5 w-3.5" /> Valid IMEI</Badge>
              ) : (
                <Badge variant="destructive" className="gap-1"><ShieldX className="h-3.5 w-3.5" /> Invalid IMEI</Badge>
              )}
            </div>
            {result.reason && <p className="text-sm text-muted-foreground">{result.reason}</p>}
            {result.valid && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">TAC</Label>
                  <div className="p-2 bg-muted/50 rounded-md font-mono border border-border/50">{result.tac}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Serial Number</Label>
                  <div className="p-2 bg-muted/50 rounded-md font-mono border border-border/50">{result.snr}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Check Digit</Label>
                  <div className="p-2 bg-muted/50 rounded-md font-mono border border-border/50">{result.checkDigit}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
