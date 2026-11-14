import type { DocumentSource } from "./index";
export type DiffLine = { text: string; sourceId: string };
export type DiffRow = {
  kind: "same" | "added" | "removed";
  before?: DiffLine;
  after?: DiffLine;
};
export function compareDocumentLines(
  original: DocumentSource,
  revised: DocumentSource,
): DiffRow[] {
  const lines = (d: DocumentSource) =>
    d.pages.flatMap((p) =>
      p.text
        .split(/\r?\n/)
        .filter((t) => t.trim())
        .map((text) => ({ text, sourceId: p.id })),
    );
  const a = lines(original),
    b = lines(revised);
  if (a.length > 1500 || b.length > 1500)
    throw Error(
      "Compare up to 1,500 non-empty lines per document. Select fewer sections; no lines are omitted.",
    );
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  const aa = a.map((l) => norm(l.text)),
    bb = b.map((l) => norm(l.text));
  const width = b.length + 1,
    dp = new Uint16Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i * width + j] =
        aa[i] === bb[j]
          ? 1 + dp[(i + 1) * width + j + 1]
          : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
  const rows: DiffRow[] = [];
  let i = 0,
    j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && aa[i] === bb[j]) {
      rows.push({ kind: "same", before: a[i++], after: b[j++] });
    } else if (
      i < a.length &&
      (j === b.length || dp[(i + 1) * width + j] >= dp[i * width + j + 1])
    )
      rows.push({ kind: "removed", before: a[i++] });
    else rows.push({ kind: "added", after: b[j++] });
  }
  return rows;
}
