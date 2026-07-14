import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import JsBarcode from "jsbarcode";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── HTML5 Boilerplate Generator ──────────────────────────────────────────────
export function Html5BoilerplateGenerator() {
  const [title, setTitle] = useState("My Website");
  const [description, setDescription] = useState("A well-crafted website");
  const [lang, setLang] = useState("en");
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [includeOg, setIncludeOg] = useState(true);
  const [includeGtm, setIncludeGtm] = useState(false);
  const [viewport, setViewport] = useState("width=device-width, initial-scale=1.0");

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="${viewport}" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="theme-color" content="${themeColor}" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />${includeOg ? `
  <!-- Open Graph -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://example.com/" />
  <meta property="og:image" content="https://example.com/og-image.png" />
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />` : ""}${includeGtm ? `
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>` : ""}
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>${includeGtm ? `
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : ""}

  <header>
    <nav>
      <a href="/">${title}</a>
    </nav>
  </header>

  <main>
    <h1>${title}</h1>
    <p>${description}</p>
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} ${title}</p>
  </footer>

  <script src="/main.js"></script>
</body>
</html>`;

  return (
    <Card>
      <CardHeader><CardTitle>HTML5 Boilerplate Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Page Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">en (English)</SelectItem>
                <SelectItem value="fr">fr (French)</SelectItem>
                <SelectItem value="de">de (German)</SelectItem>
                <SelectItem value="es">es (Spanish)</SelectItem>
                <SelectItem value="ja">ja (Japanese)</SelectItem>
                <SelectItem value="zh">zh (Chinese)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Label>Theme Color</Label>
            <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={includeOg} onChange={e => setIncludeOg(e.target.checked)} />
              <span className="text-sm">Open Graph tags</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={includeGtm} onChange={e => setIncludeGtm(e.target.checked)} />
              <span className="text-sm">Google Tag Manager</span>
            </label>
          </div>
        </div>
        <div className="relative">
          <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-72">{html}</pre>
          <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(html)}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Heading Hierarchy Checker ────────────────────────────────────────────────
export function HeadingHierarchyChecker() {
  const [html, setHtml] = useState(`<h1>Main Title</h1>
<p>Some content</p>
<h2>Section A</h2>
<h3>Subsection A.1</h3>
<h3>Subsection A.2</h3>
<h2>Section B</h2>
<h4>Skipped h3!</h4>
<h3>Back to h3</h3>`);
  const [headings, setHeadings] = useState<Array<{ level: number; text: string; issue: string }>>([]);

  const check = () => {
    const matches = [...html.matchAll(/<h([1-6])[^>]*>([^<]*)<\/h\1>/gi)];
    const result: Array<{ level: number; text: string; issue: string }> = [];
    let prev = 0;
    for (const m of matches) {
      const level = +m[1];
      const text = m[2].trim();
      const issue = level === 1 && result.some(r => r.level === 1) ? "Multiple H1s" :
        level > prev + 1 && prev > 0 ? `Skipped from H${prev} to H${level}` : "";
      result.push({ level, text, issue });
      prev = level;
    }
    setHeadings(result);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Heading Hierarchy Checker</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>HTML Content</Label>
          <Textarea value={html} onChange={e => setHtml(e.target.value)} className="font-mono text-xs h-40" />
        </div>
        <Button onClick={check}>Check Headings</Button>
        {headings.length > 0 && (
          <div className="space-y-1">
            {headings.map((h, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded ${h.issue ? "bg-red-500/10 border border-red-500/30" : "bg-muted"}`} style={{ paddingLeft: `${h.level * 12}px` }}>
                <Badge variant={h.issue ? "destructive" : "outline"} className="min-w-[36px] justify-center">H{h.level}</Badge>
                <span className="text-sm flex-1">{h.text}</span>
                {h.issue && <span className="text-xs text-red-400">⚠ {h.issue}</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Font Preview ─────────────────────────────────────────────────────────────
const FONTS = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Courier New", "Verdana",
  "Trebuchet MS", "Impact", "Comic Sans MS", "Palatino", "Garamond", "Bookman",
  "Arial Black", "Tahoma", "Lucida Console",
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
  "Playfair Display", "Merriweather", "Source Code Pro", "Fira Code",
];

export function FontPreview() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [size, setSize] = useState(18);
  const [filter, setFilter] = useState("");

  const filtered = FONTS.filter(f => f.toLowerCase().includes(filter.toLowerCase()));

  return (
    <Card>
      <CardHeader><CardTitle>Font Preview</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Preview Text</Label>
            <Input value={text} onChange={e => setText(e.target.value)} />
          </div>
          <div>
            <Label>Size: {size}px</Label>
            <input type="range" min={10} max={48} value={size} onChange={e => setSize(+e.target.value)} className="w-full" />
          </div>
          <div className="col-span-2">
            <Label>Filter</Label>
            <Input placeholder="Search fonts..." value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2 max-h-96 overflow-auto">
          {filtered.map(font => (
            <div key={font} className="p-3 rounded border hover:bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">{font}</div>
              <div style={{ fontFamily: `'${font}', sans-serif`, fontSize: `${size}px` }}>{text}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Placeholder Image Generator ──────────────────────────────────────────────
export function PlaceholderImageGenerator() {
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [bg, setBg] = useState("#6366f1");
  const [fg, setFg] = useState("#ffffff");
  const [label, setLabel] = useState("");
  const [format, setFormat] = useState("svg");

  const displayLabel = label || `${width}×${height}`;
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${bg}"/><text x="${width / 2}" y="${height / 2}" font-family="Arial,sans-serif" font-size="${Math.min(width, height) / 8}" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${displayLabel}</text></svg>`;
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

  const download = () => {
    const a = document.createElement("a");
    a.href = svgUrl;
    a.download = `placeholder-${width}x${height}.svg`;
    a.click();
  };

  const htmlSnippet = `<img src="${svgUrl}" width="${width}" height="${height}" alt="Placeholder ${displayLabel}" />`;

  return (
    <Card>
      <CardHeader><CardTitle>Placeholder Image Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Width (px)</Label>
            <Input type="number" value={width} onChange={e => setWidth(+e.target.value)} min={50} max={2000} />
          </div>
          <div>
            <Label>Height (px)</Label>
            <Input type="number" value={height} onChange={e => setHeight(+e.target.value)} min={50} max={2000} />
          </div>
          <div className="flex items-center gap-2">
            <Label>Background</Label>
            <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Label>Text Color</Label>
            <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="col-span-2">
            <Label>Custom Label (leave blank for size)</Label>
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Loading..." />
          </div>
        </div>
        <div className="flex justify-center border rounded p-4 bg-muted/30">
          <img src={svgUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200 }} />
        </div>
        <div className="flex gap-2">
          <Button onClick={download}>Download SVG</Button>
          <Button variant="outline" onClick={() => copyToClipboard(svgUrl)}>Copy URL</Button>
          <Button variant="outline" onClick={() => copyToClipboard(htmlSnippet)}>Copy HTML</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Barcode Generator ────────────────────────────────────────────────────────
export function BarcodeGeneratorTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [value, setValue] = useState("1234567890");
  const [format, setFormat] = useState("CODE128");
  const [lineColor, setLineColor] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [showText, setShowText] = useState(true);
  const [error, setError] = useState("");

  const generate = () => {
    if (!canvasRef.current || !value.trim()) return;
    try {
      JsBarcode(canvasRef.current, value, {
        format,
        lineColor,
        background: bg,
        displayValue: showText,
        margin: 10,
        width: 2,
        height: 80,
      });
      setError("");
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  useEffect(() => { generate(); }, [value, format, lineColor, bg, showText]);

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `barcode-${value}.png`;
    a.click();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Barcode Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Value</Label>
            <Input value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14", "MSI", "pharmacode"].map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label>Line Color</Label>
            <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Label>Background</Label>
            <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="showText" checked={showText} onChange={e => setShowText(e.target.checked)} />
            <Label htmlFor="showText">Show text below barcode</Label>
          </div>
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex justify-center p-4 rounded border">
          <canvas ref={canvasRef} />
        </div>
        <Button onClick={download}>Download PNG</Button>
      </CardContent>
    </Card>
  );
}

// ─── Changelog Formatter ──────────────────────────────────────────────────────
export function ChangelogFormatter() {
  const [version, setVersion] = useState("1.2.0");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [added, setAdded] = useState("New dark mode option\nBarcode generator tool");
  const [changed, setChanged] = useState("Improved JSON formatter performance");
  const [fixed, setFixed] = useState("Fixed timezone conversion bug");
  const [removed, setRemoved] = useState("");

  const lines = (s: string) => s.split("\n").filter(Boolean).map(l => `- ${l.trim()}`).join("\n");

  const changelog = `## [${version}] - ${date}\n${added.trim() ? `\n### Added\n${lines(added)}\n` : ""}${changed.trim() ? `\n### Changed\n${lines(changed)}\n` : ""}${fixed.trim() ? `\n### Fixed\n${lines(fixed)}\n` : ""}${removed.trim() ? `\n### Removed\n${lines(removed)}\n` : ""}`.trim();

  return (
    <Card>
      <CardHeader><CardTitle>Changelog Formatter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Version</Label>
            <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.2.0" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        {[["Added", added, setAdded], ["Changed", changed, setChanged], ["Fixed", fixed, setFixed], ["Removed", removed, setRemoved]].map(([label, value, setter]) => (
          <div key={label as string}>
            <Label>{label as string} (one per line)</Label>
            <Textarea value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)} className="h-20 text-sm" placeholder={`Enter ${(label as string).toLowerCase()} items...`} />
          </div>
        ))}
        <div className="relative">
          <Label>Keep a Changelog format</Label>
          <pre className="bg-muted rounded p-3 text-sm overflow-auto max-h-48">{changelog}</pre>
          <Button size="sm" className="absolute top-6 right-0" onClick={() => copyToClipboard(changelog)}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Favicon Generator ────────────────────────────────────────────────────────
export function FaviconGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("T");
  const [bg, setBg] = useState("#6366f1");
  const [fg, setFg] = useState("#ffffff");
  const [size, setSize] = useState(64);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = `bold ${size * 0.55}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.slice(0, 2), size / 2, size / 2);
  }, [text, bg, fg, size]);

  const download = (s: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = s; canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, s, s, s * 0.2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = `bold ${s * 0.55}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.slice(0, 2), s / 2, s / 2);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `favicon-${s}x${s}.png`;
    a.click();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Favicon Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Text / Emoji (1-2 chars)</Label>
            <Input value={text} onChange={e => setText(e.target.value)} maxLength={2} />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <Label>BG</Label>
              <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="h-8 w-12 cursor-pointer rounded block" />
            </div>
            <div>
              <Label>Text</Label>
              <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="h-8 w-12 cursor-pointer rounded block" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <canvas ref={canvasRef} className="rounded border" style={{ imageRendering: "pixelated", width: 64, height: 64 }} />
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Download sizes:</div>
            {[16, 32, 48, 64, 96, 180, 512].map(s => (
              <Button key={s} size="sm" variant="outline" onClick={() => download(s)}>{s}×{s}</Button>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Use favicon-32x32.png as your main favicon, 180x180 for Apple touch icon, 512x512 for PWA manifest.
        </div>
      </CardContent>
    </Card>
  );
}
