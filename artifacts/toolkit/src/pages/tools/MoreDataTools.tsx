import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, CheckCheck, ChevronDown, ChevronRight } from "lucide-react";
import TOML from "@iarna/toml";
import * as yaml from "js-yaml";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); }} disabled={!text}>
      {ok ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}

function ConvPanel({ title, desc, from, to, convert }: { title: string; desc: string; from: string; to: string; convert: (s: string) => string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const run = () => { setError(""); try { setOutput(convert(input)); } catch (e) { setError(e instanceof Error ? e.message : "Conversion failed"); setOutput(""); } };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>{from}</Label><Textarea className="font-mono text-xs min-h-[220px]" value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste ${from} here…`} /></div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center"><Label>{to}</Label><CopyBtn text={output} /></div>
            <Textarea readOnly className="font-mono text-xs min-h-[220px]" value={output} placeholder="Output will appear here…" />
          </div>
        </div>
        <Button onClick={run}>Convert</Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

// ─── TOML to JSON ─────────────────────────────────────────────────────────────
export function TomlToJson() {
  return <ConvPanel title="TOML to JSON" desc="Convert TOML configuration files to JSON format" from="TOML" to="JSON" convert={s => JSON.stringify(TOML.parse(s), null, 2)} />;
}

// ─── JSON to TOML ─────────────────────────────────────────────────────────────
export function JsonToToml() {
  return <ConvPanel title="JSON to TOML" desc="Convert JSON data to TOML format" from="JSON" to="TOML" convert={s => TOML.stringify(JSON.parse(s) as any)} />;
}

// ─── INI to JSON ─────────────────────────────────────────────────────────────
function parseIni(ini: string): Record<string, any> {
  const result: Record<string, any> = {};
  let section = "__root__";
  for (const line of ini.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith(";") || t.startsWith("#")) continue;
    if (t.startsWith("[") && t.endsWith("]")) { section = t.slice(1, -1).trim(); result[section] = result[section] ?? {}; continue; }
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim(), val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (section === "__root__") result[key] = val;
    else result[section][key] = val;
  }
  const { __root__, ...rest } = result;
  return __root__ ? { ...__root__, ...rest } : rest;
}
export function IniToJson() {
  return <ConvPanel title="INI to JSON" desc="Convert INI configuration files to JSON format" from="INI" to="JSON" convert={s => JSON.stringify(parseIni(s), null, 2)} />;
}

// ─── YAML to XML ──────────────────────────────────────────────────────────────
export function YamlToXml() {
  return <ConvPanel title="YAML to XML" desc="Convert YAML data to XML format" from="YAML" to="XML"
    convert={s => {
      const obj = yaml.load(s);
      const builder = new XMLBuilder({ format: true, indentBy: "  ", suppressEmptyNode: true });
      return builder.build({ root: obj });
    }}
  />;
}

// ─── CSV to XML ───────────────────────────────────────────────────────────────
function csvToXml(csv: string, sep = ","): string {
  const lines = csv.trim().split("\n");
  if (!lines.length) return "<records />";
  const headers = lines[0].split(sep).map(h => h.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, ""));
  const rows = lines.slice(1).map(l => l.split(sep));
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n';
  rows.forEach(r => {
    xml += "  <record>\n";
    headers.forEach((h, i) => { xml += `    <${h}>${(r[i] ?? "").trim()}</${h}>\n`; });
    xml += "  </record>\n";
  });
  return xml + "</records>";
}
export function CsvToXml() {
  const [input, setInput] = useState("name,age,city\nAlice,28,London\nBob,34,Paris\nCarol,22,Tokyo");
  const [sep, setSep] = useState(",");
  const output = useMemo(() => { try { return csvToXml(input, sep); } catch { return "Invalid CSV"; } }, [input, sep]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CSV to XML</CardTitle><CardDescription>Convert CSV data to XML format with configurable delimiters</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="space-y-1.5"><Label>Separator</Label><div className="flex gap-1">{[",",";","\t","|"].map(d => <Button key={d} size="sm" variant={sep === d ? "default" : "outline"} onClick={() => setSep(d)} className="font-mono w-10">{d === "\t" ? "⇥" : d}</Button>)}</div></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>CSV</Label><Textarea className="font-mono text-xs min-h-[200px]" value={input} onChange={e => setInput(e.target.value)} /></div>
          <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>XML</Label><CopyBtn text={output} /></div><Textarea readOnly className="font-mono text-xs min-h-[200px]" value={output} /></div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── JSON Minifier ────────────────────────────────────────────────────────────
export function JsonMinifier() {
  const [input, setInput] = useState('{\n  "name": "ToolzCraft",\n  "version": "1.0.0",\n  "tools": 110,\n  "private": true\n}');
  const output = useMemo(() => { try { return JSON.stringify(JSON.parse(input)); } catch { return ""; } }, [input]);
  const savings = input.length > 0 && output.length > 0 ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>JSON Minifier</CardTitle><CardDescription>Compress JSON by removing all whitespace and formatting</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Input JSON ({input.length} chars)</Label><Textarea className="font-mono text-xs min-h-[240px]" value={input} onChange={e => setInput(e.target.value)} /></div>
          <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>Minified JSON ({output.length} chars)</Label><CopyBtn text={output} /></div><Textarea readOnly className="font-mono text-xs min-h-[240px]" value={output} /></div>
        </div>
        {savings > 0 && <div className="text-sm text-green-500 font-medium text-center">✓ Saved {savings}% ({input.length - output.length} chars)</div>}
      </CardContent>
    </Card>
  );
}

// ─── JSON Table Viewer ────────────────────────────────────────────────────────
export function JsonTableViewer() {
  const [input, setInput] = useState('[{"name":"Alice","age":28,"city":"London","role":"Admin"},{"name":"Bob","age":34,"city":"Paris","role":"User"},{"name":"Carol","age":22,"city":"Tokyo","role":"Editor"},{"name":"Dave","age":45,"city":"Berlin","role":"User"}]');
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [filterText, setFilterText] = useState("");
  const [error, setError] = useState("");

  const { headers, rows } = useMemo(() => {
    setError("");
    try {
      const data = JSON.parse(input);
      if (!Array.isArray(data) || !data.length) return { headers: [], rows: [] };
      const headers = [...new Set(data.flatMap(r => Object.keys(r)))];
      let rows = data.map(r => headers.map(h => String(r[h] ?? "")));
      if (filterText) rows = rows.filter(r => r.some(c => c.toLowerCase().includes(filterText.toLowerCase())));
      if (sortCol) {
        const ci = headers.indexOf(sortCol);
        rows = [...rows].sort((a, b) => { const cmp = a[ci].localeCompare(b[ci], undefined, { numeric: true }); return sortDir === "asc" ? cmp : -cmp; });
      }
      return { headers, rows };
    } catch (e) { setError(e instanceof Error ? e.message : "Invalid JSON"); return { headers: [], rows: [] }; }
  }, [input, sortCol, sortDir, filterText]);

  const sort = (col: string) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader><CardTitle>JSON Table Viewer</CardTitle><CardDescription>View JSON arrays as a sortable, filterable data table</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>JSON array</Label><Textarea className="font-mono text-xs min-h-[80px]" value={input} onChange={e => setInput(e.target.value)} /></div>
        {error ? <p className="text-sm text-destructive">{error}</p> : (
          <>
            <Input className="h-8 text-sm" placeholder="Filter rows…" value={filterText} onChange={e => setFilterText(e.target.value)} />
            <div className="rounded-lg border border-border overflow-auto max-h-[400px]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/90">
                  <tr>{headers.map(h => <th key={h} className="text-left px-3 py-2 font-medium cursor-pointer hover:bg-muted/60 select-none" onClick={() => sort(h)}>{h} {sortCol === h ? (sortDir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rows.map((row, i) => <tr key={i} className="hover:bg-muted/30">{row.map((cell, j) => <td key={j} className="px-3 py-2 font-mono max-w-[200px] truncate" title={cell}>{cell}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-muted-foreground">{rows.length} row{rows.length !== 1 ? "s" : ""} &nbsp;·&nbsp; {headers.length} column{headers.length !== 1 ? "s" : ""}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Properties to JSON ───────────────────────────────────────────────────────
function parseProperties(s: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of s.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("!")) continue;
    const eq = t.search(/[=:]/);
    if (eq < 0) continue;
    result[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return result;
}
export function PropertiesToJson() {
  return <ConvPanel title="Properties to JSON" desc="Convert Java .properties files to JSON format" from=".properties" to="JSON" convert={s => JSON.stringify(parseProperties(s), null, 2)} />;
}

// ─── Structured Data Generator (JSON-LD) ──────────────────────────────────────
export function StructuredDataGenerator() {
  const [type, setType] = useState("Organization");
  const [fields, setFields] = useState<Record<string, string>>({
    name: "ToolzCraft", url: "https://toolzcraft.app", description: "Privacy-first browser utility platform"
  });

  const SCHEMAS: Record<string, string[]> = {
    Organization: ["name","url","description","logo","telephone","email","address","sameAs"],
    Person: ["name","jobTitle","email","url","telephone","address","sameAs"],
    Product: ["name","description","sku","brand","price","priceCurrency","url","image"],
    Article: ["headline","description","author","datePublished","dateModified","image","url"],
    FAQ: ["mainEntity[0].question","mainEntity[0].answer","mainEntity[1].question","mainEntity[1].answer"],
    BreadcrumbList: ["item[0].name","item[0].id","item[1].name","item[1].id","item[2].name","item[2].id"],
    WebSite: ["name","url","description","potentialAction.query-input"],
  };

  const jsonLd = useMemo(() => {
    const base: Record<string, any> = { "@context": "https://schema.org", "@type": type };
    Object.entries(fields).forEach(([k, v]) => { if (v) base[k] = v; });
    return JSON.stringify(base, null, 2);
  }, [type, fields]);

  const scriptTag = `<script type="application/ld+json">\n${jsonLd}\n</script>`;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Structured Data Generator</CardTitle><CardDescription>Generate JSON-LD structured data for SEO and rich search results</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Schema type</Label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SCHEMAS).map(s => <Button key={s} size="sm" variant={type === s ? "default" : "outline"} className="text-xs" onClick={() => { setType(s); setFields({}); }}>{s}</Button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(SCHEMAS[type] ?? []).map(f => (
            <div key={f} className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">{f}</Label>
              <Input className="h-8 font-mono text-xs" value={fields[f] ?? ""} onChange={e => setFields(fs => ({ ...fs, [f]: e.target.value }))} placeholder={`Enter ${f}…`} />
            </div>
          ))}
        </div>
        <div className="space-y-1.5"><div className="flex justify-between items-center"><Label>JSON-LD Script tag</Label><CopyBtn text={scriptTag} /></div><pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto max-h-[280px]">{scriptTag}</pre></div>
      </CardContent>
    </Card>
  );
}
