import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, CheckCheck } from "lucide-react";

function useCopy() {
  const [k, setK] = useState<string | null>(null);
  const copy = (t: string, key: string) => { navigator.clipboard.writeText(t); setK(key); setTimeout(() => setK(null), 1400); };
  return { copiedKey: k, copy };
}
function CopyBtn({ text, id = "x" }: { text: string; id?: string }) {
  const { copiedKey, copy } = useCopy();
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copy(text, id)} disabled={!text}>
      {copiedKey === id ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copiedKey === id ? "Copied" : "Copy"}
    </Button>
  );
}
function OutBox({ label, value, id }: { label: string; value: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center"><Label>{label}</Label><CopyBtn text={value} id={id} /></div>
      <Textarea readOnly value={value} className="font-mono text-xs min-h-[120px]" />
    </div>
  );
}

// ─── Text Diff ────────────────────────────────────────────────────────────────
function diffLines(a: string, b: string) {
  const la = a.split("\n"), lb = b.split("\n");
  const m = la.length, n = lb.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
    dp[i][j] = la[i] === lb[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
  const res: { type: "eq"|"del"|"add"; text: string }[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && la[i] === lb[j]) { res.push({ type: "eq", text: la[i] }); i++; j++; }
    else if (j < n && (i >= m || dp[i+1]?.[j] <= dp[i]?.[j+1])) { res.push({ type: "add", text: lb[j] }); j++; }
    else { res.push({ type: "del", text: la[i] }); i++; }
  }
  return res;
}
export function TextDiff() {
  const [a, setA] = useState("The quick brown fox\njumps over the lazy dog\nHello world");
  const [b, setB] = useState("The quick brown fox\nleaps over the lazy cat\nHello ToolzCraft");
  const diff = useMemo(() => diffLines(a, b), [a, b]);
  const added = diff.filter(d => d.type === "add").length;
  const removed = diff.filter(d => d.type === "del").length;
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader><CardTitle>Text Diff</CardTitle><CardDescription>Compare two texts and highlight line-by-line differences</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Original</Label><Textarea className="font-mono text-xs min-h-[160px]" value={a} onChange={e => setA(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Modified</Label><Textarea className="font-mono text-xs min-h-[160px]" value={b} onChange={e => setB(e.target.value)} /></div>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-green-500">+{added} added</span>
          <span className="text-red-500">-{removed} removed</span>
          <span className="text-muted-foreground">{diff.filter(d => d.type === "eq").length} unchanged</span>
        </div>
        <div className="rounded-lg border border-border overflow-hidden font-mono text-xs">
          {diff.map((d, i) => (
            <div key={i} className={`px-4 py-1 flex gap-3 ${d.type === "add" ? "bg-green-500/10 text-green-400" : d.type === "del" ? "bg-red-500/10 text-red-400 line-through" : "text-muted-foreground"}`}>
              <span className="w-4 shrink-0 select-none opacity-50">{d.type === "add" ? "+" : d.type === "del" ? "-" : " "}</span>
              <span className="whitespace-pre-wrap break-all">{d.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Find & Replace ────────────────────────────────────────────────────────────
export function FindReplace() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.\nThe fox is quick and the dog is lazy.");
  const [find, setFind] = useState("fox");
  const [replace, setReplace] = useState("cat");
  const [useRegex, setUseRegex] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [result, setResult] = useState("");
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  const run = () => {
    setError("");
    try {
      let pattern: RegExp;
      const flags = caseInsensitive ? "gi" : "g";
      if (useRegex) { pattern = new RegExp(find, flags); }
      else { pattern = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags); }
      let c = 0;
      const out = text.replace(pattern, (m) => { c++; return replace; });
      setResult(out); setCount(c);
    } catch (e) { setError(e instanceof Error ? e.message : "Invalid pattern"); }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Find & Replace</CardTitle><CardDescription>Find and replace text with optional regex support</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Find</Label><Input className="font-mono" value={find} onChange={e => setFind(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Replace with</Label><Input className="font-mono" value={replace} onChange={e => setReplace(e.target.value)} /></div>
        </div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={useRegex} onCheckedChange={setUseRegex} /><span>Regex</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={caseInsensitive} onCheckedChange={setCaseInsensitive} /><span>Case insensitive</span></label>
        </div>
        <div className="space-y-1.5"><Label>Input text</Label><Textarea className="font-mono text-xs min-h-[120px]" value={text} onChange={e => setText(e.target.value)} /></div>
        <Button onClick={run}>Replace</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && <OutBox label={`Output (${count} replacement${count !== 1 ? "s" : ""})`} value={result} id="fr-out" />}
      </CardContent>
    </Card>
  );
}

// ─── Line Sorter & Deduplicator ───────────────────────────────────────────────
export function LineSorter() {
  const [text, setText] = useState("banana\napple\ncherry\napple\ndate\nbanana\nelderberry");
  const [dedup, setDedup] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);

  const output = useMemo(() => {
    let lines = text.split("\n");
    if (trimLines) lines = lines.map(l => l.trim());
    lines = lines.filter(l => l !== "");
    if (dedup) lines = [...new Set(caseInsensitive ? lines.map(l => l.toLowerCase()) : lines)];
    lines.sort((a, b) => (caseInsensitive ? a.toLowerCase().localeCompare(b.toLowerCase()) : a.localeCompare(b)));
    if (reverse) lines.reverse();
    return lines.join("\n");
  }, [text, dedup, reverse, caseInsensitive, trimLines]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Line Sorter & Deduplicator</CardTitle><CardDescription>Sort and deduplicate lines of text alphabetically</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={dedup} onCheckedChange={setDedup} /><span>Remove duplicates</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={reverse} onCheckedChange={setReverse} /><span>Reverse order</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={caseInsensitive} onCheckedChange={setCaseInsensitive} /><span>Case insensitive</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={trimLines} onCheckedChange={setTrimLines} /><span>Trim whitespace</span></label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Input lines</Label><Textarea className="font-mono text-xs min-h-[200px]" value={text} onChange={e => setText(e.target.value)} /></div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>Sorted output ({output.split("\n").filter(Boolean).length} lines)</Label><CopyBtn text={output} id="ls" /></div>
            <Textarea readOnly className="font-mono text-xs min-h-[200px]" value={output} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Slug Generator ────────────────────────────────────────────────────────────
export function SlugGenerator() {
  const [text, setText] = useState("Hello World! This is a Slug Generator — quite useful.");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);

  const slug = useMemo(() => {
    let s = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/[^a-zA-Z0-9\s]/g, "");
    s = s.trim().replace(/\s+/g, separator);
    return lowercase ? s.toLowerCase() : s;
  }, [text, separator, lowercase]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Slug Generator</CardTitle><CardDescription>Generate URL-friendly slugs from any text</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Input text</Label><Input className="font-mono" value={text} onChange={e => setText(e.target.value)} /></div>
        <div className="flex gap-4 items-end">
          <div className="space-y-1.5"><Label>Separator</Label>
            <div className="flex gap-2">
              {["-", "_", "."].map(s => <Button key={s} size="sm" variant={separator === s ? "default" : "outline"} onClick={() => setSeparator(s)} className="font-mono">{s}</Button>)}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm pb-1"><Switch checked={lowercase} onCheckedChange={setLowercase} /><span>Lowercase</span></label>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Slug</Label><CopyBtn text={slug} id="slug" /></div>
          <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm border border-border break-all">{slug || <span className="text-muted-foreground">Enter text above…</span>}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Extract Emails & URLs ─────────────────────────────────────────────────────
export function ExtractEmailsUrls() {
  const [text, setText] = useState("Contact us at support@example.com or sales@company.io\nVisit https://example.com or http://docs.toolzcraft.app/guide\nEmail: admin@test.org");
  const emails = useMemo(() => [...new Set(text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [])], [text]);
  const urls = useMemo(() => [...new Set(text.match(/https?:\/\/[^\s"'<>]+/g) ?? [])], [text]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Extract Emails & URLs</CardTitle><CardDescription>Extract all email addresses and URLs from a block of text</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Input text</Label><Textarea className="font-mono text-xs min-h-[120px]" value={text} onChange={e => setText(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>Emails ({emails.length})</Label><CopyBtn text={emails.join("\n")} id="em" /></div>
            <div className="rounded-lg border border-border overflow-hidden">
              {emails.length ? emails.map((e, i) => <div key={i} className="px-3 py-2 font-mono text-xs border-b border-border/50 last:border-0 text-blue-400">{e}</div>) : <div className="px-3 py-6 text-center text-muted-foreground text-xs">No emails found</div>}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>URLs ({urls.length})</Label><CopyBtn text={urls.join("\n")} id="ur" /></div>
            <div className="rounded-lg border border-border overflow-hidden">
              {urls.length ? urls.map((u, i) => <div key={i} className="px-3 py-2 font-mono text-xs border-b border-border/50 last:border-0 text-green-400 break-all">{u}</div>) : <div className="px-3 py-6 text-center text-muted-foreground text-xs">No URLs found</div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── URL Parser ────────────────────────────────────────────────────────────────
export function UrlParser() {
  const [url, setUrl] = useState("https://api.example.com:8080/v1/users?page=2&limit=10&sort=name#results");
  const parsed = useMemo(() => {
    try {
      const u = new URL(url);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => { params[k] = v; });
      return { protocol: u.protocol, hostname: u.hostname, port: u.port, pathname: u.pathname, search: u.search, hash: u.hash, origin: u.origin, params, error: null };
    } catch { return { error: "Invalid URL" } as any; }
  }, [url]);

  const fields = parsed.error ? [] : [
    { label: "Protocol", value: parsed.protocol },
    { label: "Hostname", value: parsed.hostname },
    { label: "Port", value: parsed.port || "(default)" },
    { label: "Path", value: parsed.pathname },
    { label: "Query string", value: parsed.search || "(none)" },
    { label: "Hash / Fragment", value: parsed.hash || "(none)" },
    { label: "Origin", value: parsed.origin },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>URL Parser</CardTitle><CardDescription>Break down a URL into its individual components</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>URL</Label><Input className="font-mono text-xs" value={url} onChange={e => setUrl(e.target.value)} /></div>
        {parsed.error ? <div className="text-sm text-destructive">{parsed.error}</div> : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-border/50">
                  {fields.map(f => (
                    <tr key={f.label}>
                      <td className="px-3 py-2 text-muted-foreground font-medium w-36 bg-muted/30">{f.label}</td>
                      <td className="px-3 py-2 font-mono">{f.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Object.keys(parsed.params).length > 0 && (
              <div className="space-y-1.5">
                <Label>Query parameters</Label>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-muted/60 text-muted-foreground"><th className="text-left px-3 py-2">Key</th><th className="text-left px-3 py-2">Value</th></tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {Object.entries(parsed.params).map(([k, v]) => (
                        <tr key={k}><td className="px-3 py-2 font-mono text-primary">{k}</td><td className="px-3 py-2 font-mono">{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Token Counter ─────────────────────────────────────────────────────────────
function countTokens(text: string): number {
  // Approximate GPT-style tokenization: ~4 chars per token
  if (!text.trim()) return 0;
  const words = text.match(/\S+/g) ?? [];
  return Math.ceil(text.length / 4);
}
export function TokenCounter() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.");
  const chars = text.length;
  const words = (text.match(/\S+/g) ?? []).length;
  const tokens = countTokens(text);
  const lines = text.split("\n").length;

  const LIMITS = [
    { model: "GPT-3.5 Turbo", ctx: 16385 },
    { model: "GPT-4o", ctx: 128000 },
    { model: "Claude 3.5 Sonnet", ctx: 200000 },
    { model: "Gemini 1.5 Pro", ctx: 1000000 },
    { model: "Llama 3.1 70B", ctx: 128000 },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Token Counter</CardTitle><CardDescription>Count approximate tokens for LLM context windows (GPT-style ~4 chars/token)</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Textarea className="font-mono text-xs min-h-[140px]" value={text} onChange={e => setText(e.target.value)} placeholder="Paste text here…" />
        <div className="grid grid-cols-4 gap-3">
          {[{ label: "Characters", value: chars.toLocaleString() }, { label: "Words", value: words.toLocaleString() }, { label: "Lines", value: lines.toLocaleString() }, { label: "≈ Tokens", value: tokens.toLocaleString() }].map(s => (
            <div key={s.label} className="rounded-lg border border-border p-3 text-center">
              <div className="text-2xl font-black font-mono text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label>Context window usage</Label>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="bg-muted/60 text-muted-foreground"><th className="text-left px-3 py-2">Model</th><th className="text-left px-3 py-2">Max tokens</th><th className="text-left px-3 py-2">Usage</th><th className="px-3 py-2 w-24" /></tr></thead>
              <tbody className="divide-y divide-border/50">
                {LIMITS.map(l => {
                  const pct = Math.min((tokens / l.ctx) * 100, 100);
                  return (
                    <tr key={l.model}>
                      <td className="px-3 py-2 font-medium">{l.model}</td>
                      <td className="px-3 py-2 font-mono">{l.ctx.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">{pct.toFixed(2)}%</td>
                      <td className="px-3 py-2"><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── NATO Phonetic Alphabet ────────────────────────────────────────────────────
const NATO: Record<string, string> = {
  A:"Alpha",B:"Bravo",C:"Charlie",D:"Delta",E:"Echo",F:"Foxtrot",G:"Golf",H:"Hotel",
  I:"India",J:"Juliet",K:"Kilo",L:"Lima",M:"Mike",N:"November",O:"Oscar",P:"Papa",
  Q:"Quebec",R:"Romeo",S:"Sierra",T:"Tango",U:"Uniform",V:"Victor",W:"Whiskey",
  X:"X-ray",Y:"Yankee",Z:"Zulu",
  "0":"Zero","1":"One","2":"Two","3":"Three","4":"Four","5":"Five",
  "6":"Six","7":"Seven","8":"Eight","9":"Nine",
};
export function NatoPhonetic() {
  const [text, setText] = useState("Hello World");
  const words = text.toUpperCase().split("").map(c => ({ char: c, nato: NATO[c] ?? (c === " " ? "(space)" : c) }));
  const output = words.map(w => w.nato).join(" / ");

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>NATO Phonetic Alphabet</CardTitle><CardDescription>Convert text to the NATO phonetic alphabet for unambiguous voice communication</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Input text</Label><Input className="font-mono" value={text} onChange={e => setText(e.target.value)} placeholder="Type any text…" /></div>
        <div className="flex flex-wrap gap-2">
          {words.map((w, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 px-2 py-1.5 bg-muted/40 rounded-md border border-border/50 min-w-[52px]">
              <span className="font-mono font-bold text-sm text-primary">{w.char === " " ? "·" : w.char}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{w.nato}</span>
            </div>
          ))}
        </div>
        {output && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>Full readout</Label><CopyBtn text={output} id="nato" /></div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border leading-relaxed">{output}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Text Reverse / Repeat / Whitespace Remover ────────────────────────────────
export function TextTransform() {
  const [text, setText] = useState("  Hello   World!  \nThis is a test.  ");
  const [repeatCount, setRepeatCount] = useState(3);
  const reversed = text.split("").reverse().join("");
  const noWhitespace = text.replace(/\s+/g, " ").trim();
  const noAllWhitespace = text.replace(/\s+/g, "");
  const repeated = text.repeat(Math.min(repeatCount, 50));

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Text Transformer</CardTitle><CardDescription>Reverse, repeat, or clean whitespace from text</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Input text</Label><Textarea className="font-mono text-xs min-h-[100px]" value={text} onChange={e => setText(e.target.value)} /></div>
        <div className="space-y-3">
          {[
            { label: "Reversed", value: reversed, id: "rev" },
            { label: "Whitespace collapsed", value: noWhitespace, id: "wsc" },
            { label: "All whitespace removed", value: noAllWhitespace, id: "wsr" },
          ].map(r => (
            <div key={r.id} className="space-y-1.5">
              <div className="flex justify-between items-center"><Label>{r.label}</Label><CopyBtn text={r.value} id={r.id} /></div>
              <div className="p-2.5 bg-muted/50 rounded-md font-mono text-xs border border-border/50 whitespace-pre-wrap break-all max-h-20 overflow-auto">{r.value}</div>
            </div>
          ))}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Label>Repeat</Label>
              <Input type="number" className="w-20 h-8 font-mono text-sm" value={repeatCount} min={1} max={50} onChange={e => setRepeatCount(parseInt(e.target.value) || 1)} />
              <span className="text-xs text-muted-foreground">times</span>
              <div className="ml-auto"><CopyBtn text={repeated} id="rep" /></div>
            </div>
            <div className="p-2.5 bg-muted/50 rounded-md font-mono text-xs border border-border/50 whitespace-pre-wrap break-all max-h-20 overflow-auto">{repeated}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
