import { getPdfjs } from "./pdfjs";
export async function documentPageImage(
  file: File,
  pageNumber: number,
  password: string | undefined,
  signal: AbortSignal,
) {
  const canvas = document.createElement("canvas");
  let pdf: any, loading: any, bitmap: ImageBitmap | undefined;
  const abort = () => {
    void loading?.destroy();
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    if (file.name.toLowerCase().endsWith(".pdf")) {
      const lib = await getPdfjs();
      loading = lib.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        password,
      });
      pdf = await loading.promise;
      const page = await pdf.getPage(pageNumber);
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: Math.min(1200 / original.width, 1200 / original.height, 1.5),
      });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({
        canvas,
        canvasContext: canvas.getContext("2d")!,
        viewport,
      }).promise;
      page.cleanup();
    } else {
      bitmap = await createImageBitmap(file);
      const scale = Math.min(1200 / bitmap.width, 1200 / bitmap.height, 1);
      canvas.width = Math.ceil(bitmap.width * scale);
      canvas.height = Math.ceil(bitmap.height * scale);
      canvas
        .getContext("2d")!
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    }
    for (let attempt = 0; attempt < 8; attempt++) {
      if (signal.aborted) throw Error("Preview cancelled.");
      const encoded = canvas.toDataURL("image/png");
      if (encoded.length <= 200000) return encoded;
      if (Math.min(canvas.width, canvas.height) < 320) break;
      const small = document.createElement("canvas");
      small.width = Math.floor(canvas.width * 0.8);
      small.height = Math.floor(canvas.height * 0.8);
      small
        .getContext("2d")!
        .drawImage(canvas, 0, 0, small.width, small.height);
      canvas.width = small.width;
      canvas.height = small.height;
      canvas.getContext("2d")!.drawImage(small, 0, 0);
      small.width = small.height = 0;
    }
    throw Error(
      "This page is too detailed for the preview limit. Crop or split it into smaller images first.",
    );
  } finally {
    signal.removeEventListener("abort", abort);
    bitmap?.close();
    canvas.width = canvas.height = 0;
    await pdf?.destroy();
  }
}
