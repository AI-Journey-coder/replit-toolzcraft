export function redactText(text: string, terms: string[], automatic: boolean) {
  let result = text;
  for (const term of [
    ...new Set(terms.map((t) => t.trim()).filter(Boolean)),
  ].sort((a, b) => b.length - a.length))
    result = result.split(term).join("[REDACTED]");
  if (automatic)
    result = result
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL REDACTED]")
      .replace(/(?<!\w)(?:\+\d[\d ()-]{7,}\d)(?!\w)/g, "[PHONE REDACTED]");
  return result;
}
