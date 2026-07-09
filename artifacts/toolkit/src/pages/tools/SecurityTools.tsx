import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCheck, RefreshCw } from "lucide-react";

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

// ─── Password Generator ────────────────────────────────────────────────────

function passwordStrength(pass: string): { label: string; color: string; score: number } {
  let score = 0;
  if (pass.length >= 12) score++;
  if (pass.length >= 16) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-destructive", score };
  if (score <= 3) return { label: "Fair", color: "bg-orange-500", score };
  if (score <= 4) return { label: "Good", color: "bg-yellow-500", score };
  if (score <= 5) return { label: "Strong", color: "bg-green-500", score };
  return { label: "Very Strong", color: "bg-emerald-500", score };
}

export function PasswordGenerator() {
  const [length, setLength] = useState([16]);
  const [incUpper, setIncUpper] = useState(true);
  const [incLower, setIncLower] = useState(true);
  const [incNum, setIncNum] = useState(true);
  const [incSym, setIncSym] = useState(true);
  const [password, setPassword] = useState("");
  const { copied, copy } = useCopy(password);

  const generate = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const num = "0123456789";
    const sym = "!@#$%^&*()_+~|}{[]:;?><,./-=";

    let chars = "";
    if (incUpper) chars += upper;
    if (incLower) chars += lower;
    if (incNum) chars += num;
    if (incSym) chars += sym;
    if (!chars) { setPassword(""); return; }

    const array = new Uint32Array(length[0]);
    crypto.getRandomValues(array);
    setPassword(Array.from(array, v => chars[v % chars.length]).join(""));
  };

  const strength = password ? passwordStrength(password) : null;

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>Generate cryptographically secure passwords</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input value={password} readOnly className="font-mono text-base tracking-wider" data-testid="input-password" />
          <Button variant="outline" size="icon" onClick={() => copy()} title="Copy" data-testid="btn-copy">
            {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button size="icon" onClick={generate} title="Regenerate" data-testid="btn-generate">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {strength && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-mono">Strength</span>
              <span className="font-semibold font-mono" data-testid="text-strength">{strength.label}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${(strength.score / 6) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Length</Label>
            <span className="font-mono text-sm font-bold">{length[0]}</span>
          </div>
          <Slider value={length} onValueChange={setLength} min={8} max={64} step={1} data-testid="slider-length" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "upper", label: "Uppercase (A-Z)", checked: incUpper, set: setIncUpper },
            { id: "lower", label: "Lowercase (a-z)", checked: incLower, set: setIncLower },
            { id: "num", label: "Numbers (0-9)", checked: incNum, set: setIncNum },
            { id: "sym", label: "Symbols (!@#)", checked: incSym, set: setIncSym },
          ].map(({ id, label, checked, set }) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox id={id} checked={checked} onCheckedChange={c => set(!!c)} data-testid={`checkbox-${id}`} />
              <label htmlFor={id} className="text-sm cursor-pointer">{label}</label>
            </div>
          ))}
        </div>

        <Button onClick={generate} className="w-full" data-testid="btn-generate-full">Generate Password</Button>
      </CardContent>
    </Card>
  );
}

// ─── UUID Generator ────────────────────────────────────────────────────────

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState("standard");
  const { copied, copy } = useCopy(uuids.join("\n"));

  const formatUuid = (uuid: string) => {
    if (format === "no-dashes") return uuid.replace(/-/g, "");
    if (format === "braces") return `{${uuid}}`;
    return uuid;
  };

  const generate = () => {
    const n = Math.min(Math.max(1, count), 100);
    setUuids(Array.from({ length: n }, () => formatUuid(crypto.randomUUID())));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>UUID v4 Generator</CardTitle>
        <CardDescription>Generate cryptographically random UUIDs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="space-y-2">
            <Label>Count (1-100)</Label>
            <Input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))} className="w-24" data-testid="input-count" />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-[150px]" data-testid="select-format"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="no-dashes">No Dashes</SelectItem>
                <SelectItem value="braces">With Braces</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} data-testid="btn-generate">Generate</Button>
          {uuids.length > 0 && (
            <Button variant="outline" onClick={() => copy()} data-testid="btn-copy-all">
              {copied ? <CheckCheck className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
              Copy All
            </Button>
          )}
        </div>

        {uuids.length > 0 && (
          <div className="p-4 bg-muted/50 font-mono text-sm rounded-md max-h-72 overflow-y-auto border border-border space-y-1" data-testid="div-uuids">
            {uuids.map((u, i) => (
              <div key={i} className="py-0.5 hover:text-primary transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(u)} data-testid={`uuid-${i}`}>{u}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Hash Generator ────────────────────────────────────────────────────────

async function sha(input: string, algo: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest(algo, enc.encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function md5(str: string): string {
  // Simple MD5 implementation
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

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    const [sha1, sha256, sha512] = await Promise.all([
      sha(input, "SHA-1"),
      sha(input, "SHA-256"),
      sha(input, "SHA-512"),
    ]);
    setHashes({ MD5: md5(input), "SHA-1": sha1, "SHA-256": sha256, "SHA-512": sha512 });
    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Hash Generator</CardTitle>
        <CardDescription>Generate MD5, SHA-1, SHA-256, and SHA-512 hashes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea className="font-mono min-h-[100px]" placeholder="Enter text to hash..." value={input} onChange={e => setInput(e.target.value)} data-testid="textarea-input" />
        </div>
        <Button onClick={generate} disabled={loading || !input} data-testid="btn-generate">
          {loading ? "Generating..." : "Generate Hashes"}
        </Button>

        {Object.entries(hashes).length > 0 && (
          <div className="space-y-3">
            {Object.entries(hashes).map(([algo, hash]) => (
              <HashRow key={algo} algo={algo} hash={hash} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HashRow({ algo, hash }: { algo: string; hash: string }) {
  const { copied, copy } = useCopy(hash);
  return (
    <div className="space-y-1" data-testid={`hash-${algo.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
      <div className="flex justify-between items-center">
        <Badge variant="secondary" className="font-mono text-xs">{algo}</Badge>
        <Button size="sm" variant="ghost" onClick={copy} className="h-7 px-2">
          {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="p-2.5 bg-muted/50 rounded-md font-mono text-xs break-all border border-border/50">{hash}</div>
    </div>
  );
}
