import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function copyToClipboard(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

// ─── .htpasswd Generator ──────────────────────────────────────────────────────
function md5(str: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xFFFF) + (y & 0xFFFF); return ((x >> 16) + (y >> 16) + (lsw >> 16)) << 16 | lsw & 0xFFFF; }
  function bitRotateLeft(num: number, cnt: number) { return num << cnt | num >>> (32 - cnt); }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b & c | ~b & d, a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b & d | c & ~d, a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }
  function utf8Encode(s: string) { return unescape(encodeURIComponent(s)); }
  function md5Hash(s: string): number[] {
    const bytes = utf8Encode(s).split("").map(c => c.charCodeAt(0));
    const len8 = bytes.length;
    const len32 = Math.ceil((len8 + 9) / 64) * 16;
    const m = new Array(len32).fill(0);
    for (let i = 0; i < len8; i++) m[i >> 2] |= bytes[i] << (i % 4) * 8;
    m[len8 >> 2] |= 0x80 << (len8 % 4) * 8;
    m[len32 - 2] = len8 * 8;
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < len32; i += 16) {
      const aa = a, bb = b, cc = c, dd = d;
      a = md5ff(a,b,c,d,m[i+0],7,-680876936);d=md5ff(d,a,b,c,m[i+1],12,-389564586);c=md5ff(c,d,a,b,m[i+2],17,606105819);b=md5ff(b,c,d,a,m[i+3],22,-1044525330);
      a=md5ff(a,b,c,d,m[i+4],7,-176418897);d=md5ff(d,a,b,c,m[i+5],12,1200080426);c=md5ff(c,d,a,b,m[i+6],17,-1473231341);b=md5ff(b,c,d,a,m[i+7],22,-45705983);
      a=md5ff(a,b,c,d,m[i+8],7,1770035416);d=md5ff(d,a,b,c,m[i+9],12,-1958414417);c=md5ff(c,d,a,b,m[i+10],17,-42063);b=md5ff(b,c,d,a,m[i+11],22,-1990404162);
      a=md5ff(a,b,c,d,m[i+12],7,1804603682);d=md5ff(d,a,b,c,m[i+13],12,-40341101);c=md5ff(c,d,a,b,m[i+14],17,-1502002290);b=md5ff(b,c,d,a,m[i+15],22,1236535329);
      a=md5gg(a,b,c,d,m[i+1],5,-165796510);d=md5gg(d,a,b,c,m[i+6],9,-1069501632);c=md5gg(c,d,a,b,m[i+11],14,643717713);b=md5gg(b,c,d,a,m[i+0],20,-373897302);
      a=md5gg(a,b,c,d,m[i+5],5,-701558691);d=md5gg(d,a,b,c,m[i+10],9,38016083);c=md5gg(c,d,a,b,m[i+15],14,-660478335);b=md5gg(b,c,d,a,m[i+4],20,-405537848);
      a=md5gg(a,b,c,d,m[i+9],5,568446438);d=md5gg(d,a,b,c,m[i+14],9,-1019803690);c=md5gg(c,d,a,b,m[i+3],14,-187363961);b=md5gg(b,c,d,a,m[i+8],20,1163531501);
      a=md5gg(a,b,c,d,m[i+13],5,-1444681467);d=md5gg(d,a,b,c,m[i+2],9,-51403784);c=md5gg(c,d,a,b,m[i+7],14,1735328473);b=md5gg(b,c,d,a,m[i+12],20,-1926607734);
      a=md5hh(a,b,c,d,m[i+5],4,-378558);d=md5hh(d,a,b,c,m[i+8],11,-2022574463);c=md5hh(c,d,a,b,m[i+11],16,1839030562);b=md5hh(b,c,d,a,m[i+14],23,-35309556);
      a=md5hh(a,b,c,d,m[i+1],4,-1530992060);d=md5hh(d,a,b,c,m[i+4],11,1272893353);c=md5hh(c,d,a,b,m[i+7],16,-155497632);b=md5hh(b,c,d,a,m[i+10],23,-1094730640);
      a=md5hh(a,b,c,d,m[i+13],4,681279174);d=md5hh(d,a,b,c,m[i+0],11,-358537222);c=md5hh(c,d,a,b,m[i+3],16,-722521979);b=md5hh(b,c,d,a,m[i+6],23,76029189);
      a=md5hh(a,b,c,d,m[i+9],4,-640364487);d=md5hh(d,a,b,c,m[i+12],11,-421815835);c=md5hh(c,d,a,b,m[i+15],16,530742520);b=md5hh(b,c,d,a,m[i+2],23,-995338651);
      a=md5ii(a,b,c,d,m[i+0],6,-198630844);d=md5ii(d,a,b,c,m[i+7],10,1126891415);c=md5ii(c,d,a,b,m[i+14],15,-1416354905);b=md5ii(b,c,d,a,m[i+5],21,-57434055);
      a=md5ii(a,b,c,d,m[i+12],6,1700485571);d=md5ii(d,a,b,c,m[i+3],10,-1894986606);c=md5ii(c,d,a,b,m[i+10],15,-1051523);b=md5ii(b,c,d,a,m[i+1],21,-2054922799);
      a=md5ii(a,b,c,d,m[i+8],6,1873313359);d=md5ii(d,a,b,c,m[i+15],10,-30611744);c=md5ii(c,d,a,b,m[i+6],15,-1560198380);b=md5ii(b,c,d,a,m[i+13],21,1309151649);
      a=md5ii(a,b,c,d,m[i+4],6,-145523070);d=md5ii(d,a,b,c,m[i+11],10,-1120210379);c=md5ii(c,d,a,b,m[i+2],15,718787259);b=md5ii(b,c,d,a,m[i+9],21,-343485551);
      a=safeAdd(a,aa);b=safeAdd(b,bb);c=safeAdd(c,cc);d=safeAdd(d,dd);
    }
    const result: number[] = [];
    [a,b,c,d].forEach(val => { for (let i = 0; i < 4; i++) result.push((val >>> i*8) & 0xFF); });
    return result;
  }
  const hashBytes = md5Hash(str);
  return hashBytes.map(b => b.toString(16).padStart(2,"0")).join("");
}

