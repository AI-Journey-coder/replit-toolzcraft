import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Copy } from "lucide-react";
import { getPdfjs } from "@/lib/pdfjs";

// ─── PDF to Images ────────────────────────────────────────────────────────────
export function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState("2");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [images, setImages] = useState<{ url: string; name: string }[]>([]);

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setImages([]);
    try {
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const out: { url: string; name: string }[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(`Rendering page ${i} of ${doc.numPages}…`);
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: Number(scale) });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        out.push({ url: canvas.toDataURL("image/png"), name: `page-${i}.png` });
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
      }
      await doc.cleanup();
      setImages(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to render PDF");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>PDF to Images</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="p2i-file">PDF file</Label>
          <Input id="p2i-file" type="file" accept="application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setImages([]); }} data-testid="input-p2i-file" />
        </div>
        <div className="space-y-2">
          <Label>Quality</Label>
          <Select value={scale} onValueChange={setScale}>
            <SelectTrigger className="w-48" data-testid="select-p2i-scale"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Standard (1x)</SelectItem>
              <SelectItem value="2">High (2x)</SelectItem>
              <SelectItem value="3">Very high (3x)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {progress && <p className="text-sm text-muted-foreground font-mono">{progress}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={convert} disabled={!file || busy} data-testid="button-p2i">
          {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
          Convert to PNG
        </Button>
        {images.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {images.map((img) => (
              <div key={img.name} className="space-y-2 border border-border rounded-lg p-2">
                <img src={img.url} alt={img.name} className="w-full rounded" />
                <a href={img.url} download={img.name}>
                  <Button variant="outline" size="sm" className="w-full"><Download className="h-3.5 w-3.5 mr-1" />{img.name}</Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── PDF Text Extractor ───────────────────────────────────────────────────────
export function PdfTextExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [pages, setPages] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const extract = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setText("");
    try {
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      setPages(doc.numPages);
      const parts: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        parts.push(`--- Page ${i} ---\n${pageText}`);
      }
      await doc.cleanup();
      const result = parts.join("\n\n");
      setText(result);
      if (!result.replace(/--- Page \d+ ---/g, "").trim()) {
        setError("No selectable text found — this PDF may be scanned. Try the PDF OCR tool instead.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract text");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>PDF Text Extractor</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pte-file">PDF file</Label>
          <Input id="pte-file" type="file" accept="application/pdf" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setText(""); }} data-testid="input-pte-file" />
          {pages > 0 && <Badge variant="secondary">{pages} pages</Badge>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={extract} disabled={!file || busy} data-testid="button-pte">
            {busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Extract text
          </Button>
          {text && (
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(text).catch(() => {})} data-testid="button-pte-copy">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          )}
        </div>
        {text && <Textarea value={text} readOnly rows={16} className="font-mono text-xs" data-testid="text-pte-output" />}
      </CardContent>
    </Card>
  );
}
