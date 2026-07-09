import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, RefreshCw } from "lucide-react";

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

// ─── JWT Decoder ────────────────────────────────────────────────────────────

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + (4 - (str.length % 4)) % 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}

export function JwtDecoder() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decode = () => {
    try {
      const parts = token.trim().split(".");
      if (parts.length < 2) throw new Error("Invalid JWT format — expected 3 dot-separated parts");
      setHeader(JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2));
      setPayload(JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to decode token");
      setHeader(""); setPayload("");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>JWT Decoder</CardTitle>
        <CardDescription>Decode and inspect JSON Web Tokens (signature not verified)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea placeholder="Paste JWT token here..." className="font-mono text-sm h-24" value={token} onChange={(e) => setToken(e.target.value)} data-testid="textarea-token" />
        <Button onClick={decode} data-testid="btn-decode">Decode</Button>
        {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono">{error}</div>}
        {(header || payload) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">HEADER</Label>
              <Textarea readOnly className="font-mono text-sm h-40 bg-muted/30 mt-1" value={header} data-testid="textarea-header" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">PAYLOAD</Label>
              <Textarea readOnly className="font-mono text-sm h-40 bg-muted/30 mt-1" value={payload} data-testid="textarea-payload" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── JWT Builder ────────────────────────────────────────────────────────────

function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function JwtBuilder() {
  const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "Ada Lovelace",\n  "iat": 1516239022\n}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  const build = async () => {
    try {
      const h = base64UrlEncode(JSON.stringify(JSON.parse(header)));
      const p = base64UrlEncode(JSON.stringify(JSON.parse(payload)));
      const unsigned = `${h}.${p}`;
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(unsigned));
      const sigB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(sig)));
      setResult(`${unsigned}.${sigB64}`);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to build token");
      setResult("");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>JWT Builder</CardTitle>
            <CardDescription className="mt-1">Encode and sign a JSON Web Token (HS256)</CardDescription>
          </div>
          {result && <CopyBtn text={result} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">HEADER</Label>
            <Textarea className="font-mono text-sm h-32 mt-1" value={header} onChange={(e) => setHeader(e.target.value)} data-testid="textarea-header" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">PAYLOAD</Label>
            <Textarea className="font-mono text-sm h-32 mt-1" value={payload} onChange={(e) => setPayload(e.target.value)} data-testid="textarea-payload" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">SECRET</Label>
          <Input className="font-mono mt-1" value={secret} onChange={(e) => setSecret(e.target.value)} data-testid="input-secret" />
        </div>
        <Button onClick={build} data-testid="btn-build">Generate Token</Button>
        {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono">{error}</div>}
        {result && <Textarea readOnly className="font-mono text-xs bg-muted/30 min-h-[80px]" value={result} data-testid="textarea-result" />}
      </CardContent>
    </Card>
  );
}

// ─── HTTP Status Code Lookup ───────────────────────────────────────────────

const HTTP_STATUSES: Record<string, { text: string; desc: string }> = {
  "100": { text: "Continue", desc: "The server has received the request headers and the client should proceed." },
  "101": { text: "Switching Protocols", desc: "The requester has asked the server to switch protocols." },
  "200": { text: "OK", desc: "The request has succeeded." },
  "201": { text: "Created", desc: "The request has been fulfilled, resulting in a new resource." },
  "202": { text: "Accepted", desc: "The request has been accepted for processing, but processing is not complete." },
  "204": { text: "No Content", desc: "The server successfully processed the request, but is not returning content." },
  "301": { text: "Moved Permanently", desc: "This and all future requests should be directed to the given URI." },
  "302": { text: "Found", desc: "Tells the client to look at (browse to) another URL." },
  "304": { text: "Not Modified", desc: "Indicates the resource has not been modified since last requested." },
  "400": { text: "Bad Request", desc: "The server cannot process the request due to a client error." },
  "401": { text: "Unauthorized", desc: "Authentication is required and has failed or not been provided." },
  "403": { text: "Forbidden", desc: "The request was valid, but the server is refusing action." },
  "404": { text: "Not Found", desc: "The requested resource could not be found." },
  "405": { text: "Method Not Allowed", desc: "A request method is not supported for the requested resource." },
  "408": { text: "Request Timeout", desc: "The server timed out waiting for the request." },
  "409": { text: "Conflict", desc: "The request conflicts with the current state of the server." },
  "410": { text: "Gone", desc: "The resource requested is no longer available." },
  "418": { text: "I'm a teapot", desc: "The server refuses to brew coffee because it is a teapot." },
  "422": { text: "Unprocessable Entity", desc: "The request was well-formed but contains semantic errors." },
  "429": { text: "Too Many Requests", desc: "The user has sent too many requests in a given time." },
  "500": { text: "Internal Server Error", desc: "A generic error message for unexpected server conditions." },
  "501": { text: "Not Implemented", desc: "The server does not support the functionality required." },
  "502": { text: "Bad Gateway", desc: "The server was acting as a gateway and received an invalid response." },
  "503": { text: "Service Unavailable", desc: "The server is currently unavailable (overloaded or down)." },
  "504": { text: "Gateway Timeout", desc: "The server was acting as a gateway and did not get a response in time." },
};

export function HttpStatusLookup() {
  const [query, setQuery] = useState("");
  const filtered = Object.entries(HTTP_STATUSES).filter(([code, v]) =>
    !query || code.includes(query) || v.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>HTTP Status Code Lookup</CardTitle>
        <CardDescription>Look up HTTP status codes and their meanings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Search by code or name..." value={query} onChange={(e) => setQuery(e.target.value)} data-testid="input-search" />
        <div className="space-y-2 max-h-[520px] overflow-auto">
          {filtered.map(([code, v]) => (
            <div key={code} className="flex items-start gap-3 p-3 rounded-md border border-border" data-testid={`status-${code}`}>
              <Badge variant={code.startsWith("2") ? "default" : code.startsWith("4") || code.startsWith("5") ? "destructive" : "secondary"} className="font-mono shrink-0">{code}</Badge>
              <div>
                <div className="font-medium">{v.text}</div>
                <div className="text-sm text-muted-foreground">{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── User Agent Parser ─────────────────────────────────────────────────────

function parseUserAgent(ua: string) {
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) && !/Chrome/.test(ua) ? "Safari" : "Unknown";
  const browserVersion = ua.match(/(Chrome|Firefox|Safari|Edg|Version)\/([\d.]+)/)?.[2] ?? "Unknown";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  const isMobile = /Mobi|Android|iPhone/.test(ua);
  const engine = /WebKit/.test(ua) ? "WebKit" : /Gecko/.test(ua) ? "Gecko" : "Unknown";
  return { browser, browserVersion, os, isMobile, engine };
}

export function UserAgentParser() {
  const [ua, setUa] = useState(navigator.userAgent);
  const [result, setResult] = useState(parseUserAgent(navigator.userAgent));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>User Agent Parser</CardTitle>
        <CardDescription>Parse user agent strings into browser, OS, and device components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea className="font-mono text-sm h-24" value={ua} onChange={(e) => setUa(e.target.value)} data-testid="textarea-ua" />
        <Button onClick={() => setResult(parseUserAgent(ua))} data-testid="btn-parse">Parse</Button>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result).map(([k, v]) => (
            <div key={k} className="p-3 rounded-md border border-border" data-testid={`result-${k}`}>
              <div className="text-xs text-muted-foreground uppercase">{k}</div>
              <div className="font-mono">{String(v)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CRON Expression Parser ─────────────────────────────────────────────────

const CRON_FIELDS = ["minute", "hour", "day of month", "month", "day of week"];

function describeCronField(value: string, name: string): string {
  if (value === "*") return `every ${name}`;
  if (value.includes("/")) { const [, step] = value.split("/"); return `every ${step} ${name}s`; }
  if (value.includes(",")) return `at ${name}s ${value}`;
  if (value.includes("-")) return `${name}s ${value}`;
  return `at ${name} ${value}`;
}

export function CronParser() {
  const [expr, setExpr] = useState("*/15 9-17 * * 1-5");
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string[] | null>(null);

  const parse = () => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) { setError("CRON expression must have exactly 5 fields (minute hour day month weekday)"); setDescription(null); return; }
    setError(null);
    setDescription(parts.map((p, i) => describeCronField(p, CRON_FIELDS[i])));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>CRON Expression Parser</CardTitle>
        <CardDescription>Parse CRON expressions into a human-readable schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input className="font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="* * * * *" data-testid="input-cron" />
        <Button onClick={parse} data-testid="btn-parse">Parse</Button>
        {error && <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm font-mono">{error}</div>}
        {description && (
          <div className="p-3 rounded-md border border-border bg-muted/20 space-y-1 font-mono text-sm" data-testid="cron-description">
            {description.map((d, i) => <div key={i}><span className="text-muted-foreground">{CRON_FIELDS[i]}:</span> {d}</div>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Semver Calculator ──────────────────────────────────────────────────────

function parseSemver(v: string) {
  const m = v.trim().replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/);
  if (!m) return null;
  return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] };
}

function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a), pb = parseSemver(b);
  if (!pa || !pb) return 0;
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;
  if (pa.pre && !pb.pre) return -1;
  if (!pa.pre && pb.pre) return 1;
  return 0;
}

export function SemverCalculator() {
  const [version, setVersion] = useState("1.4.2");
  const [compareWith, setCompareWith] = useState("2.0.0-beta.1");
  const parsed = parseSemver(version);
  const cmp = compareSemver(version, compareWith);

  const bump = (part: "major" | "minor" | "patch") => {
    if (!parsed) return;
    const { major, minor, patch } = parsed;
    if (part === "major") setVersion(`${major + 1}.0.0`);
    if (part === "minor") setVersion(`${major}.${minor + 1}.0`);
    if (part === "patch") setVersion(`${major}.${minor}.${patch + 1}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Semver Calculator</CardTitle>
        <CardDescription>Parse, compare, and bump semantic versions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">VERSION</Label>
          <Input className="font-mono mt-1" value={version} onChange={(e) => setVersion(e.target.value)} data-testid="input-version" />
        </div>
        {parsed ? (
          <div className="flex gap-2">
            <Badge variant="outline" className="font-mono">major {parsed.major}</Badge>
            <Badge variant="outline" className="font-mono">minor {parsed.minor}</Badge>
            <Badge variant="outline" className="font-mono">patch {parsed.patch}</Badge>
            {parsed.pre && <Badge variant="outline" className="font-mono">pre {parsed.pre}</Badge>}
          </div>
        ) : <div className="text-sm text-destructive">Invalid semver string</div>}
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => bump("major")} data-testid="btn-bump-major">Bump Major</Button>
          <Button size="sm" variant="secondary" onClick={() => bump("minor")} data-testid="btn-bump-minor">Bump Minor</Button>
          <Button size="sm" variant="secondary" onClick={() => bump("patch")} data-testid="btn-bump-patch">Bump Patch</Button>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">COMPARE WITH</Label>
          <Input className="font-mono mt-1" value={compareWith} onChange={(e) => setCompareWith(e.target.value)} data-testid="input-compare" />
        </div>
        <div className="p-3 rounded-md border border-border bg-muted/20 font-mono text-sm" data-testid="compare-result">
          {version} is {cmp === 0 ? "equal to" : cmp > 0 ? "greater than" : "less than"} {compareWith}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── NanoID Generator ───────────────────────────────────────────────────────

const NANOID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateNanoId(size: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes, (b) => NANOID_ALPHABET[b % NANOID_ALPHABET.length]).join("");
}

export function NanoIdGenerator() {
  const [size, setSize] = useState(21);
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: 5 }, () => generateNanoId(21)));

  const regenerate = () => setIds(Array.from({ length: count }, () => generateNanoId(size)));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>NanoID Generator</CardTitle>
        <CardDescription>Generate compact, URL-friendly unique IDs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 items-end">
          <div>
            <Label className="text-xs text-muted-foreground">SIZE</Label>
            <Input type="number" min={4} max={64} className="w-24 mt-1" value={size} onChange={(e) => setSize(Math.max(4, Math.min(64, +e.target.value || 21)))} data-testid="input-size" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">COUNT</Label>
            <Input type="number" min={1} max={50} className="w-24 mt-1" value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, +e.target.value || 5)))} data-testid="input-count" />
          </div>
          <Button onClick={regenerate} data-testid="btn-generate"><RefreshCw className="h-4 w-4 mr-1" />Generate</Button>
        </div>
        <div className="space-y-2">
          {ids.map((id, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-md border border-border font-mono text-sm" data-testid={`nanoid-${i}`}>
              {id}
              <CopyBtn text={id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── cURL Converter ─────────────────────────────────────────────────────────

function parseCurl(cmd: string) {
  const clean = cmd.replace(/\\\n/g, " ").trim();
  const urlMatch = clean.match(/curl\s+(?:-\w+\s+)*'?"?(https?:\/\/[^\s'"]+)/);
  const url = urlMatch?.[1] ?? "";
  const method = clean.match(/-X\s+(\w+)/)?.[1] ?? (clean.includes("-d ") || clean.includes("--data") ? "POST" : "GET");
  const headers: Record<string, string> = {};
  const headerRe = /-H\s+'([^']+)'|-H\s+"([^"]+)"/g;
  let hm;
  while ((hm = headerRe.exec(clean))) {
    const h = hm[1] || hm[2];
    const idx = h.indexOf(":");
    if (idx > -1) headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
  }
  const dataMatch = clean.match(/(?:-d|--data(?:-raw)?)\s+'([^']+)'|(?:-d|--data(?:-raw)?)\s+"([^"]+)"/);
  const body = dataMatch?.[1] || dataMatch?.[2] || "";
  return { url, method, headers, body };
}

export function CurlConverter() {
  const [curl, setCurl] = useState(`curl -X POST 'https://api.example.com/users' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"name":"Ada"}'`);
  const [lang, setLang] = useState<"fetch" | "python" | "node">("fetch");

  const { url, method, headers, body } = parseCurl(curl);

  const output = (() => {
    const headersEntries = Object.entries(headers);
    if (lang === "fetch") {
      return `fetch("${url}", {\n  method: "${method}",\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},${body ? `\n  body: ${JSON.stringify(body)},` : ""}\n});`;
    }
    if (lang === "python") {
      return `import requests\n\nresponse = requests.request(\n    "${method}",\n    "${url}",\n    headers=${JSON.stringify(headers)},${body ? `\n    data=${JSON.stringify(body)},` : ""}\n)\nprint(response.text)`;
    }
    return `const https = require("https");\n\nconst options = {\n  method: "${method}",\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},\n};\n\n// url: ${url}${body ? `\n// body: ${body}` : ""}`;
  })();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>cURL Converter</CardTitle>
            <CardDescription className="mt-1">Convert curl commands to fetch, Python requests, or Node.js</CardDescription>
          </div>
          <CopyBtn text={output} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea className="font-mono text-sm h-32" value={curl} onChange={(e) => setCurl(e.target.value)} data-testid="textarea-curl" />
        <div className="flex gap-2">
          {(["fetch", "python", "node"] as const).map((l) => (
            <Button key={l} size="sm" variant={lang === l ? "default" : "outline"} onClick={() => setLang(l)} data-testid={`btn-lang-${l}`}>
              {l === "fetch" ? "JS Fetch" : l === "python" ? "Python" : "Node.js"}
            </Button>
          ))}
        </div>
        <Textarea readOnly className="font-mono text-sm h-64 bg-muted/30" value={output} data-testid="textarea-output" />
      </CardContent>
    </Card>
  );
}
