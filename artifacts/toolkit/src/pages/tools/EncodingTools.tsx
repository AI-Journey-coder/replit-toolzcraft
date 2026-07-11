import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCheck } from "lucide-react";

function useCopy() {
  const [k, setK] = useState<string|null>(null);
  const copy = (t: string, key: string) => { navigator.clipboard.writeText(t); setK(key); setTimeout(() => setK(null), 1400); };
  return { copiedKey: k, copy };
}
function CopyBtn({ text, id = "x" }: { text: string; id?: string }) {
  const { copiedKey, copy } = useCopy();
  return (
    <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => copy(text, id)} disabled={!text}>
      {copiedKey === id ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedKey === id ? "Copied" : "Copy"}
    </Button>
  );
}

// ─── Number Base Converter ────────────────────────────────────────────────────
export function NumberBaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState(10);

  const parsed = useMemo(() => {
    try {
      const n = parseInt(input.trim(), fromBase);
      if (isNaN(n)) return null;
      return {
        bin: n.toString(2),
        oct: n.toString(8),
        dec: n.toString(10),
        hex: n.toString(16).toUpperCase(),
        n,
      };
    } catch { return null; }
  }, [input, fromBase]);

  const bases = [
    { label: "Binary (2)", value: 2 },
    { label: "Octal (8)", value: 8 },
    { label: "Decimal (10)", value: 10 },
    { label: "Hexadecimal (16)", value: 16 },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Number Base Converter</CardTitle><CardDescription>Convert between binary, octal, decimal, and hexadecimal</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Input number</Label>
            <Input className="font-mono text-lg h-11" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter number…" />
          </div>
          <div className="space-y-1.5">
            <Label>Input base</Label>
            <div className="flex gap-1">
              {bases.map(b => (
                <Button key={b.value} size="sm" variant={fromBase === b.value ? "default" : "outline"} onClick={() => setFromBase(b.value)} className="text-xs font-mono">{b.value}</Button>
              ))}
            </div>
          </div>
        </div>
        {parsed ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/60 text-muted-foreground text-xs font-mono"><th className="text-left px-4 py-2.5">Base</th><th className="text-left px-4 py-2.5">Prefix</th><th className="text-left px-4 py-2.5">Value</th><th className="px-2 py-2.5 w-10" /></tr></thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { label: "Binary", prefix: "0b", value: parsed.bin, base: 2 },
                  { label: "Octal", prefix: "0o", value: parsed.oct, base: 8 },
                  { label: "Decimal", prefix: "", value: parsed.dec, base: 10 },
                  { label: "Hexadecimal", prefix: "0x", value: parsed.hex, base: 16 },
                ].map(row => (
                  <tr key={row.base} className={fromBase === row.base ? "bg-primary/5" : ""}>
                    <td className={`px-4 py-2.5 font-medium ${fromBase === row.base ? "text-primary" : ""}`}>{row.label}</td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{row.prefix}</td>
                    <td className="px-4 py-2.5 font-mono">{row.value}</td>
                    <td className="px-2 py-2.5"><CopyBtn text={row.prefix + row.value} id={`b${row.base}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">Enter a valid number above</div>
        )}
        {parsed && (
          <div className="text-xs text-muted-foreground font-mono text-center">
            Decimal value: {parsed.n.toLocaleString()} &nbsp;|&nbsp; Signed 32-bit: {new Int32Array([parsed.n])[0].toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Arbitrary Base Converter ─────────────────────────────────────────────────
export function ArbitraryBaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(36);

  const result = useMemo(() => {
    try {
      const n = parseInt(input.trim(), fromBase);
      if (isNaN(n) || fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) return "";
      return n.toString(toBase).toUpperCase();
    } catch { return ""; }
  }, [input, fromBase, toBase]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Arbitrary Base Converter</CardTitle><CardDescription>Convert numbers between any base from 2 to 36</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>From base (2–36)</Label>
            <Input type="number" min={2} max={36} className="font-mono" value={fromBase} onChange={e => setFromBase(parseInt(e.target.value) || 10)} />
          </div>
          <div className="space-y-1.5">
            <Label>To base (2–36)</Label>
            <Input type="number" min={2} max={36} className="font-mono" value={toBase} onChange={e => setToBase(parseInt(e.target.value) || 10)} />
          </div>
        </div>
        <div className="space-y-1.5"><Label>Input</Label><Input className="font-mono text-lg h-11" value={input} onChange={e => setInput(e.target.value)} /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Result (base {toBase})</Label><CopyBtn text={result} id="abc" /></div>
          <div className="p-3 bg-muted/50 rounded-lg font-mono text-xl text-primary border border-border min-h-[52px]">{result || <span className="text-muted-foreground text-base">—</span>}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Roman Numeral Converter ──────────────────────────────────────────────────
function toRoman(n: number): string {
  if (n < 1 || n > 3999) return "Out of range (1–3999)";
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { result += syms[i]; n -= vals[i]; } }
  return result;
}
function fromRoman(s: string): number {
  const map: Record<string, number> = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let result = 0, prev = 0;
  for (const ch of s.toUpperCase().split("").reverse()) {
    const v = map[ch] ?? 0;
    result += v < prev ? -v : v;
    prev = v;
  }
  return result;
}
export function RomanNumeralConverter() {
  const [mode, setMode] = useState<"to"|"from">("to");
  const [input, setInput] = useState("2025");

  const result = useMemo(() => {
    if (mode === "to") {
      const n = parseInt(input);
      return isNaN(n) ? "Invalid number" : toRoman(n);
    } else {
      const n = fromRoman(input);
      return n > 0 ? n.toString() : "Invalid Roman numeral";
    }
  }, [mode, input]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Roman Numeral Converter</CardTitle><CardDescription>Convert between Arabic numbers and Roman numerals</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "to" ? "default" : "outline"} onClick={() => setMode("to")}>Number → Roman</Button>
          <Button size="sm" variant={mode === "from" ? "default" : "outline"} onClick={() => setMode("from")}>Roman → Number</Button>
        </div>
        <div className="space-y-1.5">
          <Label>{mode === "to" ? "Arabic number (1–3999)" : "Roman numeral"}</Label>
          <Input className="font-mono text-lg h-11" value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "to" ? "e.g. 2025" : "e.g. MMXXV"} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Result</Label><CopyBtn text={result} id="rom" /></div>
          <div className="p-4 bg-muted/50 rounded-lg font-mono text-2xl text-center text-primary border border-border">{result}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Number to Words ───────────────────────────────────────────────────────────
const ONES = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function numToWords(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return "negative " + numToWords(-n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n/10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n/100)] + " hundred" + (n%100 ? " " + numToWords(n%100) : "");
  const scales = [[1e9,"billion"],[1e6,"million"],[1e3,"thousand"]] as [number,string][];
  for (const [s, name] of scales) {
    if (n >= s) return numToWords(Math.floor(n/s)) + " " + name + (n%s ? " " + numToWords(n%s) : "");
  }
  return n.toString();
}
export function NumberToWords() {
  const [input, setInput] = useState("1234567");
  const n = parseFloat(input);
  const words = isNaN(n) ? "Invalid number" : numToWords(Math.trunc(n));

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Number to Words</CardTitle><CardDescription>Convert any number to its English word representation</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Number</Label><Input className="font-mono text-lg h-11" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter a number…" /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Words</Label><CopyBtn text={words} id="n2w" /></div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border text-sm leading-relaxed capitalize">{words}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Unix Timestamp Converter ─────────────────────────────────────────────────
export function UnixTimestampConverter() {
  const [ts, setTs] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0,16));
  const [mode, setMode] = useState<"ts"|"date">("ts");

  const fromTs = useMemo(() => {
    const n = parseInt(ts);
    if (isNaN(n)) return null;
    const ms = ts.length > 11 ? n : n * 1000;
    const d = new Date(ms);
    return {
      iso: d.toISOString(),
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      ms: ms.toString(),
      unix: Math.floor(ms/1000).toString(),
    };
  }, [ts]);

  const fromDate = useMemo(() => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return { unix: Math.floor(d.getTime()/1000).toString(), ms: d.getTime().toString(), iso: d.toISOString(), utc: d.toUTCString() };
    } catch { return null; }
  }, [dateStr]);

  const nowTs = () => setTs(Math.floor(Date.now()/1000).toString());
  const nowDate = () => setDateStr(new Date().toISOString().slice(0,16));

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Unix Timestamp Converter</CardTitle><CardDescription>Convert between Unix epoch timestamps and human-readable dates</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "ts" ? "default" : "outline"} onClick={() => setMode("ts")}>Timestamp → Date</Button>
          <Button size="sm" variant={mode === "date" ? "default" : "outline"} onClick={() => setMode("date")}>Date → Timestamp</Button>
        </div>
        {mode === "ts" ? (
          <>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5"><Label>Unix timestamp (seconds or ms)</Label><Input className="font-mono" value={ts} onChange={e => setTs(e.target.value)} /></div>
              <Button size="sm" variant="outline" onClick={nowTs}>Now</Button>
            </div>
            {fromTs && (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-border/50">
                    {[["ISO 8601", fromTs.iso], ["UTC", fromTs.utc], ["Local", fromTs.local], ["Unix (s)", fromTs.unix], ["Milliseconds", fromTs.ms]].map(([l, v]) => (
                      <tr key={l}><td className="px-3 py-2 text-muted-foreground bg-muted/30 w-32">{l}</td><td className="px-3 py-2 font-mono">{v}</td><td className="px-2 py-2 text-right"><CopyBtn text={v} id={l} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5"><Label>Date & time (local)</Label><Input type="datetime-local" className="font-mono" value={dateStr} onChange={e => setDateStr(e.target.value)} /></div>
              <Button size="sm" variant="outline" onClick={nowDate}>Now</Button>
            </div>
            {fromDate && (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-border/50">
                    {[["Unix (s)", fromDate.unix], ["Milliseconds", fromDate.ms], ["ISO 8601", fromDate.iso], ["UTC", fromDate.utc]].map(([l, v]) => (
                      <tr key={l}><td className="px-3 py-2 text-muted-foreground bg-muted/30 w-32">{l}</td><td className="px-3 py-2 font-mono">{v}</td><td className="px-2 py-2 text-right"><CopyBtn text={v} id={l} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── ROT13 & Caesar Cipher ────────────────────────────────────────────────────
function rot13(s: string) { return s.replace(/[a-zA-Z]/g, c => String.fromCharCode(((c.charCodeAt(0) - (c < 'a' ? 65 : 97) + 13) % 26) + (c < 'a' ? 65 : 97))); }
function caesar(s: string, shift: number) { return s.replace(/[a-zA-Z]/g, c => { const b = c < 'a' ? 65 : 97; return String.fromCharCode(((c.charCodeAt(0) - b + shift + 26) % 26) + b); }); }

export function Rot13Caesar() {
  const [text, setText] = useState("The Quick Brown Fox Jumps Over The Lazy Dog");
  const [shift, setShift] = useState(13);
  const rot = rot13(text);
  const enc = caesar(text, shift);
  const dec = caesar(text, -shift);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>ROT13 & Caesar Cipher</CardTitle><CardDescription>Classic letter-substitution ciphers for text encoding</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Input text</Label><Textarea className="font-mono text-xs min-h-[80px]" value={text} onChange={e => setText(e.target.value)} /></div>
        <div className="space-y-3">
          {[{ label: "ROT13 (shift 13)", value: rot, id: "r13" }].map(r => (
            <div key={r.id} className="space-y-1.5">
              <div className="flex justify-between items-center"><Label>{r.label}</Label><CopyBtn text={r.value} id={r.id} /></div>
              <div className="p-2.5 bg-muted/50 rounded-md font-mono text-xs border border-border">{r.value}</div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Label className="shrink-0">Caesar shift</Label>
            <Input type="range" min={1} max={25} value={shift} onChange={e => setShift(parseInt(e.target.value))} className="flex-1 h-8" />
            <span className="font-mono text-sm w-6 text-center">{shift}</span>
          </div>
          {[{ label: `Caesar encrypt (+${shift})`, value: enc, id: "ce" }, { label: `Caesar decrypt (-${shift})`, value: dec, id: "cd" }].map(r => (
            <div key={r.id} className="space-y-1.5">
              <div className="flex justify-between items-center"><Label>{r.label}</Label><CopyBtn text={r.value} id={r.id} /></div>
              <div className="p-2.5 bg-muted/50 rounded-md font-mono text-xs border border-border">{r.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Morse Code Translator ────────────────────────────────────────────────────
const MORSE: Record<string, string> = {
  A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",
  K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",
  U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....",
  "6":"-....","7":"--...","8":"---..","9":"----.",".":".-.-.-",",":"--..--",
  "?":"..--..","!":"-.-.--","/":"-..-.","(":"-.--.",")":"-.--.-",
  "&":".-...",":":"---...","=":"-...-","+":".-.-.","-":"-....-","_":"..--.-",
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v, k]));

function textToMorse(s: string): string {
  return s.toUpperCase().split("").map(c => c === " " ? "/" : (MORSE[c] ?? "?")).join(" ");
}
function morseToText(s: string): string {
  return s.trim().split(" / ").map(word => word.split(" ").map(code => MORSE_REV[code] ?? "?").join("")).join(" ");
}

export function MorseCodeTranslator() {
  const [mode, setMode] = useState<"to"|"from">("to");
  const [input, setInput] = useState("Hello World");
  const output = mode === "to" ? textToMorse(input) : morseToText(input);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Morse Code Translator</CardTitle><CardDescription>Convert text to Morse code and back (use / to separate words in Morse input)</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "to" ? "default" : "outline"} onClick={() => { setMode("to"); setInput("Hello World"); }}>Text → Morse</Button>
          <Button size="sm" variant={mode === "from" ? "default" : "outline"} onClick={() => { setMode("from"); setInput(".... . .-.. .-.. --- / .-- --- .-. .-.. -.."); }}>Morse → Text</Button>
        </div>
        <div className="space-y-1.5"><Label>{mode === "to" ? "Text" : "Morse code"}</Label><Textarea className="font-mono text-xs min-h-[80px]" value={input} onChange={e => setInput(e.target.value)} /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label>{mode === "to" ? "Morse code" : "Text"}</Label>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => navigator.clipboard.writeText(output)}>
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border leading-relaxed break-all">{output}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── IP Address Converter ─────────────────────────────────────────────────────
function ipToDecimal(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return (nums[0] << 24 | nums[1] << 16 | nums[2] << 8 | nums[3]) >>> 0;
}
function decimalToIp(n: number): string {
  return [n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255].join(".");
}
function ipToBinary(ip: string): string {
  const parts = ip.split(".");
  if (parts.length !== 4) return "";
  return parts.map(p => parseInt(p).toString(2).padStart(8, "0")).join(".");
}

export function IpAddressConverter() {
  const [ip, setIp] = useState("192.168.1.100");
  const dec = ipToDecimal(ip);
  const bin = dec !== null ? ipToBinary(ip) : "";
  const hex = dec !== null ? "0x" + dec.toString(16).toUpperCase().padStart(8, "0") : "";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>IP Address Converter</CardTitle><CardDescription>Convert IPv4 addresses between dotted decimal, binary, hex, and decimal formats</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>IPv4 address (dotted decimal)</Label><Input className="font-mono text-lg h-11" value={ip} onChange={e => setIp(e.target.value)} placeholder="e.g. 192.168.1.1" /></div>
        {dec !== null ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/50">
                {[["Dotted decimal", ip], ["Binary", bin], ["Hexadecimal", hex], ["Decimal (32-bit)", dec.toString()]].map(([l, v]) => (
                  <tr key={l}><td className="px-4 py-2.5 text-muted-foreground bg-muted/30 w-44">{l}</td><td className="px-4 py-2.5 font-mono">{v}</td><td className="px-2 py-2.5 text-right"><Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigator.clipboard.writeText(v)}><Copy className="h-3 w-3" /></Button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">Enter a valid IPv4 address</div>
        )}
      </CardContent>
    </Card>
  );
}
