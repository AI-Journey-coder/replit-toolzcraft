import type { DocumentSource, IntelligenceResult } from "./index";
export type DocumentRule = {
  label: string;
  field: string;
  operator: "contains" | "absent" | "equals" | "minimum" | "maximum";
  expected: string;
};
export function compareDecimal(a: string, b: string) {
  if (
    !/^-?\d+(\.\d+)?$/.test(a) ||
    !/^-?\d+(\.\d+)?$/.test(b) ||
    a.length > 1000 ||
    b.length > 1000
  )
    throw Error("Use bounded plain decimal numbers.");
  const scale = Math.max(
    (a.split(".")[1] || "").length,
    (b.split(".")[1] || "").length,
  );
  const integer = (s: string) => {
    const negative = s.startsWith("-");
    const [whole, fraction = ""] = s.replace(/^-/, "").split(".");
    return BigInt((negative ? "-" : "") + whole + fraction.padEnd(scale, "0"));
  };
  const x = integer(a),
    y = integer(b);
  return x < y ? -1 : x > y ? 1 : 0;
}
export function validateRules(value: unknown): DocumentRule[] {
  if (!Array.isArray(value) || value.length > 30)
    throw Error("Use up to 30 rules.");
  return value.map((r) => {
    if (
      !r ||
      typeof r.label !== "string" ||
      !r.label.trim() ||
      r.label.length > 100 ||
      typeof r.field !== "string" ||
      !r.field.trim() ||
      r.field.length > 100 ||
      typeof r.expected !== "string" ||
      r.expected.length > 200 ||
      !["contains", "absent", "equals", "minimum", "maximum"].includes(
        r.operator,
      )
    )
      throw Error("Invalid rule.");
    if (
      ["minimum", "maximum"].includes(r.operator) &&
      (!/^-?\d+(\.\d+)?$/.test(r.expected) ||
        !Number.isFinite(Number(r.expected)))
    )
      throw Error("Numeric rules require a finite decimal value.");
    return {
      label: r.label,
      field: r.field,
      operator: r.operator,
      expected: r.expected,
    };
  });
}
export function runRules(
  documents: DocumentSource[],
  rules: DocumentRule[],
): IntelligenceResult {
  const result: IntelligenceResult = { findings: [], missing: [], checks: [] };
  const lines = documents.flatMap((d) =>
    d.pages.flatMap((p) =>
      p.text.split(/\r?\n/).map((text) => ({ text, sourceId: p.id })),
    ),
  );
  for (const rule of validateRules(rules)) {
    const candidates = lines.filter((l) =>
      l.text.toLowerCase().includes(rule.field.toLowerCase()),
    );
    if (!candidates.length) {
      result.checks.push({
        label: rule.label,
        status: "unavailable",
        detail: "No matching field found in the selected text.",
      });
      continue;
    }
    const values = candidates.map((l) => ({
      line: l,
      value: l.text
        .slice(
          l.text.toLowerCase().indexOf(rule.field.toLowerCase()) +
            rule.field.length,
        )
        .replace(/^\s*[:=]?\s*/, "")
        .trim(),
    }));
    if (values.length !== 1) {
      result.checks.push({
        label: rule.label,
        status: "review",
        detail: "Multiple matching fields; select an unambiguous section.",
      });
      continue;
    }
    const { line, value } = values[0];
    let pass = false;
    if (rule.operator === "contains")
      pass = value.toLowerCase().includes(rule.expected.toLowerCase());
    else if (rule.operator === "absent")
      pass = !value.toLowerCase().includes(rule.expected.toLowerCase());
    else if (rule.operator === "equals") pass = value === rule.expected;
    else {
      if (!/^-?\d+(\.\d+)?$/.test(value) || value.length > 1000) {
        result.checks.push({
          label: rule.label,
          status: "unavailable",
          detail:
            "Field is not a single bounded plain decimal. Currency, units and ambiguous formatting require review.",
        });
        continue;
      }
      pass =
        rule.operator === "minimum"
          ? compareDecimal(value, rule.expected) >= 0
          : compareDecimal(value, rule.expected) <= 0;
    }
    result.findings.push({
      label: rule.label,
      value: value || "(empty)",
      sourceId: line.sourceId,
      quote: line.text,
      status: "review",
    });
    result.checks.push({
      label: rule.label,
      status: pass ? "pass" : "review",
      detail: `${rule.field}: ${rule.operator} ${rule.expected} — ${pass ? "matched" : "did not match"}. Checks only the selected text.`,
    });
  }
  return result;
}
export function duplicateInvoiceReferences(
  documents: DocumentSource[],
): IntelligenceResult {
  const result: IntelligenceResult = { findings: [], missing: [], checks: [] };
  const references = new Map<
    string,
    { doc: string; sourceId: string; quote: string; value: string }[]
  >();
  for (const d of documents)
    for (const p of d.pages)
      for (const line of p.text.split(/\r?\n/)) {
        const match =
          /\binvoice\s*(?:number|no\.?|#|reference)\s*[:#-]?\s*([A-Z0-9][A-Z0-9 /_-]{1,60})\s*$/i.exec(
            line,
          );
        if (!match) continue;
        const value = match[1].trim(),
          key = value.toUpperCase().replace(/\s+/g, "");
        const group = references.get(key) || [];
        group.push({ doc: d.id, sourceId: p.id, quote: line, value });
        references.set(key, group);
      }
  for (const group of references.values())
    if (new Set(group.map((g) => g.doc)).size > 1)
      for (const g of group)
        result.findings.push({
          label: "Possible duplicate invoice reference",
          value: g.value,
          sourceId: g.sourceId,
          quote: g.quote,
          status: "review",
        });
  result.checks.push({
    label: "Duplicate invoice references",
    status: result.findings.length ? "review" : "unavailable",
    detail: result.findings.length
      ? "Matching references occur in different files. Compare suppliers and dates before treating them as duplicates."
      : "No repeated explicit invoice-reference lines found. This does not prove every invoice is unique.",
  });
  return result;
}
