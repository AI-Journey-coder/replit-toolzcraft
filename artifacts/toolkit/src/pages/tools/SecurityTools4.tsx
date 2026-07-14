import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCheck, Eye, EyeOff } from "lucide-react";
import bcrypt from "bcryptjs";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); }} disabled={!text}>
      {ok ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}

// ─── Bcrypt Generator ─────────────────────────────────────────────────────────
export function BcryptGenerator() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!password) return;
    setLoading(true); setHash("");
    const h = await bcrypt.hash(password, rounds);
    setHash(h); setLoading(false);
  };

  const verify = async () => {
    if (!verifyInput || !hash) return;
    const ok = await bcrypt.compare(verifyInput, hash);
    setVerifyResult(ok);
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Bcrypt Hash Generator</CardTitle><CardDescription>Generate bcrypt password hashes with configurable salt rounds — runs entirely in your browser</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Password</Label>
          <div className="relative">
            <Input type={show ? "text" : "password"} className="font-mono pr-10" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password to hash…" />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShow(!show)}>{show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Salt rounds (cost factor): {rounds} — ~{(2 ** rounds / 1e6).toFixed(0)}M iterations</Label>
          <input type="range" min={4} max={14} value={rounds} onChange={e => setRounds(parseInt(e.target.value))} className="w-full h-2 cursor-pointer" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>4 (fast, insecure)</span><span>14 (slow, very secure)</span></div>
        </div>
        <Button onClick={generate} disabled={!password || loading}>{loading ? "Hashing…" : "Generate Hash"}</Button>
        {hash && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>Bcrypt hash</Label><CopyBtn text={hash} /></div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border break-all">{hash}</div>
          </div>
        )}
        {hash && (
          <div className="space-y-2 pt-2 border-t border-border">
            <Label>Verify password against hash</Label>
            <div className="flex gap-2">
              <Input type="password" className="font-mono flex-1" value={verifyInput} onChange={e => { setVerifyInput(e.target.value); setVerifyResult(null); }} placeholder="Enter password to verify…" />
              <Button variant="outline" onClick={verify} disabled={!verifyInput}>Verify</Button>
            </div>
            {verifyResult !== null && (
              <div className={`text-sm font-medium p-2 rounded-lg text-center ${verifyResult ? "text-green-500 bg-green-500/10 border border-green-500/30" : "text-red-500 bg-red-500/10 border border-red-500/30"}`}>
                {verifyResult ? "✓ Password matches!" : "✗ Password does not match"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SRI Hash Generator ────────────────────────────────────────────────────────
export function SriHashGenerator() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [algo, setAlgo] = useState("SHA-384");
  const [sriHash, setSriHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateFromContent = async () => {
    if (!content) return;
    setError(""); setLoading(true);
    try {
      const data = new TextEncoder().encode(content);
      const hash = await crypto.subtle.digest(algo.replace("-", "-"), data);
      const b64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
      setSriHash(`${algo.toLowerCase().replace("-", "")}=${b64}`);
    } catch (e) { setError("Hash generation failed"); }
    setLoading(false);
  };

  const fetchAndHash = async () => {
    if (!url) return;
    setError(""); setLoading(true); setSriHash("");
    try {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const hash = await crypto.subtle.digest(algo.replace("-", "-"), buf);
      const b64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
      setSriHash(`${algo.toLowerCase().replace("-", "")}=${b64}`);
    } catch { setError("Failed to fetch URL — try pasting content directly"); }
    setLoading(false);
  };

  const integrity = sriHash ? `integrity="${sriHash}" crossorigin="anonymous"` : "";
  const scriptTag = url ? `<script src="${url}" ${integrity}></script>` : "";
  const linkTag = url ? `<link rel="stylesheet" href="${url}" ${integrity}>` : "";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>SRI Hash Generator</CardTitle><CardDescription>Generate Subresource Integrity hashes for CDN scripts and stylesheets</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Hash algorithm</Label>
          <Select value={algo} onValueChange={setAlgo}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="SHA-256">SHA-256</SelectItem><SelectItem value="SHA-384">SHA-384</SelectItem><SelectItem value="SHA-512">SHA-512</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>CDN URL (optional)</Label><div className="flex gap-2"><Input className="font-mono text-xs flex-1" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://cdn.example.com/library.min.js" /><Button variant="outline" size="sm" onClick={fetchAndHash} disabled={!url || loading}>Fetch & Hash</Button></div></div>
        <div className="space-y-1.5"><Label>Or paste file content</Label><Textarea className="font-mono text-xs min-h-[80px]" value={content} onChange={e => setContent(e.target.value)} placeholder="Paste the file content here…" /><Button size="sm" variant="outline" onClick={generateFromContent} disabled={!content || loading}>Hash content</Button></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {sriHash && (
          <>
            <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>SRI hash</Label><CopyBtn text={sriHash} /></div><div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border break-all">{sriHash}</div></div>
            {url && (
              <>
                <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>&lt;script&gt; tag</Label><CopyBtn text={scriptTag} /></div><pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto">{scriptTag}</pre></div>
                <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>&lt;link&gt; tag</Label><CopyBtn text={linkTag} /></div><pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto">{linkTag}</pre></div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── TOTP Generator ────────────────────────────────────────────────────────────
async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", key.buffer as BufferSource, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, data.buffer as BufferSource);
  return new Uint8Array(sig);
}
function base32ToBytes(s: string): Uint8Array {
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  s = s.toUpperCase().replace(/=+$/, "");
  let bits = 0, val = 0;
  const bytes: number[] = [];
  for (const c of s) { const i = ALPHA.indexOf(c); if (i < 0) continue; val = (val << 5) | i; bits += 5; if (bits >= 8) { bytes.push((val >>> (bits - 8)) & 255); bits -= 8; } }
  return new Uint8Array(bytes);
}
async function generateTotp(secret: string, step = 30, digits = 6): Promise<string> {
  const counter = Math.floor(Date.now() / 1000 / step);
  const counterBytes = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { counterBytes[i] = c & 0xFF; c >>= 8; }
  const key = base32ToBytes(secret);
  const hmac = await hmacSha1(key, counterBytes);
  const offset = hmac[hmac.length - 1] & 0xF;
  const code = ((hmac[offset] & 0x7F) << 24 | (hmac[offset+1] & 0xFF) << 16 | (hmac[offset+2] & 0xFF) << 8 | (hmac[offset+3] & 0xFF)) % (10 ** digits);
  return code.toString().padStart(digits, "0");
}

export function TotpGenerator() {
  const [secret, setSecret] = useState("JBSWY3DPEHPK3PXP");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(() => 30 - (Math.floor(Date.now() / 1000) % 30));

  const generate = async () => {
    if (!secret) return;
    setError(""); setLoading(true);
    try {
      const code = await generateTotp(secret);
      setOtp(code);
      const tick = setInterval(() => {
        setCountdown(30 - (Math.floor(Date.now() / 1000) % 30));
      }, 1000);
      setTimeout(() => clearInterval(tick), 60000);
    } catch { setError("Invalid Base32 secret"); }
    setLoading(false);
  };

  const newSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const arr = new Uint8Array(20);
    crypto.getRandomValues(arr);
    setSecret(Array.from(arr).map(b => chars[b % 32]).join(""));
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>TOTP Generator</CardTitle><CardDescription>Generate time-based one-time passwords (RFC 6238) using a Base32 secret</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Secret key (Base32)</Label>
          <div className="flex gap-2"><Input className="font-mono text-sm flex-1" value={secret} onChange={e => setSecret(e.target.value.toUpperCase())} /><Button size="sm" variant="outline" onClick={newSecret}>Generate</Button></div>
        </div>
        <Button onClick={generate} disabled={!secret || loading}>{loading ? "Generating…" : "Generate OTP"}</Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {otp && (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center">
              <div className="text-5xl font-black font-mono tracking-[0.4em] text-primary">{otp}</div>
              <div className="mt-3 text-xs text-muted-foreground">Expires in</div>
              <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden mx-8">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(countdown / 30) * 100}%` }} />
              </div>
              <div className="text-sm font-mono mt-1 text-primary">{countdown}s</div>
            </div>
            <p className="text-xs text-muted-foreground text-center">Generated locally — your secret never leaves your browser.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── RSA Key Generator ────────────────────────────────────────────────────────
export function RsaKeyGenerator() {
  const [keySize, setKeySize] = useState(2048);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setPublicKey(""); setPrivateKey("");
    try {
      const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
      const pub = await crypto.subtle.exportKey("spki", pair.publicKey);
      const priv = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
      const toBase64 = (buf: ArrayBuffer) => { let b = ""; new Uint8Array(buf).forEach(b2 => b += String.fromCharCode(b2)); return btoa(b); };
      const wrap = (type: string, b64: string) => `-----BEGIN ${type}-----\n${b64.match(/.{1,64}/g)!.join("\n")}\n-----END ${type}-----`;
      setPublicKey(wrap("PUBLIC KEY", toBase64(pub)));
      setPrivateKey(wrap("PRIVATE KEY", toBase64(priv)));
    } catch { }
    setLoading(false);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>RSA Key Generator</CardTitle><CardDescription>Generate RSA public/private key pairs using Web Crypto — all processing is client-side</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="space-y-1.5"><Label>Key size</Label>
            <Select value={keySize.toString()} onValueChange={v => setKeySize(parseInt(v))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="1024">1024 bits</SelectItem><SelectItem value="2048">2048 bits</SelectItem><SelectItem value="4096">4096 bits</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading}>{loading ? "Generating…" : "Generate Key Pair"}</Button>
        </div>
        {publicKey && (
          <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>Public key (SPKI)</Label><CopyBtn text={publicKey} /></div><Textarea readOnly className="font-mono text-xs min-h-[120px]" value={publicKey} /></div>
        )}
        {privateKey && (
          <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>Private key (PKCS#8)</Label><CopyBtn text={privateKey} /></div><Textarea readOnly className="font-mono text-xs min-h-[160px]" value={privateKey} />
            <p className="text-xs text-destructive font-medium">⚠ Keep your private key secret — never share it or store it in a public location.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Hash Identifier ─────────────────────────────────────────────────────────
interface HashPattern { name: string; regex: RegExp; note: string }
const HASH_PATTERNS: HashPattern[] = [
  { name: "MD5", regex: /^[a-f0-9]{32}$/i, note: "32 hex chars — broken, do not use for security" },
  { name: "SHA-1", regex: /^[a-f0-9]{40}$/i, note: "40 hex chars — deprecated" },
  { name: "SHA-224", regex: /^[a-f0-9]{56}$/i, note: "56 hex chars" },
  { name: "SHA-256", regex: /^[a-f0-9]{64}$/i, note: "64 hex chars — widely used" },
  { name: "SHA-384", regex: /^[a-f0-9]{96}$/i, note: "96 hex chars" },
  { name: "SHA-512", regex: /^[a-f0-9]{128}$/i, note: "128 hex chars — highly secure" },
  { name: "Bcrypt", regex: /^\$2[ayb]\$\d{2}\$[./A-Za-z0-9]{53}$/, note: "60 chars — password hashing" },
  { name: "Argon2", regex: /^\$argon2/, note: "Modern password hashing algorithm" },
  { name: "PBKDF2 (base64)", regex: /^[A-Za-z0-9+/]{43}={0,2}$/, note: "Possible PBKDF2 base64 output" },
  { name: "MD5 (base64)", regex: /^[A-Za-z0-9+/]{22}={2}$/, note: "Possible MD5 in base64" },
  { name: "NTLM", regex: /^[a-f0-9]{32}$/i, note: "Same length as MD5 — Windows password hash" },
  { name: "UUID / GUID", regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, note: "Universally unique identifier" },
  { name: "CRC32", regex: /^[a-f0-9]{8}$/i, note: "8 hex chars — checksum only, not cryptographic" },
];

export function HashIdentifier() {
  const [hash, setHash] = useState("5f4dcc3b5aa765d61d8327deb882cf99");
  const matches = HASH_PATTERNS.filter(p => p.regex.test(hash.trim()));

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Hash Identifier</CardTitle><CardDescription>Identify the likely algorithm from a hash string based on length and format</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Hash string</Label><Input className="font-mono text-sm" value={hash} onChange={e => setHash(e.target.value)} placeholder="Paste any hash here…" /></div>
        <div className="text-xs text-muted-foreground font-mono">Length: {hash.trim().length} chars</div>
        {hash.trim().length > 0 && (
          matches.length > 0 ? (
            <div className="space-y-2">
              <Label>{matches.length} possible algorithm{matches.length !== 1 ? "s" : ""}</Label>
              {matches.map(m => (
                <div key={m.name} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div><div className="font-bold text-sm">{m.name}</div><div className="text-xs text-muted-foreground mt-0.5">{m.note}</div></div>
                </div>
              ))}
            </div>
          ) : <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border">No known hash pattern matched. Could be a custom, salted, or non-standard hash.</div>
        )}
      </CardContent>
    </Card>
  );
}
