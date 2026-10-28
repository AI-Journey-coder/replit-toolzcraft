import { useEffect, useState } from "react";
import { getPdfjs } from "@/lib/pdfjs";
import type { SourcePage } from "@workspace/document-intelligence";

export function DocumentThumbnails({
  file,
  pages,
  onSelect,
}: {
  file?: File;
  pages: SourcePage[];
  onSelect: (id: string) => void;
}) {
  const [images, setImages] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false,
      loading: any,
      render: any;
    setImages({});
    setError("");
    if (!file?.name.toLowerCase().endsWith(".pdf")) return;
    void (async () => {
      try {
        const lib = await getPdfjs();
        if (cancelled) return;
        const data = await file.arrayBuffer();
        if (cancelled) return;
        loading = lib.getDocument({ data });
        const pdf = await loading.promise;
        for (let n = 1; n <= Math.min(pdf.numPages, 20); n++) {
          if (cancelled) break;
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({
            scale: Math.min(140 / base.width, 180 / base.height),
          });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          try {
            render = page.render({
              canvas,
              canvasContext: canvas.getContext("2d")!,
              viewport,
            });
            await render.promise;
            if (!cancelled) {
              const image = canvas.toDataURL("image/png");
              setImages((old) => ({ ...old, [n]: image }));
            }
          } finally {
            canvas.width = canvas.height = 0;
            page.cleanup();
          }
        }
      } catch {
        if (!cancelled)
          setError("Thumbnails unavailable; use the page buttons below.");
      } finally {
        await loading?.destroy().catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
      render?.cancel();
      void loading?.destroy();
    };
  }, [file]);
  if (!file?.name.toLowerCase().endsWith(".pdf")) return null;
  return (
    <div className="grid grid-cols-2 gap-2" aria-label="PDF page thumbnails">
      {error && (
        <p className="col-span-2 text-xs" role="status">
          {error}
        </p>
      )}
      {pages.map((p) => {
        const n = Number(p.label.match(/^Page (\d+)$/)?.[1]);
        return images[n] ? (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="rounded border p-1 text-xs hover:border-primary"
            aria-label={"Preview " + p.label}
          >
            <img
              src={images[n]}
              alt={"Thumbnail " + p.label}
              className="mx-auto max-h-32"
            />
            {p.label}
          </button>
        ) : null;
      })}
    </div>
  );
}
