import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import TOML from "@iarna/toml";
import * as yaml from "js-yaml";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── JSON Schema Validator ────────────────────────────────────────────────────
function validateAgainstSchema(data: unknown, schema: Record<string, unknown>): string[] {
  const errors: string[] = [];
  function check(d: unknown, s: Record<string, unknown>, path: string) {
    if (s.type) {
      const expected = s.type as string;
      const actual = d === null ? "null" : Array.isArray(d) ? "array" : typeof d;
      if (expected !== actual && !(expected === "integer" && typeof d === "number" && Number.isInteger(d as number))) {
        errors.push(`${path}: expected ${expected}, got ${actual}`);
        return;
      }
    }
    if (s.required && Array.isArray(s.required) && typeof d === "object" && d !== null) {
      for (const key of s.required as string[]) {
        if (!(key in (d as Record<string, unknown>))) errors.push(`${path}: missing required property "${key}"`);
      }
    }
    if (s.properties && typeof d === "object" && d !== null && !Array.isArray(d)) {
      for (const [k, sub] of Object.entries(s.properties as Record<string, unknown>)) {
        if (k in (d as Record<string, unknown>)) check((d as Record<string, unknown>)[k], sub as Record<string, unknown>, `${path}.${k}`);
      }
    }
    if (s.minimum !== undefined && typeof d === "number" && d < (s.minimum as number)) errors.push(`${path}: ${d} < minimum ${s.minimum}`);
    if (s.maximum !== undefined && typeof d === "number" && d > (s.maximum as number)) errors.push(`${path}: ${d} > maximum ${s.maximum}`);
    if (s.minLength !== undefined && typeof d === "string" && d.length < (s.minLength as number)) errors.push(`${path}: length ${d.length} < minLength ${s.minLength}`);
    if (s.maxLength !== undefined && typeof d === "string" && d.length > (s.maxLength as number)) errors.push(`${path}: length ${d.length} > maxLength ${s.maxLength}`);
    if (s.enum && Array.isArray(s.enum) && !(s.enum as unknown[]).includes(d)) errors.push(`${path}: "${d}" not in enum`);
    if (s.items && Array.isArray(d)) {
      (d as unknown[]).forEach((item, i) => check(item, s.items as Record<string, unknown>, `${path}[${i}]`));
    }
  }
  check(data, schema, "$");
  return errors;
}

