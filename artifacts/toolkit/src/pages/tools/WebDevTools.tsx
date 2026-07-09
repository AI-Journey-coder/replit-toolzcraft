import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCheck, Upload, X } from "lucide-react";

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

// ─── FormatRow (no hooks in map) ──────────────────────────────────────────

function FormatRow({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy(value);
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">{label}</span>
      <span className="flex-1 font-mono text-sm" data-testid={`text-${label.toLowerCase()}`}>{value}</span>
      <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors" data-testid={`btn-copy-${label.toLowerCase()}`}>
        {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Color Picker ──────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function complementary(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `#${(255 - r).toString(16).padStart(2, "0")}${(255 - g).toString(16).padStart(2, "0")}${(255 - b).toString(16).padStart(2, "0")}`;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}

export function ColorPicker() {
  const [color, setColor] = useState("#3b82f6");
  const { r, g, b } = hexToRgb(color);
  const { h, s, l } = rgbToHsl(r, g, b);

  const analogous = [hslToHex((h - 30 + 360) % 360, s, l), hslToHex((h + 30) % 360, s, l)];
  const triadic = [hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
  const comp = complementary(color);

  const formats = [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
    { label: "HSL", value: `hsl(${h}, ${s}%, ${l}%)` },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Color Picker</CardTitle>
          <CardDescription>Pick a color and get all format values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div
              className="w-full h-40 rounded-xl border border-border shadow-sm transition-colors"
              style={{ backgroundColor: color }}
              data-testid="div-color-preview"
            />
            <div className="flex gap-3 items-center">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-20 rounded cursor-pointer border border-border bg-transparent" data-testid="input-color" />
              <Input className="font-mono uppercase" value={color} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setColor(e.target.value); }} data-testid="input-hex" />
            </div>
          </div>

          <div className="space-y-2">
            {formats.map(({ label, value }) => (
              <FormatRow key={label} label={label} value={value} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Color Harmony</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {[
            { label: "Complementary", colors: [comp] },
            { label: "Analogous", colors: analogous },
            { label: "Triadic", colors: triadic },
          ].map(({ label, colors }) => (
            <div key={label} className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    className="flex-1 h-14 rounded-lg border border-border shadow-sm hover:scale-105 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                    data-testid={`swatch-${c.replace("#", "")}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── CSS Gradient Generator ────────────────────────────────────────────────

type Stop = { id: number; color: string; pos: number };

export function CssGradient() {
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, color: "#3b82f6", pos: 0 },
    { id: 2, color: "#8b5cf6", pos: 100 },
  ]);
  const [direction, setDirection] = useState("90deg");
  const [type, setType] = useState("linear");
  const nextId = useRef(3);

  const addStop = () => {
    setStops(prev => [...prev, { id: nextId.current++, color: "#ec4899", pos: 50 }].sort((a, b) => a.pos - b.pos));
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const updateStop = (id: number, field: keyof Stop, value: string | number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const gradientStr = stops
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .map(s => `${s.color} ${s.pos}%`)
    .join(", ");

  const css = type === "linear"
    ? `background: linear-gradient(${direction}, ${gradientStr});`
    : `background: radial-gradient(circle, ${gradientStr});`;

  const { copied, copy } = useCopy(css);

  const directions = ["0deg", "45deg", "90deg", "135deg", "180deg", "225deg", "270deg", "315deg"];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>CSS Gradient Generator</CardTitle>
          <CardDescription>Build beautiful gradients visually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div
            className="w-full h-36 rounded-xl border border-border shadow-sm"
            style={{ background: type === "linear" ? `linear-gradient(${direction}, ${gradientStr})` : `radial-gradient(circle, ${gradientStr})` }}
            data-testid="div-gradient-preview"
          />

          <div className="flex gap-3 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <div className="flex gap-2">
                {["linear", "radial"].map(t => (
                  <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)} data-testid={`btn-type-${t}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {type === "linear" && (
              <div className="space-y-1">
                <Label className="text-xs">Direction</Label>
                <div className="flex gap-1 flex-wrap">
                  {directions.map(d => (
                    <button key={d} onClick={() => setDirection(d)} className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${direction === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`} data-testid={`btn-dir-${d}`}>{d}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Color Stops</Label>
              <Button size="sm" variant="outline" onClick={addStop} data-testid="btn-add-stop">Add Stop</Button>
            </div>
            <div className="space-y-2">
              {stops.map(stop => (
                <div key={stop.id} className="flex items-center gap-2" data-testid={`stop-${stop.id}`}>
                  <input type="color" value={stop.color} onChange={e => updateStop(stop.id, "color", e.target.value)} className="h-9 w-14 rounded cursor-pointer border border-border bg-transparent" />
                  <Input className="font-mono uppercase w-28" value={stop.color} onChange={e => updateStop(stop.id, "color", e.target.value)} />
                  <Input type="number" min={0} max={100} value={stop.pos} onChange={e => updateStop(stop.id, "pos", Number(e.target.value))} className="w-20 font-mono" />
                  <span className="text-muted-foreground text-sm">%</span>
                  <button onClick={() => removeStop(stop.id)} className="text-muted-foreground hover:text-destructive transition-colors" disabled={stops.length <= 2}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">CSS Output</Label>
              <Button size="sm" variant="outline" onClick={copy} data-testid="btn-copy-css">
                {copied ? <CheckCheck className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy CSS"}
              </Button>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm border border-border" data-testid="text-css-output">{css}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Image to Base64 ───────────────────────────────────────────────────────

export function ImageToBase64() {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { copied, copy } = useCopy(base64);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setBase64(result.split(",")[1] ?? "");
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, []);

  const download = () => {
    if (!base64 || !preview) return;
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(base64);
    a.download = `${fileName}.b64.txt`;
    a.click();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Image to Base64</CardTitle>
        <CardDescription>Convert any image to a Base64 encoded string</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} data-testid="input-file" />

        <div
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          data-testid="div-dropzone"
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Drag & drop an image, or click to select</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WebP, SVG</p>
        </div>

        {preview && (
          <div className="space-y-3">
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg border border-border mx-auto object-contain" data-testid="img-preview" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={copy} data-testid="btn-copy">
                {copied ? <CheckCheck className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                Copy Base64
              </Button>
              <Button variant="outline" onClick={download} data-testid="btn-download">Download .txt</Button>
            </div>
            <Textarea readOnly className="font-mono text-xs min-h-[120px] bg-muted/30" value={base64} data-testid="textarea-base64" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Meta Tag Generator ────────────────────────────────────────────────────

export function MetaTagGenerator() {
  const [fields, setFields] = useState({
    title: "My Awesome Page",
    description: "A brief description of the page content",
    keywords: "keyword1, keyword2, keyword3",
    author: "",
    ogTitle: "My Awesome Page",
    ogDescription: "A brief description of the page content",
    ogImage: "https://example.com/image.jpg",
    ogUrl: "https://example.com",
    twitterCard: "summary_large_image",
  });

  const update = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(prev => ({ ...prev, [key]: e.target.value }));
  };

  const output = `<!-- Primary Meta Tags -->
<title>${fields.title}</title>
<meta name="title" content="${fields.title}" />
<meta name="description" content="${fields.description}" />
${fields.keywords ? `<meta name="keywords" content="${fields.keywords}" />` : ""}
${fields.author ? `<meta name="author" content="${fields.author}" />` : ""}

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${fields.ogUrl}" />
<meta property="og:title" content="${fields.ogTitle}" />
<meta property="og:description" content="${fields.ogDescription}" />
${fields.ogImage ? `<meta property="og:image" content="${fields.ogImage}" />` : ""}

<!-- Twitter -->
<meta property="twitter:card" content="${fields.twitterCard}" />
<meta property="twitter:url" content="${fields.ogUrl}" />
<meta property="twitter:title" content="${fields.ogTitle}" />
<meta property="twitter:description" content="${fields.ogDescription}" />
${fields.ogImage ? `<meta property="twitter:image" content="${fields.ogImage}" />` : ""}`.replace(/\n{3,}/g, "\n\n").trim();

  const { copied, copy } = useCopy(output);

  const formFields = [
    { key: "title" as const, label: "Title", placeholder: "My Awesome Page" },
    { key: "description" as const, label: "Description", placeholder: "Page description (150-160 chars recommended)" },
    { key: "keywords" as const, label: "Keywords", placeholder: "keyword1, keyword2, keyword3" },
    { key: "author" as const, label: "Author", placeholder: "John Doe" },
    { key: "ogTitle" as const, label: "OG Title", placeholder: "Open Graph title" },
    { key: "ogDescription" as const, label: "OG Description", placeholder: "Open Graph description" },
    { key: "ogImage" as const, label: "OG Image URL", placeholder: "https://example.com/image.jpg" },
    { key: "ogUrl" as const, label: "Page URL", placeholder: "https://example.com" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Meta Tag Generator</CardTitle>
          <CardDescription>Generate SEO and social sharing meta tags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {formFields.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input placeholder={placeholder} value={fields[key]} onChange={update(key)} data-testid={`input-${key}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Generated HTML</CardTitle>
              <CardDescription>Copy and paste into your &lt;head&gt;</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={copy} data-testid="btn-copy">
              {copied ? <CheckCheck className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea readOnly className="font-mono text-xs min-h-[420px] bg-muted/30 resize-none" value={output} data-testid="textarea-output" />
        </CardContent>
      </Card>
    </div>
  );
}
