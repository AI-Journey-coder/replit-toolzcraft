import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── CSS Scrollbar Generator ──────────────────────────────────────────────────
export function CssScrollbarGenerator() {
  const [width, setWidth] = useState(8);
  const [thumbColor, setThumbColor] = useState("#6366f1");
  const [trackColor, setTrackColor] = useState("#1e1e2e");
  const [radius, setRadius] = useState(4);
  const [hover, setHover] = useState("#818cf8");

  const css = `::-webkit-scrollbar {
  width: ${width}px;
  height: ${width}px;
}
::-webkit-scrollbar-track {
  background: ${trackColor};
  border-radius: ${radius}px;
}
::-webkit-scrollbar-thumb {
  background: ${thumbColor};
  border-radius: ${radius}px;
}
::-webkit-scrollbar-thumb:hover {
  background: ${hover};
}
* {
  scrollbar-width: thin;
  scrollbar-color: ${thumbColor} ${trackColor};
}`;

  return (
    <Card>
      <CardHeader><CardTitle>CSS Scrollbar Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Width: {width}px</Label>
            <Slider min={4} max={24} value={[width]} onValueChange={([v]) => setWidth(v)} />
          </div>
          <div>
            <Label>Border Radius: {radius}px</Label>
            <Slider min={0} max={20} value={[radius]} onValueChange={([v]) => setRadius(v)} />
          </div>
          <div className="flex items-center gap-2">
            <Label>Thumb Color</Label>
            <input type="color" value={thumbColor} onChange={e => setThumbColor(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Label>Track Color</Label>
            <input type="color" value={trackColor} onChange={e => setTrackColor(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Label>Hover Color</Label>
            <input type="color" value={hover} onChange={e => setHover(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
        </div>
        <div className="h-32 overflow-y-auto border rounded p-2 text-sm" style={{ scrollbarWidth: "thin", scrollbarColor: `${thumbColor} ${trackColor}` }}>
          {Array.from({ length: 20 }, (_, i) => <div key={i}>Scroll content line {i + 1}</div>)}
        </div>
        <div className="relative">
          <pre className="bg-muted rounded p-3 text-xs overflow-auto">{css}</pre>
          <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(css)}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CSS Triangle Generator ───────────────────────────────────────────────────
export function CssTriangleGenerator() {
  const [direction, setDirection] = useState("up");
  const [size, setSize] = useState(40);
  const [color, setColor] = useState("#6366f1");

  const dirs: Record<string, { border: string; display: string }> = {
    up:    { border: `0 ${size}px ${size}px`, display: "▲ Up" },
    down:  { border: `${size}px ${size}px 0`, display: "▼ Down" },
    left:  { border: `${size}px ${size}px ${size}px 0`, display: "◀ Left" },
    right: { border: `${size}px 0 ${size}px ${size}px`, display: "▶ Right" },
  };

  const borderMap: Record<string, string> = {
    up: `border-left: ${size}px solid transparent; border-right: ${size}px solid transparent; border-bottom: ${size}px solid ${color};`,
    down: `border-left: ${size}px solid transparent; border-right: ${size}px solid transparent; border-top: ${size}px solid ${color};`,
    left: `border-top: ${size}px solid transparent; border-bottom: ${size}px solid transparent; border-right: ${size}px solid ${color};`,
    right: `border-top: ${size}px solid transparent; border-bottom: ${size}px solid transparent; border-left: ${size}px solid ${color};`,
  };

  const css = `.triangle {
  width: 0;
  height: 0;
  ${borderMap[direction]}
}`;

  const previewStyle: React.CSSProperties = { width: 0, height: 0, ...(
    direction === "up" ? { borderLeft: `${size}px solid transparent`, borderRight: `${size}px solid transparent`, borderBottom: `${size}px solid ${color}` } :
    direction === "down" ? { borderLeft: `${size}px solid transparent`, borderRight: `${size}px solid transparent`, borderTop: `${size}px solid ${color}` } :
    direction === "left" ? { borderTop: `${size}px solid transparent`, borderBottom: `${size}px solid transparent`, borderRight: `${size}px solid ${color}` } :
    { borderTop: `${size}px solid transparent`, borderBottom: `${size}px solid transparent`, borderLeft: `${size}px solid ${color}` }
  )};

  return (
    <Card>
      <CardHeader><CardTitle>CSS Triangle Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Direction</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(dirs).map(([k, v]) => <SelectItem key={k} value={k}>{v.display}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label>Color</Label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div>
            <Label>Size: {size}px</Label>
            <Slider min={10} max={100} value={[size]} onValueChange={([v]) => setSize(v)} />
          </div>
        </div>
        <div className="flex justify-center items-center h-32 bg-muted rounded">
          <div style={previewStyle} />
        </div>
        <div className="relative">
          <pre className="bg-muted rounded p-3 text-xs">{css}</pre>
          <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(css)}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Color Converter ──────────────────────────────────────────────────────────
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
function rgbToCmyk(r: number, g: number, b: number) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const k = 1 - Math.max(r1, g1, b1);
  const c = (1 - r1 - k) / (1 - k);
  const m = (1 - g1 - k) / (1 - k);
  const y = (1 - b1 - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}
function parseHexInput(s: string) {
  s = s.trim().replace(/^#/, "");
  if (s.length === 3) s = s.split("").map(c => c + c).join("");
  if (s.length === 6 && /^[0-9a-fA-F]{6}$/.test(s)) return "#" + s;
  return null;
}

export function ColorConverter() {
  const [hex, setHex] = useState("#6366f1");
  const [hexInput, setHexInput] = useState("#6366f1");
  const [rgbInput, setRgbInput] = useState("");
  const [hslInput, setHslInput] = useState("");

  const handleHexChange = (v: string) => {
    setHexInput(v);
    const parsed = parseHexInput(v);
    if (parsed) setHex(parsed);
  };
  const handlePickerChange = (v: string) => { setHex(v); setHexInput(v); };
  const handleRgbApply = () => {
    const m = rgbInput.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (m) {
      const r = +m[1], g = +m[2], b = +m[3];
      if (r <= 255 && g <= 255 && b <= 255) {
        const h = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
        setHex(h); setHexInput(h);
      }
    }
  };
  const handleHslApply = () => {
    const m = hslInput.match(/(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/);
    if (m) {
      const h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100;
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
      const g = Math.round(hue2rgb(p, q, h) * 255);
      const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
      const hex2 = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
      setHex(hex2); setHexInput(hex2);
    }
  };

  const { r, g, b } = hexToRgb(hex);
  const { h: hh, s, l } = rgbToHsl(r, g, b);
  const { c, m, y, k } = rgbToCmyk(r, g, b);

  return (
    <Card>
      <CardHeader><CardTitle>Color Converter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input type="color" value={hex} onChange={e => handlePickerChange(e.target.value)} className="h-16 w-16 cursor-pointer rounded border" />
          <div className="flex-1">
            <Label>HEX</Label>
            <div className="flex gap-2">
              <Input value={hexInput} onChange={e => handleHexChange(e.target.value)} placeholder="#rrggbb" />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(hex)}>Copy</Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded space-y-1">
            <div className="font-semibold text-sm">RGB</div>
            <div className="text-sm font-mono">{`rgb(${r}, ${g}, ${b})`}</div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => copyToClipboard(`rgb(${r}, ${g}, ${b})`)}>Copy</Button>
          </div>
          <div className="p-3 bg-muted rounded space-y-1">
            <div className="font-semibold text-sm">HSL</div>
            <div className="text-sm font-mono">{`hsl(${hh}, ${s}%, ${l}%)`}</div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => copyToClipboard(`hsl(${hh}, ${s}%, ${l}%)`)}>Copy</Button>
          </div>
          <div className="p-3 bg-muted rounded space-y-1">
            <div className="font-semibold text-sm">CMYK</div>
            <div className="text-sm font-mono">{`cmyk(${c}%, ${m}%, ${y}%, ${k}%)`}</div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => copyToClipboard(`cmyk(${c}%, ${m}%, ${y}%, ${k}%)`)}>Copy</Button>
          </div>
          <div className="p-3 bg-muted rounded space-y-1">
            <div className="font-semibold text-sm">CSS Variables</div>
            <div className="text-xs font-mono">{`--color: ${hex};`}</div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => copyToClipboard(`--color: ${hex};`)}>Copy</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Convert from RGB</Label>
            <div className="flex gap-2">
              <Input placeholder="255, 128, 0" value={rgbInput} onChange={e => setRgbInput(e.target.value)} />
              <Button size="sm" onClick={handleRgbApply}>Apply</Button>
            </div>
          </div>
          <div>
            <Label>Convert from HSL</Label>
            <div className="flex gap-2">
              <Input placeholder="270, 80%, 60%" value={hslInput} onChange={e => setHslInput(e.target.value)} />
              <Button size="sm" onClick={handleHslApply}>Apply</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Color Math ───────────────────────────────────────────────────────────────
export function ColorMath() {
  const [color1, setColor1] = useState("#6366f1");
  const [color2, setColor2] = useState("#ec4899");
  const [amount, setAmount] = useState(50);

  function hexToArr(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    return [r, g, b];
  }
  function arrToHex(arr: number[]) {
    return "#" + arr.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
  }
  const mix = arrToHex(hexToArr(color1).map((v, i) => v + (hexToArr(color2)[i] - v) * (amount / 100)));
  const lighten = (hex: string) => { const { r, g, b } = hexToRgb(hex); const f = amount / 100; return arrToHex([r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f]); };
  const darken = (hex: string) => { const { r, g, b } = hexToRgb(hex); const f = 1 - amount / 100; return arrToHex([r * f, g * f, b * f]); };
  const complement = (hex: string) => arrToHex(hexToArr(hex).map(v => 255 - v));

  const results = [
    { label: `Mix ${100 - amount}/${amount}`, value: mix },
    { label: `Lighten ${amount}%`, value: lighten(color1) },
    { label: `Darken ${amount}%`, value: darken(color1) },
    { label: "Complement", value: complement(color1) },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Color Math</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div>
            <Label>Color 1</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="h-10 w-16 cursor-pointer rounded" />
              <span className="font-mono text-sm">{color1}</span>
            </div>
          </div>
          <div>
            <Label>Color 2 (for mix)</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="h-10 w-16 cursor-pointer rounded" />
              <span className="font-mono text-sm">{color2}</span>
            </div>
          </div>
        </div>
        <div>
          <Label>Amount: {amount}%</Label>
          <Slider min={0} max={100} value={[amount]} onValueChange={([v]) => setAmount(v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {results.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3 p-2 rounded border">
              <div className="w-10 h-10 rounded" style={{ background: value }} />
              <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-mono text-sm">{value}</div>
              </div>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => copyToClipboard(value)}>Copy</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Color Blindness Simulator ────────────────────────────────────────────────
export function ColorBlindnessSimulator() {
  const [color, setColor] = useState("#6366f1");

  function simulate(hex: string, type: string) {
    const { r, g, b } = hexToRgb(hex);
    const r1 = r / 255, g1 = g / 255, b1 = b / 255;
    let nr = r1, ng = g1, nb = b1;
    if (type === "deuteranopia") { nr = 0.625 * r1 + 0.375 * g1; ng = 0.7 * r1 + 0.3 * g1; nb = 0.3 * g1 + 0.7 * b1; }
    if (type === "protanopia") { nr = 0.567 * r1 + 0.433 * g1; ng = 0.558 * r1 + 0.442 * g1; nb = 0.242 * g1 + 0.758 * b1; }
    if (type === "tritanopia") { nr = 0.95 * r1 + 0.05 * b1; ng = g1; nb = 0.433 * g1 + 0.567 * b1; }
    if (type === "achromatopsia") { const v = 0.299 * r1 + 0.587 * g1 + 0.114 * b1; nr = ng = nb = v; }
    return "#" + [nr, ng, nb].map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
  }

  const types = [
    { key: "normal", label: "Normal Vision" },
    { key: "deuteranopia", label: "Deuteranopia (red-green)" },
    { key: "protanopia", label: "Protanopia (red-green)" },
    { key: "tritanopia", label: "Tritanopia (blue-yellow)" },
    { key: "achromatopsia", label: "Achromatopsia (full)" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Color Blindness Simulator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-12 w-20 cursor-pointer rounded border" />
          <div>
            <div className="font-medium">Selected: {color}</div>
            <div className="text-sm text-muted-foreground">See how this color appears with different vision types</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {types.map(({ key, label }) => {
            const sim = key === "normal" ? color : simulate(color, key);
            return (
              <div key={key} className="flex items-center gap-3 p-2 rounded border">
                <div className="w-12 h-12 rounded flex-shrink-0" style={{ background: sim }} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="font-mono text-xs text-muted-foreground">{sim}</div>
                </div>
                <div className="w-24 h-6 rounded" style={{ background: `linear-gradient(to right, white, ${sim}, black)` }} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Mesh Gradient Generator ──────────────────────────────────────────────────
export function MeshGradientGenerator() {
  const [colors, setColors] = useState(["#6366f1", "#ec4899", "#06b6d4", "#10b981"]);

  const gradient = `radial-gradient(at 0% 0%, ${colors[0]} 0px, transparent 50%),
radial-gradient(at 100% 0%, ${colors[1]} 0px, transparent 50%),
radial-gradient(at 100% 100%, ${colors[2]} 0px, transparent 50%),
radial-gradient(at 0% 100%, ${colors[3]} 0px, transparent 50%)`;

  const css = `background-color: ${colors[0]};
background-image: ${gradient};`;

  return (
    <Card>
      <CardHeader><CardTitle>Mesh Gradient Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((c, i) => (
            <div key={i} className="text-center">
              <input type="color" value={c} onChange={e => { const nc = [...colors]; nc[i] = e.target.value; setColors(nc); }} className="h-10 w-full cursor-pointer rounded" />
              <div className="text-xs text-muted-foreground mt-1">Point {i + 1}</div>
            </div>
          ))}
        </div>
        <div className="h-48 rounded-lg border" style={{ backgroundColor: colors[0], backgroundImage: gradient }} />
        <div className="relative">
          <pre className="bg-muted rounded p-3 text-xs overflow-auto">{css}</pre>
          <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(css)}>Copy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tailwind Color Picker ────────────────────────────────────────────────────
export function TailwindColorPicker() {
  const [selected, setSelected] = useState<string | null>(null);

  const palette: Record<string, Record<string, string>> = {
    slate:  { "50":"#f8fafc","100":"#f1f5f9","200":"#e2e8f0","300":"#cbd5e1","400":"#94a3b8","500":"#64748b","600":"#475569","700":"#334155","800":"#1e293b","900":"#0f172a" },
    gray:   { "50":"#f9fafb","100":"#f3f4f6","200":"#e5e7eb","300":"#d1d5db","400":"#9ca3af","500":"#6b7280","600":"#4b5563","700":"#374151","800":"#1f2937","900":"#111827" },
    red:    { "50":"#fef2f2","100":"#fee2e2","200":"#fecaca","300":"#fca5a5","400":"#f87171","500":"#ef4444","600":"#dc2626","700":"#b91c1c","800":"#991b1b","900":"#7f1d1d" },
    orange: { "50":"#fff7ed","100":"#ffedd5","200":"#fed7aa","300":"#fdba74","400":"#fb923c","500":"#f97316","600":"#ea580c","700":"#c2410c","800":"#9a3412","900":"#7c2d12" },
    yellow: { "50":"#fefce8","100":"#fef9c3","200":"#fef08a","300":"#fde047","400":"#facc15","500":"#eab308","600":"#ca8a04","700":"#a16207","800":"#854d0e","900":"#713f12" },
    green:  { "50":"#f0fdf4","100":"#dcfce7","200":"#bbf7d0","300":"#86efac","400":"#4ade80","500":"#22c55e","600":"#16a34a","700":"#15803d","800":"#166534","900":"#14532d" },
    blue:   { "50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a" },
    violet: { "50":"#f5f3ff","100":"#ede9fe","200":"#ddd6fe","300":"#c4b5fd","400":"#a78bfa","500":"#8b5cf6","600":"#7c3aed","700":"#6d28d9","800":"#5b21b6","900":"#4c1d95" },
    pink:   { "50":"#fdf2f8","100":"#fce7f3","200":"#fbcfe8","300":"#f9a8d4","400":"#f472b6","500":"#ec4899","600":"#db2777","700":"#be185d","800":"#9d174d","900":"#831843" },
    cyan:   { "50":"#ecfeff","100":"#cffafe","200":"#a5f3fc","300":"#67e8f9","400":"#22d3ee","500":"#06b6d4","600":"#0891b2","700":"#0e7490","800":"#155e75","900":"#164e63" },
  };

  return (
    <Card>
      <CardHeader><CardTitle>Tailwind Color Picker</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {selected && (
          <div className="flex items-center gap-3 p-3 rounded border bg-muted">
            <div className="w-10 h-10 rounded" style={{ background: selected }} />
            <div>
              <div className="font-mono font-medium">{selected}</div>
            </div>
            <Button size="sm" className="ml-auto" onClick={() => copyToClipboard(selected)}>Copy HEX</Button>
          </div>
        )}
        <div className="space-y-2 overflow-auto max-h-96">
          {Object.entries(palette).map(([name, shades]) => (
            <div key={name} className="flex items-center gap-1">
              <span className="w-16 text-xs text-muted-foreground capitalize">{name}</span>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(shades).map(([shade, hex]) => (
                  <button key={shade} title={`${name}-${shade}: ${hex}`} className="w-7 h-7 rounded border-2 transition-transform hover:scale-125" style={{ background: hex, borderColor: selected === hex ? "white" : "transparent" }} onClick={() => setSelected(hex)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Color Palette Generator ──────────────────────────────────────────────────
export function ColorPaletteGenerator() {
  const [base, setBase] = useState("#6366f1");
  const [mode, setMode] = useState("shades");

  const { r, g, b } = hexToRgb(base);
  const { h, s, l } = rgbToHsl(r, g, b);

  function hslToHex(hue: number, sat: number, lit: number) {
    const a = sat / 100, b2 = lit / 100;
    const f = (n: number) => {
      const k = (n + hue / 30) % 12;
      const color = b2 - a * Math.min(b2, 1 - b2) * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round((color + 1e-10) * 255);
    };
    return "#" + [f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  const palettes: Record<string, Array<{ label: string; hex: string }>> = {
    shades: Array.from({ length: 10 }, (_, i) => ({ label: `${(i + 1) * 10}%`, hex: hslToHex(h, s, (i + 1) * 9) })),
    analogous: [-30, -15, 0, 15, 30].map(offset => ({ label: `${h + offset}°`, hex: hslToHex((h + offset + 360) % 360, s, l) })),
    complementary: [0, 30, 60, 180, 210, 240].map(offset => ({ label: `${(h + offset) % 360}°`, hex: hslToHex((h + offset) % 360, s, l) })),
    triadic: [0, 120, 240].map(offset => ({ label: `${(h + offset) % 360}°`, hex: hslToHex((h + offset) % 360, s, l) })),
  };

  return (
    <Card>
      <CardHeader><CardTitle>Color Palette Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input type="color" value={base} onChange={e => setBase(e.target.value)} className="h-12 w-20 cursor-pointer rounded border" />
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="shades">Shades</SelectItem>
              <SelectItem value="analogous">Analogous</SelectItem>
              <SelectItem value="complementary">Complementary</SelectItem>
              <SelectItem value="triadic">Triadic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {palettes[mode].map(({ label, hex }) => (
            <div key={hex} className="text-center cursor-pointer" onClick={() => copyToClipboard(hex)}>
              <div className="w-14 h-14 rounded border hover:scale-105 transition-transform" style={{ background: hex }} title={hex} />
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
              <div className="text-xs font-mono">{hex}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Click any swatch to copy hex value</div>
      </CardContent>
    </Card>
  );
}

// ─── SVG to CSS Converter ─────────────────────────────────────────────────────
export function SvgToCss() {
  const [svg, setSvg] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`);
  const [output, setOutput] = useState("");

  const convert = useCallback(() => {
    const encoded = encodeURIComponent(svg.trim())
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    const dataUrl = `url("data:image/svg+xml,${encoded}")`;
    setOutput(`.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: ${dataUrl} no-repeat center / contain;
}`);
  }, [svg]);

  return (
    <Card>
      <CardHeader><CardTitle>SVG to CSS Background</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>SVG Code</Label>
          <Textarea value={svg} onChange={e => setSvg(e.target.value)} className="font-mono text-xs h-32" />
        </div>
        <Button onClick={convert}>Convert to CSS</Button>
        {output && (
          <div className="relative">
            <pre className="bg-muted rounded p-3 text-xs overflow-auto">{output}</pre>
            <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
        {output && (
          <div className="flex items-center gap-2">
            <div style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: "no-repeat", backgroundSize: "contain", width: 48, height: 48 }} />
            <span className="text-sm text-muted-foreground">Preview</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Color Safe Palette Generator ─────────────────────────────────────────────
function getLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function getContrast(hex1: string, hex2: string) {
  const l1 = getLuminance(hex1), l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function ColorSafePaletteGenerator() {
  const [bg, setBg] = useState("#1e1e2e");

  function hslToHex2(h: number, s: number, l: number) {
    const a = s / 100; const b2 = l / 100;
    const f = (n: number) => { const k = (n + h / 30) % 12; const c = b2 - a * Math.min(b2, 1 - b2) * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); return Math.round(Math.max(0, Math.min(1, c)) * 255); };
    return "#" + [f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  const candidates = Array.from({ length: 36 }, (_, i) => hslToHex2(i * 10, 70, 60));
  const safe = candidates.filter(c => getContrast(c, bg) >= 4.5);
  const aaa = candidates.filter(c => getContrast(c, bg) >= 7);

  return (
    <Card>
      <CardHeader><CardTitle>Color Safe Palette Generator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div>
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="h-10 w-16 cursor-pointer rounded" />
              <span className="font-mono text-sm">{bg}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="font-medium mb-2">WCAG AA Compliant Colors ({safe.length})</div>
          <div className="flex gap-2 flex-wrap p-3 rounded" style={{ background: bg }}>
            {safe.map(c => (
              <div key={c} className="w-10 h-10 rounded border border-white/20 cursor-pointer" style={{ background: c }} title={c} onClick={() => copyToClipboard(c)} />
            ))}
          </div>
        </div>
        <div>
          <div className="font-medium mb-2">WCAG AAA Compliant Colors ({aaa.length})</div>
          <div className="flex gap-2 flex-wrap p-3 rounded" style={{ background: bg }}>
            {aaa.map(c => (
              <div key={c} className="w-10 h-10 rounded border border-white/20 cursor-pointer" style={{ background: c }} title={c} onClick={() => copyToClipboard(c)} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
