import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCheck } from "lucide-react";
import { marked } from "marked";
import TurndownService from "turndown";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); }} disabled={!text}>
      {ok ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}

// ─── Markdown to HTML ─────────────────────────────────────────────────────────
export function MarkdownToHtml() {
  const [md, setMd] = useState(`# Hello World

This is **bold**, *italic*, and \`code\`.

## Features
- Item 1
- Item 2
- Item 3

> A blockquote

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`
`);
  const html = useMemo(() => marked(md) as string, [md]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader><CardTitle>Markdown to HTML</CardTitle><CardDescription>Convert Markdown text to clean HTML output</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Markdown</Label><Textarea className="font-mono text-xs min-h-[320px]" value={md} onChange={e => setMd(e.target.value)} /></div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>HTML output</Label><CopyBtn text={html} /></div>
            <pre className="font-mono text-xs min-h-[320px] p-3 bg-muted/50 rounded-lg border border-border overflow-auto whitespace-pre-wrap">{html}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── HTML to Markdown ─────────────────────────────────────────────────────────
export function HtmlToMarkdown() {
  const [html, setHtml] = useState(`<h1>Hello World</h1>
<p>This is <strong>bold</strong>, <em>italic</em>, and <code>code</code>.</p>
<h2>Features</h2>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<blockquote><p>A blockquote here</p></blockquote>`);

  const markdown = useMemo(() => {
    try { return new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" }).turndown(html); }
    catch { return "Invalid HTML"; }
  }, [html]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader><CardTitle>HTML to Markdown</CardTitle><CardDescription>Convert HTML code to clean Markdown format</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>HTML</Label><Textarea className="font-mono text-xs min-h-[300px]" value={html} onChange={e => setHtml(e.target.value)} /></div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>Markdown output</Label><CopyBtn text={markdown} /></div>
            <pre className="font-mono text-xs min-h-[300px] p-3 bg-muted/50 rounded-lg border border-border overflow-auto whitespace-pre-wrap">{markdown}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CSV Column Extractor ─────────────────────────────────────────────────────
export function CsvColumnExtractor() {
  const [csv, setCsv] = useState(`name,email,age,city
Alice,alice@example.com,28,London
Bob,bob@test.org,34,Paris
Carol,carol@demo.io,22,Tokyo
Dave,dave@sample.net,45,Berlin`);
  const [sep, setSep] = useState(",");
  const [selected, setSelected] = useState<number[]>([0, 1]);

  const { headers, rows } = useMemo(() => {
    const lines = csv.trim().split("\n");
    if (!lines.length) return { headers: [], rows: [] };
    const headers = lines[0].split(sep).map(h => h.trim());
    const rows = lines.slice(1).map(l => l.split(sep).map(c => c.trim()));
    return { headers, rows };
  }, [csv, sep]);

  const output = useMemo(() => {
    if (!selected.length) return "";
    const hdr = selected.map(i => headers[i] ?? "").join(sep);
    const body = rows.map(r => selected.map(i => r[i] ?? "").join(sep)).join("\n");
    return hdr + "\n" + body;
  }, [selected, headers, rows, sep]);

  const toggle = (i: number) => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i].sort());

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CSV Column Extractor</CardTitle><CardDescription>Select and extract specific columns from CSV data</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="space-y-1.5"><Label>Delimiter</Label>
            <div className="flex gap-1">
              {[",", ";", "\t", "|"].map(d => <Button key={d} size="sm" variant={sep === d ? "default" : "outline"} className="font-mono w-10" onClick={() => setSep(d)}>{d === "\t" ? "⇥" : d}</Button>)}
            </div>
          </div>
        </div>
        <div className="space-y-1.5"><Label>CSV input</Label><Textarea className="font-mono text-xs min-h-[140px]" value={csv} onChange={e => setCsv(e.target.value)} /></div>
        {headers.length > 0 && (
          <div className="space-y-1.5">
            <Label>Select columns to extract ({selected.length}/{headers.length})</Label>
            <div className="flex flex-wrap gap-2">
              {headers.map((h, i) => (
                <button key={i} onClick={() => toggle(i)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selected.includes(i) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-border text-muted-foreground hover:border-primary"}`}>
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
        {output && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>Extracted CSV</Label><CopyBtn text={output} /></div>
            <pre className="font-mono text-xs p-3 bg-muted/50 rounded-lg border border-border overflow-auto max-h-[200px]">{output}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Readability Score ────────────────────────────────────────────────────────
function fleschKincaid(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
  const words: string[] = text.match(/\b\w+\b/g) ?? [];
  const wordCount = words.length || 1;
  const syllables = words.reduce((sum: number, w: string) => sum + countSyllables(w), 0);
  const score = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
  return { score: Math.max(0, Math.min(100, score)), sentences, words: wordCount, syllables, avgWordsPerSentence: +(wordCount / sentences).toFixed(1), avgSyllablesPerWord: +(syllables / wordCount).toFixed(2) };
}
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}
function gradeLabel(score: number) {
  if (score >= 90) return { label: "5th grade", desc: "Very easy to read" };
  if (score >= 80) return { label: "6th grade", desc: "Easy to read" };
  if (score >= 70) return { label: "7th grade", desc: "Fairly easy" };
  if (score >= 60) return { label: "8th-9th grade", desc: "Standard" };
  if (score >= 50) return { label: "10th-12th grade", desc: "Fairly difficult" };
  if (score >= 30) return { label: "College", desc: "Difficult" };
  return { label: "Professional", desc: "Very difficult" };
}

export function ReadabilityScore() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog. This sentence demonstrates readability scoring with common words. Short sentences are easier to read. Readability analysis helps writers communicate clearly.");
  const stats = useMemo(() => fleschKincaid(text), [text]);
  const grade = gradeLabel(stats.score);

  const color = stats.score >= 70 ? "text-green-500" : stats.score >= 50 ? "text-yellow-500" : "text-red-500";
  const barColor = stats.score >= 70 ? "bg-green-500" : stats.score >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Readability Score</CardTitle><CardDescription>Check Flesch-Kincaid readability and get writing suggestions</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Textarea className="font-mono text-xs min-h-[140px]" value={text} onChange={e => setText(e.target.value)} placeholder="Paste your text here…" />
        {text.trim() && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className={`text-3xl font-black font-mono ${color}`}>{stats.score.toFixed(1)}</span>
                <div className="text-right"><div className="font-bold">{grade.label}</div><div className="text-xs text-muted-foreground">{grade.desc}</div></div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${stats.score}%` }} /></div>
              <div className="text-xs text-muted-foreground">Flesch Reading Ease score (0 = very hard, 100 = very easy)</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: "Sentences", v: stats.sentences }, { label: "Words", v: stats.words }, { label: "Syllables", v: stats.syllables }, { label: "Words/sentence", v: stats.avgWordsPerSentence }, { label: "Syllables/word", v: stats.avgSyllablesPerWord }].map(s => (
                <div key={s.label} className="rounded-lg border border-border p-2 text-center">
                  <div className="text-xl font-black font-mono text-primary">{s.v}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Fancy / Zalgo / Upside-Down Text ─────────────────────────────────────────
const UPSIDE_DOWN: Record<string, string> = {
  a:"ɐ",b:"q",c:"ɔ",d:"p",e:"ǝ",f:"ɟ",g:"ƃ",h:"ɥ",i:"ᴉ",j:"ɾ",k:"ʞ",l:"l",m:"ɯ",
  n:"u",o:"o",p:"d",q:"b",r:"ɹ",s:"s",t:"ʇ",u:"n",v:"ʌ",w:"ʍ",x:"x",y:"ʎ",z:"z",
  A:"∀",B:"ᗺ",C:"Ɔ",D:"ᗡ",E:"Ǝ",F:"Ⅎ",G:"פ",H:"H",I:"I",J:"ɾ",K:"ʞ",L:"˥",M:"W",
  N:"N",O:"O",P:"Ԁ",Q:"Q",R:"ɹ",S:"S",T:"┴",U:"∩",V:"Λ",W:"M",X:"X",Y:"⅄",Z:"Z",
  "0":"0","1":"Ɩ","2":"ᄅ","3":"Ɛ","4":"ㄣ","5":"ϛ","6":"9","7":"ㄥ","8":"8","9":"6",
  ".":"˙",",":"'","?":"¿","!":"¡","(":")",")":"(","{":"}","}":"{","[":"]","]":"[",
};
const SMALL_CAPS: Record<string, string> = {
  a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ғ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",
  n:"ɴ",o:"ᴏ",p:"ᴘ",q:"Q",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ",
};
function wide(s: string) { return Array.from(s).map(c => c === " " ? "　" : String.fromCodePoint(c.codePointAt(0)! + (c.match(/[a-zA-Z0-9]/) ? 65248 : 0))).join(""); }
function strikethrough(s: string) { return Array.from(s).map(c => c + "\u0336").join(""); }
function zalgo(s: string) {
  const cc = ["̍","̎","̄","̅","̿","̑","̆","̐","͒","͗","͑","̇","̈","̉","͙","̊","͚","̋","̃","̂","̌","͐","̀","́","̂","͌","͛","͘"];
  return Array.from(s).map(c => c === " " ? " " : c + cc[Math.floor(Math.random() * cc.length)] + cc[Math.floor(Math.random() * cc.length)]).join("");
}

export function FancyText() {
  const [input, setInput] = useState("Hello World");
  const transforms = [
    { label: "🙃 Upside-down", fn: (s: string) => Array.from(s).map(c => UPSIDE_DOWN[c] ?? c).reverse().join("") },
    { label: "ᴀ Small caps", fn: (s: string) => Array.from(s.toLowerCase()).map(c => SMALL_CAPS[c] ?? c).join("") },
    { label: "Ｗ Wide text", fn: wide },
    { label: "S̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶", fn: strikethrough },
    { label: "Z̵a̸l̷g̶o̴", fn: zalgo },
    { label: "𝗕𝗼𝗹𝗱", fn: (s: string) => Array.from(s).map(c => { const cp = c.codePointAt(0)!; if (cp >= 65 && cp <= 90) return String.fromCodePoint(cp - 65 + 0x1D400); if (cp >= 97 && cp <= 122) return String.fromCodePoint(cp - 97 + 0x1D41A); return c; }).join("") },
    { label: "𝘐𝘵𝘢𝘭𝘪𝘤", fn: (s: string) => Array.from(s).map(c => { const cp = c.codePointAt(0)!; if (cp >= 65 && cp <= 90) return String.fromCodePoint(cp - 65 + 0x1D434); if (cp >= 97 && cp <= 122) return String.fromCodePoint(cp - 97 + 0x1D44E); return c; }).join("") },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Fancy / Zalgo / Upside-Down Text</CardTitle><CardDescription>Generate stylized and decorative Unicode text transformations</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Input text</Label><Input className="font-mono text-lg" value={input} onChange={e => setInput(e.target.value)} /></div>
        <div className="space-y-2">
          {transforms.map(t => {
            const out = t.fn(input);
            return (
              <div key={t.label} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg border border-border/50">
                <span className="text-xs text-muted-foreground w-32 shrink-0">{t.label}</span>
                <span className="font-mono text-sm flex-1 break-all">{out}</span>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={() => navigator.clipboard.writeText(out)}><Copy className="h-3 w-3" /></Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Text to Speech ────────────────────────────────────────────────────────────
export function TextToSpeech() {
  const [text, setText] = useState("Welcome to ToolzCraft — your privacy-first browser utility platform. All tools run entirely in your browser.");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voice, setVoice] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const supported = "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const load = () => { const v = speechSynthesis.getVoices(); setVoices(v); if (v.length && !voice) setVoice(v[0].name); };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, [supported]);

  const speak = () => {
    if (!supported) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const v = voices.find(v => v.name === voice);
    if (v) utt.voice = v;
    utt.rate = rate; utt.pitch = pitch; utt.volume = volume;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    speechSynthesis.speak(utt);
  };
  const stop = () => { speechSynthesis.cancel(); setSpeaking(false); };

  if (!supported) return (
    <Card className="max-w-xl mx-auto"><CardHeader><CardTitle>Text to Speech</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Your browser does not support the Web Speech API. Please use a modern browser like Chrome or Edge.</p></CardContent></Card>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Text to Speech</CardTitle><CardDescription>Convert text to spoken audio using the browser's built-in Web Speech API — no server required</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Text to speak</Label><Textarea className="min-h-[120px]" value={text} onChange={e => setText(e.target.value)} /></div>
        {voices.length > 0 && (
          <div className="space-y-1.5"><Label>Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger><SelectValue placeholder="Select voice…" /></SelectTrigger>
              <SelectContent className="max-h-56">{voices.map(v => <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          {[{ label: "Speed", value: rate, min: 0.5, max: 2, step: 0.1, set: setRate, unit: "×" }, { label: "Pitch", value: pitch, min: 0, max: 2, step: 0.1, set: setPitch, unit: "" }, { label: "Volume", value: volume, min: 0, max: 1, step: 0.05, set: setVolume, unit: "" }].map(s => (
            <div key={s.label} className="space-y-1">
              <div className="flex justify-between text-xs"><Label>{s.label}</Label><span className="font-mono text-muted-foreground">{s.value}{s.unit}</span></div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.set(parseFloat(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={speak} disabled={!text.trim() || speaking}>{speaking ? "Speaking…" : "▶ Speak"}</Button>
          <Button variant="outline" onClick={stop} disabled={!speaking}>■ Stop</Button>
        </div>
        <p className="text-xs text-muted-foreground">Uses Web Speech API — all audio processing is done locally in your browser.</p>
      </CardContent>
    </Card>
  );
}

// ─── Prompt Formatter ─────────────────────────────────────────────────────────
export function PromptFormatter() {
  const [role, setRole] = useState("You are a helpful assistant specialized in software engineering.");
  const [context, setContext] = useState("The user is building a React application with TypeScript.");
  const [task, setTask] = useState("Review the following code and suggest improvements for performance and readability.");
  const [constraints, setConstraints] = useState("Keep the response concise. Use bullet points. No external libraries.");
  const [outputFmt, setOutputFmt] = useState("Markdown with code blocks");
  const [userInput, setUserInput] = useState("```tsx\nconst App = () => <div>Hello</div>;\n```");

  const prompt = [
    role && `## Role\n${role}`,
    context && `\n## Context\n${context}`,
    task && `\n## Task\n${task}`,
    userInput && `\n## Input\n${userInput}`,
    constraints && `\n## Constraints\n${constraints}`,
    outputFmt && `\n## Output Format\n${outputFmt}`,
  ].filter(Boolean).join("\n");

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Prompt Formatter</CardTitle><CardDescription>Structure AI prompts with role, context, task, and constraints sections</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {[
          { label: "Role (system)", value: role, set: setRole, placeholder: "You are a…" },
          { label: "Context", value: context, set: setContext, placeholder: "Background information…" },
          { label: "Task", value: task, set: setTask, placeholder: "What you want the AI to do…" },
          { label: "Input / User content", value: userInput, set: setUserInput, placeholder: "Paste your code, text, or data…" },
          { label: "Constraints", value: constraints, set: setConstraints, placeholder: "Format, length, style requirements…" },
          { label: "Output format", value: outputFmt, set: setOutputFmt, placeholder: "JSON, Markdown, plain text…" },
        ].map(f => (
          <div key={f.label} className="space-y-1.5">
            <Label>{f.label}</Label>
            <Textarea className="font-mono text-xs min-h-[60px] resize-y" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
          </div>
        ))}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Full formatted prompt</Label><CopyBtn text={prompt} /></div>
          <pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto max-h-[320px] whitespace-pre-wrap">{prompt}</pre>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Text to ASCII Art ────────────────────────────────────────────────────────
// Simple 5x7 bitmap font for digits and uppercase letters
const FONT: Record<string, string[]> = {
  A:["  █  ","█   █","█████","█   █","█   █"],B:["████ ","█   █","████ ","█   █","████ "],C:[" ████","█    ","█    ","█    "," ████"],
  D:["████ ","█   █","█   █","█   █","████ "],E:["█████","█    ","████ ","█    ","█████"],F:["█████","█    ","████ ","█    ","█    "],
  G:[" ████","█    ","█  ██","█   █"," ████"],H:["█   █","█   █","█████","█   █","█   █"],I:["█████","  █  ","  █  ","  █  ","█████"],
  J:["  ███","   █ ","   █ ","█  █ "," ██  "],K:["█   █","█  █ ","███  ","█  █ ","█   █"],L:["█    ","█    ","█    ","█    ","█████"],
  M:["█   █","██ ██","█ █ █","█   █","█   █"],N:["█   █","██  █","█ █ █","█  ██","█   █"],O:[" ███ ","█   █","█   █","█   █"," ███ "],
  P:["████ ","█   █","████ ","█    ","█    "],Q:[" ███ ","█   █","█ █ █","█  ██"," ████"],R:["████ ","█   █","████ ","█  █ ","█   █"],
  S:[" ████","█    "," ███ ","    █","████ "],T:["█████","  █  ","  █  ","  █  ","  █  "],U:["█   █","█   █","█   █","█   █"," ███ "],
  V:["█   █","█   █","█   █"," █ █ ","  █  "],W:["█   █","█   █","█ █ █","██ ██","█   █"],X:["█   █"," █ █ ","  █  "," █ █ ","█   █"],
  Y:["█   █"," █ █ ","  █  ","  █  ","  █  "],Z:["█████","   █ ","  █  "," █   ","█████"],
  "0":[" ███ ","█  ██","█ █ █","██  █"," ███ "],"1":["  █  "," ██  ","  █  ","  █  ","█████"],"2":[" ███ ","█   █","  ██ "," █   ","█████"],
  "3":["█████","   █ ","  ██ ","   █ ","████ "],"4":["   █ ","  ██ "," █ █ ","█████","   █ "],"5":["█████","█    ","████ ","    █","████ "],
  "6":[" ███ ","█    ","████ ","█   █"," ███ "],"7":["█████","   █ ","  █  "," █   ","█    "],"8":[" ███ ","█   █"," ███ ","█   █"," ███ "],
  "9":[" ███ ","█   █"," ████","    █"," ███ "]," ":["     ","     ","     ","     ","     "],"!":["  █  ","  █  ","  █  ","     ","  █  "],
  "."  :["     ","     ","     ","     ","  █  "],
};
export function TextToAsciiArt() {
  const [text, setText] = useState("HELLO");
  const [char, setChar] = useState("█");

  const art = useMemo(() => {
    const chars = text.toUpperCase().slice(0, 12).split("");
    const rows = 5;
    const lines: string[] = Array(rows).fill("");
    for (const c of chars) {
      const glyph = FONT[c] ?? FONT[" "];
      for (let r = 0; r < rows; r++) {
        lines[r] += (glyph[r] ?? "     ").replace(/█/g, char) + " ";
      }
    }
    return lines.join("\n");
  }, [text, char]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Text to ASCII Art</CardTitle><CardDescription>Convert text to large ASCII block-letter art (A–Z, 0–9)</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5"><Label>Text (max 12 chars)</Label><Input className="font-mono text-lg uppercase" value={text} onChange={e => setText(e.target.value.slice(0, 12))} placeholder="HELLO" /></div>
          <div className="w-24 space-y-1.5"><Label>Block char</Label><Input className="font-mono text-center" value={char} onChange={e => setChar(e.target.value.slice(0, 2) || "█")} /></div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>ASCII art</Label><CopyBtn text={art} /></div>
          <pre className="p-4 bg-muted/50 rounded-lg font-mono text-sm border border-border overflow-auto leading-tight">{art}</pre>
        </div>
      </CardContent>
    </Card>
  );
}
