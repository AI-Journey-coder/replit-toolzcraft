// Rasterized pages preserve the browser's Unicode text rendering in exported reports.
// The TXT/JSON alternatives preserve machine-readable text and source identifiers.
export async function downloadDocumentReport(text: string, theme: string = "classic") {
  if (text.length > 100000)
    throw Error(
      "Select a smaller report for PDF export (100,000 characters maximum). TXT and JSON remain available.",
    );
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const canvas = document.createElement("canvas");
  canvas.width = 1190;
  canvas.height = 1684;
  const c = canvas.getContext("2d");
  if (!c) throw Error("Canvas is unavailable. Use TXT export.");
  const width = 1030,
    lineHeight = theme === "compact" ? 25 : theme === "large-print" ? 38 : 31;
  const fontSize = theme === "compact" ? 18 : theme === "large-print" ? 28 : 22;
  const lines: string[] = [];
  c.font = fontSize + "px sans-serif";
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const character of Array.from(paragraph)) {
      if (c.measureText(line + character).width > width) {
        lines.push(line);
        line = character;
      } else line += character;
    }
    lines.push(line);
  }
  const perPage = theme === "compact" ? 55 : theme === "large-print" ? 36 : 46;
  if (Math.ceil(lines.length / perPage) > 50)
    throw Error(
      "Report exceeds 50 PDF pages. Use TXT or select fewer findings.",
    );
  try {
    for (let start = 0; start < lines.length; start += perPage) {
      c.fillStyle = "white";
      c.fillRect(0, 0, 1190, 1684);
      c.fillStyle = "#12382e";
      c.font = "bold 28px sans-serif";
      c.fillText("ToolzCraft · Document Intelligence", 80, 80);
      c.font = fontSize + "px sans-serif";
      c.fillStyle = "#16221f";
      lines
        .slice(start, start + perPage)
        .forEach((line, i) => c.fillText(line, 80, 140 + i * lineHeight));
      c.font = "18px sans-serif";
      c.fillText(
        "Report page " +
          (Math.floor(start / perPage) + 1) +
          " · Verify findings against source",
        80,
        1610,
      );
      const image = await pdf.embedPng(canvas.toDataURL("image/png"));
      pdf
        .addPage([595, 842])
        .drawImage(image, { x: 0, y: 0, width: 595, height: 842 });
    }
    const bytes = await pdf.save();
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "document-evidence-report.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    canvas.width = canvas.height = 0;
  }
}
