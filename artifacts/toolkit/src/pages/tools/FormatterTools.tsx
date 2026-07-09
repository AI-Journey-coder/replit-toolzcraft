import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, CheckCheck } from "lucide-react";
import { html as beautifyHtml, css as beautifyCss } from "js-beautify";
import JSON5 from "json5";
import * as TOML from "@iarna/toml";
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

function FormatterShell({
  title, description, inputPlaceholder, outputFilename, format,
}: {
  title: string;
  description: string;
  inputPlaceholder: string;
  outputFilename: string;
  format: (input: string) => string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    try {
      if (!input.trim()) { setOutput(""); setError(null); return; }
      setOutput(format(input));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Formatting failed");
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
          <Button onClick={run} data-testid="btn-format">Format</Button>
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

// ─── HTML Formatter ─────────────────────────────────────────────────────────

export function HtmlFormatter() {
  return (
    <FormatterShell
      title="HTML Formatter"
      description="Beautify and indent HTML code"
      inputPlaceholder="<div><p>Hello</p></div>"
      outputFilename="formatted.html"
      format={(input) => beautifyHtml(input, { indent_size: 2, wrap_line_length: 0 })}
    />
  );
}

// ─── CSS Formatter ──────────────────────────────────────────────────────────

export function CssFormatter() {
  return (
    <FormatterShell
      title="CSS Formatter"
      description="Beautify and format CSS code"
      inputPlaceholder=".btn{color:red;padding:4px}"
      outputFilename="formatted.css"
      format={(input) => beautifyCss(input, { indent_size: 2 })}
    />
  );
}

// ─── XML Formatter ──────────────────────────────────────────────────────────

export function XmlFormatter() {
  return (
    <FormatterShell
      title="XML Formatter"
      description="Beautify and indent XML documents"
      inputPlaceholder="<root><item>value</item></root>"
      outputFilename="formatted.xml"
      format={(input) => {
        const parser = new XMLParser({ preserveOrder: true, ignoreAttributes: false });
        const parsed = parser.parse(input);
        const builder = new XMLBuilder({ format: true, indentBy: "  ", preserveOrder: true, ignoreAttributes: false });
        return builder.build(parsed);
      }}
    />
  );
}

// ─── YAML Formatter ─────────────────────────────────────────────────────────

export function YamlFormatter() {
  return (
    <FormatterShell
      title="YAML Formatter"
      description="Beautify and format YAML documents"
      inputPlaceholder={"name: Ada\nroles: [admin, user]"}
      outputFilename="formatted.yaml"
      format={(input) => yaml.dump(yaml.load(input), { indent: 2 })}
    />
  );
}

// ─── TOML Formatter ─────────────────────────────────────────────────────────

export function TomlFormatter() {
  return (
    <FormatterShell
      title="TOML Formatter"
      description="Beautify and format TOML configuration files"
      inputPlaceholder={'title = "example"\n[owner]\nname = "Ada"'}
      outputFilename="formatted.toml"
      format={(input) => TOML.stringify(TOML.parse(input))}
    />
  );
}

// ─── JSON5 Formatter ────────────────────────────────────────────────────────

export function Json5Formatter() {
  return (
    <FormatterShell
      title="JSON5 Formatter"
      description="Format JSON5 with comments and trailing commas"
      inputPlaceholder={"{\n  // comment\n  name: 'Ada',\n  active: true,\n}"}
      outputFilename="formatted.json5"
      format={(input) => JSON5.stringify(JSON5.parse(input), null, 2)}
    />
  );
}

// ─── JSON to Python Dict ────────────────────────────────────────────────────

function jsonToPython(value: any, indent = 0): string {
  const pad = "    ".repeat(indent);
  const padIn = "    ".repeat(indent + 1);
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`;
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((v) => `${padIn}${jsonToPython(v, indent + 1)}`).join(",\n")}\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  return `{\n${entries.map(([k, v]) => `${padIn}'${k}': ${jsonToPython(v, indent + 1)}`).join(",\n")}\n${pad}}`;
}

export function JsonToPythonDict() {
  return (
    <FormatterShell
      title="JSON to Python Dict"
      description="Convert JSON to Python dictionary syntax"
      inputPlaceholder='{"name": "Ada", "active": true, "tags": ["admin", "user"]}'
      outputFilename="data.py"
      format={(input) => jsonToPython(JSON.parse(input))}
    />
  );
}

// ─── JSON to Go Struct ──────────────────────────────────────────────────────

function toGoFieldName(key: string): string {
  return key.split(/[_-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function goType(value: any): string {
  if (value === null) return "interface{}";
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number") return Number.isInteger(value) ? "int" : "float64";
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) return `[]${value.length ? goType(value[0]) : "interface{}"}`;
  if (typeof value === "object") return "struct";
  return "interface{}";
}

function jsonToGoStruct(obj: Record<string, any>, name = "Root"): string {
  const nested: string[] = [];
  const fields = Object.entries(obj).map(([k, v]) => {
    const fieldName = toGoFieldName(k);
    let type = goType(v);
    if (type === "struct") {
      const structName = fieldName;
      nested.push(jsonToGoStruct(v, structName));
      type = structName;
    }
    return `\t${fieldName} ${type} \`json:"${k}"\``;
  });
  const main = `type ${name} struct {\n${fields.join("\n")}\n}`;
  return [main, ...nested].join("\n\n");
}

export function JsonToGoStruct() {
  return (
    <FormatterShell
      title="JSON to Go Struct"
      description="Generate Go structs from JSON data"
      inputPlaceholder='{"name": "Ada", "age": 30, "address": {"city": "London"}}'
      outputFilename="struct.go"
      format={(input) => jsonToGoStruct(JSON.parse(input))}
    />
  );
}

// ─── JSON to Java Class ─────────────────────────────────────────────────────

function toJavaFieldName(key: string): string {
  const parts = key.split(/[_-]/);
  return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function javaType(value: any): string {
  if (value === null) return "Object";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return Number.isInteger(value) ? "int" : "double";
  if (typeof value === "string") return "String";
  if (Array.isArray(value)) return `List<${value.length ? javaType(value[0]) : "Object"}>`;
  if (typeof value === "object") return "Object";
  return "Object";
}

function jsonToJavaClass(obj: Record<string, any>, name = "Root"): string {
  const fields = Object.entries(obj).map(([k, v]) => `    private ${javaType(v)} ${toJavaFieldName(k)};`);
  const gettersSetters = Object.entries(obj).map(([k, v]) => {
    const fieldName = toJavaFieldName(k);
    const capitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const type = javaType(v);
    return `    public ${type} get${capitalized}() { return ${fieldName}; }\n    public void set${capitalized}(${type} ${fieldName}) { this.${fieldName} = ${fieldName}; }`;
  });
  return `public class ${name} {\n${fields.join("\n")}\n\n${gettersSetters.join("\n\n")}\n}`;
}

export function JsonToJavaClass() {
  return (
    <FormatterShell
      title="JSON to Java Class"
      description="Generate Java classes from JSON data"
      inputPlaceholder='{"name": "Ada", "age": 30, "tags": ["admin"]}'
      outputFilename="Root.java"
      format={(input) => jsonToJavaClass(JSON.parse(input))}
    />
  );
}

// ─── Regex Visualizer / Explainer ──────────────────────────────────────────

const REGEX_TOKEN_EXPLANATIONS: [RegExp, (m: string) => string][] = [
  [/^\^/, () => "start of string"],
  [/^\$/, () => "end of string"],
  [/^\.\*/, () => "any characters, zero or more times"],
  [/^\.\+/, () => "any characters, one or more times"],
  [/^\./, () => "any single character"],
  [/^\\d\+/, () => "one or more digits"],
  [/^\\d\*/, () => "zero or more digits"],
  [/^\\d/, () => "a digit (0-9)"],
  [/^\\w\+/, () => "one or more word characters"],
  [/^\\w/, () => "a word character (letter, digit, underscore)"],
  [/^\\s\+/, () => "one or more whitespace characters"],
  [/^\\s/, () => "a whitespace character"],
  [/^\[([^\]]+)\]\+/, (m) => `one or more characters from the set [${m}]`],
  [/^\[([^\]]+)\]/, (m) => `a character from the set [${m}]`],
  [/^\(([^)]+)\)/, (m) => `a capturing group matching "${m}"`],
  [/^\{(\d+),(\d+)\}/, (m) => { const [min, max] = m.split(","); return `between ${min} and ${max} repetitions of the previous token`; }],
  [/^\{(\d+)\}/, (m) => `exactly ${m} repetitions of the previous token`],
  [/^\?/, () => "the previous token, optionally (zero or one time)"],
  [/^\*/, () => "the previous token, zero or more times"],
  [/^\+/, () => "the previous token, one or more times"],
  [/^\|/, () => "or"],
];

