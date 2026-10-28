import { getPdfjs } from "./pdfjs";
import type { DocumentSource } from "@workspace/document-intelligence";
export async function readDocument(
  file: File,
  id: string,
  progress: (s: string) => void,
  signal: AbortSignal,
): Promise<DocumentSource> {
  if (!file.size || file.size > 20 * 1024 * 1024)
    throw Error("Choose a non-empty file up to 20 MB.");
  const name = file.name.slice(0, 200),
    extension = file.name.split(".").pop()?.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let worker:
    | Awaited<ReturnType<(typeof import("tesseract.js"))["createWorker"]>>
    | undefined;
  let loading: any;
  const check = () => {
    if (signal.aborted) throw Error("Extraction cancelled.");
  };
  const abort = () => {
    void worker?.terminate();
    void loading?.destroy();
  };
  signal.addEventListener("abort", abort, { once: true });
  const ocr = async (input: File | HTMLCanvasElement) => {
    check();
    if (!worker) {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("eng");
      check();
    }
    return (await worker.recognize(input)).data.text;
  };
  try {
    check();
    progress("Validating file locally…");
    if (extension === "txt") {
      if (bytes.includes(0))
        throw Error("This does not look like a plain-text file.");
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (text.length > 200000)
        throw Error("Text file exceeds 200,000 characters. Split it first.");
      return {
        id,
        name,
        pages: [{ id: id + "-text", label: "Text section 1", text }],
      };
    }
    if (extension === "docx") {
      if (bytes[0] !== 80 || bytes[1] !== 75)
        throw Error("Invalid DOCX container.");
      progress("Reading Word paragraphs locally…");
      const { unzipSync, strFromU8 } = await import("fflate");
      const entries = unzipSync(bytes, {
        filter: (e) =>
          e.name === "word/document.xml" && e.originalSize <= 4000000,
      });
      if (!entries["word/document.xml"])
        throw Error("DOCX is damaged or its document content exceeds 4 MB.");
      const xml = strFromU8(entries["word/document.xml"]);
      if (/<!DOCTYPE|<!ENTITY/i.test(xml))
        throw Error("Unsupported XML declarations in DOCX.");
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      if (doc.getElementsByTagName("parsererror").length)
        throw Error("Invalid DOCX XML.");
      const body = doc.getElementsByTagNameNS("*", "body")[0];
      if (!body) throw Error("DOCX has no document body.");
      const textOf = (p: Element) =>
        Array.from(p.getElementsByTagNameNS("*", "t"))
          .map((t) => t.textContent || "")
          .join("");
      const hasTables = body.getElementsByTagNameNS("*", "tbl").length > 0;
      const paragraphs = Array.from(body.children)
        .flatMap((element) => {
          if (element.localName === "tbl")
            return Array.from(element.children)
              .filter((r) => r.localName === "tr")
              .map((row) =>
                Array.from(row.children)
                  .filter((c) => c.localName === "tc")
                  .map((cell) =>
                    Array.from(cell.getElementsByTagNameNS("*", "p"))
                      .map(textOf)
                      .join(" "),
                  )
                  .join("\t"),
              );
          return [textOf(element)];
        })
        .filter(Boolean);
      if (paragraphs.join("\n").length > 200000)
        throw Error(
          "DOCX exceeds 200,000 extracted characters. Split it first.",
        );
      const pages = [];
      for (let i = 0; i < paragraphs.length; i += 20)
        pages.push({
          id: id + "-section" + i,
          label:
            (hasTables ? "Blocks " : "Paragraphs ") +
            (i + 1) +
            "–" +
            Math.min(i + 20, paragraphs.length),
          text: paragraphs.slice(i, i + 20).join("\n"),
        });
      check();
      return { id, name, pages };
    }
    if (extension === "pdf") {
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
        throw Error("Invalid PDF signature.");
      const lib = await getPdfjs();
      loading = lib.getDocument({ data: bytes });
      const pdf = await loading.promise;
      if (pdf.numPages > 20)
        throw Error(
          "Choose a PDF with up to 20 pages. Split larger files first.",
        );
      const pages = [];
      let characters = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        check();
        progress("Reading page " + i + " of " + pdf.numPages + "…");
        const page = await pdf.getPage(i);
        try {
          const content = await page.getTextContent();
          let text = content.items
            .map((x: any) => (x.str || "") + (x.hasEOL ? "\n" : "\t"))
            .join("");
          if (!text.trim()) {
            const viewport = page.getViewport({ scale: 1.5 });
            if (viewport.width * viewport.height > 16000000)
              throw Error(
                "Page exceeds the safe rendering size. Resize it first.",
              );
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            try {
              await page.render({
                canvas,
                canvasContext: canvas.getContext("2d")!,
                viewport,
              }).promise;
              text = await ocr(canvas);
            } finally {
              canvas.width = canvas.height = 0;
            }
          }
          characters += text.length;
          if (characters > 200000)
            throw Error(
              "Document exceeds 200,000 extracted characters. Split it first.",
            );
          pages.push({ id: id + "-p" + i, label: "Page " + i, text });
        } finally {
          page.cleanup();
        }
      }
      return { id, name, pages };
    }
    if (["jpg", "jpeg", "png"].includes(extension || "")) {
      const png =
          bytes[0] === 137 &&
          bytes[1] === 80 &&
          bytes[2] === 78 &&
          bytes[3] === 71,
        jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      if (!png && !jpg) throw Error("Image type does not match its content.");
      const bitmap = await createImageBitmap(file);
      const pixels = bitmap.width * bitmap.height;
      bitmap.close();
      if (pixels > 16000000)
        throw Error("Image exceeds 16 megapixels. Resize it first.");
      progress("Recognizing English text locally…");
      const text = await ocr(file);
      check();
      return {
        id,
        name,
        pages: [{ id: id + "-image", label: "Image 1", text }],
      };
    }
    throw Error("Supported files: PDF, DOCX, UTF-8 TXT, JPG and PNG.");
  } catch (e) {
    if (signal.aborted) throw Error("Extraction cancelled.");
    if ((e as Error).name === "PasswordException")
      throw Error(
        "This PDF is password-protected. Unlock a copy with your password before uploading.",
      );
    throw e;
  } finally {
    signal.removeEventListener("abort", abort);
    await worker?.terminate().catch(() => {});
    await loading?.destroy().catch(() => {});
  }
}
