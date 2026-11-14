import type { DocumentSource } from "./index";
/** Lossless contiguous sections; no overlap, no silent omissions or synthetic source text. */
export function splitDocumentBatch(
  documents: DocumentSource[],
): DocumentSource[][] {
  if (!documents.length || documents.length > 5)
    throw Error("Choose one to five documents.");
  const batches: DocumentSource[][] = [];
  for (const document of documents) {
    let pages: DocumentSource["pages"] = [],
      length = 0;
    const flush = () => {
      if (pages.length) {
        batches.push([{ id: document.id, name: document.name, pages }]);
        pages = [];
        length = 0;
      }
    };
    for (const [pageIndex, page] of document.pages.entries()) {
      if (!page.text.trim())
        throw Error(
          "Review empty source pages before batch processing; no page is silently skipped.",
        );
      let offset = 0,
        part = 0;
      while (offset < page.text.length) {
        if (length === 24000 || pages.length === 100) flush();
        let end = Math.min(page.text.length, offset + 24000 - length);
        // Do not split UTF-16 surrogate pairs.
        if (
          end < page.text.length &&
          /[\uD800-\uDBFF]/.test(page.text[end - 1])
        )
          end--;
        if (end === offset) {
          flush();
          continue;
        }
        const text = page.text.slice(offset, end);
        part++;
        pages.push({
          id: `${document.id.slice(0, 65)}-page-${pageIndex + 1}-part-${part}`,
          label: `${page.label.slice(0, 45)} · chars ${offset + 1}–${end}`,
          text,
        });
        length += text.length;
        offset = end;
      }
    }
    flush();
  }
  if (!batches.length || batches.length > 30)
    throw Error(
      "This selection requires more than 30 jobs. Select fewer documents or pages; nothing has been submitted.",
    );
  return batches;
}
