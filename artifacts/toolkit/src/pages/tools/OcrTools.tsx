import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, Copy, ScanLine } from "lucide-react";
import { getPdfjs } from "@/lib/pdfjs";

const OCR_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "ara", label: "Arabic" },
  { code: "rus", label: "Russian" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
];

async function createOcrWorker(lang: string, onProgress: (pct: number) => void) {
  const { createWorker } = await import("tesseract.js");
  return createWorker(lang, undefined, {
    logger: (m) => {
      if (m.status === "recognizing text") onProgress(Math.round(m.progress * 100));
    },
  });
}

// ─── Image OCR ────────────────────────────────────────────────────────────────
export function ImageOcr() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [lang, setLang] = useState("eng");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");

  const previewRef = useRef("");
  previewRef.current = preview;
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const onFile = (f: File | null) => {
    setFile(f);
    setText("");
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setText("");
    setPct(0);
    let worker: Awaited<ReturnType<typeof createOcrWorker>> | null = null;
    try {
      worker = await createOcrWorker(lang, setPct);
      const result = await worker.recognize(file);
      setText(result.data.text.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "OCR failed");
    } finally {
      await worker?.terminate().catch(() => {});
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image to Text (OCR)</CardTitle>
        <CardDescription>Extract text from photos and screenshots. Runs entirely in your browser — files never leave your device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ocr-file">Image (JPG, PNG, WebP, BMP)</Label>
            <Input id="ocr-file" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} data-testid="input-ocr-file" />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger data-testid="select-ocr-lang"><SelectValue /></SelectTrigger>
              <SelectContent>
                {OCR_LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {preview && <img src={preview} alt="preview" className="max-h-64 rounded-lg border border-border" />}
        {busy && (
          <div className="space-y-1">
            <Progress value={pct} />
            <p className="text-xs text-muted-foreground font-mono">{pct < 1 ? "Loading OCR engine…" : `Recognizing… ${pct}%`}</p>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={run} disabled={!file || busy} data-testid="button-ocr">
            {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ScanLine className="h-4 w-4 mr-1" />}
            Extract text
          </Button>
          {text && (
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(text).catch(() => {})} data-testid="button-ocr-copy">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          )}
        </div>
        {text && <Textarea value={text} readOnly rows={12} className="font-mono text-xs" data-testid="text-ocr-output" />}
      </CardContent>
    </Card>
  );
}

// ─── PDF OCR ──────────────────────────────────────────────────────────────────
export function PdfOcr() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const activeRun = useRef<{ cancel: () => void } | null>(null);
  useEffect(() => () => activeRun.current?.cancel(), []);

  const cancel = () => {
    activeRun.current?.cancel();
    activeRun.current = null;
    setBusy(false);
    setPct(0);
    setStatus("OCR cancelled. Text from completed pages is kept.");
  };

  const run = async () => {
    if (!file || activeRun.current) return;
    setBusy(true);
    setError("");
    setText("");
    setPct(0);
    setStatus("Loading PDF and OCR engine…");
    let worker: Awaited<ReturnType<typeof createOcrWorker>> | null = null;
    let doc: Awaited<ReturnType<Awaited<ReturnType<typeof getPdfjs>>["getDocument"]>["promise"]> | null = null;
    let loadingTask: ReturnType<Awaited<ReturnType<typeof getPdfjs>>["getDocument"]> | null = null;
    let renderTask: { cancel: () => void } | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let cancelled = false;
    const stop = () => {
      cancelled = true;
      renderTask?.cancel();
      void worker?.terminate().catch(() => {});
      worker = null;
      void loadingTask?.destroy().catch(() => {});
      loadingTask = null;
      if (canvas) { canvas.width = 0; canvas.height = 0; }
    };
    const job = { cancel: stop };
    activeRun.current = job;
    try {
      const pdfjs = await getPdfjs();
      if (cancelled) return;
      const data = await file.arrayBuffer();
      if (cancelled) return;
      loadingTask = pdfjs.getDocument({ data });
      doc = await loadingTask.promise;
      if (cancelled) return;
      worker = await createOcrWorker(lang, (value) => { if (!cancelled) setPct(value); });
      // Worker initialization cannot be interrupted through Tesseract's public API.
      // Dispose a late worker immediately instead of starting recognition.
      if (cancelled) return;
      const maxPages = Math.min(doc.numPages, 20);
      const parts: string[] = [];
      for (let i = 1; i <= maxPages; i++) {
        setStatus(`Page ${i} of ${maxPages}`);
        setPct(0);
        const page = await doc.getPage(i);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 2 });
        canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const rendering = page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas });
        renderTask = rendering;
        await rendering.promise;
        renderTask = null;
        if (cancelled) return;
        const result = await worker.recognize(canvas);
        if (cancelled) return;
        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
        parts.push(`--- Page ${i} ---\n${result.data.text.trim()}`);
        setText(parts.join("\n\n"));
      }
      if (doc.numPages > maxPages) {
        parts.push(`(Stopped at ${maxPages} pages — split the PDF to OCR the rest.)`);
        setText(parts.join("\n\n"));
      }
    } catch (e) {
      if (!cancelled) setError(e instanceof Error ? e.message : "PDF OCR failed");
    } finally {
      await worker?.terminate().catch(() => {});
      await loadingTask?.destroy().catch(() => {});
      if (canvas) { canvas.width = 0; canvas.height = 0; }
      if (activeRun.current === job) {
        activeRun.current = null;
        setBusy(false);
        setStatus("");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF OCR (Scanned PDF to Text)</CardTitle>
        <CardDescription>Recognize text in scanned PDFs, page by page, entirely in your browser. Up to 20 pages per run.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pdfocr-file">PDF file</Label>
            <Input id="pdfocr-file" type="file" accept="application/pdf" disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setText(""); setStatus(""); setError(""); }} data-testid="input-pdfocr-file" />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={lang} onValueChange={setLang} disabled={busy}>
              <SelectTrigger data-testid="select-pdfocr-lang"><SelectValue /></SelectTrigger>
              <SelectContent>
                {OCR_LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {busy && (
          <div className="space-y-1">
            <Progress value={pct} />
            <p role="status" className="text-xs text-muted-foreground font-mono">{status} — {pct}%</p>
          </div>
        )}
        {!busy && status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={run} disabled={!file || busy} data-testid="button-pdfocr">
            {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ScanLine className="h-4 w-4 mr-1" />}
            Run OCR
          </Button>
          {busy && <Button variant="outline" onClick={cancel} data-testid="button-pdfocr-cancel">Cancel OCR</Button>}
          {text && !busy && (
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(text).catch(() => {})} data-testid="button-pdfocr-copy">
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          )}
        </div>
        {text && <Textarea value={text} readOnly rows={14} className="font-mono text-xs" data-testid="text-pdfocr-output" />}
      </CardContent>
    </Card>
  );
}
