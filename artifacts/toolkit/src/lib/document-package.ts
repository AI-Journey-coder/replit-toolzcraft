import { zipSync, strToU8, unzipSync } from "fflate";
const xml = (s: string) =>
  s
    .replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c]!,
    )
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
function download(data: Uint8Array, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function buildWord(text: string, theme: string = "classic") {
  if (text.length > 200000)
    throw Error("Word export is limited to 200,000 characters.");
  const files = {
    "[Content_Types].xml": strToU8(
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    ),
    "_rels/.rels": strToU8(
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    ),
    "word/document.xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
        text
          .split("\n")
          .map(
            (line) =>
              '<w:p><w:r><w:rPr><w:sz w:val="' + (theme === 'compact' ? 20 : theme === 'large-print' ? 32 : 24) + '"/></w:rPr><w:t xml:space="preserve">' +
              xml(line) +
              "</w:t></w:r></w:p>",
          )
          .join("") +
        "<w:sectPr/></w:body></w:document>",
    ),
  };
  return zipSync(files);
}
export function exportWord(text: string, theme: string = "classic") {
  download(
    buildWord(text, theme),
    "document-report.docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
}
export function buildExcel(rows: string[][]) {
  if (rows.length > 10000 || rows.some((r) => r.length > 100))
    throw Error("Excel export exceeds 10,000 rows or 100 columns.");
  const files = {
    "[Content_Types].xml": strToU8(
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    ),
    "_rels/.rels": strToU8(
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    ),
    "xl/workbook.xml": strToU8(
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Extracted data" sheetId="1" r:id="r1"/></sheets></workbook>',
    ),
    "xl/_rels/workbook.xml.rels": strToU8(
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    ),
    "xl/worksheets/sheet1.xml": strToU8(
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
        rows
          .map(
            (row, i) =>
              '<row r="' +
              (i + 1) +
              '">' +
              row
                .map(
                  (cell) =>
                    '<c t="inlineStr"><is><t xml:space="preserve">' +
                    xml(cell) +
                    "</t></is></c>",
                )
                .join("") +
              "</row>",
          )
          .join("") +
        "</sheetData></worksheet>",
    ),
  };
  return zipSync(files);
}
export function exportExcel(rows: string[][], name = "document-table.xlsx") {
  download(
    buildExcel(rows),
    name,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}
export async function expandDocumentZip(file: File): Promise<File[]> {
  if (file.size > 20 * 1024 * 1024) throw Error("ZIP exceeds 20 MB.");
  let total = 0,
    count = 0;
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (e) => {
      if (e.name.endsWith("/")) return false;
      if (!/\.(pdf|docx|txt|png|jpe?g)$/i.test(e.name))
        throw Error("ZIP contains unsupported files; include documents only.");
      count++;
      total += e.originalSize;
      if (
        count > 5 ||
        e.originalSize > 20 * 1024 * 1024 ||
        total > 50 * 1024 * 1024
      )
        throw Error(
          "ZIP exceeds five documents, 20 MB per file or 50 MB expanded.",
        );
      return true;
    },
  });
  const decoded = Object.entries(entries);
  if (!decoded.length) throw Error("ZIP contains no supported documents.");
  if (
    decoded.some(([, data]) => data.length > 20 * 1024 * 1024) ||
    decoded.reduce((sum, [, data]) => sum + data.length, 0) > 50 * 1024 * 1024
  )
    throw Error("ZIP expanded size exceeds the document limits.");
  return decoded.map(
    ([path, data]) =>
      new File(
        [new Uint8Array(data)],
        path.split(/[\\/]/).at(-1) || "document",
        {
          type: /\.png$/i.test(path)
            ? "image/png"
            : /\.jpe?g$/i.test(path)
              ? "image/jpeg"
              : "",
        },
      ),
  );
}
