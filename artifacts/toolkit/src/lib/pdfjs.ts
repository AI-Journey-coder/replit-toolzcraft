import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  return pdfjs;
}
