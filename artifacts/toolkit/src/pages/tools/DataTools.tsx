import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, CheckCheck, ChevronRight, ChevronDown } from "lucide-react";
import * as yaml from "js-yaml";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

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

function DownloadBtn({ text, filename }: { text: string; filename: string }) {
  const download = () => {
    if (!text) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = filename;
    a.click();
  };
  return (
    <Button size="sm" variant="outline" onClick={download} data-testid="btn-download">
      <Download className="h-4 w-4 mr-1" />Download
    </Button>
  );
}

function ConverterShell({
  title, description, inputPlaceholder, outputFilename, convert,
}: {
  title: string;
  description: string;
  inputPlaceholder: string;
  outputFilename: string;
  convert: (input: string) => string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    try {
      if (!input.trim()) { setOutput(""); setError(null); return; }
      setOutput(convert(input));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Conversion failed");
      setOutput("");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {output && <CopyBtn text={output} />}
            {output && <DownloadBtn text={output} filename={outputFilename} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={run} data-testid="btn-convert">Convert</Button>
          <Button variant="ghost" onClick={() => { setInput(""); setOutput(""); setError(null); }}>Clear</Button>
        </div>
        {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono" data-testid="status-error">Error: {error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[480px]">
          <Textarea placeholder={inputPlaceholder} className="font-mono text-sm resize-none h-full" value={input} onChange={(e) => setInput(e.target.value)} data-testid="textarea-input" />
          <Textarea readOnly placeholder="Output appears here..." className="font-mono text-sm bg-muted/30 resize-none h-full" value={output} data-testid="textarea-output" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CSV helpers ─────────────────────────────────────────────────────────

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
}

function toCsv(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) throw new Error("Input must be a non-empty JSON array");
  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
  const escape = (v: any) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of data) lines.push(headers.map((h) => escape(row[h])).join(","));
  return lines.join("\n");
}

// ─── JSON Validator ───────────────────────────────────────────────────────

export function JsonValidator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

  const validate = () => {
    if (!input.trim()) { setResult(null); return; }
    try {
      JSON.parse(input);
      setResult({ valid: true, message: "Valid JSON document." });
    } catch (e: any) {
      setResult({ valid: false, message: e.message || "Invalid JSON" });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>JSON Validator</CardTitle>
        <CardDescription>Validate JSON with detailed error messages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={validate} data-testid="btn-validate">Validate</Button>
        {result && (
          <div className={`p-3 rounded-md text-sm font-mono border ${result.valid ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`} data-testid="status-result">
            {result.message}
          </div>
        )}
        <Textarea placeholder="Paste JSON here..." className="font-mono text-sm resize-none h-[420px]" value={input} onChange={(e) => setInput(e.target.value)} data-testid="textarea-input" />
      </CardContent>
    </Card>
  );
}

// ─── JSON Diff ─────────────────────────────────────────────────────────────

function diffObjects(a: any, b: any, path = ""): string[] {
  const lines: string[] = [];
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    if (JSON.stringify(a) !== JSON.stringify(b)) lines.push(`${path || "root"}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
    return lines;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const p = path ? `${path}.${key}` : key;
    if (!(key in a)) lines.push(`+ ${p}: ${JSON.stringify(b[key])}`);
    else if (!(key in b)) lines.push(`- ${p}: ${JSON.stringify(a[key])}`);
    else if (typeof a[key] === "object" && typeof b[key] === "object" && a[key] !== null && b[key] !== null) lines.push(...diffObjects(a[key], b[key], p));
    else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) lines.push(`~ ${p}: ${JSON.stringify(a[key])} → ${JSON.stringify(b[key])}`);
  }
  return lines;
}

export function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    try {
      const a = JSON.parse(left || "{}");
      const b = JSON.parse(right || "{}");
      const d = diffObjects(a, b);
      setDiff(d.length ? d : ["No differences found."]);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setDiff(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>JSON Diff</CardTitle>
        <CardDescription>Compare two JSON documents structurally</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={run} data-testid="btn-diff">Compare</Button>
        {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Textarea placeholder="JSON A" className="font-mono text-sm h-[300px]" value={left} onChange={(e) => setLeft(e.target.value)} data-testid="textarea-left" />
          <Textarea placeholder="JSON B" className="font-mono text-sm h-[300px]" value={right} onChange={(e) => setRight(e.target.value)} data-testid="textarea-right" />
        </div>
        {diff && (
          <div className="p-3 bg-muted/30 rounded-md font-mono text-sm space-y-1 max-h-[240px] overflow-auto" data-testid="diff-output">
            {diff.map((l, i) => (
              <div key={i} className={l.startsWith("+") ? "text-green-500" : l.startsWith("-") ? "text-red-500" : l.startsWith("~") ? "text-yellow-500" : ""}>{l}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── JSON Tree Viewer ──────────────────────────────────────────────────────

function TreeNode({ label, value, depth = 0 }: { label: string; value: any; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = value !== null && typeof value === "object";

  if (!isObj) {
    return (
      <div style={{ paddingLeft: depth * 16 }} className="font-mono text-sm py-0.5">
        <span className="text-blue-400">{label}</span>: <span className="text-foreground">{JSON.stringify(value)}</span>
      </div>
    );
  }

  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value);
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 font-mono text-sm py-0.5 hover:text-primary" data-testid={`tree-toggle-${label}`}>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="text-blue-400">{label}</span>
        <span className="text-muted-foreground">{Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</span>
      </button>
      {open && entries.map(([k, v]) => <TreeNode key={k} label={k} value={v} depth={depth + 1} />)}
    </div>
  );
}

export function JsonTreeViewer() {
  const [input, setInput] = useState('{\n  "name": "example",\n  "tags": ["a", "b"],\n  "nested": { "count": 3 }\n}');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const parse = () => {
    try { setData(JSON.parse(input)); setError(null); } catch (e: any) { setError(e.message); setData(null); }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>JSON Tree Viewer</CardTitle>
        <CardDescription>Explore JSON data as a collapsible tree</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={parse} data-testid="btn-parse">Parse</Button>
        {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Textarea className="font-mono text-sm h-[400px]" value={input} onChange={(e) => setInput(e.target.value)} data-testid="textarea-input" />
          <div className="border border-border rounded-md p-3 h-[400px] overflow-auto bg-muted/20" data-testid="tree-output">
            {data !== null ? <TreeNode label="root" value={data} /> : <span className="text-muted-foreground text-sm">Parse JSON to view tree</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── JSON Schema Generator ─────────────────────────────────────────────────

function inferSchema(value: any): any {
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) return { type: "array", items: value.length ? inferSchema(value[0]) : {} };
  const t = typeof value;
  if (t === "object") {
    const properties: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) properties[k] = inferSchema(v);
    return { type: "object", properties, required: Object.keys(value) };
  }
  if (t === "number") return { type: Number.isInteger(value) ? "integer" : "number" };
  return { type: t };
}

export function JsonSchemaGenerator() {
  return (
    <ConverterShell
      title="JSON Schema Generator"
      description="Generate a JSON Schema (draft-07) from sample JSON data"
      inputPlaceholder='Paste sample JSON, e.g. {"name": "Ada", "age": 30}'
      outputFilename="schema.json"
      convert={(input) => {
        const parsed = JSON.parse(input);
        const schema = { $schema: "http://json-schema.org/draft-07/schema#", ...inferSchema(parsed) };
        return JSON.stringify(schema, null, 2);
      }}
    />
  );
}

// ─── JSON <-> CSV ───────────────────────────────────────────────────────────

export function JsonToCsv() {
  return (
    <ConverterShell
      title="JSON to CSV"
      description="Convert JSON arrays to CSV format"
      inputPlaceholder='[{"name": "Ada", "age": 30}, {"name": "Bob", "age": 25}]'
      outputFilename="data.csv"
      convert={(input) => toCsv(JSON.parse(input))}
    />
  );
}

export function CsvToJson() {
  return (
    <ConverterShell
      title="CSV to JSON"
      description="Convert CSV data to JSON format"
      inputPlaceholder={"name,age\nAda,30\nBob,25"}
      outputFilename="data.json"
      convert={(input) => JSON.stringify(parseCsv(input), null, 2)}
    />
  );
}

// ─── JSON <-> YAML ──────────────────────────────────────────────────────────

export function JsonToYaml() {
  return (
    <ConverterShell
      title="JSON to YAML"
      description="Convert JSON data to YAML format"
      inputPlaceholder='{"name": "Ada", "roles": ["admin", "user"]}'
      outputFilename="data.yaml"
      convert={(input) => yaml.dump(JSON.parse(input))}
    />
  );
}

export function YamlToJson() {
  return (
    <ConverterShell
      title="YAML to JSON"
      description="Convert YAML to JSON format"
      inputPlaceholder={"name: Ada\nroles:\n  - admin\n  - user"}
      outputFilename="data.json"
      convert={(input) => JSON.stringify(yaml.load(input), null, 2)}
    />
  );
}

// ─── JSON <-> XML ───────────────────────────────────────────────────────────

export function JsonToXml() {
  return (
    <ConverterShell
      title="JSON to XML"
      description="Convert JSON data to XML format"
      inputPlaceholder='{"person": {"name": "Ada", "age": 30}}'
      outputFilename="data.xml"
      convert={(input) => {
        const builder = new XMLBuilder({ format: true, indentBy: "  " });
        return builder.build(JSON.parse(input));
      }}
    />
  );
}

export function XmlToJson() {
  return (
    <ConverterShell
      title="XML to JSON"
      description="Convert XML documents to JSON format"
      inputPlaceholder={"<person>\n  <name>Ada</name>\n  <age>30</age>\n</person>"}
      outputFilename="data.json"
      convert={(input) => {
        const parser = new XMLParser();
        return JSON.stringify(parser.parse(input), null, 2);
      }}
    />
  );
}
