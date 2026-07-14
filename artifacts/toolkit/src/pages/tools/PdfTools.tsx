import { useState } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { FileUp, Download, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parsePageRanges(input: string, pageCount: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const start = Number(m[1]);
      const end = Number(m[2]);
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        if (i >= 1 && i <= pageCount) pages.add(i);
      }
    } else if (/^\d+$/.test(p)) {
      const n = Number(p);
      if (n >= 1 && n <= pageCount) pages.add(n);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

// ─── Merge PDF ────────────────────────────────────────────────────────────────
export function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const move = (i: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  };

  const merge = async () => {
    setBusy(true);
    setError("");
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: false });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      downloadBytes(await out.save(), "merged.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to merge PDFs");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Merge PDF</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="merge-files">Add PDF files (order matters)</Label>
          <Input
            id="merge-files"
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            data-testid="input-merge-files"
          />
        </div>
        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2">
                <span className="font-mono text-xs flex-1 truncate">{i + 1}. {f.name}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(i, 1)} disabled={i === files.length - 1}><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={merge} disabled={files.length < 2 || busy} data-testid="button-merge">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Merge {files.length} PDFs
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Split / Extract Pages ────────────────────────────────────────────────────
export function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (f: File | null) => {
    setFile(f);
    setError("");
    setPageCount(0);
    if (f) {
      try {
        const doc = await PDFDocument.load(await f.arrayBuffer());
        setPageCount(doc.getPageCount());
      } catch {
        setError("Could not read this PDF (it may be encrypted).");
      }
    }
  };

  const extract = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const pages = parsePageRanges(ranges, src.getPageCount());
      if (pages.length === 0) {
        setError("No valid pages selected. Use e.g. 1-3, 5, 8");
        return;
      }
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p - 1));
      copied.forEach((p) => out.addPage(p));
      downloadBytes(await out.save(), "extracted.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to split PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Split PDF / Extract Pages</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="split-file">PDF file</Label>
          <Input id="split-file" type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} data-testid="input-split-file" />
          {pageCount > 0 && <Badge variant="secondary">{pageCount} pages</Badge>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="split-ranges">Pages to extract (e.g. 1-3, 5, 8)</Label>
          <Input id="split-ranges" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 5" data-testid="input-split-ranges" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={extract} disabled={!file || !ranges.trim() || busy} data-testid="button-split">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Extract pages
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Images to PDF ────────────────────────────────────────────────────────────
export function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const convert = async () => {
    setBusy(true);
    setError("");
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const img = f.type === "image/png" ? await out.embedPng(bytes) : await out.embedJpg(bytes);
        const page = out.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      downloadBytes(await out.save(), "images.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert. Only JPG and PNG are supported.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Images to PDF</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="img2pdf-files">JPG or PNG images (one page each)</Label>
          <Input
            id="img2pdf-files"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            data-testid="input-img2pdf-files"
          />
          {files.length > 0 && <Badge variant="secondary">{files.length} image(s)</Badge>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={convert} disabled={files.length === 0 || busy} data-testid="button-img2pdf">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Create PDF
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Rotate PDF ───────────────────────────────────────────────────────────────
export function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState("90");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const rotate = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const delta = Number(angle);
      doc.getPages().forEach((p) => p.setRotation(degrees(((p.getRotation().angle + delta) % 360 + 360) % 360)));
      downloadBytes(await doc.save(), "rotated.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rotate PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Rotate PDF</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rotate-file">PDF file</Label>
          <Input id="rotate-file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="input-rotate-file" />
        </div>
        <div className="space-y-2">
          <Label>Rotation</Label>
          <Select value={angle} onValueChange={setAngle}>
            <SelectTrigger className="w-48" data-testid="select-rotate-angle"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90° clockwise</SelectItem>
              <SelectItem value="180">180°</SelectItem>
              <SelectItem value="270">90° counter-clockwise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={rotate} disabled={!file || busy} data-testid="button-rotate">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Rotate & download
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Watermark PDF ────────────────────────────────────────────────────────────
export function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState([30]);
  const [size, setSize] = useState([48]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = size[0]!;
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: opacity[0]! / 100,
          rotate: degrees(35),
        });
      }
      downloadBytes(await doc.save(), "watermarked.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to watermark PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Watermark PDF</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wm-file">PDF file</Label>
          <Input id="wm-file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="input-wm-file" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wm-text">Watermark text</Label>
          <Input id="wm-text" value={text} onChange={(e) => setText(e.target.value)} data-testid="input-wm-text" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Opacity: {opacity[0]}%</Label>
            <Slider value={opacity} onValueChange={setOpacity} min={5} max={100} step={5} />
          </div>
          <div className="space-y-2">
            <Label>Font size: {size[0]}pt</Label>
            <Slider value={size} onValueChange={setSize} min={12} max={120} step={4} />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={apply} disabled={!file || !text.trim() || busy} data-testid="button-watermark">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Watermark & download
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Page Numbers ─────────────────────────────────────────────────────────────
export function PdfPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState("bottom-center");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((page, i) => {
        const { width } = page.getSize();
        const label = `${i + 1} / ${pages.length}`;
        const textWidth = font.widthOfTextAtSize(label, 10);
        const x = position.endsWith("left") ? 36 : position.endsWith("right") ? width - 36 - textWidth : width / 2 - textWidth / 2;
        const y = position.startsWith("top") ? page.getSize().height - 24 : 24;
        page.drawText(label, { x, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      });
      downloadBytes(await doc.save(), "numbered.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add page numbers");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Add Page Numbers</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pn-file">PDF file</Label>
          <Input id="pn-file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="input-pn-file" />
        </div>
        <div className="space-y-2">
          <Label>Position</Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="w-56" data-testid="select-pn-position"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-center">Bottom center</SelectItem>
              <SelectItem value="bottom-left">Bottom left</SelectItem>
              <SelectItem value="bottom-right">Bottom right</SelectItem>
              <SelectItem value="top-center">Top center</SelectItem>
              <SelectItem value="top-left">Top left</SelectItem>
              <SelectItem value="top-right">Top right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={apply} disabled={!file || busy} data-testid="button-page-numbers">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Add numbers & download
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Metadata Viewer/Editor ───────────────────────────────────────────────────
export function PdfMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({ title: "", author: "", subject: "", keywords: "", creator: "", producer: "" });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (f: File | null) => {
    setFile(f);
    setLoaded(false);
    setError("");
    if (!f) return;
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer(), { updateMetadata: false });
      setMeta({
        title: doc.getTitle() ?? "",
        author: doc.getAuthor() ?? "",
        subject: doc.getSubject() ?? "",
        keywords: doc.getKeywords() ?? "",
        creator: doc.getCreator() ?? "",
        producer: doc.getProducer() ?? "",
      });
      setLoaded(true);
    } catch {
      setError("Could not read this PDF (it may be encrypted).");
    }
  };

  const save = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      doc.setTitle(meta.title);
      doc.setAuthor(meta.author);
      doc.setSubject(meta.subject);
      doc.setKeywords(meta.keywords.split(",").map((k) => k.trim()).filter(Boolean));
      doc.setCreator(meta.creator);
      doc.setProducer(meta.producer);
      downloadBytes(await doc.save(), "metadata-updated.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update metadata");
    } finally {
      setBusy(false);
    }
  };

  const fields: { key: keyof typeof meta; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "subject", label: "Subject" },
    { key: "keywords", label: "Keywords (comma-separated)" },
    { key: "creator", label: "Creator" },
    { key: "producer", label: "Producer" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>PDF Metadata Viewer & Editor</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meta-file">PDF file</Label>
          <Input id="meta-file" type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0] ?? null)} data-testid="input-meta-file" />
        </div>
        {loaded && (
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={`meta-${f.key}`}>{f.label}</Label>
                <Input id={`meta-${f.key}`} value={meta[f.key]} onChange={(e) => setMeta({ ...meta, [f.key]: e.target.value })} data-testid={`input-meta-${f.key}`} />
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={save} disabled={!loaded || busy} data-testid="button-meta-save">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Save & download
        </Button>
      </CardContent>
    </Card>
  );
}
