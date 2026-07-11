import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCheck } from "lucide-react";
import QRCode from "qrcode";

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }} disabled={!text}>
      {ok ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : label}
    </Button>
  );
}

// ─── QR Code Generator ────────────────────────────────────────────────────────
export function QrCodeGenerator() {
  const [text, setText] = useState("https://toolzcraft.app");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<"L"|"M"|"Q"|"H">("M");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) return;
    QRCode.toDataURL(text, {
      width: size, errorCorrectionLevel: errorLevel,
      color: { dark: darkColor, light: lightColor },
      margin: 2,
    }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [text, size, errorLevel, darkColor, lightColor]);

  const download = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>QR Code Generator</CardTitle><CardDescription>Generate QR codes from any URL or text, with customizable colors and error correction</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Content (URL or text)</Label><Textarea className="font-mono text-xs min-h-[80px]" value={text} onChange={e => setText(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Size (px)</Label>
                <Select value={size.toString()} onValueChange={v => setSize(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[128, 256, 512, 1024].map(s => <SelectItem key={s} value={s.toString()}>{s}×{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Error correction</Label>
                <Select value={errorLevel} onValueChange={v => setErrorLevel(v as "L"|"M"|"Q"|"H")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L — Low (7%)</SelectItem>
                    <SelectItem value="M">M — Medium (15%)</SelectItem>
                    <SelectItem value="Q">Q — Quartile (25%)</SelectItem>
                    <SelectItem value="H">H — High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Dark color</Label><div className="flex gap-2"><input type="color" value={darkColor} onChange={e => setDarkColor(e.target.value)} className="w-11 h-9 rounded cursor-pointer border border-border" /><Input className="font-mono text-xs" value={darkColor} onChange={e => setDarkColor(e.target.value)} /></div></div>
              <div className="space-y-1.5"><Label>Light color</Label><div className="flex gap-2"><input type="color" value={lightColor} onChange={e => setLightColor(e.target.value)} className="w-11 h-9 rounded cursor-pointer border border-border" /><Input className="font-mono text-xs" value={lightColor} onChange={e => setLightColor(e.target.value)} /></div></div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            {dataUrl ? (
              <>
                <img src={dataUrl} alt="QR Code" className="rounded-lg border border-border shadow-sm" style={{ width: 200, height: 200 }} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={download}>Download PNG</Button>
                  <CopyBtn text={text} label="Copy text" />
                </div>
              </>
            ) : (
              <div className="w-[200px] h-[200px] bg-muted/50 rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground">Enter text above</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CSS Box Shadow Generator ──────────────────────────────────────────────────
export function CssBoxShadow() {
  const [x, setX] = useState(4);
  const [y, setY] = useState(8);
  const [blur, setBlur] = useState(16);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState("#00000040");
  const [inset, setInset] = useState(false);
  const [layers, setLayers] = useState<{ x:number; y:number; blur:number; spread:number; color:string; inset:boolean }[]>([]);

  const currentLayer = { x, y, blur, spread, color, inset };
  const allLayers = [...layers, currentLayer];
  const css = allLayers.map(l => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`).join(",\n  ");
  const fullCss = `box-shadow: ${css};`;

  const Slider = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs"><Label>{label}</Label><span className="font-mono text-muted-foreground">{value}px</span></div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full h-2" />
    </div>
  );

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CSS Box Shadow Generator</CardTitle><CardDescription>Build single or multi-layer CSS box shadows visually</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Slider label="Horizontal offset" value={x} min={-100} max={100} onChange={setX} />
            <Slider label="Vertical offset" value={y} min={-100} max={100} onChange={setY} />
            <Slider label="Blur radius" value={blur} min={0} max={100} onChange={setBlur} />
            <Slider label="Spread radius" value={spread} min={-50} max={50} onChange={setSpread} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Shadow color</Label><div className="flex gap-2"><input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-11 h-9 rounded cursor-pointer border border-border" /><Input className="font-mono text-xs" value={color} onChange={e => setColor(e.target.value)} /></div></div>
              <div className="space-y-1.5"><Label>Type</Label><div className="flex gap-1"><Button size="sm" variant={!inset ? "default" : "outline"} onClick={() => setInset(false)}>Outer</Button><Button size="sm" variant={inset ? "default" : "outline"} onClick={() => setInset(true)}>Inset</Button></div></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setLayers(l => [...l, currentLayer])}>+ Add layer</Button>
              {layers.length > 0 && <Button size="sm" variant="outline" onClick={() => setLayers([])}>Clear layers</Button>}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-xl border border-border bg-white dark:bg-zinc-900 flex items-center justify-center min-h-[180px]">
              <div className="w-24 h-24 rounded-xl bg-primary/80" style={{ boxShadow: css }} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center"><Label>CSS</Label><CopyBtn text={fullCss} /></div>
              <pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto">{fullCss}</pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── WCAG Contrast Checker ────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}
function luminance([r, g, b]: [number, number, number]) {
  const [rs, gs, bs] = [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function contrast(fg: string, bg: string) {
  const c1 = hexToRgb(fg), c2 = hexToRgb(bg);
  if (!c1 || !c2) return null;
  const l1 = luminance(c1), l2 = luminance(c2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function WcagContrastChecker() {
  const [fg, setFg] = useState("#ffffff");
  const [bg, setBg] = useState("#1e40af");
  const ratio = contrast(fg, bg);
  const aaLarge = ratio !== null && ratio >= 3;
  const aaNormal = ratio !== null && ratio >= 4.5;
  const aaaLarge = ratio !== null && ratio >= 4.5;
  const aaaNormal = ratio !== null && ratio >= 7;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>WCAG Contrast Checker</CardTitle><CardDescription>Check foreground/background color contrast against WCAG 2.1 AA and AAA standards</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Foreground color</Label><div className="flex gap-2"><input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-11 h-9 rounded cursor-pointer border border-border" /><Input className="font-mono" value={fg} onChange={e => setFg(e.target.value)} /></div></div>
          <div className="space-y-1.5"><Label>Background color</Label><div className="flex gap-2"><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-11 h-9 rounded cursor-pointer border border-border" /><Input className="font-mono" value={bg} onChange={e => setBg(e.target.value)} /></div></div>
        </div>
        <div className="rounded-xl border border-border p-6 text-center" style={{ backgroundColor: bg, color: fg }}>
          <p className="text-2xl font-bold mb-1">Contrast Preview</p>
          <p className="text-sm opacity-90">The quick brown fox jumps over the lazy dog</p>
          <p className="text-xs mt-2 opacity-70">Small body text example at 14px</p>
        </div>
        {ratio !== null && (
          <>
            <div className="text-center">
              <div className={`text-4xl font-black font-mono ${ratio >= 4.5 ? "text-green-500" : ratio >= 3 ? "text-yellow-500" : "text-red-500"}`}>{ratio.toFixed(2)}:1</div>
              <div className="text-xs text-muted-foreground mt-1">Contrast ratio</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { level: "AA Normal text", req: 4.5, pass: aaNormal },
                { level: "AA Large text (≥18pt)", req: 3.0, pass: aaLarge },
                { level: "AAA Normal text", req: 7.0, pass: aaaNormal },
                { level: "AAA Large text (≥18pt)", req: 4.5, pass: aaaLarge },
              ].map(({ level, req, pass }) => (
                <div key={level} className={`rounded-lg p-3 border ${pass ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                  <div className="font-medium text-xs">{level}</div>
                  <div className={`font-bold mt-0.5 ${pass ? "text-green-500" : "text-red-500"}`}>{pass ? "✓ Pass" : "✗ Fail"}</div>
                  <div className="text-xs text-muted-foreground">Requires {req}:1</div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── PX to REM Converter ──────────────────────────────────────────────────────
export function PxToRem() {
  const [basePx, setBasePx] = useState(16);
  const [input, setInput] = useState("16");
  const [mode, setMode] = useState<"pxToRem"|"remToPx">("pxToRem");

  const result = useMemo(() => {
    const n = parseFloat(input);
    if (isNaN(n) || basePx <= 0) return "";
    return mode === "pxToRem" ? (n / basePx).toFixed(4).replace(/\.?0+$/, "") + "rem" : (n * basePx).toFixed(2).replace(/\.?0+$/, "") + "px";
  }, [input, basePx, mode]);

  const table = useMemo(() => {
    const common = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
    return common.map(px => ({ px, rem: +(px / basePx).toFixed(4) }));
  }, [basePx]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>PX to REM Converter</CardTitle><CardDescription>Convert pixel values to REM units (and back) with a configurable base font size</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="space-y-1.5"><Label>Base font size (px)</Label><Input type="number" className="font-mono w-28" value={basePx} onChange={e => setBasePx(parseFloat(e.target.value) || 16)} /></div>
          <div className="flex gap-1">
            <Button size="sm" variant={mode === "pxToRem" ? "default" : "outline"} onClick={() => setMode("pxToRem")}>px → rem</Button>
            <Button size="sm" variant={mode === "remToPx" ? "default" : "outline"} onClick={() => setMode("remToPx")}>rem → px</Button>
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5"><Label>Value ({mode === "pxToRem" ? "px" : "rem"})</Label><Input className="font-mono text-lg h-11" value={input} onChange={e => setInput(e.target.value)} /></div>
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between items-center"><Label>Result</Label><CopyBtn text={result} /></div>
            <div className="h-11 flex items-center px-3 bg-muted/50 rounded-lg border border-border font-mono text-lg text-primary">{result || "—"}</div>
          </div>
        </div>
        <div className="rounded-lg border border-border overflow-auto max-h-[280px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/90"><tr className="text-muted-foreground"><th className="text-left px-3 py-2">px</th><th className="text-left px-3 py-2">rem (base {basePx}px)</th><th className="px-2 py-2 w-8" /></tr></thead>
            <tbody className="divide-y divide-border/50">
              {table.map(row => (
                <tr key={row.px} className={parseFloat(input) === row.px && mode === "pxToRem" ? "bg-primary/5" : ""}>
                  <td className="px-3 py-1.5 font-mono">{row.px}</td>
                  <td className="px-3 py-1.5 font-mono text-primary">{row.rem}</td>
                  <td className="px-2 py-1.5"><button className="text-muted-foreground hover:text-foreground" onClick={() => navigator.clipboard.writeText(row.rem.toString())}><Copy className="h-3 w-3" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── HTML Table Generator ─────────────────────────────────────────────────────
export function HtmlTableGenerator() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  const [bordered, setBordered] = useState(true);
  const [data, setData] = useState<string[][]>(() =>
    Array.from({ length: 5 }, (_, r) => Array.from({ length: 4 }, (_, c) => r === 0 ? `Header ${c+1}` : `Cell ${r},${c+1}`))
  );

  const updateCell = (r: number, c: number, v: string) => {
    setData(d => { const n = d.map(row => [...row]); n[r] = n[r] || []; n[r][c] = v; return n; });
  };

  const html = useMemo(() => {
    const styleAttr = bordered ? ' style="border-collapse:collapse;width:100%"' : ' style="width:100%"';
    const cellStyle = bordered ? ' style="border:1px solid #ccc;padding:8px"' : ' style="padding:8px"';
    let out = `<table${styleAttr}>\n`;
    for (let r = 0; r < rows; r++) {
      if (r === 0 && hasHeader) out += "  <thead>\n    <tr>\n";
      else if (r === 1 && hasHeader) out += "  </thead>\n  <tbody>\n    <tr>\n";
      else if (r === 0 && !hasHeader) out += "  <tbody>\n    <tr>\n";
      else out += "    <tr>\n";
      for (let c = 0; c < cols; c++) {
        const tag = r === 0 && hasHeader ? "th" : "td";
        out += `      <${tag}${cellStyle}>${(data[r]?.[c] ?? `${r===0&&hasHeader?"H":"C"}${r+1}${c+1}`)}</${tag}>\n`;
      }
      out += "    </tr>\n";
    }
    if (hasHeader && rows > 1) out += "  </tbody>\n";
    return out + "</table>";
  }, [rows, cols, hasHeader, bordered, data]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>HTML Table Generator</CardTitle><CardDescription>Build and preview HTML tables visually with editable cells</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 flex-wrap items-end">
          <div className="space-y-1.5"><Label>Rows</Label><Input type="number" min={1} max={20} className="w-20 font-mono" value={rows} onChange={e => setRows(parseInt(e.target.value) || 1)} /></div>
          <div className="space-y-1.5"><Label>Columns</Label><Input type="number" min={1} max={10} className="w-20 font-mono" value={cols} onChange={e => setCols(parseInt(e.target.value) || 1)} /></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer pb-0.5"><input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} className="w-4 h-4" />Header row</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer pb-0.5"><input type="checkbox" checked={bordered} onChange={e => setBordered(e.target.checked)} className="w-4 h-4" />Bordered</label>
        </div>
        <div className="overflow-auto rounded-lg border border-border">
          <table className={bordered ? "border-collapse w-full text-sm" : "w-full text-sm"}>
            <tbody>
              {Array.from({ length: rows }, (_, r) => (
                <tr key={r} className={r === 0 && hasHeader ? "bg-muted/60" : ""}>
                  {Array.from({ length: cols }, (_, c) => (
                    <td key={c} className={bordered ? "border border-border p-0" : "p-0"}>
                      <Input value={data[r]?.[c] ?? ""} onChange={e => updateCell(r, c, e.target.value)} className="border-0 rounded-none h-8 text-xs font-mono bg-transparent focus-visible:ring-inset" placeholder={r===0&&hasHeader?"Header":"Cell"} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Generated HTML</Label><CopyBtn text={html} /></div>
          <pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto max-h-[220px]">{html}</pre>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Open Graph Tag Generator ─────────────────────────────────────────────────
export function OpenGraphGenerator() {
  const [title, setTitle] = useState("My Amazing Page");
  const [desc, setDesc] = useState("A compelling description of my page for social sharing.");
  const [url, setUrl] = useState("https://example.com/my-page");
  const [image, setImage] = useState("https://example.com/og-image.png");
  const [type, setType] = useState("website");
  const [siteName, setSiteName] = useState("My Site");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");

  const tags = [
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${siteName}" />`,
    ``,
    `<meta name="twitter:card" content="${twitterCard}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join("\n");

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>Open Graph Tag Generator</CardTitle><CardDescription>Generate Open Graph and Twitter Card meta tags for social sharing</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Title</Label><Input className="font-mono text-xs" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Site name</Label><Input className="font-mono text-xs" value={siteName} onChange={e => setSiteName(e.target.value)} /></div>
          <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea className="font-mono text-xs min-h-[60px]" value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>URL</Label><Input className="font-mono text-xs" value={url} onChange={e => setUrl(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Image URL</Label><Input className="font-mono text-xs" value={image} onChange={e => setImage(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>OG type</Label>
            <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              {["website","article","product","video.movie","music.song","profile"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5">
            <Label>Twitter card</Label>
            <Select value={twitterCard} onValueChange={setTwitterCard}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="summary">summary</SelectItem>
              <SelectItem value="summary_large_image">summary_large_image</SelectItem>
              <SelectItem value="app">app</SelectItem>
              <SelectItem value="player">player</SelectItem>
            </SelectContent></Select>
          </div>
        </div>
        <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-2">
          <div className="rounded-lg bg-background border border-border overflow-hidden w-64">
            {image && <div className="h-28 bg-muted/50 flex items-center justify-center text-xs text-muted-foreground overflow-hidden"><img src={image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} /></div>}
            <div className="p-3"><div className="text-xs font-bold line-clamp-2">{title}</div><div className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</div><div className="text-xs text-muted-foreground mt-1 truncate">{url}</div></div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center"><Label>Meta tags</Label><CopyBtn text={tags} /></div>
          <pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto">{tags}</pre>
        </div>
      </CardContent>
    </Card>
  );
}
