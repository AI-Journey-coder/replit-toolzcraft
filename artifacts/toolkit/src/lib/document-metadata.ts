import { franc } from "franc-min";
export function detectDocumentLanguage(text: string) {
  const sample = text.slice(0, 30000).replace(/\s+/g, " ").trim();
  const code = franc(sample, { minLength: 100 });
  return code === "und"
    ? "Undetermined (insufficient text)"
    : `${code} (ISO 639-3; automatic estimate)`;
}
export function documentStructure(text: string) {
  const lines = text.split(/\r?\n/);
  return {
    paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim()).length,
    headings: lines.filter(
      (l) =>
        /^(?:#{1,6}\s|\d+(?:\.\d+)*[.)]?\s+[A-Z])/.test(l.trim()) ||
        /^[A-Z][A-Z\s:—-]{3,80}$/.test(l.trim()),
    ),
    dates: Array.from(
      new Set(
        text.match(
          /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/gi,
        ) || [],
      ),
    ),
  };
}