const APR64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const APR64_CHARS = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function toApr64(bytes: number[]): string {
  let result = "";
  const groups = [[0,6,12],[1,7,13],[2,8,14],[3,9,15]];
  for (const g of groups) { if (g[0] < bytes.length) { const v = (bytes[g[0]] | (g[1] < bytes.length ? bytes[g[1]] << 8 : 0) | (g[2] < bytes.length ? bytes[g[2]] << 16 : 0)); result += APR64_CHARS[v & 63] + APR64_CHARS[(v >> 6) & 63] + (g[1] < bytes.length ? APR64_CHARS[(v >> 12) & 63] : "") + (g[2] < bytes.length ? APR64_CHARS[(v >> 18) & 63] : ""); } }
  return result;
}

export function HtpasswdGenerator() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("mypassword");
  const [method, setMethod] = useState("apr1");
  const [result, setResult] = useState("");

  const generate = () => {
    if (method === "sha1") {
      crypto.subtle.digest("SHA-1", new TextEncoder().encode(password)).then(buf => {
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        setResult(`${username}:{SHA}${b64}`);
      });
    } else if (method === "md5") {
      const hash = md5(password);
      setResult(`${username}:${hash}`);
    } else {
      const salt = "$apr1$" + Math.random().toString(36).slice(2, 10) + "$";
      setResult(`${username}:${salt}[apr1-hash-requires-server-side]`);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>.htpasswd Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Username</Label><Input value={username} onChange={e => setUsername(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
          <div>
            <Label>Hash Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sha1">SHA-1 ({"{SHA}"}) — Apache compatible</SelectItem>
                <SelectItem value="md5">MD5 (unsalted)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={generate}>Generate</Button>
        {result && (
          <div className="relative">
            <pre className="bg-muted rounded p-3 text-sm font-mono">{result}</pre>
            <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(result)}>Copy</Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Add the output line to your <code>.htpasswd</code> file. Use Apache's <code>htpasswd</code> CLI for APR1-MD5 (the most secure format).</p>
      </CardContent>
    </Card>
  );
}

// ─── Sitemap Generator ────────────────────────────────────────────────────────
export function SitemapGenerator() {
  const [baseUrl, setBaseUrl] = useState("https://example.com");
  const [urls, setUrls] = useState("/\n/about\n/blog\n/blog/post-1\n/contact");
  const [defaultFreq, setDefaultFreq] = useState("weekly");
  const [defaultPriority, setDefaultPriority] = useState("0.8");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.split("\n").filter(Boolean).map(path => {
  const clean = path.trim().startsWith("/") ? path.trim() : "/" + path.trim();
  const priority = clean === "/" ? "1.0" : defaultPriority;
  return `  <url>
    <loc>${baseUrl}${clean}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${defaultFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join("\n")}
</urlset>`;

  return (
    <Card>
      <CardHeader><CardTitle>Sitemap Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Base URL</Label>
          <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://example.com" />
        </div>
        <div>
          <Label>URL Paths (one per line)</Label>
          <Textarea value={urls} onChange={e => setUrls(e.target.value)} className="h-32 font-mono text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Default Change Frequency</Label>
            <Select value={defaultFreq} onValueChange={setDefaultFreq}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default Priority</Label>
            <Select value={defaultPriority} onValueChange={setDefaultPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["1.0", "0.9", "0.8", "0.7", "0.5", "0.3", "0.1"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{sitemap}</pre>
          <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(sitemap)}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ARIA Roles Reference ─────────────────────────────────────────────────────
const ARIA_ROLES = [
  { role: "banner", desc: "Site-oriented header at the top, typically contains logo and nav", category: "Landmark" },
  { role: "navigation", desc: "Contains navigational links to other pages or parts of the page", category: "Landmark" },
  { role: "main", desc: "Primary content of the document", category: "Landmark" },
  { role: "complementary", desc: "Supporting section related to main content but can stand alone", category: "Landmark" },
  { role: "contentinfo", desc: "Perceivable section containing info about the parent document (footer)", category: "Landmark" },
  { role: "search", desc: "A landmark region that contains a collection of search functionality", category: "Landmark" },
  { role: "form", desc: "Landmark region containing form elements", category: "Landmark" },
  { role: "region", desc: "Perceivable section with a name, containing content relevant to a specific purpose", category: "Landmark" },
  { role: "button", desc: "An input that allows users to trigger an action", category: "Widget" },
  { role: "checkbox", desc: "A checkable input that has three possible values", category: "Widget" },
  { role: "dialog", desc: "A window separate from the main window of the web application", category: "Widget" },
  { role: "grid", desc: "A composite widget containing rows of cells", category: "Widget" },
  { role: "gridcell", desc: "A cell in a grid or treegrid", category: "Widget" },
  { role: "link", desc: "An interactive reference to an internal or external resource", category: "Widget" },
  { role: "listbox", desc: "A widget that allows the user to select one or more items from a list", category: "Widget" },
  { role: "menu", desc: "A type of widget that offers a list of choices to the user", category: "Widget" },
  { role: "menubar", desc: "A presentation of menu that usually remains visible", category: "Widget" },
  { role: "menuitem", desc: "An option in a set of choices contained by a menu or menubar", category: "Widget" },
  { role: "option", desc: "A selectable item in a select list", category: "Widget" },
  { role: "progressbar", desc: "An element that displays the progress status for tasks", category: "Widget" },
  { role: "radio", desc: "A checkable input in a group of the same role", category: "Widget" },
  { role: "radiogroup", desc: "A group of radio buttons", category: "Widget" },
  { role: "scrollbar", desc: "A graphical object that controls the scrolling of content", category: "Widget" },
  { role: "searchbox", desc: "A type of textbox intended for specifying search criteria", category: "Widget" },
  { role: "slider", desc: "An input where the user selects a value from within a given range", category: "Widget" },
  { role: "spinbutton", desc: "A form of range that expects a user to select from among discrete choices", category: "Widget" },
  { role: "switch", desc: "A type of checkbox that represents on/off values", category: "Widget" },
  { role: "tab", desc: "A grouping label providing a mechanism for selecting content", category: "Widget" },
  { role: "tablist", desc: "A list of tab elements, which are references to tabpanel elements", category: "Widget" },
  { role: "tabpanel", desc: "A container for the resources associated with a tab", category: "Widget" },
  { role: "textbox", desc: "A type of input that allows free-form text as its value", category: "Widget" },
  { role: "tooltip", desc: "A contextual popup that displays a description for an element", category: "Widget" },
  { role: "tree", desc: "A type of list that may contain sub-level nested groups", category: "Widget" },
  { role: "treegrid", desc: "A grid whose rows can be expanded and collapsed", category: "Widget" },
  { role: "treeitem", desc: "An option item of a tree", category: "Widget" },
  { role: "alert", desc: "A live region with important, usually time-sensitive, information", category: "Live Region" },
  { role: "alertdialog", desc: "A type of dialog that contains an alert message", category: "Live Region" },
  { role: "log", desc: "A type of live region where new information is added in meaningful order", category: "Live Region" },
  { role: "marquee", desc: "A type of live region where non-essential information changes frequently", category: "Live Region" },
  { role: "status", desc: "A type of live region whose content is advisory information", category: "Live Region" },
  { role: "timer", desc: "A numerical counter which indicates an amount of elapsed time", category: "Live Region" },
  { role: "article", desc: "A section of a page that could stand alone, e.g., a blog post", category: "Document" },
  { role: "cell", desc: "A cell in a tabular container", category: "Document" },
  { role: "columnheader", desc: "A cell containing header information for a column", category: "Document" },
  { role: "definition", desc: "A definition of a term or concept", category: "Document" },
  { role: "document", desc: "An element containing content that assistive technology users may navigate", category: "Document" },
  { role: "figure", desc: "A perceivable section of content with an optional caption", category: "Document" },
  { role: "group", desc: "A set of user interface objects not intended to be included in a page summary", category: "Document" },
  { role: "heading", desc: "A heading for a section of the page (h1–h6)", category: "Document" },
  { role: "img", desc: "A container for a collection of elements that form an image", category: "Document" },
  { role: "list", desc: "A section containing listitem elements", category: "Document" },
  { role: "listitem", desc: "A single item in a list or directory", category: "Document" },
  { role: "math", desc: "Content that represents a mathematical expression", category: "Document" },
  { role: "note", desc: "A section whose content is parenthetic or ancillary", category: "Document" },
  { role: "presentation", desc: "An element whose implicit native role semantics will not be mapped", category: "Document" },
  { role: "row", desc: "A row of cells in a tabular container", category: "Document" },
  { role: "rowgroup", desc: "A structure containing one or more row elements", category: "Document" },
  { role: "rowheader", desc: "A cell containing header information for a row", category: "Document" },
  { role: "separator", desc: "A divider that separates and distinguishes sections of content", category: "Document" },
  { role: "table", desc: "A section containing data arranged in rows and columns", category: "Document" },
  { role: "term", desc: "A word or phrase with a corresponding definition", category: "Document" },
];

export function AriaRolesReference() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", "Landmark", "Widget", "Live Region", "Document"];
  const filtered = ARIA_ROLES.filter(r =>
    (category === "All" || r.category === category) &&
    (r.role.includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader><CardTitle>ARIA Roles Reference</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)}>{c}</Button>
          ))}
        </div>
        <Input placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-2 max-h-96 overflow-auto">
          {filtered.map(r => (
            <div key={r.role} className="flex gap-2 p-2 rounded border items-start">
              <div className="flex-shrink-0">
                <Badge variant="outline">{r.role}</Badge>
                <div className="text-xs text-muted-foreground mt-1">{r.category}</div>
              </div>
              <div className="text-sm">{r.desc}</div>
              <code className="text-xs text-muted-foreground flex-shrink-0">role="{r.role}"</code>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} of {ARIA_ROLES.length} roles shown</div>
      </CardContent>
    </Card>
  );
}

// ─── WCAG Reference ────────────────────────────────────────────────────────────
const WCAG_CRITERIA = [
  { id: "1.1.1", level: "A", principle: "Perceivable", title: "Non-text Content", desc: "All non-text content has a text alternative that serves the equivalent purpose." },
  { id: "1.2.1", level: "A", principle: "Perceivable", title: "Audio-only and Video-only", desc: "An alternative for time-based media is provided for prerecorded audio-only and video-only content." },
  { id: "1.3.1", level: "A", principle: "Perceivable", title: "Info and Relationships", desc: "Information, structure, and relationships conveyed through presentation can be programmatically determined." },
  { id: "1.4.1", level: "A", principle: "Perceivable", title: "Use of Color", desc: "Color is not used as the only visual means of conveying information or indicating an action." },
  { id: "1.4.3", level: "AA", principle: "Perceivable", title: "Contrast (Minimum)", desc: "Text has a contrast ratio of at least 4.5:1 (3:1 for large text)." },
  { id: "1.4.4", level: "AA", principle: "Perceivable", title: "Resize Text", desc: "Text can be resized up to 200% without loss of content or functionality." },
  { id: "1.4.6", level: "AAA", principle: "Perceivable", title: "Contrast (Enhanced)", desc: "Text has a contrast ratio of at least 7:1 (4.5:1 for large text)." },
  { id: "1.4.10", level: "AA", principle: "Perceivable", title: "Reflow", desc: "Content can be presented without loss of information at 320 CSS pixels wide." },
  { id: "1.4.11", level: "AA", principle: "Perceivable", title: "Non-text Contrast", desc: "UI components and graphical objects have a contrast ratio of at least 3:1." },
  { id: "2.1.1", level: "A", principle: "Operable", title: "Keyboard", desc: "All functionality is operable through a keyboard interface without timing." },
  { id: "2.1.2", level: "A", principle: "Operable", title: "No Keyboard Trap", desc: "Keyboard focus can be moved away from any component using only the keyboard." },
  { id: "2.4.1", level: "A", principle: "Operable", title: "Bypass Blocks", desc: "A mechanism is available to bypass blocks of content that are repeated on multiple pages." },
  { id: "2.4.2", level: "A", principle: "Operable", title: "Page Titled", desc: "Web pages have titles that describe topic or purpose." },
  { id: "2.4.3", level: "A", principle: "Operable", title: "Focus Order", desc: "Focusable components receive focus in an order that preserves meaning and operability." },
  { id: "2.4.4", level: "A", principle: "Operable", title: "Link Purpose", desc: "The purpose of each link can be determined from the link text alone or its context." },
  { id: "2.4.7", level: "AA", principle: "Operable", title: "Focus Visible", desc: "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible." },
  { id: "3.1.1", level: "A", principle: "Understandable", title: "Language of Page", desc: "The default human language of each web page can be programmatically determined." },
  { id: "3.2.1", level: "A", principle: "Understandable", title: "On Focus", desc: "Receiving focus on any component does not initiate a change of context." },
  { id: "3.3.1", level: "A", principle: "Understandable", title: "Error Identification", desc: "If an input error is detected, the item in error is identified and described to the user." },
  { id: "3.3.2", level: "A", principle: "Understandable", title: "Labels or Instructions", desc: "Labels or instructions are provided when content requires user input." },
  { id: "4.1.1", level: "A", principle: "Robust", title: "Parsing", desc: "Elements have complete start and end tags, are nested according to specs, and no duplicate attributes." },
  { id: "4.1.2", level: "A", principle: "Robust", title: "Name, Role, Value", desc: "For all UI components, the name, role, and state can be programmatically determined." },
  { id: "4.1.3", level: "AA", principle: "Robust", title: "Status Messages", desc: "Status messages can be programmatically determined through role or property." },
];

export function WcagReference() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [principle, setPrinciple] = useState("All");
  const levels = ["All", "A", "AA", "AAA"];
  const principles = ["All", "Perceivable", "Operable", "Understandable", "Robust"];
  const filtered = WCAG_CRITERIA.filter(c =>
    (level === "All" || c.level === level) &&
    (principle === "All" || c.principle === principle) &&
    (c.id.includes(search) || c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const levelColor = (l: string) => l === "A" ? "bg-green-500/20 text-green-400" : l === "AA" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400";

  return (
    <Card>
      <CardHeader><CardTitle>WCAG 2.1 Reference</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {levels.map(l => <Button key={l} size="sm" variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)}>{l}</Button>)}
          <span className="text-muted-foreground">|</span>
          {principles.map(p => <Button key={p} size="sm" variant={principle === p ? "default" : "outline"} onClick={() => setPrinciple(p)}>{p}</Button>)}
        </div>
        <Input placeholder="Search WCAG criteria..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-2 max-h-96 overflow-auto">
          {filtered.map(c => (
            <div key={c.id} className="p-3 rounded border">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{c.id}</Badge>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${levelColor(c.level)}`}>{c.level}</span>
                <span className="font-medium text-sm">{c.title}</span>
                <span className="text-xs text-muted-foreground ml-auto">{c.principle}</span>
              </div>
              <div className="text-sm text-muted-foreground">{c.desc}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} criteria shown</div>
      </CardContent>
    </Card>
  );
}

// ─── HTTP Status Codes Reference ──────────────────────────────────────────────
const HTTP_CODES = [
  { code: 100, text: "Continue", desc: "The server has received the request headers and the client should proceed." },
  { code: 101, text: "Switching Protocols", desc: "The server is switching protocols as requested by the client." },
  { code: 200, text: "OK", desc: "The request was successful." },
  { code: 201, text: "Created", desc: "The request was successful and a resource was created." },
  { code: 202, text: "Accepted", desc: "The request has been accepted but not yet processed." },
  { code: 204, text: "No Content", desc: "The request was successful but there is no content to send." },
  { code: 206, text: "Partial Content", desc: "The server is delivering only part of the resource due to a range header." },
  { code: 301, text: "Moved Permanently", desc: "The URL has been permanently changed to the one provided." },
  { code: 302, text: "Found", desc: "The URI of the resource is temporarily different." },
  { code: 304, text: "Not Modified", desc: "The response has not been modified and the client can use the cached version." },
  { code: 307, text: "Temporary Redirect", desc: "Redirect should use the same HTTP method as the original request." },
  { code: 308, text: "Permanent Redirect", desc: "Permanent redirect, must use the same HTTP method." },
  { code: 400, text: "Bad Request", desc: "The server cannot process the request due to a client error." },
  { code: 401, text: "Unauthorized", desc: "Authentication is required and has failed or not been provided." },
  { code: 403, text: "Forbidden", desc: "The client does not have access rights to the content." },
  { code: 404, text: "Not Found", desc: "The server cannot find the requested resource." },
  { code: 405, text: "Method Not Allowed", desc: "The HTTP method is not allowed for this resource." },
  { code: 408, text: "Request Timeout", desc: "The server timed out waiting for the request." },
  { code: 409, text: "Conflict", desc: "The request conflicts with the current state of the resource." },
  { code: 410, text: "Gone", desc: "The resource has been permanently deleted and will not be available again." },
  { code: 413, text: "Payload Too Large", desc: "The request is larger than the server is willing to process." },
  { code: 422, text: "Unprocessable Entity", desc: "The request is well-formed but contains semantic errors." },
  { code: 429, text: "Too Many Requests", desc: "The user has sent too many requests in a given amount of time (rate limiting)." },
  { code: 500, text: "Internal Server Error", desc: "The server encountered an unexpected condition." },
  { code: 501, text: "Not Implemented", desc: "The server does not support the functionality required." },
  { code: 502, text: "Bad Gateway", desc: "The server received an invalid response from an upstream server." },
  { code: 503, text: "Service Unavailable", desc: "The server is not ready to handle the request." },
  { code: 504, text: "Gateway Timeout", desc: "The upstream server failed to send a response in time." },
  { code: 505, text: "HTTP Version Not Supported", desc: "The HTTP version used in the request is not supported." },
];

export function HttpStatusCodesReference() {
  const [search, setSearch] = useState("");
  const filtered = HTTP_CODES.filter(c => String(c.code).includes(search) || c.text.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()));
  const classColor = (c: number) => c < 200 ? "bg-gray-500/20 text-gray-400" : c < 300 ? "bg-green-500/20 text-green-400" : c < 400 ? "bg-blue-500/20 text-blue-400" : c < 500 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400";

  return (
    <Card>
      <CardHeader><CardTitle>HTTP Status Codes Reference</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Search status codes..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-2 max-h-[500px] overflow-auto">
          {filtered.map(c => (
            <div key={c.code} className="flex gap-3 p-3 rounded border items-start">
              <div className={`text-lg font-bold min-w-[52px] text-center py-1 rounded ${classColor(c.code)}`}>{c.code}</div>
              <div>
                <div className="font-medium text-sm">{c.text}</div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} codes shown</div>
      </CardContent>
    </Card>
  );
}
