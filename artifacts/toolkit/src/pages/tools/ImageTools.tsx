import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

function copyToClipboard(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

// ─── EXIF Viewer ──────────────────────────────────────────────────────────────
function readExif(buffer: ArrayBuffer): Record<string, string> {
  const view = new DataView(buffer);
  const result: Record<string, string> = {};
  if (view.getUint16(0) !== 0xFFD8) return result;
  let offset = 2;
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset);
    if (marker === 0xFFE1) {
      const length = view.getUint16(offset + 2);
      const exifHeader = new TextDecoder("ascii").decode(new Uint8Array(buffer, offset + 4, 4));
      if (exifHeader === "Exif") {
        const tiffOffset = offset + 10;
        const littleEndian = view.getUint16(tiffOffset) === 0x4949;
        const ifdOffset = view.getUint32(tiffOffset + 4, littleEndian);
        const ifdCount = view.getUint16(tiffOffset + ifdOffset, littleEndian);
        const TAG_NAMES: Record<number, string> = {
          0x010F: "Make", 0x0110: "Model", 0x0112: "Orientation",
          0x011A: "XResolution", 0x011B: "YResolution", 0x0128: "ResolutionUnit",
          0x0131: "Software", 0x0132: "DateTime", 0x013B: "Artist",
          0x8769: "ExifIFD", 0x8825: "GPSIFD", 0xA002: "PixelXDimension",
          0xA003: "PixelYDimension", 0x9003: "DateTimeOriginal",
          0x920A: "FocalLength", 0x9209: "Flash", 0x829A: "ExposureTime",
          0x8827: "ISOSpeedRatings", 0x9201: "ShutterSpeedValue",
        };
        for (let i = 0; i < ifdCount; i++) {
          const entryOffset = tiffOffset + ifdOffset + 2 + i * 12;
          const tag = view.getUint16(entryOffset, littleEndian);
          const type = view.getUint16(entryOffset + 2, littleEndian);
          const count = view.getUint32(entryOffset + 4, littleEndian);
          const name = TAG_NAMES[tag];
          if (!name) continue;
          try {
            let value = "";
            if (type === 2) {
              const strOffset = count > 4 ? view.getUint32(entryOffset + 8, littleEndian) + tiffOffset : entryOffset + 8;
              value = new TextDecoder("ascii").decode(new Uint8Array(buffer, strOffset, count - 1)).trim();
            } else if (type === 3) {
              value = String(view.getUint16(entryOffset + 8, littleEndian));
            } else if (type === 4) {
              value = String(view.getUint32(entryOffset + 8, littleEndian));
            } else if (type === 5) {
              const ratOffset = view.getUint32(entryOffset + 8, littleEndian) + tiffOffset;
              const num = view.getUint32(ratOffset, littleEndian);
              const den = view.getUint32(ratOffset + 4, littleEndian);
              value = den > 0 ? `${num}/${den}` : String(num);
            }
            if (value) result[name] = value;
          } catch { }
        }
      }
      break;
    }
    if (marker === 0xFFDA) break;
    offset += 2 + view.getUint16(offset + 2);
  }
  return result;
}