export function JsonSchemaValidator() {
  const [json, setJson] = useState(`{\n  "name": "Alice",\n  "age": 30,\n  "email": "alice@example.com"\n}`);
  const [schema, setSchema] = useState(`{\n  "type": "object",\n  "required": ["name", "age"],\n  "properties": {\n    "name": { "type": "string", "minLength": 1 },\n    "age": { "type": "integer", "minimum": 0, "maximum": 150 },\n    "email": { "type": "string" }\n  }\n}`);
  const [result, setResult] = useState<{ valid: boolean; errors: string[] } | null>(null);

  const validate = () => {
    try {
      const data = JSON.parse(json);
      const s = JSON.parse(schema);
      const errors = validateAgainstSchema(data, s);
      setResult({ valid: errors.length === 0, errors });
    } catch (e: unknown) {
      setResult({ valid: false, errors: [(e as Error).message] });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>JSON Schema Validator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>JSON Data</Label>
            <Textarea value={json} onChange={e => setJson(e.target.value)} className="font-mono text-xs h-48" />
          </div>
          <div>
            <Label>JSON Schema</Label>
            <Textarea value={schema} onChange={e => setSchema(e.target.value)} className="font-mono text-xs h-48" />
          </div>
        </div>
        <Button onClick={validate}>Validate</Button>
        {result && (
          <div className={`p-3 rounded border ${result.valid ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}>
            <Badge variant={result.valid ? "default" : "destructive"}>{result.valid ? "✓ Valid" : "✗ Invalid"}</Badge>
            {result.errors.map((e, i) => <div key={i} className="text-sm mt-1 text-red-400">{e}</div>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── JSON to TOML ─────────────────────────────────────────────────────────────
export function JsonToTomlConverter() {
  const [input, setInput] = useState(`{\n  "title": "ToolzCraft",\n  "version": "1.0.0",\n  "features": ["fast", "free", "private"],\n  "server": {\n    "port": 3000,\n    "host": "localhost"\n  }\n}`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const obj = JSON.parse(input);
      setOutput(TOML.stringify(obj as Parameters<typeof TOML.stringify>[0]));
      setError("");
    } catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>JSON to TOML</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>JSON Input</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" />
        </div>
        <Button onClick={convert}>Convert to TOML</Button>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {output && (
          <div className="relative">
            <Label>TOML Output</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{output}</pre>
            <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── YAML Diff ────────────────────────────────────────────────────────────────
export function YamlDiff() {
  const [left, setLeft] = useState(`name: Alice\nage: 30\nrole: admin\ncity: London`);
  const [right, setRight] = useState(`name: Alice\nage: 31\nrole: user\ncountry: UK`);
  const [diff, setDiff] = useState<Array<{ type: "same" | "left" | "right"; key: string; lv: string; rv: string }> | null>(null);

  const compare = () => {
    try {
      const l = yaml.load(left) as Record<string, unknown>;
      const r = yaml.load(right) as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(l), ...Object.keys(r)]);
      const result = Array.from(allKeys).map(key => ({
        key, type: (JSON.stringify(l[key]) === JSON.stringify(r[key]) ? "same" : "left") as "same" | "left" | "right",
        lv: key in l ? JSON.stringify(l[key]) : "—",
        rv: key in r ? JSON.stringify(r[key]) : "—",
      }));
      result.forEach(row => { if (row.lv !== row.rv) row.type = row.rv === "—" ? "left" : "right"; if (row.lv === "—") row.type = "right"; if (row.rv === "—") row.type = "left"; if (row.lv !== "—" && row.rv !== "—" && row.lv !== row.rv) row.type = "right"; });
      setDiff(result);
    } catch (e: unknown) { alert((e as Error).message); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>YAML Diff</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>YAML A</Label>
            <Textarea value={left} onChange={e => setLeft(e.target.value)} className="font-mono text-xs h-40" />
          </div>
          <div>
            <Label>YAML B</Label>
            <Textarea value={right} onChange={e => setRight(e.target.value)} className="font-mono text-xs h-40" />
          </div>
        </div>
        <Button onClick={compare}>Compare</Button>
        {diff && (
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-muted"><th className="p-2 text-left">Key</th><th className="p-2 text-left">YAML A</th><th className="p-2 text-left">YAML B</th></tr></thead>
            <tbody>
              {diff.map(row => (
                <tr key={row.key} className={row.type === "same" ? "" : "bg-yellow-500/10"}>
                  <td className="p-2 font-mono border-b">{row.key}</td>
                  <td className={`p-2 font-mono border-b ${row.lv === "—" ? "text-red-400" : ""}`}>{row.lv}</td>
                  <td className={`p-2 font-mono border-b ${row.rv === "—" ? "text-red-400" : ""}`}>{row.rv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

// ─── YAML to Properties ───────────────────────────────────────────────────────
function flattenToProperties(obj: unknown, prefix = ""): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      lines.push(...flattenToProperties(v, key).split("\n").filter(Boolean));
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => lines.push(`${key}[${i}]=${item}`));
    } else {
      lines.push(`${key}=${v}`);
    }
  }
  return lines.join("\n");
}

export function YamlToProperties() {
  const [input, setInput] = useState(`server:\n  host: localhost\n  port: 8080\napp:\n  name: ToolzCraft\n  debug: true`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const obj = yaml.load(input) as Record<string, unknown>;
      setOutput(flattenToProperties(obj));
      setError("");
    } catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>YAML to .properties</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>YAML Input</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" />
        </div>
        <Button onClick={convert}>Convert</Button>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {output && (
          <div className="relative">
            <Label>.properties Output</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-56">{output}</pre>
            <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── TOML to YAML ─────────────────────────────────────────────────────────────
export function TomlToYamlConverter() {
  const [input, setInput] = useState(`[server]\nhost = "localhost"\nport = 8080\n\n[app]\nname = "ToolzCraft"\ndebug = true`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const obj = TOML.parse(input);
      setOutput(yaml.dump(obj, { indent: 2 }));
      setError("");
    } catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>TOML to YAML</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>TOML Input</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" />
        </div>
        <Button onClick={convert}>Convert</Button>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {output && (
          <div className="relative">
            <Label>YAML Output</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-56">{output}</pre>
            <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── XML to CSV ───────────────────────────────────────────────────────────────
export function XmlToCsvConverter() {
  const [input, setInput] = useState(`<users>\n  <user>\n    <id>1</id>\n    <name>Alice</name>\n    <email>alice@example.com</email>\n  </user>\n  <user>\n    <id>2</id>\n    <name>Bob</name>\n    <email>bob@example.com</email>\n  </user>\n</users>`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const parser = new XMLParser({ ignoreAttributes: false });
      const parsed = parser.parse(input) as Record<string, unknown>;
      const root = Object.values(parsed)[0] as Record<string, unknown>;
      const rowKey = Object.keys(root)[0];
      let rows = root[rowKey] as Record<string, unknown>[];
      if (!Array.isArray(rows)) rows = [rows];
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
      ].join("\n");
      setOutput(csv);
      setError("");
    } catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>XML to CSV</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>XML Input (list structure)</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" />
        </div>
        <Button onClick={convert}>Convert to CSV</Button>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {output && (
          <div className="relative">
            <Label>CSV Output</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-56">{output}</pre>
            <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Properties to YAML ───────────────────────────────────────────────────────
export function PropertiesToYaml() {
  const [input, setInput] = useState(`server.host=localhost\nserver.port=8080\napp.name=ToolzCraft\napp.debug=true`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const obj: Record<string, unknown> = {};
      input.split("\n").forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eq = trimmed.indexOf("=");
        if (eq === -1) return;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        const parts = key.split(".");
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!(parts[i] in cur)) cur[parts[i]] = {};
          cur = cur[parts[i]] as Record<string, unknown>;
        }
        const v: unknown = value === "true" ? true : value === "false" ? false : !isNaN(Number(value)) && value !== "" ? Number(value) : value;
        cur[parts[parts.length - 1]] = v;
      });
      setOutput(yaml.dump(obj, { indent: 2 }));
      setError("");
    } catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>.properties to YAML</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>.properties Input</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" />
        </div>
        <Button onClick={convert}>Convert</Button>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {output && (
          <div className="relative">
            <Label>YAML Output</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-56">{output}</pre>
            <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── JSON Mock Data Generator ──────────────────────────────────────────────────
const FIRSTNAMES = ["Alice", "Bob", "Carol", "Dave", "Eva", "Frank", "Grace", "Hiro", "Iris", "Jake"];
const LASTNAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
const DOMAINS = ["example.com", "test.org", "demo.net", "fake.io"];

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]) { return arr[randomInt(0, arr.length - 1)]; }
function generateMockRow(fields: Array<{ name: string; type: string }>) {
  const obj: Record<string, unknown> = {};
  fields.forEach(({ name, type }) => {
    const t = type.toLowerCase();
    const n = name.toLowerCase();
    if (t === "string" && (n.includes("email") || n === "email")) {
      const fn = pick(FIRSTNAMES).toLowerCase();
      obj[name] = `${fn}@${pick(DOMAINS)}`;
    } else if (t === "string" && (n.includes("name") || n.includes("first") || n.includes("last"))) {
      obj[name] = n.includes("last") ? pick(LASTNAMES) : n.includes("first") ? pick(FIRSTNAMES) : `${pick(FIRSTNAMES)} ${pick(LASTNAMES)}`;
    } else if (t === "string") {
      obj[name] = `${name}_${randomInt(1, 999)}`;
    } else if (t === "number" || t === "integer") {
      obj[name] = randomInt(1, 10000);
    } else if (t === "boolean") {
      obj[name] = Math.random() > 0.5;
    } else if (t === "date") {
      const d = new Date(Date.now() - randomInt(0, 365 * 5) * 86400000);
      obj[name] = d.toISOString().split("T")[0];
    } else {
      obj[name] = null;
    }
  });
  return obj;
}

export function JsonMockGenerator() {
  const [fields, setFields] = useState([
    { name: "id", type: "integer" },
    { name: "name", type: "string" },
    { name: "email", type: "string" },
    { name: "active", type: "boolean" },
    { name: "createdAt", type: "date" },
  ]);
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");

  const generate = () => {
    const data = Array.from({ length: count }, (_, i) => ({ ...generateMockRow(fields), id: i + 1 }));
    setOutput(JSON.stringify(data, null, 2));
  };

  const updateField = (i: number, key: "name" | "type", value: string) => {
    const f = [...fields]; f[i] = { ...f[i], [key]: value }; setFields(f);
  };

  return (
    <Card>
      <CardHeader><CardTitle>JSON Mock Data Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="flex-1 rounded border bg-background px-2 py-1 text-sm" placeholder="Field name" value={f.name} onChange={e => updateField(i, "name", e.target.value)} />
              <select className="rounded border bg-background px-2 py-1 text-sm" value={f.type} onChange={e => updateField(i, "type", e.target.value)}>
                {["string", "integer", "number", "boolean", "date"].map(t => <option key={t}>{t}</option>)}
              </select>
              <Button size="sm" variant="destructive" onClick={() => setFields(f => f.filter((_, j) => j !== i))}>×</Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setFields(f => [...f, { name: "field", type: "string" }])}>+ Add Field</Button>
        </div>
        <div className="flex items-center gap-2">
          <Label>Rows:</Label>
          <input type="number" className="w-20 rounded border bg-background px-2 py-1 text-sm" min={1} max={100} value={count} onChange={e => setCount(+e.target.value)} />
          <Button onClick={generate}>Generate</Button>
        </div>
        {output && (
          <div className="relative">
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{output}</pre>
            <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SOAP XML to JSON ─────────────────────────────────────────────────────────
export function SoapXmlToJson() {
  const [input, setInput] = useState(`<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUserResponse>
      <User>
        <id>42</id>
        <name>Alice</name>
        <email>alice@example.com</email>
      </User>
    </GetUserResponse>
  </soap:Body>
</soap:Envelope>`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
      const full = parser.parse(input) as Record<string, unknown>;
      const envelope = (full["Envelope"] ?? full["soap:Envelope"]) as Record<string, unknown>;
      const body = (envelope?.["Body"] ?? envelope?.["soap:Body"]) as Record<string, unknown> ?? full;
      setOutput(JSON.stringify(body, null, 2));
      setError("");
    } catch (e: unknown) { setError((e as Error).message); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>SOAP XML to JSON</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>SOAP XML Input</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-48" />
        </div>
        <Button onClick={convert}>Extract Body as JSON</Button>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {output && (
          <div className="relative">
            <Label>JSON Output (Body only)</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{output}</pre>
            <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
