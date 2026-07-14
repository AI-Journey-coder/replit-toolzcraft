import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Search } from "lucide-react";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}>{ok ? "✓" : <Copy className="h-3 w-3" />}</Button>;
}

// ─── ASCII Table ──────────────────────────────────────────────────────────────
const ASCII_SPECIAL: Record<number, string> = {
  0:"NUL",1:"SOH",2:"STX",3:"ETX",4:"EOT",5:"ENQ",6:"ACK",7:"BEL",8:"BS",9:"HT",10:"LF",11:"VT",12:"FF",13:"CR",14:"SO",15:"SI",16:"DLE",17:"DC1",18:"DC2",19:"DC3",20:"DC4",21:"NAK",22:"SYN",23:"ETB",24:"CAN",25:"EM",26:"SUB",27:"ESC",28:"FS",29:"GS",30:"RS",31:"US",32:"Space",127:"DEL",
};

export function AsciiTable() {
  const [filter, setFilter] = useState("");
  const [range, setRange] = useState<"printable"|"control"|"all">("printable");

  const chars = useMemo(() => {
    const all = Array.from({ length: 128 }, (_, i) => ({
      dec: i, hex: i.toString(16).toUpperCase().padStart(2, "0"), oct: i.toString(8).padStart(3, "0"), bin: i.toString(2).padStart(7, "0"),
      char: ASCII_SPECIAL[i] ?? String.fromCharCode(i), printable: i >= 32 && i < 127,
    }));
    const filtered = range === "printable" ? all.filter(c => c.printable) : range === "control" ? all.filter(c => !c.printable) : all;
    if (!filter) return filtered;
    return filtered.filter(c => c.dec.toString().includes(filter) || c.hex.toLowerCase().includes(filter.toLowerCase()) || c.char.toLowerCase().includes(filter.toLowerCase()));
  }, [range, filter]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader><CardTitle>ASCII Table</CardTitle><CardDescription>Complete ASCII character code reference with decimal, hex, octal, and binary</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-9" placeholder="Search by char, decimal, or hex…" value={filter} onChange={e => setFilter(e.target.value)} /></div>
          <div className="flex gap-1">{[["printable","Printable (32–126)"],["control","Control (0–31, 127)"],["all","All 128"]].map(([v,l]) => <Button key={v} size="sm" variant={range === v ? "default" : "outline"} onClick={() => setRange(v as any)} className="text-xs">{l}</Button>)}</div>
        </div>
        <div className="rounded-lg border border-border overflow-auto max-h-[440px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/90"><tr className="text-muted-foreground"><th className="text-left px-3 py-2 w-16">Dec</th><th className="text-left px-3 py-2 w-16">Hex</th><th className="text-left px-3 py-2 w-16">Oct</th><th className="text-left px-3 py-2 w-24">Binary</th><th className="text-left px-3 py-2">Character</th><th className="w-8" /></tr></thead>
            <tbody className="divide-y divide-border/40">
              {chars.map(c => (
                <tr key={c.dec} className="hover:bg-muted/30">
                  <td className="px-3 py-1.5 font-mono">{c.dec}</td>
                  <td className="px-3 py-1.5 font-mono text-blue-400">{c.hex}</td>
                  <td className="px-3 py-1.5 font-mono">{c.oct}</td>
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">{c.bin}</td>
                  <td className="px-3 py-1.5 font-mono font-bold text-primary">{c.char}</td>
                  <td className="pr-2"><CopyBtn text={c.printable ? String.fromCharCode(c.dec) : c.char} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── HTML Entities Reference ──────────────────────────────────────────────────
const HTML_ENTITIES = [
  { entity: "&amp;", char: "&", name: "Ampersand", dec: "&#38;" },
  { entity: "&lt;", char: "<", name: "Less than", dec: "&#60;" },
  { entity: "&gt;", char: ">", name: "Greater than", dec: "&#62;" },
  { entity: "&quot;", char: '"', name: "Double quote", dec: "&#34;" },
  { entity: "&apos;", char: "'", name: "Apostrophe", dec: "&#39;" },
  { entity: "&nbsp;", char: " ", name: "Non-breaking space", dec: "&#160;" },
  { entity: "&copy;", char: "©", name: "Copyright", dec: "&#169;" },
  { entity: "&reg;", char: "®", name: "Registered trademark", dec: "&#174;" },
  { entity: "&trade;", char: "™", name: "Trademark", dec: "&#8482;" },
  { entity: "&euro;", char: "€", name: "Euro sign", dec: "&#8364;" },
  { entity: "&pound;", char: "£", name: "Pound sign", dec: "&#163;" },
  { entity: "&yen;", char: "¥", name: "Yen sign", dec: "&#165;" },
  { entity: "&cent;", char: "¢", name: "Cent sign", dec: "&#162;" },
  { entity: "&mdash;", char: "—", name: "Em dash", dec: "&#8212;" },
  { entity: "&ndash;", char: "–", name: "En dash", dec: "&#8211;" },
  { entity: "&hellip;", char: "…", name: "Ellipsis", dec: "&#8230;" },
  { entity: "&laquo;", char: "«", name: "Left guillemet", dec: "&#171;" },
  { entity: "&raquo;", char: "»", name: "Right guillemet", dec: "&#187;" },
  { entity: "&ldquo;", char: "\u201C", name: "Left double quote", dec: "&#8220;" },
  { entity: "&rdquo;", char: "\u201D", name: "Right double quote", dec: "&#8221;" },
  { entity: "&lsquo;", char: "\u2018", name: "Left single quote", dec: "&#8216;" },
  { entity: "&rsquo;", char: "\u2019", name: "Right single quote", dec: "&#8217;" },
  { entity: "&bull;", char: "•", name: "Bullet", dec: "&#8226;" },
  { entity: "&middot;", char: "·", name: "Middle dot", dec: "&#183;" },
  { entity: "&times;", char: "×", name: "Multiplication sign", dec: "&#215;" },
  { entity: "&divide;", char: "÷", name: "Division sign", dec: "&#247;" },
  { entity: "&plusmn;", char: "±", name: "Plus-minus sign", dec: "&#177;" },
  { entity: "&deg;", char: "°", name: "Degree sign", dec: "&#176;" },
  { entity: "&frac12;", char: "½", name: "One half", dec: "&#189;" },
  { entity: "&frac14;", char: "¼", name: "One quarter", dec: "&#188;" },
  { entity: "&sup2;", char: "²", name: "Superscript 2", dec: "&#178;" },
  { entity: "&sup3;", char: "³", name: "Superscript 3", dec: "&#179;" },
  { entity: "&infin;", char: "∞", name: "Infinity", dec: "&#8734;" },
  { entity: "&sum;", char: "∑", name: "Summation", dec: "&#8721;" },
  { entity: "&Delta;", char: "Δ", name: "Delta (Greek)", dec: "&#916;" },
  { entity: "&pi;", char: "π", name: "Pi (Greek)", dec: "&#960;" },
  { entity: "&alpha;", char: "α", name: "Alpha (Greek)", dec: "&#945;" },
  { entity: "&beta;", char: "β", name: "Beta (Greek)", dec: "&#946;" },
  { entity: "&rarr;", char: "→", name: "Right arrow", dec: "&#8594;" },
  { entity: "&larr;", char: "←", name: "Left arrow", dec: "&#8592;" },
  { entity: "&harr;", char: "↔", name: "Left-right arrow", dec: "&#8596;" },
  { entity: "&uarr;", char: "↑", name: "Up arrow", dec: "&#8593;" },
  { entity: "&darr;", char: "↓", name: "Down arrow", dec: "&#8595;" },
  { entity: "&check;", char: "✓", name: "Check mark", dec: "&#10003;" },
  { entity: "&cross;", char: "✗", name: "Cross", dec: "&#10007;" },
  { entity: "&hearts;", char: "♥", name: "Heart", dec: "&#9829;" },
  { entity: "&spades;", char: "♠", name: "Spade", dec: "&#9824;" },
  { entity: "&clubs;", char: "♣", name: "Club", dec: "&#9827;" },
  { entity: "&diams;", char: "♦", name: "Diamond", dec: "&#9830;" },
];

export function HtmlEntitiesReference() {
  const [filter, setFilter] = useState("");
  const rows = useMemo(() => {
    if (!filter) return HTML_ENTITIES;
    return HTML_ENTITIES.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()) || e.entity.includes(filter) || e.char === filter);
  }, [filter]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>HTML Entities Reference</CardTitle><CardDescription>Quick-reference for HTML entity codes — named, decimal, and hex</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search by name or character…" value={filter} onChange={e => setFilter(e.target.value)} /></div>
        <div className="rounded-lg border border-border overflow-auto max-h-[440px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/90"><tr className="text-muted-foreground"><th className="text-center px-3 py-2 w-12">Char</th><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Named entity</th><th className="text-left px-3 py-2">Decimal</th></tr></thead>
            <tbody className="divide-y divide-border/40">
              {rows.map(e => (
                <tr key={e.entity} className="hover:bg-muted/30">
                  <td className="px-3 py-2 text-center text-xl">{e.char}</td>
                  <td className="px-3 py-2 text-muted-foreground">{e.name}</td>
                  <td className="px-3 py-2 font-mono text-primary flex items-center gap-1">{e.entity}<CopyBtn text={e.entity} /></td>
                  <td className="px-3 py-2 font-mono">{e.dec}<CopyBtn text={e.dec} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── HTTP Headers Reference ────────────────────────────────────────────────────
const HTTP_HEADERS = [
  { name: "Accept", type: "Request", desc: "Media types the client can handle", example: "text/html, application/json" },
  { name: "Accept-Encoding", type: "Request", desc: "Compression algorithms the client supports", example: "gzip, deflate, br" },
  { name: "Accept-Language", type: "Request", desc: "Preferred languages for the response", example: "en-US, en;q=0.9" },
  { name: "Authorization", type: "Request", desc: "Credentials for authenticating the client", example: "Bearer eyJhbG..." },
  { name: "Cache-Control", type: "Both", desc: "Directives for caching mechanisms", example: "no-cache, max-age=3600" },
  { name: "Content-Type", type: "Both", desc: "Media type of the resource body", example: "application/json; charset=utf-8" },
  { name: "Content-Length", type: "Both", desc: "Size of the body in bytes", example: "348" },
  { name: "Cookie", type: "Request", desc: "HTTP cookies sent by the client", example: "session_id=abc123" },
  { name: "ETag", type: "Response", desc: "Identifier for a specific version of a resource", example: '"33a64df5"' },
  { name: "Host", type: "Request", desc: "Domain name and port of the server", example: "api.example.com:443" },
  { name: "If-Modified-Since", type: "Request", desc: "Conditional request for resources modified after date", example: "Sat, 29 Oct 1994 19:43:31 GMT" },
  { name: "If-None-Match", type: "Request", desc: "Return 304 if ETag matches", example: '"33a64df5"' },
  { name: "Last-Modified", type: "Response", desc: "Date the resource was last modified", example: "Wed, 21 Oct 2015 07:28:00 GMT" },
  { name: "Location", type: "Response", desc: "URL to redirect the request to", example: "https://example.com/new-uri" },
  { name: "Origin", type: "Request", desc: "Origin of the cross-site access request", example: "https://app.example.com" },
  { name: "Referer", type: "Request", desc: "Previous page URL (note: misspelling is intentional)", example: "https://google.com/search?q=..." },
  { name: "Set-Cookie", type: "Response", desc: "Send cookies from the server", example: "id=a3f; Max-Age=3600; HttpOnly; Secure" },
  { name: "Strict-Transport-Security", type: "Response", desc: "Force HTTPS for future requests (HSTS)", example: "max-age=31536000; includeSubDomains" },
  { name: "Transfer-Encoding", type: "Both", desc: "Form of encoding used to transfer the body", example: "chunked" },
  { name: "User-Agent", type: "Request", desc: "Client software identification string", example: "Mozilla/5.0 (Windows NT 10.0...)" },
  { name: "Vary", type: "Response", desc: "Headers to consider when caching", example: "Accept-Encoding, Accept-Language" },
  { name: "WWW-Authenticate", type: "Response", desc: "Authentication method to gain access", example: "Bearer realm=\"api\"" },
  { name: "X-Content-Type-Options", type: "Response", desc: "Prevent MIME type sniffing", example: "nosniff" },
  { name: "X-Frame-Options", type: "Response", desc: "Whether resource can be embedded in frames", example: "DENY, SAMEORIGIN" },
  { name: "X-RateLimit-Limit", type: "Response", desc: "Max requests allowed in period", example: "1000" },
  { name: "X-Request-Id", type: "Both", desc: "Unique identifier for request tracing", example: "f58a3d1e-..." },
  { name: "Access-Control-Allow-Origin", type: "Response", desc: "CORS — allowed origins", example: "https://app.example.com, *" },
  { name: "Access-Control-Allow-Methods", type: "Response", desc: "CORS — allowed HTTP methods", example: "GET, POST, PUT, DELETE" },
  { name: "Content-Security-Policy", type: "Response", desc: "Controls resources the browser can load", example: "default-src 'self'; script-src 'nonce-...'" },
  { name: "Permissions-Policy", type: "Response", desc: "Control browser features and APIs", example: "camera=(), microphone=()" },
];

export function HttpHeadersReference() {
  const [filter, setFilter] = useState("");
  const [type, setType] = useState("All");
  const rows = useMemo(() => {
    let r = HTTP_HEADERS;
    if (type !== "All") r = r.filter(h => h.type === type || h.type === "Both");
    if (filter) r = r.filter(h => h.name.toLowerCase().includes(filter.toLowerCase()) || h.desc.toLowerCase().includes(filter.toLowerCase()));
    return r;
  }, [filter, type]);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader><CardTitle>HTTP Headers Reference</CardTitle><CardDescription>Reference for common HTTP request and response headers with descriptions and examples</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search headers…" value={filter} onChange={e => setFilter(e.target.value)} /></div>
          <div className="flex gap-1">{["All","Request","Response"].map(t => <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)} className="text-xs">{t}</Button>)}</div>
        </div>
        <div className="rounded-lg border border-border overflow-auto max-h-[480px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/90"><tr className="text-muted-foreground"><th className="text-left px-3 py-2">Header</th><th className="text-left px-3 py-2 w-20">Type</th><th className="text-left px-3 py-2">Description</th><th className="text-left px-3 py-2 hidden md:table-cell">Example</th></tr></thead>
            <tbody className="divide-y divide-border/40">
              {rows.map(h => (
                <tr key={h.name} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono font-medium text-primary whitespace-nowrap">{h.name}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-xs ${h.type === "Request" ? "bg-blue-500/20 text-blue-400" : h.type === "Response" ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"}`}>{h.type}</span></td>
                  <td className="px-3 py-2 text-muted-foreground">{h.desc}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground/70 hidden md:table-cell max-w-[200px] truncate">{h.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── MIME Types Reference ─────────────────────────────────────────────────────
const MIME_TYPES = [
  { ext: ".html", mime: "text/html", cat: "Text" }, { ext: ".css", mime: "text/css", cat: "Text" },
  { ext: ".js", mime: "text/javascript", cat: "Text" }, { ext: ".ts", mime: "text/typescript", cat: "Text" },
  { ext: ".json", mime: "application/json", cat: "Application" }, { ext: ".xml", mime: "application/xml", cat: "Application" },
  { ext: ".pdf", mime: "application/pdf", cat: "Application" }, { ext: ".zip", mime: "application/zip", cat: "Application" },
  { ext: ".gz", mime: "application/gzip", cat: "Application" }, { ext: ".tar", mime: "application/x-tar", cat: "Application" },
  { ext: ".wasm", mime: "application/wasm", cat: "Application" }, { ext: ".csv", mime: "text/csv", cat: "Text" },
  { ext: ".md", mime: "text/markdown", cat: "Text" }, { ext: ".txt", mime: "text/plain", cat: "Text" },
  { ext: ".png", mime: "image/png", cat: "Image" }, { ext: ".jpg", mime: "image/jpeg", cat: "Image" },
  { ext: ".gif", mime: "image/gif", cat: "Image" }, { ext: ".svg", mime: "image/svg+xml", cat: "Image" },
  { ext: ".webp", mime: "image/webp", cat: "Image" }, { ext: ".ico", mime: "image/x-icon", cat: "Image" },
  { ext: ".avif", mime: "image/avif", cat: "Image" }, { ext: ".bmp", mime: "image/bmp", cat: "Image" },
  { ext: ".mp3", mime: "audio/mpeg", cat: "Audio" }, { ext: ".wav", mime: "audio/wav", cat: "Audio" },
  { ext: ".ogg", mime: "audio/ogg", cat: "Audio" }, { ext: ".mp4", mime: "video/mp4", cat: "Video" },
  { ext: ".webm", mime: "video/webm", cat: "Video" }, { ext: ".mov", mime: "video/quicktime", cat: "Video" },
  { ext: ".avi", mime: "video/x-msvideo", cat: "Video" }, { ext: ".woff", mime: "font/woff", cat: "Font" },
  { ext: ".woff2", mime: "font/woff2", cat: "Font" }, { ext: ".ttf", mime: "font/ttf", cat: "Font" },
  { ext: ".otf", mime: "font/otf", cat: "Font" }, { ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", cat: "Application" },
  { ext: ".xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", cat: "Application" },
  { ext: ".pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", cat: "Application" },
  { ext: ".rtf", mime: "application/rtf", cat: "Application" }, { ext: ".yaml", mime: "application/yaml", cat: "Application" },
  { ext: ".toml", mime: "application/toml", cat: "Application" }, { ext: ".sql", mime: "application/sql", cat: "Application" },
];

export function MimeTypesReference() {
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", "Text", "Application", "Image", "Audio", "Video", "Font"];
  const rows = useMemo(() => {
    let r = MIME_TYPES;
    if (cat !== "All") r = r.filter(m => m.cat === cat);
    if (filter) r = r.filter(m => m.ext.includes(filter.toLowerCase()) || m.mime.toLowerCase().includes(filter.toLowerCase()));
    return r;
  }, [filter, cat]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>MIME Types Reference</CardTitle><CardDescription>Common file extension to MIME type mappings for web development</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search by extension or MIME…" value={filter} onChange={e => setFilter(e.target.value)} /></div>
          <div className="flex gap-1 flex-wrap">{cats.map(c => <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)} className="text-xs">{c}</Button>)}</div>
        </div>
        <div className="rounded-lg border border-border overflow-auto max-h-[440px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/90"><tr className="text-muted-foreground"><th className="text-left px-3 py-2 w-20">Extension</th><th className="text-left px-3 py-2">MIME type</th><th className="text-left px-3 py-2 w-24">Category</th><th className="w-8" /></tr></thead>
            <tbody className="divide-y divide-border/40">
              {rows.map(m => (
                <tr key={m.ext + m.mime} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono font-bold text-primary">{m.ext}</td>
                  <td className="px-3 py-2 font-mono text-xs">{m.mime}</td>
                  <td className="px-3 py-2 text-muted-foreground">{m.cat}</td>
                  <td className="pr-2"><CopyBtn text={m.mime} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