export function ExifViewer() {
  const [exif, setExif] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState("");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);

  const handleFile = (file: File) => {
    setFileInfo({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, type: file.type });
    const reader = new FileReader();
    reader.onload = e => {
      const buf = e.target?.result as ArrayBuffer;
      const data = readExif(buf);
      if (Object.keys(data).length === 0) data["Note"] = "No EXIF data found in this image.";
      setExif(data);
      setPreview(URL.createObjectURL(file));
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Card>
      <CardHeader><CardTitle>EXIF Viewer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
          <input type="file" accept="image/jpeg,image/jpg,image/tiff" className="hidden" id="exif-file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <label htmlFor="exif-file" className="cursor-pointer">
            <div className="text-4xl mb-2">📷</div>
            <div className="text-sm text-muted-foreground">Drop a JPEG image here or click to select</div>
            <div className="text-xs text-muted-foreground mt-1">(EXIF data is read client-side — file never leaves your browser)</div>
          </label>
        </div>
        {preview && (
          <div className="flex gap-4">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border" />
            {fileInfo && (
              <div className="space-y-1 text-sm">
                <div><span className="text-muted-foreground">File:</span> {fileInfo.name}</div>
                <div><span className="text-muted-foreground">Size:</span> {fileInfo.size}</div>
                <div><span className="text-muted-foreground">Type:</span> {fileInfo.type}</div>
              </div>
            )}
          </div>
        )}
        {Object.keys(exif).length > 0 && (
          <div className="space-y-1">
            {Object.entries(exif).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground w-40 flex-shrink-0">{k}</span>
                <span className="font-mono flex-1">{v}</span>
                <button className="text-xs text-blue-400 hover:underline" onClick={() => copyToClipboard(v)}>copy</button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Color Picker from Image ──────────────────────────────────────────────────
export function ColorPickerFromImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [preview, setPreview] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 });

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 600;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      setSize({ w: canvas.width, h: canvas.height });
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = url;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const [r, g, b] = canvas.getContext("2d")!.getImageData(x, y, 1, 1).data;
    const hex = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
    setColor({ hex, rgb: `rgb(${r}, ${g}, ${b})` });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Color Picker from Image</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
          <input type="file" accept="image/*" className="hidden" id="picker-file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <label htmlFor="picker-file" className="cursor-pointer text-sm text-muted-foreground">Drop an image or click to select, then click on any pixel</label>
        </div>
        {color && (
          <div className="flex items-center gap-3 p-3 rounded border">
            <div className="w-12 h-12 rounded border" style={{ background: color.hex }} />
            <div>
              <div className="font-mono">{color.hex}</div>
              <div className="font-mono text-sm text-muted-foreground">{color.rgb}</div>
            </div>
            <Button size="sm" className="ml-auto" onClick={() => copyToClipboard(color.hex)}>Copy HEX</Button>
          </div>
        )}
        {preview && (
          <div className="overflow-auto max-h-80">
            <canvas ref={canvasRef} onClick={handleClick} className="cursor-crosshair max-w-full rounded border" style={{ imageRendering: "auto" }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Color Palette from Image ─────────────────────────────────────────────────
export function ColorPaletteFromImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [count, setCount] = useState(8);

  const extractPalette = (imageData: ImageData, n: number): string[] => {
    const pixels: [number, number, number][] = [];
    for (let i = 0; i < imageData.data.length; i += 16) {
      pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
    }
    const clusters: [number, number, number][] = Array.from({ length: n }, (_, i) => pixels[Math.floor(i * pixels.length / n)]);
    for (let iter = 0; iter < 10; iter++) {
      const sums = clusters.map(() => [0, 0, 0, 0] as [number, number, number, number]);
      pixels.forEach(([r, g, b]) => {
        let best = 0, bestDist = Infinity;
        clusters.forEach(([cr, cg, cb], j) => { const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2; if (d < bestDist) { bestDist = d; best = j; } });
        sums[best][0] += r; sums[best][1] += g; sums[best][2] += b; sums[best][3]++;
      });
      sums.forEach(([r, g, b, c], j) => { if (c > 0) clusters[j] = [Math.round(r / c), Math.round(g / c), Math.round(b / c)]; });
    }
    return clusters.map(([r, g, b]) => "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join(""));
  };

  const handleFile = (file: File) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = 100; canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      setPalette(extractPalette(imageData, count));
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Color Palette from Image</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <canvas ref={canvasRef} className="hidden" />
        <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
          <input type="file" accept="image/*" className="hidden" id="palette-file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <label htmlFor="palette-file" className="cursor-pointer text-sm text-muted-foreground">Drop an image or click to extract colors</label>
        </div>
        <div className="flex items-center gap-2">
          <Label>Colors to extract: {count}</Label>
          <Slider min={4} max={16} value={[count]} onValueChange={([v]) => setCount(v)} className="flex-1" />
        </div>
        {palette.length > 0 && (
          <>
            <div className="flex gap-2 flex-wrap">
              {palette.map(hex => (
                <div key={hex} className="text-center cursor-pointer" onClick={() => copyToClipboard(hex)}>
                  <div className="w-14 h-14 rounded border hover:scale-105 transition-transform" style={{ background: hex }} title={hex} />
                  <div className="text-xs font-mono mt-1">{hex}</div>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(palette.join(", "))}>Copy All HEX</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SVG to PNG Converter ─────────────────────────────────────────────────────
export function SvgToPngConverter() {
  const [svg, setSvg] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#6366f1"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-family="Arial">✦</text></svg>`);
  const [scale, setScale] = useState(2);
  const [preview, setPreview] = useState("");

  const convert = (download = false) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "image/svg+xml");
    const svgEl = doc.documentElement;
    const viewBox = svgEl.getAttribute("viewBox")?.split(" ").map(Number) ?? [0, 0, 100, 100];
    const w = +(svgEl.getAttribute("width") || viewBox[2] || 100) * scale;
    const h = +(svgEl.getAttribute("height") || viewBox[3] || 100) * scale;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      const png = canvas.toDataURL("image/png");
      setPreview(png);
      if (download) { const a = document.createElement("a"); a.href = png; a.download = "image.png"; a.click(); }
    };
    img.src = url;
  };

  return (
    <Card>
      <CardHeader><CardTitle>SVG to PNG Converter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>SVG Code</Label>
          <textarea className="w-full rounded border bg-background font-mono text-xs p-2 h-32 resize-y" value={svg} onChange={e => setSvg(e.target.value)} />
        </div>
        <div className="flex items-center gap-4">
          <Label>Scale: {scale}x</Label>
          <Slider min={1} max={8} value={[scale]} onValueChange={([v]) => setScale(v)} className="flex-1" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => convert(false)}>Preview</Button>
          <Button variant="outline" onClick={() => convert(true)}>Download PNG</Button>
        </div>
        {preview && <img src={preview} alt="PNG Preview" className="max-w-full rounded border max-h-48 object-contain" />}
      </CardContent>
    </Card>
  );
}

// ─── Image Resizer & Compressor ───────────────────────────────────────────────
export function ImageResizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [original, setOriginal] = useState<{ w: number; h: number; size: number; name: string } | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState("image/jpeg");
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (file: File) => {
    const img = new Image();
    img.onload = () => {
      setOriginal({ w: img.width, h: img.height, size: file.size, name: file.name });
      setWidth(img.width); setHeight(img.height);
      imgRef.current = img;
    };
    img.src = URL.createObjectURL(file);
  };

  const process = (download = false) => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
    canvas.toBlob(blob => {
      if (!blob) return;
      setOutputSize(blob.size);
      if (download) {
        const ext = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `resized-${width}x${height}.${ext}`;
        a.click();
      }
    }, format, quality / 100);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Image Resizer & Compressor</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <canvas ref={canvasRef} className="hidden" />
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
          <input type="file" accept="image/*" className="hidden" id="resize-file" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <label htmlFor="resize-file" className="cursor-pointer text-sm text-muted-foreground">Drop an image or click to select</label>
        </div>
        {original && (
          <>
            <div className="text-sm text-muted-foreground">Original: {original.w}×{original.h}px — {(original.size / 1024).toFixed(1)} KB</div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Width (px)</Label><Input type="number" value={width} onChange={e => setWidth(+e.target.value)} /></div>
              <div><Label>Height (px)</Label><Input type="number" value={height} onChange={e => setHeight(+e.target.value)} /></div>
              <div>
                <Label>Output Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quality: {quality}%</Label>
                <Slider min={10} max={100} value={[quality]} onValueChange={([v]) => setQuality(v)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => process(false)}>Calculate Size</Button>
              <Button variant="outline" onClick={() => process(true)}>Download</Button>
            </div>
            {outputSize && (
              <div className="text-sm">
                Output: {width}×{height}px — {(outputSize / 1024).toFixed(1)} KB
                <Badge variant="outline" className="ml-2">{Math.round((1 - outputSize / original.size) * 100)}% smaller</Badge>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
