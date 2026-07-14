import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCheck } from "lucide-react";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); }} disabled={!text}>
      {ok ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : "Copy"}
    </Button>
  );
}
function Slider({ label, value, min, max, step = 1, unit = "px", onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (n: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs"><Label>{label}</Label><span className="font-mono text-muted-foreground">{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-2 cursor-pointer" />
    </div>
  );
}
function CssOut({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center"><Label>{label}</Label><CopyBtn text={value} /></div>
      <pre className="p-3 bg-muted/50 rounded-lg font-mono text-xs border border-border overflow-auto whitespace-pre-wrap">{value}</pre>
    </div>
  );
}

// ─── CSS Border Radius Generator ──────────────────────────────────────────────
export function CssBorderRadius() {
  const [tl, setTl] = useState(12); const [tr, setTr] = useState(12);
  const [bl, setBl] = useState(12); const [br, setBr] = useState(12);
  const [linked, setLinked] = useState(true);

  const set = (v: number) => { if (linked) { setTl(v); setTr(v); setBl(v); setBr(v); } };
  const css = tl === tr && tr === bl && bl === br ? `border-radius: ${tl}px;` : `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  const tailwind = tl === tr && tr === bl && bl === br ? `rounded-[${tl}px]` : `rounded-tl-[${tl}px] rounded-tr-[${tr}px] rounded-br-[${br}px] rounded-bl-[${bl}px]`;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>CSS Border Radius Generator</CardTitle><CardDescription>Generate CSS border-radius for individual or linked corners</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={linked} onChange={e => setLinked(e.target.checked)} className="w-4 h-4" />Link all corners</label>
        {linked ? (
          <Slider label="All corners" value={tl} min={0} max={200} onChange={v => { setTl(v); setTr(v); setBl(v); setBr(v); }} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Slider label="Top-left" value={tl} min={0} max={200} onChange={setTl} />
            <Slider label="Top-right" value={tr} min={0} max={200} onChange={setTr} />
            <Slider label="Bottom-left" value={bl} min={0} max={200} onChange={setBl} />
            <Slider label="Bottom-right" value={br} min={0} max={200} onChange={setBr} />
          </div>
        )}
        <div className="flex justify-center py-4">
          <div className="w-36 h-36 bg-primary/80 transition-all duration-200" style={{ borderRadius: `${tl}px ${tr}px ${br}px ${bl}px` }} />
        </div>
        <CssOut label="CSS" value={css} />
        <CssOut label="Tailwind CSS" value={tailwind} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Text Shadow Generator ────────────────────────────────────────────────
export function CssTextShadow() {
  const [x, setX] = useState(2); const [y, setY] = useState(2);
  const [blur, setBlur] = useState(4); const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(40);

  const hex = color + Math.round(opacity * 2.55).toString(16).padStart(2, "0");
  const css = `text-shadow: ${x}px ${y}px ${blur}px ${hex};`;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>CSS Text Shadow Generator</CardTitle><CardDescription>Generate CSS text-shadow code visually</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 bg-muted/30 rounded-xl border border-border text-center min-h-[80px] flex items-center justify-center">
          <span className="text-4xl font-black text-primary transition-all" style={{ textShadow: `${x}px ${y}px ${blur}px ${hex}` }}>ToolzCraft</span>
        </div>
        <Slider label="Horizontal offset" value={x} min={-30} max={30} onChange={setX} />
        <Slider label="Vertical offset" value={y} min={-30} max={30} onChange={setY} />
        <Slider label="Blur radius" value={blur} min={0} max={50} onChange={setBlur} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Shadow color</Label><div className="flex gap-2"><input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-11 h-9 rounded cursor-pointer border border-border" /><Input className="font-mono text-xs" value={color} onChange={e => setColor(e.target.value)} /></div></div>
          <Slider label="Opacity" value={opacity} min={0} max={100} unit="%" onChange={setOpacity} />
        </div>
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Glassmorphism Generator ──────────────────────────────────────────────
export function CssGlassmorphism() {
  const [blur, setBlur] = useState(16); const [opacity, setOpacity] = useState(20);
  const [saturation, setSaturation] = useState(180); const [borderOpacity, setBorderOpacity] = useState(30);
  const [borderRadius, setBorderRadius] = useState(16); const [bgColor, setBgColor] = useState("#ffffff");

  const css = `.glass {
  background: ${bgColor}${Math.round(opacity * 2.55).toString(16).padStart(2, "0")};
  backdrop-filter: blur(${blur}px) saturate(${saturation}%);
  -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
  border-radius: ${borderRadius}px;
  border: 1px solid ${bgColor}${Math.round(borderOpacity * 2.55).toString(16).padStart(2, "0")};
}`;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>CSS Glassmorphism Generator</CardTitle><CardDescription>Generate frosted-glass CSS effects with backdrop-filter</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl p-6 overflow-hidden relative" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f64f59 100%)", minHeight: 160 }}>
          <div className="rounded-xl p-5 text-white relative z-10 shadow-lg" style={{
            background: `${bgColor}${Math.round(opacity * 2.55).toString(16).padStart(2, "0")}`,
            backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
            WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
            borderRadius: `${borderRadius}px`,
            border: `1px solid ${bgColor}${Math.round(borderOpacity * 2.55).toString(16).padStart(2, "0")}`,
          }}>
            <p className="font-bold text-lg">Glassmorphism Card</p>
            <p className="text-sm opacity-80 mt-1">Frosted glass effect preview</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Slider label="Blur intensity" value={blur} min={0} max={40} onChange={setBlur} />
          <Slider label="Background opacity" value={opacity} min={0} max={100} unit="%" onChange={setOpacity} />
          <Slider label="Saturation" value={saturation} min={100} max={300} unit="%" onChange={setSaturation} />
          <Slider label="Border opacity" value={borderOpacity} min={0} max={100} unit="%" onChange={setBorderOpacity} />
          <Slider label="Border radius" value={borderRadius} min={0} max={50} onChange={setBorderRadius} />
          <div className="space-y-1.5"><Label>Background tint</Label><div className="flex gap-2"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-11 h-9 rounded cursor-pointer border border-border" /><Input className="font-mono text-xs" value={bgColor} onChange={e => setBgColor(e.target.value)} /></div></div>
        </div>
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Transform Generator ──────────────────────────────────────────────────
export function CssTransform() {
  const [translateX, setTx] = useState(0); const [translateY, setTy] = useState(0);
  const [rotate, setRot] = useState(0); const [scaleX, setScX] = useState(1); const [scaleY, setScY] = useState(1);
  const [skewX, setSkX] = useState(0); const [skewY, setSkY] = useState(0);

  const parts = [
    translateX !== 0 || translateY !== 0 ? `translate(${translateX}px, ${translateY}px)` : "",
    rotate !== 0 ? `rotate(${rotate}deg)` : "",
    scaleX !== 1 || scaleY !== 1 ? `scale(${scaleX}, ${scaleY})` : "",
    skewX !== 0 || skewY !== 0 ? `skew(${skewX}deg, ${skewY}deg)` : "",
  ].filter(Boolean);
  const transform = parts.length ? parts.join(" ") : "none";
  const css = `transform: ${transform};`;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>CSS Transform Generator</CardTitle><CardDescription>Build CSS transform functions visually with real-time preview</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-muted/30 border border-border flex items-center justify-center" style={{ height: 160 }}>
          <div className="w-24 h-24 bg-primary/80 rounded-xl transition-all duration-200 flex items-center justify-center text-xs text-white font-bold" style={{ transform }}>{transform === "none" ? "No transform" : "Preview"}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Slider label="Translate X" value={translateX} min={-200} max={200} onChange={setTx} />
          <Slider label="Translate Y" value={translateY} min={-200} max={200} onChange={setTy} />
          <Slider label="Rotate" value={rotate} min={-360} max={360} unit="°" onChange={setRot} />
          <Slider label="Scale X" value={scaleX} min={0.1} max={3} step={0.05} unit="×" onChange={setScX} />
          <Slider label="Scale Y" value={scaleY} min={0.1} max={3} step={0.05} unit="×" onChange={setScY} />
          <Slider label="Skew X" value={skewX} min={-60} max={60} unit="°" onChange={setSkX} />
          <Slider label="Skew Y" value={skewY} min={-60} max={60} unit="°" onChange={setSkY} />
        </div>
        <Button variant="outline" size="sm" onClick={() => { setTx(0); setTy(0); setRot(0); setScX(1); setScY(1); setSkX(0); setSkY(0); }}>Reset</Button>
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Flexbox Builder ──────────────────────────────────────────────────────
export function CssFlexbox() {
  const [direction, setDirection] = useState("row");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [wrap, setWrap] = useState("nowrap");
  const [gap, setGap] = useState(8);
  const [items, setItems] = useState(4);

  const css = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CSS Flexbox Builder</CardTitle><CardDescription>Build CSS flexbox layouts visually and copy the generated code</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "flex-direction", value: direction, opts: ["row","row-reverse","column","column-reverse"], set: setDirection },
            { label: "justify-content", value: justifyContent, opts: ["flex-start","flex-end","center","space-between","space-around","space-evenly"], set: setJustifyContent },
            { label: "align-items", value: alignItems, opts: ["stretch","flex-start","flex-end","center","baseline"], set: setAlignItems },
            { label: "flex-wrap", value: wrap, opts: ["nowrap","wrap","wrap-reverse"], set: setWrap },
          ].map(({ label, value, opts, set }) => (
            <div key={label} className="space-y-1.5">
              <Label className="text-xs">{label}</Label>
              <Select value={value} onValueChange={set}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{opts.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Slider label="Gap" value={gap} min={0} max={40} onChange={setGap} />
          <div className="space-y-1.5"><Label className="text-xs">Number of items</Label><Input type="number" min={1} max={10} className="h-8 font-mono text-sm" value={items} onChange={e => setItems(parseInt(e.target.value) || 1)} /></div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border p-3 bg-muted/20 overflow-auto" style={{ minHeight: 120 }}>
          <div style={{ display: "flex", flexDirection: direction as any, justifyContent, alignItems, flexWrap: wrap as any, gap }}>
            {Array.from({ length: items }, (_, i) => (
              <div key={i} className="rounded-lg bg-primary/70 text-white text-xs font-bold flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52 }}>{i + 1}</div>
            ))}
          </div>
        </div>
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Grid Builder ─────────────────────────────────────────────────────────
export function CssGrid() {
  const [cols, setCols] = useState("repeat(3, 1fr)");
  const [rows, setRows] = useState("auto");
  const [gap, setGap] = useState(8);
  const [colGap, setColGap] = useState(8);
  const [rowGap, setRowGap] = useState(8);
  const [useGap, setUseGap] = useState(true);
  const [items, setItems] = useState(6);

  const css = `.grid-container {
  display: grid;
  grid-template-columns: ${cols};
  grid-template-rows: ${rows};
  ${useGap ? `gap: ${gap}px;` : `column-gap: ${colGap}px;\n  row-gap: ${rowGap}px;`}
}`;

  const presets = [
    { label: "2 cols", cols: "repeat(2, 1fr)", rows: "auto" },
    { label: "3 cols", cols: "repeat(3, 1fr)", rows: "auto" },
    { label: "4 cols", cols: "repeat(4, 1fr)", rows: "auto" },
    { label: "Holy grail", cols: "200px 1fr 200px", rows: "auto 1fr auto" },
    { label: "12-col grid", cols: "repeat(12, 1fr)", rows: "auto" },
    { label: "Masonry-like", cols: "repeat(auto-fill, minmax(150px, 1fr))", rows: "auto" },
  ];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CSS Grid Layout Builder</CardTitle><CardDescription>Build CSS grid layouts with presets and live preview</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => <Button key={p.label} size="sm" variant="outline" className="text-xs h-7" onClick={() => { setCols(p.cols); setRows(p.rows); }}>{p.label}</Button>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>grid-template-columns</Label><Input className="font-mono text-xs h-8" value={cols} onChange={e => setCols(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>grid-template-rows</Label><Input className="font-mono text-xs h-8" value={rows} onChange={e => setRows(e.target.value)} /></div>
        </div>
        <Slider label="Gap" value={gap} min={0} max={40} onChange={setGap} />
        <div className="space-y-1.5"><Label className="text-xs">Number of items</Label><Input type="number" min={1} max={24} className="h-8 font-mono text-sm w-24" value={items} onChange={e => setItems(parseInt(e.target.value) || 1)} /></div>
        <div className="rounded-xl border-2 border-dashed border-border p-3 bg-muted/20 overflow-auto" style={{ minHeight: 120 }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap }}>
            {Array.from({ length: items }, (_, i) => (
              <div key={i} className="rounded-lg bg-primary/70 text-white text-xs font-bold flex items-center justify-center h-12">{i + 1}</div>
            ))}
          </div>
        </div>
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Filter Generator ─────────────────────────────────────────────────────
export function CssFilter() {
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [invert, setInvert] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [sepia, setSepia] = useState(0);

  const filterStr = [
    blur > 0 ? `blur(${blur}px)` : "",
    brightness !== 100 ? `brightness(${brightness}%)` : "",
    contrast !== 100 ? `contrast(${contrast}%)` : "",
    grayscale > 0 ? `grayscale(${grayscale}%)` : "",
    hueRotate !== 0 ? `hue-rotate(${hueRotate}deg)` : "",
    invert > 0 ? `invert(${invert}%)` : "",
    opacity !== 100 ? `opacity(${opacity}%)` : "",
    saturate !== 100 ? `saturate(${saturate}%)` : "",
    sepia > 0 ? `sepia(${sepia}%)` : "",
  ].filter(Boolean).join(" ") || "none";

  const css = `filter: ${filterStr};`;

  const reset = () => { setBlur(0); setBrightness(100); setContrast(100); setGrayscale(0); setHueRotate(0); setInvert(0); setOpacity(100); setSaturate(100); setSepia(0); };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>CSS Filter Generator</CardTitle><CardDescription>Build CSS filter effects like blur, brightness, grayscale, and sepia</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl overflow-hidden border border-border h-40 flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <div className="w-full h-full flex items-center justify-center" style={{ filter: filterStr }}>
            <span className="text-white font-black text-3xl drop-shadow-lg">Preview</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Slider label="Blur" value={blur} min={0} max={20} onChange={setBlur} />
          <Slider label="Brightness" value={brightness} min={0} max={200} unit="%" onChange={setBrightness} />
          <Slider label="Contrast" value={contrast} min={0} max={200} unit="%" onChange={setContrast} />
          <Slider label="Grayscale" value={grayscale} min={0} max={100} unit="%" onChange={setGrayscale} />
          <Slider label="Hue Rotate" value={hueRotate} min={0} max={360} unit="°" onChange={setHueRotate} />
          <Slider label="Invert" value={invert} min={0} max={100} unit="%" onChange={setInvert} />
          <Slider label="Opacity" value={opacity} min={0} max={100} unit="%" onChange={setOpacity} />
          <Slider label="Saturate" value={saturate} min={0} max={300} unit="%" onChange={setSaturate} />
          <Slider label="Sepia" value={sepia} min={0} max={100} unit="%" onChange={setSepia} />
        </div>
        <Button variant="outline" size="sm" onClick={reset}>Reset all</Button>
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Clip Path Generator ──────────────────────────────────────────────────
export function CssClipPath() {
  const [shape, setShape] = useState("polygon");
  const [insetVals, setInset] = useState([10, 10, 10, 10]);
  const [circleRadius, setCircleRadius] = useState(50);
  const [ellipseRx, setEllipseRx] = useState(50); const [ellipseRy, setEllipseRy] = useState(30);
  const [polyPoints, setPolyPoints] = useState("50% 0%, 100% 100%, 0% 100%");

  const clipPath = shape === "inset" ? `inset(${insetVals.join("% ")}%)` :
    shape === "circle" ? `circle(${circleRadius}%)` :
    shape === "ellipse" ? `ellipse(${ellipseRx}% ${ellipseRy}% at 50% 50%)` :
    `polygon(${polyPoints})`;
  const css = `clip-path: ${clipPath};`;

  const presets = [
    { label: "Triangle", points: "50% 0%, 100% 100%, 0% 100%" },
    { label: "Arrow →", points: "0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%" },
    { label: "Hexagon", points: "25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%" },
    { label: "Star", points: "50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%" },
    { label: "Chevron", points: "0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%" },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>CSS Clip Path Generator</CardTitle><CardDescription>Generate CSS clip-path shapes with live preview</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {["polygon","circle","ellipse","inset"].map(s => <Button key={s} size="sm" variant={shape === s ? "default" : "outline"} onClick={() => setShape(s)} className="text-xs">{s}</Button>)}
        </div>
        <div className="rounded-xl bg-muted/30 border border-border flex items-center justify-center" style={{ height: 160 }}>
          <div className="w-36 h-36 bg-primary/80 transition-all duration-200" style={{ clipPath }} />
        </div>
        {shape === "polygon" && (
          <>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => <Button key={p.label} size="sm" variant="outline" className="text-xs h-7" onClick={() => setPolyPoints(p.points)}>{p.label}</Button>)}
            </div>
            <div className="space-y-1.5"><Label>Polygon points</Label><input className="w-full font-mono text-xs border border-border rounded-lg p-2 bg-background" value={polyPoints} onChange={e => setPolyPoints(e.target.value)} /></div>
          </>
        )}
        {shape === "circle" && <Slider label="Radius" value={circleRadius} min={0} max={100} unit="%" onChange={setCircleRadius} />}
        {shape === "ellipse" && (<><Slider label="Radius X" value={ellipseRx} min={0} max={100} unit="%" onChange={setEllipseRx} /><Slider label="Radius Y" value={ellipseRy} min={0} max={100} unit="%" onChange={setEllipseRy} /></>)}
        {shape === "inset" && (
          <div className="grid grid-cols-2 gap-3">
            {["Top","Right","Bottom","Left"].map((l, i) => <Slider key={l} label={l} value={insetVals[i]} min={0} max={50} unit="%" onChange={v => setInset(s => s.map((x, j) => j === i ? v : x))} />)}
          </div>
        )}
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}

// ─── CSS Animation Builder ────────────────────────────────────────────────────
export function CssAnimationBuilder() {
  const [name, setName] = useState("fadeIn");
  const [duration, setDuration] = useState(1); const [delay, setDelay] = useState(0);
  const [timing, setTiming] = useState("ease"); const [iteration, setIteration] = useState("1");
  const [direction, setDirection] = useState("normal"); const [fillMode, setFillMode] = useState("none");
  const [keyframes, setKeyframes] = useState("from {\n  opacity: 0;\n  transform: translateY(-20px);\n}\nto {\n  opacity: 1;\n  transform: translateY(0);\n}");

  const [playing, setPlaying] = useState(false);
  const [key, setKey] = useState(0);

  const css = `@keyframes ${name} {\n  ${keyframes}\n}\n\n.animated {\n  animation: ${name} ${duration}s ${timing} ${delay}s ${iteration} ${direction} ${fillMode};\n}`;

  const play = () => { setPlaying(false); setTimeout(() => { setKey(k => k + 1); setPlaying(true); }, 50); };

  const presets = [
    { name: "fadeIn", kf: "from {\n  opacity: 0;\n  transform: translateY(-20px);\n}\nto {\n  opacity: 1;\n  transform: translateY(0);\n}" },
    { name: "bounce", kf: "0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8,0,1,1); }\n50% { transform: translateY(-30px); animation-timing-function: cubic-bezier(0,0,0.2,1); }" },
    { name: "spin", kf: "from { transform: rotate(0deg); }\nto { transform: rotate(360deg); }" },
    { name: "pulse", kf: "0%, 100% { opacity: 1; }\n50% { opacity: 0.5; }" },
    { name: "shake", kf: "0%, 100% { transform: translateX(0); }\n20%, 60% { transform: translateX(-8px); }\n40%, 80% { transform: translateX(8px); }" },
  ];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader><CardTitle>CSS Animation Builder</CardTitle><CardDescription>Build CSS @keyframes animations with live preview and presets</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {presets.map(p => <Button key={p.name} size="sm" variant="outline" className="text-xs h-7" onClick={() => { setName(p.name); setKeyframes(p.kf); }}>{p.name}</Button>)}
        </div>
        <div className="rounded-xl bg-muted/30 border border-border flex items-center justify-center" style={{ height: 120 }}>
          <style>{`@keyframes preview-${key}-${name} { ${keyframes} }`}</style>
          <div key={key} className="w-16 h-16 bg-primary/80 rounded-xl flex items-center justify-center text-white text-xs font-bold"
            style={playing ? { animation: `preview-${key}-${name} ${duration}s ${timing} ${delay}s ${iteration === "infinite" ? "infinite" : parseInt(iteration)} ${direction} ${fillMode} forwards` } : {}}>
            Box
          </div>
        </div>
        <Button size="sm" onClick={play}>▶ Play</Button>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Name</Label><Input className="font-mono text-xs h-8" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Duration (s)</Label><Input type="number" step={0.1} className="font-mono text-xs h-8" value={duration} onChange={e => setDuration(parseFloat(e.target.value) || 1)} /></div>
          <div className="space-y-1.5"><Label>Delay (s)</Label><Input type="number" step={0.1} className="font-mono text-xs h-8" value={delay} onChange={e => setDelay(parseFloat(e.target.value) || 0)} /></div>
          <div className="space-y-1.5"><Label>Timing</Label><Select value={timing} onValueChange={setTiming}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{["ease","linear","ease-in","ease-out","ease-in-out"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Iteration</Label><Select value={iteration} onValueChange={setIteration}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{["1","2","3","infinite"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Direction</Label><Select value={direction} onValueChange={setDirection}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{["normal","reverse","alternate","alternate-reverse"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="space-y-1.5"><Label>Keyframes body</Label><textarea className="w-full font-mono text-xs border border-border rounded-lg p-2 bg-muted/30 min-h-[100px] resize-y" value={keyframes} onChange={e => setKeyframes(e.target.value)} /></div>
        <CssOut label="CSS" value={css} />
      </CardContent>
    </Card>
  );
}
