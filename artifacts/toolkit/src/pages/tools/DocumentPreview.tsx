import { useEffect, useRef, useState } from "react";
import { getPdfjs } from "@/lib/pdfjs";
export function DocumentPreview({
  file,
  page,
  password,
}: {
  file?: File;
  page: number;
  password?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(""),
    [zoom, setZoom] = useState(1),
    [rotation, setRotation] = useState(0),
    [image, setImage] = useState("");
  useEffect(() => {
    if (!file || !/^image\//.test(file.type)) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    return () => {
      URL.revokeObjectURL(url);
      setImage("");
    };
  }, [file]);
  useEffect(() => {
    let cancelled = false,
      loading: any,
      render: any;
    setError("");
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) return;
    void (async () => {
      try {
        const lib = await getPdfjs();
        if (cancelled) return;
        loading = lib.getDocument({ data: await file.arrayBuffer(), password });
        const doc = await loading.promise;
        if (cancelled) return;
        const p = await doc.getPage(page + 1);
        const viewport = p.getViewport({ scale: zoom, rotation });
        if (viewport.width * viewport.height > 16000000)
          throw Error("Preview is too large. Reduce zoom.");
        const c = canvas.current;
        if (!c || cancelled) return;
        c.width = viewport.width;
        c.height = viewport.height;
        render = p.render({
          canvas: c,
          canvasContext: c.getContext("2d")!,
          viewport,
        });
        await render.promise;
      } catch (e) {
        if (!cancelled)
          setError(
            "Preview unavailable. Use the extracted source text or download/open your original locally.",
          );
      }
    })();
    return () => {
      cancelled = true;
      render?.cancel();
      void loading?.destroy();
    };
  }, [file, page, zoom, rotation, password]);
  if (!file)
    return (
      <p className="text-sm text-muted-foreground">
        Pasted source text has no original file preview.
      </p>
    );
  if (!file.name.toLowerCase().endsWith(".pdf") && !image)
    return (
      <p className="text-sm text-muted-foreground">
        Text/Word content is shown in the source editor. Word paragraph anchors
        do not imply page numbers.
      </p>
    );
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap gap-3 text-sm">
        <label>
          Zoom{" "}
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="bg-background border rounded p-1"
          >
            {[0.5, 1, 1.5, 2].map((v) => (
              <option key={v} value={v}>
                {v * 100}%
              </option>
            ))}
          </select>
        </label>
        <button
          className="underline"
          onClick={() => setRotation((r) => (r + 90) % 360)}
        >
          Rotate preview
        </button>
      </div>
      {error && <p role="status">{error}</p>}
      <div className="max-h-[32rem] overflow-auto rounded border bg-white">
        {image ? (
          <img
            alt="Original uploaded document"
            src={image}
            style={{
              maxWidth: "100%",
              transform: `rotate(${rotation}deg) scale(${zoom})`,
            }}
          />
        ) : (
          <canvas
            ref={canvas}
            className="max-w-full"
            aria-label={"Original PDF page " + (page + 1)}
          />
        )}
      </div>
    </div>
  );
}
