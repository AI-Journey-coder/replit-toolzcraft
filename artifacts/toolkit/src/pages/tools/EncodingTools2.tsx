import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, CheckCheck, ArrowLeftRight } from "lucide-react";

function CopyBtn({ text, id = "x" }: { text: string; id?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); }} disabled={!text}>
      {ok ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}
function TwoWay({ title, desc, encode, decode, inputPlaceholder = "Enter text…", outputPlaceholder = "Encoded output…" }: { title: string; desc: string; encode: (s: string) => string; decode: (s: string) => string; inputPlaceholder?: string; outputPlaceholder?: string }) {
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => {
    setError("");
    try { setOutput(mode === "enc" ? encode(input) : decode(input)); }
    catch (e) { setError(e instanceof Error ? e.message : "Invalid input"); setOutput(""); }
  };
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "enc" ? "default" : "outline"} onClick={() => { setMode("enc"); setInput(""); setOutput(""); }}>Encode</Button>
          <Button size="sm" variant={mode === "dec" ? "default" : "outline"} onClick={() => { setMode("dec"); setInput(""); setOutput(""); }}>Decode</Button>
        </div>
        <div className="space-y-1.5"><Label>{mode === "enc" ? "Input text" : "Encoded string"}</Label><Textarea className="font-mono text-xs min-h-[100px]" value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "enc" ? inputPlaceholder : outputPlaceholder} /></div>
        <Button onClick={run}>{mode === "enc" ? "Encode" : "Decode"}</Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {output && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>{mode === "enc" ? "Encoded" : "Decoded"}</Label><CopyBtn text={output} /></div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border break-all">{output}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Base32 ───────────────────────────────────────────────────────────────────
const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bits = 0, val = 0, out = "";
  for (const b of bytes) { val = (val << 8) | b; bits += 8; while (bits >= 5) { out += B32_ALPHA[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32_ALPHA[(val << (5 - bits)) & 31];
  while (out.length % 8) out += "=";
  return out;
}
function base32Decode(s: string): string {
  s = s.toUpperCase().replace(/=+$/, "");
  let bits = 0, val = 0;
  const bytes: number[] = [];
  for (const c of s) { const idx = B32_ALPHA.indexOf(c); if (idx === -1) throw new Error(`Invalid char: ${c}`); val = (val << 5) | idx; bits += 5; if (bits >= 8) { bytes.push((val >>> (bits - 8)) & 255); bits -= 8; } }
  return new TextDecoder().decode(new Uint8Array(bytes));
}
export function Base32Codec() {
  return <TwoWay title="Base32 Encoder / Decoder" desc="Encode and decode Base32 strings (RFC 4648)" encode={base32Encode} decode={base32Decode} outputPlaceholder="Base32 encoded string…" />;
}

// ─── Base58 ───────────────────────────────────────────────────────────────────
const B58_ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58Encode(s: string): string {
  const bytes = Array.from(new TextEncoder().encode(s));
  let num = BigInt(0);
  for (const b of bytes) num = (num << 8n) | BigInt(b);
  let out = "";
  while (num > 0n) { out = B58_ALPHA[Number(num % 58n)] + out; num /= 58n; }
  for (const b of bytes) { if (b !== 0) break; out = "1" + out; }
  return out;
}
function base58Decode(s: string): string {
  let num = BigInt(0);
  for (const c of s) { const i = B58_ALPHA.indexOf(c); if (i < 0) throw new Error(`Invalid char: ${c}`); num = num * 58n + BigInt(i); }
  const bytes: number[] = [];
  while (num > 0n) { bytes.unshift(Number(num & 0xFFn)); num >>= 8n; }
  for (const c of s) { if (c !== "1") break; bytes.unshift(0); }
  return new TextDecoder().decode(new Uint8Array(bytes));
}
export function Base58Codec() {
  return <TwoWay title="Base58 Encoder / Decoder" desc="Encode and decode Base58 strings (Bitcoin-style alphabet)" encode={base58Encode} decode={base58Decode} outputPlaceholder="Base58 encoded string…" />;
}

// ─── HTML Entity Encoder ──────────────────────────────────────────────────────
function htmlEncode(s: string) { return s.replace(/[&<>"'`=]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;", "=": "&#61;" }[c] ?? c)); }
function htmlDecode(s: string) {
  const el = document.createElement("div");
  el.innerHTML = s;
  return el.textContent ?? "";
}
function htmlEncodeAll(s: string) { return Array.from(s).map(c => c === " " ? " " : `&#${c.charCodeAt(0)};`).join(""); }

export function HtmlEntityCodec() {
  const [input, setInput] = useState('<h1 class="title">Hello "World" & \'Friends\'</h1>');
  const [mode, setMode] = useState<"special" | "all" | "decode">("special");
  const output = useMemo(() => {
    if (mode === "decode") return htmlDecode(input);
    if (mode === "all") return htmlEncodeAll(input);
    return htmlEncode(input);
  }, [input, mode]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>HTML Entity Encoder / Decoder</CardTitle><CardDescription>Encode special HTML characters or decode HTML entities back to text</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {[["special", "Encode special chars"], ["all", "Encode all chars"], ["decode", "Decode entities"]].map(([v, l]) => (
            <Button key={v} size="sm" variant={mode === v ? "default" : "outline"} onClick={() => setMode(v as any)}>{l}</Button>
          ))}
        </div>
        <div className="space-y-1.5"><Label>Input</Label><Textarea className="font-mono text-xs min-h-[100px]" value={input} onChange={e => setInput(e.target.value)} /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Output</Label><CopyBtn text={output} /></div>
          <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border break-all whitespace-pre-wrap">{output}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ASCII to Hex / Hex to Text ────────────────────────────────────────────────
function asciiToHex(s: string) { return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); }
function hexToText(s: string) {
  const hex = s.trim().replace(/\s+/g, "");
  if (hex.length % 2 !== 0) throw new Error("Odd number of hex digits");
  return Array.from({ length: hex.length / 2 }, (_, i) => String.fromCharCode(parseInt(hex.slice(i * 2, i * 2 + 2), 16))).join("");
}
export function AsciiHexConverter() {
  return <TwoWay title="ASCII ↔ Hex Converter" desc="Convert ASCII text to hexadecimal codes and back" encode={asciiToHex} decode={s => { try { return hexToText(s); } catch(e) { throw new Error(e instanceof Error ? e.message : "Invalid hex"); }}} inputPlaceholder="Hello World" outputPlaceholder="48 65 6c 6c 6f…" />;
}

// ─── Binary to Text ────────────────────────────────────────────────────────────
function textToBinary(s: string) { return Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "); }
function binaryToText(s: string) {
  const chunks = s.trim().split(/\s+/);
  return chunks.map(b => { const n = parseInt(b, 2); if (isNaN(n)) throw new Error(`Invalid binary: ${b}`); return String.fromCharCode(n); }).join("");
}
export function BinaryTextConverter() {
  return <TwoWay title="Binary ↔ Text Converter" desc="Convert text to 8-bit binary representation and back" encode={textToBinary} decode={binaryToText} outputPlaceholder="01001000 01100101 01101100…" />;
}

// ─── UTF-8 Byte Viewer ────────────────────────────────────────────────────────
export function Utf8ByteViewer() {
  const [text, setText] = useState("Hello, 世界! 🌍");
  const bytes = useMemo(() => {
    const enc = new TextEncoder().encode(text);
    return Array.from(enc).map((b, i) => ({ byte: b, hex: b.toString(16).padStart(2, "0").toUpperCase(), bin: b.toString(2).padStart(8, "0") }));
  }, [text]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>UTF-8 Byte Viewer</CardTitle><CardDescription>View the raw UTF-8 byte sequence for any text, including emoji and Unicode characters</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Input text</Label><Input className="font-mono" value={text} onChange={e => setText(e.target.value)} /></div>
        <div className="flex gap-4 text-xs font-mono text-muted-foreground">
          <span>{text.length} chars</span><span>{bytes.length} bytes</span><span>Ratio: {text.length ? (bytes.length / text.length).toFixed(2) : "—"} bytes/char</span>
        </div>
        <div className="rounded-lg border border-border overflow-auto max-h-[320px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/90"><tr className="text-muted-foreground"><th className="text-left px-3 py-2">#</th><th className="px-3 py-2">Byte</th><th className="px-3 py-2">Hex</th><th className="px-3 py-2">Binary</th><th className="px-3 py-2">Decimal</th></tr></thead>
            <tbody className="divide-y divide-border/50">
              {bytes.map((b, i) => (
                <tr key={i}><td className="px-3 py-1.5 text-muted-foreground">{i}</td><td className="px-3 py-1.5 font-mono text-center text-xs">0x{b.hex}</td><td className="px-3 py-1.5 font-mono text-primary">{b.hex}</td><td className="px-3 py-1.5 font-mono text-muted-foreground">{b.bin}</td><td className="px-3 py-1.5 font-mono">{b.byte}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(bytes.map(b => b.hex).join(" "))}>Copy hex</Button>
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(bytes.map(b => b.byte.toString()).join(" "))}>Copy decimal</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Braille Translator ────────────────────────────────────────────────────────
const BRAILLE: Record<string, string> = {
  a:"⠁",b:"⠃",c:"⠉",d:"⠙",e:"⠑",f:"⠋",g:"⠛",h:"⠓",i:"⠊",j:"⠚",k:"⠅",l:"⠇",m:"⠍",
  n:"⠝",o:"⠕",p:"⠏",q:"⠟",r:"⠗",s:"⠎",t:"⠞",u:"⠥",v:"⠧",w:"⠺",x:"⠭",y:"⠽",z:"⠵",
  "1":"⠂","2":"⠆","3":"⠒","4":"⠲","5":"⠢","6":"⠖","7":"⠶","8":"⠦","9":"⠔","0":"⠴",
  ".":"⠲",",":"⠂","?":"⠦","!":"⠖",";":"⠆",":":"⠒","'":"⠄","-":"⠤"," ":"⠀",
};
const BRAILLE_REV = Object.fromEntries(Object.entries(BRAILLE).map(([k, v]) => [v, k]));

export function BrailleTranslator() {
  const [mode, setMode] = useState<"to" | "from">("to");
  const [input, setInput] = useState("Hello World");
  const output = useMemo(() => {
    if (mode === "to") return input.toLowerCase().split("").map(c => BRAILLE[c] ?? c).join("");
    return input.split("").map(c => BRAILLE_REV[c] ?? c).join("");
  }, [input, mode]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Braille Translator</CardTitle><CardDescription>Convert text to Grade 1 Braille Unicode characters and back</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "to" ? "default" : "outline"} onClick={() => { setMode("to"); setInput("Hello World"); }}>Text → Braille</Button>
          <Button size="sm" variant={mode === "from" ? "default" : "outline"} onClick={() => { setMode("from"); setInput("⠓⠑⠇⠇⠕⠀⠺⠕⠗⠇⠙"); }}>Braille → Text</Button>
        </div>
        <div className="space-y-1.5"><Label>Input</Label><Textarea className="font-mono text-sm min-h-[80px]" value={input} onChange={e => setInput(e.target.value)} /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Output</Label><CopyBtn text={output} /></div>
          <div className="p-4 bg-muted/50 rounded-lg font-mono text-2xl border border-border leading-relaxed break-all">{output}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Unicode Escape ────────────────────────────────────────────────────────────
export function UnicodeEscape() {
  const [mode, setMode] = useState<"escape" | "unescape">("escape");
  const [input, setInput] = useState("Hello 世界 🌍");
  const output = useMemo(() => {
    if (mode === "escape") {
      return Array.from(input).map(c => {
        const cp = c.codePointAt(0)!;
        if (cp <= 0x7F) return c;
        return cp > 0xFFFF ? `\\u{${cp.toString(16).toUpperCase()}}` : `\\u${cp.toString(16).padStart(4, "0").toUpperCase()}`;
      }).join("");
    } else {
      try { return input.replace(/\\u\{([0-9A-Fa-f]+)\}|\\u([0-9A-Fa-f]{4})/g, (_, a, b) => String.fromCodePoint(parseInt(a || b, 16))); }
      catch { return "Invalid escape sequence"; }
    }
  }, [input, mode]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Unicode Escape / Unescape</CardTitle><CardDescription>Escape non-ASCII characters to \\uXXXX sequences and unescape them back</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "escape" ? "default" : "outline"} onClick={() => setMode("escape")}>Escape</Button>
          <Button size="sm" variant={mode === "unescape" ? "default" : "outline"} onClick={() => setMode("unescape")}>Unescape</Button>
        </div>
        <div className="space-y-1.5"><Label>Input</Label><Textarea className="font-mono text-xs min-h-[80px]" value={input} onChange={e => setInput(e.target.value)} /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Output</Label><CopyBtn text={output} /></div>
          <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border break-all whitespace-pre-wrap">{output}</div>
        </div>
      </CardContent>
    </Card>
  );
}
