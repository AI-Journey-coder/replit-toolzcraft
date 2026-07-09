import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, CheckCheck } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────

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
    <Button size="sm" variant="outline" onClick={copy} data-testid="btn-copy">
      {copied ? <CheckCheck className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

// ─── JSON Formatter ───────────────────────────────────────────────────────

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const process = (minify = false) => {
    try {
      if (!input.trim()) { setOutput(""); setError(null); return; }
      const parsed = JSON.parse(input);
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
      setOutput("");
    }
  };

  const download = () => {
    if (!output) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([output], { type: "application/json" }));
    a.download = "formatted.json";
    a.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>JSON Formatter & Validator</CardTitle>
              <CardDescription className="mt-1">Format, minify, and validate JSON</CardDescription>
            </div>
            <div className="flex gap-2">
              {output && <CopyBtn text={output} />}
              {output && <Button size="sm" variant="outline" onClick={download} data-testid="btn-download"><Download className="h-4 w-4 mr-1" />Download</Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={() => process(false)} data-testid="btn-beautify">Beautify</Button>
            <Button variant="secondary" onClick={() => process(true)} data-testid="btn-minify">Minify</Button>
            <Button variant="outline" onClick={() => process(false)} data-testid="btn-validate">Validate</Button>
            <Button variant="ghost" onClick={() => { setInput(""); setOutput(""); setError(null); }}>Clear</Button>
          </div>
          {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono" data-testid="status-error">Error: {error}</div>}
          {!error && output && <div className="p-3 bg-green-500/10 text-green-600 border border-green-500/20 rounded-md text-sm font-mono" data-testid="status-valid">Valid JSON</div>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[480px]">
            <Textarea placeholder="Paste JSON here..." className="font-mono text-sm resize-none h-full" value={input} onChange={(e) => setInput(e.target.value)} data-testid="textarea-input" />
            <Textarea readOnly placeholder="Output appears here..." className="font-mono text-sm bg-muted/30 resize-none h-full" value={output} data-testid="textarea-output" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Base64 Encode/Decode ─────────────────────────────────────────────────

export function Base64Tool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("encode");
  const fileRef = useRef<HTMLInputElement>(null);

  const encode = () => {
    try { setResult(btoa(unescape(encodeURIComponent(text)))); setError(""); } catch { setError("Encoding failed"); }
  };
  const decode = () => {
    try { setResult(decodeURIComponent(escape(atob(text)))); setError(""); } catch { setError("Invalid Base64 string"); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(",")[1] ?? "";
      setResult(b64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Base64 Encode / Decode</CardTitle>
        <CardDescription>Convert text or files to/from Base64</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="encode" data-testid="tab-encode">Encode</TabsTrigger>
            <TabsTrigger value="decode" data-testid="tab-decode">Decode</TabsTrigger>
            <TabsTrigger value="file" data-testid="tab-file">File to Base64</TabsTrigger>
          </TabsList>
          <TabsContent value="encode" className="space-y-3 mt-4">
            <Textarea placeholder="Enter text to encode..." className="font-mono min-h-[150px]" value={text} onChange={e => setText(e.target.value)} data-testid="textarea-encode-input" />
            <Button onClick={encode} data-testid="btn-encode">Encode</Button>
          </TabsContent>
          <TabsContent value="decode" className="space-y-3 mt-4">
            <Textarea placeholder="Enter Base64 string to decode..." className="font-mono min-h-[150px]" value={text} onChange={e => setText(e.target.value)} data-testid="textarea-decode-input" />
            <Button onClick={decode} data-testid="btn-decode">Decode</Button>
          </TabsContent>
          <TabsContent value="file" className="space-y-3 mt-4">
            <input ref={fileRef} type="file" className="hidden" onChange={handleFile} data-testid="input-file" />
            <Button variant="outline" onClick={() => fileRef.current?.click()} data-testid="btn-select-file">Select File</Button>
            <p className="text-sm text-muted-foreground">Select any file to convert to Base64</p>
          </TabsContent>
        </Tabs>

        {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-mono">{error}</div>}

        {result && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Result</Label>
              <CopyBtn text={result} />
            </div>
            <Textarea readOnly className="font-mono text-sm bg-muted/30 min-h-[120px]" value={result} data-testid="textarea-result" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── URL Encode/Decode ────────────────────────────────────────────────────

export function UrlEncodeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tab, setTab] = useState("encode");

  const process = () => {
    try {
      if (tab === "encode") setOutput(encodeURIComponent(input));
      else setOutput(decodeURIComponent(input));
    } catch { setOutput("Invalid input"); }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>URL Encode / Decode</CardTitle>
        <CardDescription>Percent-encode or decode URL strings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={v => { setTab(v); setOutput(""); }}>
          <TabsList>
            <TabsTrigger value="encode" data-testid="tab-encode">Encode</TabsTrigger>
            <TabsTrigger value="decode" data-testid="tab-decode">Decode</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-2">
          <Label>Input</Label>
          <Textarea className="font-mono min-h-[120px]" placeholder={tab === "encode" ? "Enter URL or text..." : "Enter encoded URL..."} value={input} onChange={e => setInput(e.target.value)} data-testid="textarea-input" />
        </div>
        <Button onClick={process} data-testid="btn-process">{tab === "encode" ? "Encode" : "Decode"}</Button>
        {output && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Result</Label>
              <CopyBtn text={output} />
            </div>
            <Textarea readOnly className="font-mono text-sm bg-muted/30 min-h-[120px]" value={output} data-testid="textarea-output" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Regex Tester ─────────────────────────────────────────────────────────

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testStr, setTestStr] = useState("");

  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join("");

  let matches: RegExpMatchArray[] = [];
  let error = "";
  let highlightedHtml = testStr;

  try {
    if (pattern) {
      const regex = new RegExp(pattern, flagStr);
      const allMatches = [...testStr.matchAll(new RegExp(pattern, flagStr.includes("g") ? flagStr : flagStr + "g"))];
      matches = allMatches;
      highlightedHtml = testStr.replace(new RegExp(pattern, flagStr.includes("g") ? flagStr : flagStr + "g"),
        (m) => `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">${m.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</mark>`
      );
    }
  } catch (e: any) { error = e.message; }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Regex Tester</CardTitle>
          <CardDescription>Test regular expressions against your string</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label>Pattern</Label>
              <Input className="font-mono" placeholder="Enter regex pattern..." value={pattern} onChange={e => setPattern(e.target.value)} data-testid="input-pattern" />
            </div>
            <div className="space-y-2">
              <Label>Flags</Label>
              <div className="flex gap-3">
                {(Object.keys(flags) as Array<keyof typeof flags>).map(f => (
                  <div key={f} className="flex items-center gap-1">
                    <Checkbox id={`flag-${f}`} checked={flags[f]} onCheckedChange={c => setFlags(prev => ({ ...prev, [f]: !!c }))} data-testid={`checkbox-flag-${f}`} />
                    <label htmlFor={`flag-${f}`} className="font-mono text-sm cursor-pointer">{f}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-mono">{error}</div>}

          <div className="space-y-2">
            <Label>Test String</Label>
            <Textarea className="font-mono min-h-[130px]" placeholder="Enter text to test against..." value={testStr} onChange={e => setTestStr(e.target.value)} data-testid="textarea-test" />
          </div>

          {testStr && pattern && !error && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Label>Highlighted Matches</Label>
                <Badge variant={matches.length > 0 ? "default" : "secondary"} data-testid="badge-count">
                  {matches.length} match{matches.length !== 1 ? "es" : ""}
                </Badge>
              </div>
              <div
                className="p-3 font-mono text-sm bg-muted/30 rounded-md whitespace-pre-wrap min-h-[60px] border border-border"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                data-testid="div-highlighted"
              />
            </div>
          )}

          {matches.length > 0 && (
            <div className="space-y-2">
              <Label>Match Details</Label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {matches.map((m, i) => (
                  <div key={i} className="flex gap-2 text-sm font-mono p-2 bg-muted/40 rounded" data-testid={`match-${i}`}>
                    <span className="text-muted-foreground">#{i + 1}</span>
                    <span className="text-primary">&quot;{m[0]}&quot;</span>
                    <span className="text-muted-foreground">at index {m.index}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Code Diff Viewer ─────────────────────────────────────────────────────

type DiffLine = { type: "same" | "added" | "removed"; content: string };

function computeDiff(original: string, modified: string): DiffLine[] {
  const aLines = original.split("\n");
  const bLines = modified.split("\n");
  const result: DiffLine[] = [];
  const maxLen = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < maxLen; i++) {
    const a = aLines[i];
    const b = bLines[i];
    if (a === undefined) result.push({ type: "added", content: b });
    else if (b === undefined) result.push({ type: "removed", content: a });
    else if (a === b) result.push({ type: "same", content: a });
    else {
      result.push({ type: "removed", content: a });
      result.push({ type: "added", content: b });
    }
  }
  return result;
}

export function CodeDiff() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  const diff = computeDiff(original, modified);
  const added = diff.filter(d => d.type === "added").length;
  const removed = diff.filter(d => d.type === "removed").length;

  const bgColor = { same: "", added: "bg-green-500/15 dark:bg-green-900/25", removed: "bg-red-500/15 dark:bg-red-900/25" };
  const textColor = { same: "", added: "text-green-700 dark:text-green-400", removed: "text-red-600 dark:text-red-400" };
  const prefix = { same: "  ", added: "+ ", removed: "- " };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Code Diff Viewer</CardTitle>
            <CardDescription>Compare two pieces of code line by line</CardDescription>
          </div>
          {showDiff && (
            <div className="flex gap-2 text-sm font-mono">
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/20">+{added} added</Badge>
              <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20">-{removed} removed</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showDiff ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original</Label>
                <Textarea className="font-mono text-sm min-h-[300px]" placeholder="Original code..." value={original} onChange={e => setOriginal(e.target.value)} data-testid="textarea-original" />
              </div>
              <div className="space-y-2">
                <Label>Modified</Label>
                <Textarea className="font-mono text-sm min-h-[300px]" placeholder="Modified code..." value={modified} onChange={e => setModified(e.target.value)} data-testid="textarea-modified" />
              </div>
            </div>
            <Button onClick={() => setShowDiff(true)} data-testid="btn-diff">Compare</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setShowDiff(false)} data-testid="btn-back">Back to Editor</Button>
            <div className="font-mono text-sm bg-muted/30 rounded-md border border-border overflow-auto max-h-[500px]" data-testid="div-diff">
              {diff.map((line, i) => (
                <div key={i} className={`px-4 py-0.5 flex gap-3 ${bgColor[line.type]}`}>
                  <span className={`shrink-0 select-none ${textColor[line.type]}`}>{prefix[line.type]}</span>
                  <span className={textColor[line.type]}>{line.content || " "}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── JS/CSS Minifier ─────────────────────────────────────────────────────

function minifyJs(code: string): string {
  return code
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,()=+\-*/<>!&|])\s*/g, "$1")
    .trim();
}

function minifyCss(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

export function JsMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [lang, setLang] = useState("js");

  const minify = () => {
    setOutput(lang === "js" ? minifyJs(input) : minifyCss(input));
  };

  const origSize = new Blob([input]).size;
  const minSize = new Blob([output]).size;
  const saved = origSize > 0 ? (((origSize - minSize) / origSize) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>JS / CSS Minifier</CardTitle>
        <CardDescription>Minify JavaScript or CSS to reduce file size</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-center">
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-[120px]" data-testid="select-lang"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={minify} data-testid="btn-minify">Minify</Button>
          {output && <CopyBtn text={output} />}
          {output && origSize > 0 && (
            <div className="text-sm font-mono text-muted-foreground">
              {origSize}B → {minSize}B <span className="text-green-600">({saved}% saved)</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
          <Textarea className="font-mono text-sm resize-none h-full" placeholder={`Paste ${lang.toUpperCase()} here...`} value={input} onChange={e => setInput(e.target.value)} data-testid="textarea-input" />
          <Textarea readOnly className="font-mono text-sm bg-muted/30 resize-none h-full" placeholder="Minified output..." value={output} data-testid="textarea-output" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SQL Formatter ────────────────────────────────────────────────────────

const SQL_KEYWORDS = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "ON", "AND", "OR", "NOT", "IN", "LIKE", "IS NULL", "IS NOT NULL", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "INDEX", "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "UNION", "UNION ALL", "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "DISTINCT", "COUNT", "SUM", "AVG", "MAX", "MIN"];

function formatSql(sql: string): string {
  let result = sql.trim();
  const upper = result.toUpperCase();
  for (const kw of SQL_KEYWORDS.sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`\\b${kw}\\b`, "gi");
    result = result.replace(re, kw);
  }
  const breakBefore = ["SELECT", "FROM", "WHERE", "ORDER BY", "GROUP BY", "HAVING", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "LIMIT", "OFFSET", "UNION", "UNION ALL", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM"];
  for (const kw of breakBefore) {
    result = result.replace(new RegExp(`(?<!\n)\\b(${kw})\\b`, "g"), "\n$1");
  }
  result = result.replace(/,\s*/g, ",\n  ");
  result = result.replace(/\bAND\b/g, "\n  AND");
  result = result.replace(/\bOR\b/g, "\n  OR");
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

export function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>SQL Formatter</CardTitle>
            <CardDescription>Format and beautify SQL queries</CardDescription>
          </div>
          {output && <CopyBtn text={output} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={() => setOutput(formatSql(input))} data-testid="btn-format">Format SQL</Button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[420px]">
          <Textarea className="font-mono text-sm resize-none h-full" placeholder="Paste raw SQL here..." value={input} onChange={e => setInput(e.target.value)} data-testid="textarea-input" />
          <Textarea readOnly className="font-mono text-sm bg-muted/30 resize-none h-full" placeholder="Formatted output..." value={output} data-testid="textarea-output" />
        </div>
      </CardContent>
    </Card>
  );
}
