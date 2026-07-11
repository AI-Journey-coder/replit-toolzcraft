import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCheck, Eye, EyeOff } from "lucide-react";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { if (!text) return; navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={copy} disabled={!text}>
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

// ─── Password Strength Checker ────────────────────────────────────────────────
function checkStrength(p: string) {
  const checks = [
    { label: "At least 8 characters", ok: p.length >= 8 },
    { label: "At least 12 characters", ok: p.length >= 12 },
    { label: "Lowercase letters (a-z)", ok: /[a-z]/.test(p) },
    { label: "Uppercase letters (A-Z)", ok: /[A-Z]/.test(p) },
    { label: "Numbers (0-9)", ok: /\d/.test(p) },
    { label: "Special characters (!@#$…)", ok: /[^a-zA-Z0-9]/.test(p) },
    { label: "No common patterns", ok: !/^(password|123456|qwerty|abc123)/i.test(p) },
    { label: "Length ≥ 16 characters", ok: p.length >= 16 },
  ];
  const score = checks.filter(c => c.ok).length;
  const level = score <= 2 ? "Very Weak" : score <= 4 ? "Weak" : score <= 5 ? "Fair" : score <= 6 ? "Strong" : "Very Strong";
  const color = score <= 2 ? "bg-red-500" : score <= 4 ? "bg-orange-500" : score <= 5 ? "bg-yellow-500" : score <= 6 ? "bg-blue-500" : "bg-green-500";
  const textColor = score <= 2 ? "text-red-500" : score <= 4 ? "text-orange-500" : score <= 5 ? "text-yellow-500" : score <= 6 ? "text-blue-500" : "text-green-500";
  const entropy = p.length > 0 ? Math.round(p.length * Math.log2(
    (/[a-z]/.test(p) ? 26 : 0) + (/[A-Z]/.test(p) ? 26 : 0) + (/\d/.test(p) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(p) ? 32 : 0) || 1
  )) : 0;
  return { checks, score, level, color, textColor, entropy };
}
export function PasswordStrengthChecker() {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const st = checkStrength(pwd);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Password Strength Checker</CardTitle><CardDescription>Analyze password entropy and check against security requirements</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Password</Label>
          <div className="relative">
            <Input type={show ? "text" : "password"} className="font-mono pr-10" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Enter password…" autoComplete="off" />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShow(!show)}>
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        {pwd && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`font-bold text-sm ${st.textColor}`}>{st.level}</span>
                <span className="text-xs text-muted-foreground font-mono">{st.entropy} bits entropy</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${st.color} rounded-full transition-all`} style={{ width: `${(st.score / 8) * 100}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              {st.checks.map(c => (
                <div key={c.label} className={`flex items-center gap-2 text-xs ${c.ok ? "text-green-500" : "text-muted-foreground"}`}>
                  <span className="w-3 text-center">{c.ok ? "✓" : "○"}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border/50">
              <strong>Estimated crack time:</strong> {st.score <= 3 ? "Seconds to minutes" : st.score <= 5 ? "Hours to days" : st.score <= 6 ? "Months to years" : "Centuries (with current hardware)"}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── AES Encryption / Decryption ──────────────────────────────────────────────
async function aesEncrypt(text: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
  const out = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  out.set(salt); out.set(iv, 16); out.set(new Uint8Array(encrypted), 28);
  return btoa(String.fromCharCode(...out));
}
async function aesDecrypt(ciphertext: string, password: string): Promise<string> {
  const data = new Uint8Array(atob(ciphertext).split("").map(c => c.charCodeAt(0)));
  const salt = data.slice(0, 16), iv = data.slice(16, 28), ct = data.slice(28);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(decrypted);
}

export function AesEncryptDecrypt() {
  const [mode, setMode] = useState<"enc"|"dec">("enc");
  const [text, setText] = useState("Secret message to encrypt");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text || !password) return;
    setLoading(true); setError(""); setOutput("");
    try {
      setOutput(mode === "enc" ? await aesEncrypt(text, password) : await aesDecrypt(text, password));
    } catch { setError(mode === "enc" ? "Encryption failed" : "Decryption failed — wrong password or corrupted data"); }
    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>AES Encryption / Decryption</CardTitle><CardDescription>Encrypt and decrypt text with AES-256-GCM using Web Crypto — runs entirely in your browser</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "enc" ? "default" : "outline"} onClick={() => { setMode("enc"); setOutput(""); setText("Secret message to encrypt"); }}>Encrypt</Button>
          <Button size="sm" variant={mode === "dec" ? "default" : "outline"} onClick={() => { setMode("dec"); setOutput(""); setText(""); }}>Decrypt</Button>
        </div>
        <div className="space-y-1.5">
          <Label>{mode === "enc" ? "Plaintext" : "Encrypted text (Base64)"}</Label>
          <Textarea className="font-mono text-xs min-h-[100px]" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <div className="relative">
            <Input type={showPwd ? "text" : "password"} className="font-mono pr-10" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter encryption password…" />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        <Button onClick={run} disabled={!text || !password || loading}>{loading ? "Processing…" : mode === "enc" ? "Encrypt" : "Decrypt"}</Button>
        {error && <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>}
        {output && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>Output</Label><CopyBtn text={output} /></div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border break-all">{output}</div>
          </div>
        )}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border/50">
          Uses AES-256-GCM + PBKDF2 (100,000 iterations, SHA-256). All operations run locally — your data never leaves your browser.
        </div>
      </CardContent>
    </Card>
  );
}

// ─── HMAC Generator ───────────────────────────────────────────────────────────
export function HmacGenerator() {
  const [message, setMessage] = useState("Hello, World!");
  const [secret, setSecret] = useState("my-secret-key");
  const [algo, setAlgo] = useState("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generate = async () => {
    setError(""); setOutput("");
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: algo }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
      setOutput(Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join(""));
    } catch { setError("HMAC generation failed"); }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>HMAC Generator</CardTitle><CardDescription>Generate HMAC message authentication codes using Web Crypto</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Hash algorithm</Label>
          <Select value={algo} onValueChange={setAlgo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SHA-1">HMAC-SHA-1</SelectItem>
              <SelectItem value="SHA-256">HMAC-SHA-256</SelectItem>
              <SelectItem value="SHA-384">HMAC-SHA-384</SelectItem>
              <SelectItem value="SHA-512">HMAC-SHA-512</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Message</Label><Textarea className="font-mono text-xs min-h-[80px]" value={message} onChange={e => setMessage(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Secret key</Label><Input className="font-mono" type="password" value={secret} onChange={e => setSecret(e.target.value)} /></div>
        <Button onClick={generate} disabled={!message || !secret}>Generate HMAC</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {output && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>HMAC ({algo})</Label><CopyBtn text={output} /></div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border break-all">{output}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Random Number Generator ──────────────────────────────────────────────────
export function RandomNumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<number[]>([]);
  const [unique, setUnique] = useState(false);

  const generate = () => {
    const arr = new Uint32Array(count * 2);
    crypto.getRandomValues(arr);
    const range = max - min + 1;
    const nums: number[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < arr.length && nums.length < count; i++) {
      const n = min + (arr[i] % range);
      if (unique) { if (!seen.has(n)) { seen.add(n); nums.push(n); } }
      else nums.push(n);
    }
    setResults(nums);
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Random Number Generator</CardTitle><CardDescription>Generate cryptographically secure random numbers using Web Crypto</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Min</Label><Input type="number" className="font-mono" value={min} onChange={e => setMin(parseInt(e.target.value) || 0)} /></div>
          <div className="space-y-1.5"><Label>Max</Label><Input type="number" className="font-mono" value={max} onChange={e => setMax(parseInt(e.target.value) || 100)} /></div>
          <div className="space-y-1.5"><Label>Count</Label><Input type="number" min={1} max={1000} className="font-mono" value={count} onChange={e => setCount(parseInt(e.target.value) || 1)} /></div>
        </div>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={unique} onChange={e => setUnique(e.target.checked)} className="w-4 h-4" />
            Unique values
          </label>
          <Button onClick={generate}>Generate</Button>
          {results.length > 0 && <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(results.join(", "))}>Copy all</Button>}
        </div>
        {results.length > 0 && (
          <div className="rounded-lg border border-border p-3">
            <div className="flex flex-wrap gap-2">
              {results.map((n, i) => (
                <span key={i} className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md font-mono text-sm text-primary">{n}</span>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground font-mono">
              Sum: {results.reduce((a,b) => a+b, 0).toLocaleString()} &nbsp;|&nbsp; Avg: {(results.reduce((a,b) => a+b, 0) / results.length).toFixed(2)} &nbsp;|&nbsp; Min: {Math.min(...results)} &nbsp;|&nbsp; Max: {Math.max(...results)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Passphrase Generator ─────────────────────────────────────────────────────
const WORDS = ["apple","brave","cloud","dance","eagle","flame","grace","heart","ivory","jolly","karma","light","mango","noble","ocean","peace","quest","river","storm","tiger","unity","vivid","waltz","xenon","yacht","zeal","amber","bliss","coral","delta","ember","frost","globe","haven","index","jewel","knife","lunar","maple","nexus","oasis","prism","quartz","ridge","solar","topaz","ultra","viper","woven","xerox","yield"];
export function PassphraseGenerator() {
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(false);
  const [phrase, setPhrase] = useState("");

  const generate = () => {
    const arr = new Uint32Array(wordCount);
    crypto.getRandomValues(arr);
    const words = Array.from(arr).map(n => {
      const w = WORDS[n % WORDS.length];
      return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    });
    setPhrase(words.join(separator));
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Passphrase Generator</CardTitle><CardDescription>Generate memorable random passphrases made of real words</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="space-y-1.5">
            <Label>Word count</Label>
            <Input type="number" min={3} max={10} className="font-mono w-24" value={wordCount} onChange={e => setWordCount(parseInt(e.target.value) || 4)} />
          </div>
          <div className="space-y-1.5">
            <Label>Separator</Label>
            <div className="flex gap-1">
              {["-","_","."," "].map(s => <Button key={s} size="sm" variant={separator === s ? "default" : "outline"} onClick={() => setSeparator(s)} className="font-mono w-9">{s === " " ? "·" : s}</Button>)}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer pb-0.5">
            <input type="checkbox" checked={capitalize} onChange={e => setCapitalize(e.target.checked)} className="w-4 h-4" />
            Capitalize
          </label>
        </div>
        <Button onClick={generate}>Generate Passphrase</Button>
        {phrase && (
          <div className="space-y-2">
            <div className="flex justify-between items-center"><Label>Passphrase</Label><CopyBtn text={phrase} /></div>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-lg border border-border text-center break-all">{phrase}</div>
            <div className="text-xs text-muted-foreground text-center">≈ {Math.round(wordCount * Math.log2(WORDS.length))} bits of entropy</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