function explainRegex(pattern: string): string[] {
  const explanations: string[] = [];
  let rest = pattern;
  let guard = 0;
  while (rest.length > 0 && guard++ < 200) {
    let matched = false;
    for (const [re, fn] of REGEX_TOKEN_EXPLANATIONS) {
      const m = rest.match(re);
      if (m) {
        explanations.push(fn(m[1] ?? m[0]));
        rest = rest.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      explanations.push(`literal character "${rest[0]}"`);
      rest = rest.slice(1);
    }
  }
  return explanations;
}

export function RegexVisualizer() {
  const [pattern, setPattern] = useState("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
  const [explanation, setExplanation] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const explain = () => {
    try {
      new RegExp(pattern);
      setExplanation(explainRegex(pattern.replace(/^\/|\/[gimsuy]*$/g, "")));
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setExplanation(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Regex Visualizer / Explainer</CardTitle>
        <CardDescription>Turn regex patterns into plain English explanations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea className="font-mono text-sm h-20" value={pattern} onChange={(e) => setPattern(e.target.value)} data-testid="textarea-pattern" />
        <Button onClick={explain} data-testid="btn-explain">Explain</Button>
        {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono">{error}</div>}
        {explanation && (
          <ol className="space-y-1 list-decimal list-inside text-sm p-3 rounded-md border border-border bg-muted/20 max-h-[400px] overflow-auto" data-testid="explanation-output">
            {explanation.map((e, i) => <li key={i}>{e}</li>)}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
