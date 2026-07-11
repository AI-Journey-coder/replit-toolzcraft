import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, CheckCheck } from "lucide-react";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }} disabled={!text}>
      {ok ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}
function OutBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center"><Label>{label}</Label><CopyBtn text={value} /></div>
      <pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto max-h-[300px] whitespace-pre-wrap">{value}</pre>
    </div>
  );
}

// ─── robots.txt Generator ─────────────────────────────────────────────────────
const PRESET_BOTS = ["Googlebot","Bingbot","Slurp","DuckDuckBot","Baiduspider","YandexBot","facebookexternalhit","Twitterbot","LinkedInBot","Applebot"];

export function RobotsTxtGenerator() {
  const [rules, setRules] = useState([
    { userAgent: "*", allow: ["/"], disallow: ["/admin/", "/private/"], crawlDelay: "" },
  ]);
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");

  const addRule = () => setRules(r => [...r, { userAgent: "Googlebot", allow: [""], disallow: [""], crawlDelay: "" }]);
  const updateRule = (i: number, field: string, value: string) => setRules(r => r.map((rule, idx) => idx === i ? { ...rule, [field]: value } : rule));
  const updateList = (i: number, field: "allow"|"disallow", raw: string) => setRules(r => r.map((rule, idx) => idx === i ? { ...rule, [field]: raw.split("\n") } : rule));

  const output = useMemo(() => {
    const lines: string[] = [];
    rules.forEach(rule => {
      lines.push(`User-agent: ${rule.userAgent}`);
      rule.allow.forEach(a => a.trim() && lines.push(`Allow: ${a.trim()}`));
      rule.disallow.forEach(d => d.trim() && lines.push(`Disallow: ${d.trim()}`));
      if (rule.crawlDelay) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      lines.push("");
    });
    if (sitemap.trim()) lines.push(`Sitemap: ${sitemap.trim()}`);
    return lines.join("\n");
  }, [rules, sitemap]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>robots.txt Generator</CardTitle><CardDescription>Build a robots.txt file with allow/disallow rules for crawlers</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        {rules.map((rule, i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <Label>User-agent</Label>
                <Input className="font-mono text-sm" value={rule.userAgent} onChange={e => updateRule(i, "userAgent", e.target.value)} />
              </div>
              <div className="w-28 space-y-1.5">
                <Label>Crawl-delay</Label>
                <Input className="font-mono text-sm" placeholder="e.g. 10" value={rule.crawlDelay} onChange={e => updateRule(i, "crawlDelay", e.target.value)} />
              </div>
              {rules.length > 1 && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRules(r => r.filter((_, idx) => idx !== i))}>Remove</Button>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Allow paths (one per line)</Label><Textarea className="font-mono text-xs min-h-[80px]" value={rule.allow.join("\n")} onChange={e => updateList(i, "allow", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Disallow paths (one per line)</Label><Textarea className="font-mono text-xs min-h-[80px]" value={rule.disallow.join("\n")} onChange={e => updateList(i, "disallow", e.target.value)} /></div>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addRule}>+ Add user-agent rule</Button>
        </div>
        <div className="space-y-1.5"><Label>Sitemap URL</Label><Input className="font-mono text-xs" value={sitemap} onChange={e => setSitemap(e.target.value)} /></div>
        <OutBlock label="robots.txt" value={output} />
      </CardContent>
    </Card>
  );
}

// ─── CORS Header Generator ────────────────────────────────────────────────────
export function CorsHeaderGenerator() {
  const [origin, setOrigin] = useState("https://example.com");
  const [methods, setMethods] = useState(["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
  const [headers, setHeaders] = useState("Content-Type, Authorization");
  const [credentials, setCredentials] = useState(false);
  const [maxAge, setMaxAge] = useState("86400");
  const [exposeHeaders, setExposeHeaders] = useState("");

  const ALL_METHODS = ["GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"];
  const toggleMethod = (m: string) => setMethods(ms => ms.includes(m) ? ms.filter(x => x !== m) : [...ms, m]);

  const nginxConf = [
    `add_header 'Access-Control-Allow-Origin' '${origin}';`,
    `add_header 'Access-Control-Allow-Methods' '${methods.join(", ")}';`,
    `add_header 'Access-Control-Allow-Headers' '${headers}';`,
    credentials ? `add_header 'Access-Control-Allow-Credentials' 'true';` : null,
    maxAge ? `add_header 'Access-Control-Max-Age' ${maxAge};` : null,
    exposeHeaders ? `add_header 'Access-Control-Expose-Headers' '${exposeHeaders}';` : null,
  ].filter(Boolean).join("\n");

  const expressCode = `app.use((req, res, next) => {\n  res.header('Access-Control-Allow-Origin', '${origin}');\n  res.header('Access-Control-Allow-Methods', '${methods.join(", ")}');\n  res.header('Access-Control-Allow-Headers', '${headers}');${credentials ? "\n  res.header('Access-Control-Allow-Credentials', 'true');" : ""}${maxAge ? `\n  res.header('Access-Control-Max-Age', '${maxAge}');` : ""}\n  if (req.method === 'OPTIONS') return res.status(204).send();\n  next();\n});`;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CORS Header Generator</CardTitle><CardDescription>Generate CORS headers for Nginx, Express, Apache, and more</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Allow-Origin</Label><Input className="font-mono text-sm" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="https://example.com or *" /></div>
        <div className="space-y-1.5">
          <Label>Allow-Methods</Label>
          <div className="flex gap-2 flex-wrap">
            {ALL_METHODS.map(m => <Button key={m} size="sm" variant={methods.includes(m) ? "default" : "outline"} onClick={() => toggleMethod(m)} className="font-mono text-xs">{m}</Button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Allow-Headers</Label><Input className="font-mono text-xs" value={headers} onChange={e => setHeaders(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Expose-Headers</Label><Input className="font-mono text-xs" value={exposeHeaders} onChange={e => setExposeHeaders(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Max-Age (seconds)</Label><Input className="font-mono text-xs" value={maxAge} onChange={e => setMaxAge(e.target.value)} /></div>
          <div className="flex items-center gap-2 pt-7">
            <Switch checked={credentials} onCheckedChange={setCredentials} /><Label>Allow-Credentials</Label>
          </div>
        </div>
        <OutBlock label="Nginx config" value={nginxConf} />
        <OutBlock label="Express.js middleware" value={expressCode} />
      </CardContent>
    </Card>
  );
}

// ─── CSP Header Generator ──────────────────────────────────────────────────────
const CSP_DIRECTIVES = [
  { key: "default-src", label: "default-src", placeholder: "'self'" },
  { key: "script-src", label: "script-src", placeholder: "'self' 'nonce-{random}'" },
  { key: "style-src", label: "style-src", placeholder: "'self' 'unsafe-inline'" },
  { key: "img-src", label: "img-src", placeholder: "'self' data: https:" },
  { key: "font-src", label: "font-src", placeholder: "'self' https://fonts.gstatic.com" },
  { key: "connect-src", label: "connect-src", placeholder: "'self' https://api.example.com" },
  { key: "frame-src", label: "frame-src", placeholder: "'none'" },
  { key: "object-src", label: "object-src", placeholder: "'none'" },
  { key: "base-uri", label: "base-uri", placeholder: "'self'" },
  { key: "form-action", label: "form-action", placeholder: "'self'" },
];
export function CspHeaderGenerator() {
  const [values, setValues] = useState<Record<string, string>>({ "default-src": "'self'", "script-src": "'self'", "img-src": "'self' data:", "object-src": "'none'" });
  const [reportOnly, setReportOnly] = useState(false);

  const policy = Object.entries(values).filter(([, v]) => v.trim()).map(([k, v]) => `${k} ${v.trim()}`).join("; ");
  const headerName = reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
  const header = `${headerName}: ${policy}`;
  const metaTag = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CSP Header Generator</CardTitle><CardDescription>Build a Content Security Policy header to protect against XSS and injection attacks</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2"><Switch checked={reportOnly} onCheckedChange={setReportOnly} /><Label>Report-Only mode (no enforcement)</Label></div>
        <div className="space-y-2">
          {CSP_DIRECTIVES.map(d => (
            <div key={d.key} className="grid grid-cols-[140px,1fr] gap-2 items-center">
              <Label className="font-mono text-xs">{d.label}</Label>
              <Input className="font-mono text-xs h-8" placeholder={d.placeholder} value={values[d.key] ?? ""} onChange={e => setValues(v => ({ ...v, [d.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <OutBlock label="HTTP Header" value={header} />
        <OutBlock label="HTML Meta tag" value={metaTag} />
      </CardContent>
    </Card>
  );
}

// ─── .htaccess Generator ──────────────────────────────────────────────────────
export function HtaccessGenerator() {
  const [forceHttps, setForceHttps] = useState(true);
  const [wwwRedirect, setWwwRedirect] = useState<"none"|"www"|"nowww">("nowww");
  const [trailingSlash, setTrailingSlash] = useState<"none"|"add"|"remove">("none");
  const [hotlinkProtect, setHotlinkProtect] = useState(false);
  const [domain, setDomain] = useState("example.com");
  const [cacheControl, setCacheControl] = useState(true);
  const [gzip, setGzip] = useState(true);
  const [customRedirects, setCustomRedirects] = useState("/old-page /new-page 301\n/blog /articles 302");
  const [denyDotFiles, setDenyDotFiles] = useState(true);
  const [phpErrors, setPhpErrors] = useState(false);

  const output = useMemo(() => {
    const lines: string[] = ["Options -Indexes", ""];
    if (forceHttps || wwwRedirect !== "none" || trailingSlash !== "none") {
      lines.push("RewriteEngine On", "");
      if (forceHttps) lines.push("# Force HTTPS", "RewriteCond %{HTTPS} off", "RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]", "");
      if (wwwRedirect === "www") lines.push(`# Redirect to www`, `RewriteCond %{HTTP_HOST} !^www\\. [NC]`, `RewriteRule ^(.*)$ https://www.${domain}/$1 [L,R=301]`, "");
      if (wwwRedirect === "nowww") lines.push(`# Remove www`, `RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]`, `RewriteRule ^(.*)$ https://%1/$1 [L,R=301]`, "");
      if (trailingSlash === "remove") lines.push("# Remove trailing slash", "RewriteCond %{REQUEST_FILENAME} !-d", "RewriteRule ^(.*)/$ /$1 [L,R=301]", "");
      if (trailingSlash === "add") lines.push("# Add trailing slash", "RewriteCond %{REQUEST_FILENAME} !-f", "RewriteRule ^(.*[^/])$ /$1/ [L,R=301]", "");
    }
    if (customRedirects.trim()) {
      lines.push("# Custom redirects");
      customRedirects.split("\n").forEach(line => { const parts = line.trim().split(/\s+/); if (parts.length >= 2) lines.push(`Redirect ${parts[2] || "301"} ${parts[0]} https://${domain}${parts[1]}`); });
      lines.push("");
    }
    if (denyDotFiles) lines.push("# Deny access to dot files", "<FilesMatch \"^\\.\">\n  Order allow,deny\n  Deny from all\n</FilesMatch>", "");
    if (hotlinkProtect) lines.push(`# Hotlink protection`, `RewriteCond %{HTTP_REFERER} !^$`, `RewriteCond %{HTTP_REFERER} !^https?://(www\\.)?${domain.replace(".", "\\.")}/ [NC]`, `RewriteRule \\.(jpg|jpeg|png|gif|svg|webp)$ - [F,NC]`, "");
    if (cacheControl) lines.push("# Browser caching", "<FilesMatch \"\\.(ico|jpg|jpeg|png|gif|webp|svg|css|js|woff2?)$\">", "  Header set Cache-Control \"max-age=31536000, public\"", "</FilesMatch>", "");
    if (gzip) lines.push("# Enable Gzip compression", "<IfModule mod_deflate.c>", "  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json", "</IfModule>", "");
    if (phpErrors) lines.push("# Show PHP errors (dev only)", "php_flag display_errors on", "php_value error_reporting E_ALL", "");
    return lines.join("\n");
  }, [forceHttps, wwwRedirect, trailingSlash, hotlinkProtect, domain, cacheControl, gzip, customRedirects, denyDotFiles, phpErrors]);

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm"><Switch checked={checked} onCheckedChange={onChange} /><span>{label}</span></label>
  );

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>.htaccess Generator</CardTitle><CardDescription>Generate Apache .htaccess rules for redirects, caching, and security</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Domain name</Label><Input className="font-mono text-sm" value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com" /></div>
        <div className="grid grid-cols-2 gap-3">
          <Toggle label="Force HTTPS" checked={forceHttps} onChange={setForceHttps} />
          <Toggle label="Hotlink protection" checked={hotlinkProtect} onChange={setHotlinkProtect} />
          <Toggle label="Browser cache headers" checked={cacheControl} onChange={setCacheControl} />
          <Toggle label="Gzip compression" checked={gzip} onChange={setGzip} />
          <Toggle label="Deny .htaccess / dot files" checked={denyDotFiles} onChange={setDenyDotFiles} />
          <Toggle label="Show PHP errors (dev)" checked={phpErrors} onChange={setPhpErrors} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>WWW redirect</Label>
            <Select value={wwwRedirect} onValueChange={v => setWwwRedirect(v as "none"|"www"|"nowww")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No redirect</SelectItem>
                <SelectItem value="www">Force www</SelectItem>
                <SelectItem value="nowww">Remove www</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Trailing slash</Label>
            <Select value={trailingSlash} onValueChange={v => setTrailingSlash(v as "none"|"add"|"remove")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="add">Add trailing slash</SelectItem>
                <SelectItem value="remove">Remove trailing slash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label>Custom redirects (from to code, one per line)</Label><Textarea className="font-mono text-xs min-h-[80px]" value={customRedirects} onChange={e => setCustomRedirects(e.target.value)} /></div>
        <OutBlock label=".htaccess" value={output} />
      </CardContent>
    </Card>
  );
}

// ─── GCD & LCM Calculator ─────────────────────────────────────────────────────
function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function lcm(a: number, b: number): number { return a / gcd(a, b) * b; }

export function GcdLcmCalculator() {
  const [nums, setNums] = useState("12, 18, 24");

  const result = useMemo(() => {
    const arr = nums.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n > 0);
    if (arr.length < 2) return null;
    const g = arr.reduce(gcd);
    const l = arr.reduce(lcm);
    const factors = arr.map(n => {
      const f: number[] = [];
      let nn = n;
      for (let i = 2; i <= nn; i++) { while (nn % i === 0) { f.push(i); nn /= i; } }
      return { n, factors: f };
    });
    return { gcd: g, lcm: l, factors };
  }, [nums]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>GCD & LCM Calculator</CardTitle><CardDescription>Find the greatest common divisor and least common multiple of a set of numbers</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Numbers (comma or space separated)</Label><Input className="font-mono" value={nums} onChange={e => setNums(e.target.value)} placeholder="12, 18, 24" /></div>
        {result && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">GCD</div>
                <div className="text-4xl font-black font-mono text-green-500">{result.gcd}</div>
              </div>
              <div className="rounded-lg border border-border p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">LCM</div>
                <div className="text-4xl font-black font-mono text-blue-500">{result.lcm.toLocaleString()}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Prime factorizations</Label>
              <div className="space-y-1">
                {result.factors.map(({ n, factors }) => (
                  <div key={n} className="flex gap-2 items-center text-sm font-mono">
                    <span className="text-muted-foreground w-12 text-right">{n} =</span>
                    <span>{factors.length ? factors.join(" × ") : n + " (prime)"}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Bandwidth Calculator ─────────────────────────────────────────────────────
export function BandwidthCalculator() {
  const [fileSize, setFileSize] = useState(100);
  const [fileSizeUnit, setFileSizeUnit] = useState("MB");
  const [bandwidth, setBandwidth] = useState(100);
  const [bandwidthUnit, setBandwidthUnit] = useState("Mbps");

  const UNITS_BYTES: Record<string, number> = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12 };
  const UNITS_BITS: Record<string, number> = { bps: 1, Kbps: 1e3, Mbps: 1e6, Gbps: 1e9 };

  const bytes = fileSize * (UNITS_BYTES[fileSizeUnit] ?? 1);
  const bitsPerSec = bandwidth * (UNITS_BITS[bandwidthUnit] ?? 1);
  const secs = bitsPerSec > 0 ? (bytes * 8) / bitsPerSec : Infinity;

  const fmt = (s: number) => {
    if (!isFinite(s)) return "∞";
    if (s < 60) return `${s.toFixed(1)}s`;
    if (s < 3600) return `${Math.floor(s/60)}m ${Math.round(s%60)}s`;
    return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Bandwidth Calculator</CardTitle><CardDescription>Calculate download/upload time for a given file size and connection speed</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>File size</Label>
          <div className="flex gap-2">
            <Input type="number" className="font-mono flex-1" value={fileSize} onChange={e => setFileSize(parseFloat(e.target.value) || 0)} />
            <Select value={fileSizeUnit} onValueChange={setFileSizeUnit}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(UNITS_BYTES).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Connection speed</Label>
          <div className="flex gap-2">
            <Input type="number" className="font-mono flex-1" value={bandwidth} onChange={e => setBandwidth(parseFloat(e.target.value) || 0)} />
            <Select value={bandwidthUnit} onValueChange={setBandwidthUnit}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(UNITS_BITS).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">Transfer time</div>
          <div className="text-4xl font-black font-mono text-primary">{fmt(secs)}</div>
        </div>
        <div className="text-xs text-muted-foreground font-mono text-center">
          {(bytes / 1e6).toFixed(2)} MB &nbsp;÷&nbsp; {(bitsPerSec / 1e6).toFixed(1)} Mbps &nbsp;×&nbsp; 8 bits/byte
        </div>
      </CardContent>
    </Card>
  );
}
