import { getPdfjs } from "./pdfjs";
import type { DocumentSource } from "@workspace/document-intelligence";
export async function readDocument(
  file: File,
  id: string,
  progress: (s: string) => void,
  signal: AbortSignal,
  options: {
    password?: string;
    language?: string;
    forceOcr?: boolean;
    maxMegabytes?: number;
    maxPdfPages?: number;
  } = {},
): Promise<DocumentSource> {
  const maxMegabytes = options.maxMegabytes ?? 20,
    maxPdfPages = options.maxPdfPages ?? 20;
  if (
    !Number.isInteger(maxMegabytes) ||
    maxMegabytes < 1 ||
    maxMegabytes > 20 ||
    !Number.isInteger(maxPdfPages) ||
    maxPdfPages < 1 ||
    maxPdfPages > 20
  )
    throw Error("Choose whole-number extraction limits from 1 to 20.");
  if (!file.size || file.size > maxMegabytes * 1024 * 1024)
    throw Error(`Choose a non-empty file up to ${maxMegabytes} MB.`);
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
      const language = options.language || "eng";
      if (
        ![
          "eng",
          "eng+hin",
          "eng+mar",
          "fra",
          "deu",
          "spa",
          "ara",
          "jpn",
          "chi_sim",
        ].includes(language)
      )
        throw Error("Unsupported OCR language.");
      worker = await createWorker(language);
      check();
    }
    return (await worker.recognize(input, {}, { text: true, blocks: true }))
      .data;
  };
  const ocrDetails = (data: Awaited<ReturnType<typeof ocr>>) => ({
    ocrConfidence: data.confidence,
    uncertainWords: Array.from(
      new Set(
        (data.blocks || []).flatMap((b) =>
          b.paragraphs.flatMap((p) =>
            p.lines.flatMap((l) =>
              l.words.filter((w) => w.confidence < 70).map((w) => w.text),
            ),
          ),
        ),
      ),
    ),
  });
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
          (e.name === "word/document.xml" && e.originalSize <= 4000000) ||
          (e.name === "docProps/core.xml" && e.originalSize <= 64000),
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
      const metadata: Record<string, string> = {};
      if (entries["docProps/core.xml"]) {
        const coreXml = strFromU8(entries["docProps/core.xml"]);
        if (!/<!DOCTYPE|<!ENTITY/i.test(coreXml)) {
          const core = new DOMParser().parseFromString(
            coreXml,
            "application/xml",
          );
          for (const [tag, label] of [
            ["title", "Title"],
            ["creator", "Author"],
            ["created", "Created"],
            ["modified", "Modified"],
            ["language", "Declared language"],
          ]) {
            const value = core
              .getElementsByTagNameNS("*", tag)[0]
              ?.textContent?.trim();
            if (value) metadata[label] = value.slice(0, 1000);
          }
        }
      }
      return { id, name, pages, metadata };
    }
    if (extension === "pdf") {
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
        throw Error("Invalid PDF signature.");
      const lib = await getPdfjs();
      loading = lib.getDocument({ data: bytes, password: options.password });
      const pdf = await loading.promise;
      const metadata: Record<string, string> = {};
      try {
        const { info } = await pdf.getMetadata();
        for (const field of [
          "Title",
          "Author",
          "Subject",
          "CreationDate",
          "ModDate",
        ]) {
          const value = (info as any)[field];
          if (typeof value === "string" && value.trim())
            metadata[field] = value.slice(0, 1000);
        }
      } catch {}
      if (pdf.numPages > maxPdfPages)
        throw Error(
          `Choose a PDF with up to ${maxPdfPages} pages. Split larger files first.`,
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
          const annotations = await page.getAnnotations({ intent: "display" });
          const fields = annotations
            .filter((a: any) => a.subtype === "Widget")
            .map((a: any) => {
              const label = String(
                a.fieldName || a.alternativeText || "Unnamed field",
              ).slice(0, 200);
              if (a.fieldType === "Sig")
                return (
                  label +
                  ": PDF signature field present; cryptographic validity and actual signing are not established."
                );
              if (a.checkBox)
                return (
                  label +
                  ": checkbox value " +
                  JSON.stringify(a.fieldValue ?? "not supplied")
                );
              return (
                label + ": " + String(a.fieldValue ?? "(empty)").slice(0, 2000)
              );
            });
          let details: ReturnType<typeof ocrDetails> | undefined;
          if (!text.trim() || options.forceOcr) {
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
              const recognized = await ocr(canvas);
              text = recognized.text;
              details = ocrDetails(recognized);
            } finally {
              canvas.width = canvas.height = 0;
            }
          }
          if (fields.length)
            text +=
              "\n[Embedded PDF form values — review against the visible page]\n" +
              fields.join("\n");
          characters += text.length;
          if (characters > 200000)
            throw Error(
              "Document exceeds 200,000 extracted characters. Split it first.",
            );
          pages.push({
            id: id + "-p" + i,
            label: "Page " + i,
            text,
            ...details,
          });
        } finally {
          page.cleanup();
        }
      }
      return { id, name, pages, metadata };
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
      progress("Recognizing text locally in the selected language…");
      const recognized = await ocr(file);
      const text = recognized.text;
      check();
      return {
        id,
        name,
        pages: [
          {
            id: id + "-image",
            label: "Image 1",
            text,
            ...ocrDetails(recognized),
          },
        ],
      };
    }
    throw Error("Supported files: PDF, DOCX, UTF-8 TXT, JPG and PNG.");
  } catch (e) {
    if (signal.aborted) throw Error("Extraction cancelled.");
    if ((e as Error).name === "PasswordException")
      throw Error(
        "This PDF needs the correct password. Enter it in extraction settings, then select the file again.",
      );
    throw e;
  } finally {
    signal.removeEventListener("abort", abort);
    await worker?.terminate().catch(() => {});
    await loading?.destroy().catch(() => {});
  }
}
