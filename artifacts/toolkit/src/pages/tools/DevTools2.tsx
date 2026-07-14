import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── API Response Viewer ──────────────────────────────────────────────────────
export function ApiResponseViewer() {
  const [input, setInput] = useState(`{"id":1,"name":"Alice","email":"alice@example.com","roles":["admin","user"],"meta":{"createdAt":"2024-01-15","active":true}}`);
  const [format, setFormat] = useState<"json" | "xml" | "text">("json");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<Record<string, string>>({});

  const analyze = () => {
    const size = new TextEncoder().encode(input).length;
    if (format === "json") {
      try {
        const parsed = JSON.parse(input);
        const pretty = JSON.stringify(parsed, null, 2);
        setOutput(pretty);
        const countKeys = (o: unknown): number => {
          if (typeof o !== "object" || o === null) return 0;
          return Object.keys(o as object).length + Object.values(o as object).reduce((s, v) => s + countKeys(v), 0);
        };
        setStats({ Size: `${size} bytes`, Keys: `${countKeys(parsed)}`, Type: Array.isArray(parsed) ? `Array[${(parsed as unknown[]).length}]` : typeof parsed });
      } catch (e: unknown) { setOutput(`Error: ${(e as Error).message}`); setStats({}); }
    } else {
      setOutput(input);
      setStats({ Size: `${size} bytes`, Lines: `${input.split("\n").length}` });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>API Response Viewer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={format} onValueChange={v => setFormat(v as "json" | "xml" | "text")}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={analyze}>Analyze & Format</Button>
        </div>
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-32" placeholder="Paste API response here..." />
        {Object.keys(stats).length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {Object.entries(stats).map(([k, v]) => (
              <Badge key={k} variant="outline">{k}: {v}</Badge>
            ))}
          </div>
        )}
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

// ─── JSONPath Tester ──────────────────────────────────────────────────────────
function jsonPath(obj: unknown, path: string): unknown[] {
  const parts = path.replace(/^\$\.?/, "").split(/[\.\[\]]+/).filter(Boolean);
  const results: unknown[] = [];
  function traverse(current: unknown, remaining: string[]) {
    if (remaining.length === 0) { results.push(current); return; }
    const [head, ...rest] = remaining;
    if (head === "*") {
      if (Array.isArray(current)) current.forEach(item => traverse(item, rest));
      else if (typeof current === "object" && current !== null) Object.values(current).forEach(v => traverse(v, rest));
    } else if (head === "..") {
      traverse(current, rest);
      if (Array.isArray(current)) current.forEach(item => traverse(item, remaining));
      else if (typeof current === "object" && current !== null) Object.values(current).forEach(v => traverse(v, remaining));
    } else if (!isNaN(Number(head)) && Array.isArray(current)) {
      traverse((current as unknown[])[Number(head)], rest);
    } else if (typeof current === "object" && current !== null) {
      traverse((current as Record<string, unknown>)[head], rest);
    }
  }
  traverse(obj, parts);
  return results;
}

export function JsonPathTester() {
  const [json, setJson] = useState(`{\n  "store": {\n    "books": [\n      { "title": "Clean Code", "price": 29.99, "author": "Martin" },\n      { "title": "DDIA", "price": 45.00, "author": "Kleppmann" },\n      { "title": "SICP", "price": 35.50, "author": "Abelson" }\n    ]\n  }\n}`);
  const [path, setPath] = useState("$.store.books[*].title");
  const [results, setResults] = useState<unknown[]>([]);
  const [error, setError] = useState("");

  const test = () => {
    try {
      const obj = JSON.parse(json);
      const r = jsonPath(obj, path);
      setResults(r);
      setError("");
    } catch (e: unknown) { setError((e as Error).message); setResults([]); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>JSONPath Tester</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>JSON Data</Label>
          <Textarea value={json} onChange={e => setJson(e.target.value)} className="font-mono text-xs h-40" />
        </div>
        <div>
          <Label>JSONPath Expression</Label>
          <div className="flex gap-2">
            <Input value={path} onChange={e => setPath(e.target.value)} className="font-mono" placeholder="$.store.books[*].title" />
            <Button onClick={test}>Test</Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
          {["$.store.books[*].title", "$.store.books[0]", "$.store.books[*].price"].map(p => (
            <button key={p} className="px-2 py-1 rounded border hover:bg-muted font-mono" onClick={() => setPath(p)}>{p}</button>
          ))}
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {results.length > 0 && (
          <div>
            <Label>Results ({results.length})</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-48">{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── GraphQL Formatter ────────────────────────────────────────────────────────
function formatGraphQL(query: string): string {
  let indent = 0;
  const lines: string[] = [];
  const tokens = query.replace(/\s+/g, " ").trim().split(/([{}()]|,(?!\s*[}\]]))/);
  tokens.forEach(token => {
    token = token.trim();
    if (!token) return;
    if (token === "}") { indent--; lines.push("  ".repeat(indent) + token); }
    else if (token === "{") { lines[lines.length - 1] += " {"; indent++; }
    else if (token === "(") { lines[lines.length - 1] += "("; }
    else if (token === ")") { lines[lines.length - 1] += ")"; }
    else if (token === ",") { lines[lines.length - 1] += ","; }
    else { lines.push("  ".repeat(indent) + token); }
  });
  return lines.filter(Boolean).join("\n");
}

export function GraphqlFormatter() {
  const [input, setInput] = useState(`query GetUser($id: ID!) { user(id: $id) { id name email posts { title createdAt } } }`);
  const [output, setOutput] = useState("");

  const format = () => { setOutput(formatGraphQL(input)); };

  return (
    <Card>
      <CardHeader><CardTitle>GraphQL Formatter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>GraphQL Query / Schema</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-32" />
        </div>
        <Button onClick={format}>Format</Button>
        {output && (
          <div className="relative">
            <Label>Formatted</Label>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{output}</pre>
            <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Dockerfile Builder ───────────────────────────────────────────────────────
export function DockerfileBuilder() {
  const [lang, setLang] = useState("node");
  const [version, setVersion] = useState("20");
  const [port, setPort] = useState("3000");
  const [workdir, setWorkdir] = useState("/app");
  const [cmd, setCmd] = useState("");
  const [envVars, setEnvVars] = useState("NODE_ENV=production");
  const [multi, setMulti] = useState(true);

  const templates: Record<string, { image: string; versions: string[]; build: string; run: string; defaultCmd: string }> = {
    node: { image: "node", versions: ["20", "18", "16"], build: "RUN npm ci --only=production", run: "COPY . .", defaultCmd: "node index.js" },
    python: { image: "python", versions: ["3.12", "3.11", "3.10"], build: "RUN pip install --no-cache-dir -r requirements.txt", run: "COPY . .", defaultCmd: "python app.py" },
    go: { image: "golang", versions: ["1.22", "1.21"], build: "RUN go mod download && go build -o /app/main .", run: "", defaultCmd: "/app/main" },
    java: { image: "eclipse-temurin", versions: ["21", "17", "11"], build: "RUN mvn clean package -DskipTests", run: "COPY target/*.jar app.jar", defaultCmd: "java -jar app.jar" },
  };

  const tmpl = templates[lang];
  const effectiveCmd = cmd || tmpl.defaultCmd;

  const dockerfile = multi
    ? `# Build stage\nFROM ${tmpl.image}:${version}-alpine AS builder\nWORKDIR ${workdir}\nCOPY package*.json ./\n${tmpl.build}\n${tmpl.run}\n\n# Production stage\nFROM ${tmpl.image}:${version}-alpine\nWORKDIR ${workdir}\nCOPY --from=builder ${workdir} ${workdir}\n${envVars.split("\n").filter(Boolean).map(e => `ENV ${e}`).join("\n")}\nEXPOSE ${port}\nCMD ["${effectiveCmd.split(" ").join('", "')}"]\n`
    : `FROM ${tmpl.image}:${version}-alpine\nWORKDIR ${workdir}\nCOPY . .\n${tmpl.build}\n${envVars.split("\n").filter(Boolean).map(e => `ENV ${e}`).join("\n")}\nEXPOSE ${port}\nCMD ["${effectiveCmd.split(" ").join('", "')}"]\n`;

  return (
    <Card>
      <CardHeader><CardTitle>Dockerfile Builder</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Language</Label>
            <Select value={lang} onValueChange={v => { setLang(v); setVersion(templates[v].versions[0]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(templates).map(k => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Version</Label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tmpl.versions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Exposed Port</Label>
            <Input value={port} onChange={e => setPort(e.target.value)} />
          </div>
          <div>
            <Label>Work Directory</Label>
            <Input value={workdir} onChange={e => setWorkdir(e.target.value)} />
          </div>
          <div>
            <Label>CMD Override (optional)</Label>
            <Input value={cmd} onChange={e => setCmd(e.target.value)} placeholder={tmpl.defaultCmd} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="multi" checked={multi} onChange={e => setMulti(e.target.checked)} />
            <Label htmlFor="multi">Multi-stage build</Label>
          </div>
        </div>
        <div>
          <Label>Environment Variables (one per line KEY=VALUE)</Label>
          <Textarea value={envVars} onChange={e => setEnvVars(e.target.value)} className="font-mono text-xs h-20" />
        </div>
        <div className="relative">
          <Label>Dockerfile</Label>
          <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{dockerfile}</pre>
          <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(dockerfile)}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── DNS Record Reference ─────────────────────────────────────────────────────
const DNS_RECORDS = [
  { type: "A", description: "Maps a domain to an IPv4 address", example: "example.com → 93.184.216.34", notes: "Most common record type. Used for web servers." },
  { type: "AAAA", description: "Maps a domain to an IPv6 address", example: "example.com → 2606:2800:220:1:248:1893:25c8:1946", notes: "IPv6 equivalent of A record." },
  { type: "CNAME", description: "Canonical name — alias to another domain", example: "www.example.com → example.com", notes: "Cannot be used at the zone apex with other records." },
  { type: "MX", description: "Mail exchange — specifies mail server", example: "10 mail.example.com", notes: "Priority value: lower = higher priority." },
  { type: "TXT", description: "Arbitrary text data", example: "v=spf1 include:_spf.google.com ~all", notes: "Used for SPF, DKIM, DMARC, domain verification." },
  { type: "NS", description: "Name server for the domain zone", example: "ns1.example.com", notes: "Delegates a subdomain to another nameserver." },
  { type: "SOA", description: "Start of Authority — zone metadata", example: "ns1.example.com. admin.example.com.", notes: "Contains serial, refresh, retry, expire, TTL." },
  { type: "PTR", description: "Reverse DNS — IP to domain name", example: "34.216.184.93.in-addr.arpa → example.com", notes: "Used in reverse DNS lookups." },
  { type: "SRV", description: "Service location record", example: "_sip._tcp.example.com 10 5 5060 sip.example.com", notes: "Used for SIP, XMPP, auto-discovery." },
  { type: "CAA", description: "Certification Authority Authorization", example: "0 issue \"letsencrypt.org\"", notes: "Restricts which CAs can issue SSL certs." },
  { type: "DKIM", description: "DomainKeys Identified Mail signature", example: "v=DKIM1; k=rsa; p=...", notes: "Stored as TXT record at selector._domainkey.domain." },
  { type: "DMARC", description: "Domain-based Message Authentication", example: "v=DMARC1; p=reject; rua=mailto:dmarc@example.com", notes: "Stored as TXT at _dmarc.domain." },
  { type: "SPF", description: "Sender Policy Framework", example: "v=spf1 include:_spf.google.com -all", notes: "Stored as TXT record. Authorizes mail senders." },
];

export function DnsRecordReference() {
  const [search, setSearch] = useState("");
  const filtered = DNS_RECORDS.filter(r => r.type.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader><CardTitle>DNS Record Reference</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Search record types..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.type} className="p-3 rounded border">
              <div className="flex items-center gap-2 mb-1">
                <Badge>{r.type}</Badge>
                <span className="font-medium text-sm">{r.description}</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground bg-muted rounded p-2">{r.example}</div>
              <div className="text-xs text-muted-foreground mt-1">{r.notes}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OpenAPI Validator ────────────────────────────────────────────────────────
import * as yaml from "js-yaml";

export function OpenApiValidator() {
  const [input, setInput] = useState(`openapi: "3.0.0"
info:
  title: My API
  version: "1.0.0"
paths:
  /users:
    get:
      summary: List users
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: array`);
  const [results, setResults] = useState<Array<{ type: "error" | "warning" | "ok"; message: string }>>([]);

  const validate = () => {
    const issues: Array<{ type: "error" | "warning" | "ok"; message: string }> = [];
    try {
      const doc = yaml.load(input) as Record<string, unknown>;
      if (!doc.openapi && !doc.swagger) issues.push({ type: "error", message: "Missing 'openapi' or 'swagger' version field" });
      else issues.push({ type: "ok", message: `Version: ${doc.openapi ?? doc.swagger}` });
      const info = doc.info as Record<string, unknown> | undefined;
      if (!info) issues.push({ type: "error", message: "Missing 'info' object" });
      else {
        if (!info.title) issues.push({ type: "error", message: "info.title is required" });
        if (!info.version) issues.push({ type: "error", message: "info.version is required" });
        if (info.title && info.version) issues.push({ type: "ok", message: `API: ${info.title} v${info.version}` });
      }
      const paths = doc.paths as Record<string, unknown> | undefined;
      if (!paths) issues.push({ type: "warning", message: "No 'paths' defined" });
      else {
        const pathCount = Object.keys(paths).length;
        issues.push({ type: "ok", message: `${pathCount} path(s) defined` });
        for (const [path, pathObj] of Object.entries(paths)) {
          const methods = Object.keys(pathObj as object).filter(k => ["get", "post", "put", "patch", "delete", "options", "head"].includes(k));
          if (methods.length === 0) issues.push({ type: "warning", message: `${path}: no HTTP methods defined` });
        }
      }
    } catch (e: unknown) { issues.push({ type: "error", message: `Parse error: ${(e as Error).message}` }); }
    setResults(issues);
  };

  return (
    <Card>
      <CardHeader><CardTitle>OpenAPI Validator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>OpenAPI YAML or JSON</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-52" />
        </div>
        <Button onClick={validate}>Validate</Button>
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded ${r.type === "error" ? "bg-red-500/10 text-red-400" : r.type === "warning" ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"}`}>
                <span>{r.type === "error" ? "✗" : r.type === "warning" ? "⚠" : "✓"}</span>
                <span>{r.message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
