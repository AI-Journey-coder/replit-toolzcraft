import type { DocumentSource, IntelligenceResult } from "./index";

export type FinancialOperand = {
  sourceId: string;
  quote: string;
  value: string;
  unit: string;
};
function decimal(raw: string) {
  if (!/^-?\d{1,30}(?:\.\d{1,6})?$/.test(raw))
    throw Error(
      "Use a plain decimal with up to six decimal places; review separators and units first.",
    );
  const [whole, fraction = ""] = raw.split(".");
  return BigInt(whole + fraction.padEnd(6, "0"));
}
function display(value: bigint) {
  const negative = value < 0n;
  const s = (negative ? -value : value).toString().padStart(7, "0");
  return (
    (negative ? "-" : "") +
    s.slice(0, -6) +
    ("." + s.slice(-6)).replace(/0+$/, "").replace(/\.$/, "")
  );
}
/** Explicit source selections only: never infer a reporting period, currency or scale. */
export function checkFinancialCalculation(
  documents: DocumentSource[],
  mode: "sum" | "difference" | "growth",
  operands: FinancialOperand[],
): IntelligenceResult {
  if (
    !["sum", "difference", "growth"].includes(mode) ||
    !Array.isArray(operands) ||
    operands.length < 2 ||
    operands.length > 20 ||
    (mode !== "sum" && operands.length !== 2)
  )
    throw Error("Choose two values, or up to 20 for a total check.");
  const values = operands.map((o) => {
    const page = documents
      .flatMap((d) => d.pages)
      .find((p) => p.id === o.sourceId);
    if (
      !page ||
      !o.quote.trim() ||
      !page.text.includes(o.quote) ||
      !o.value ||
      !o.quote.includes(o.value) ||
      !/^[A-Za-z][A-Za-z0-9 /_-]{0,39}$/.test(o.unit)
    )
      throw Error(
        "Every value needs an exact source excerpt and an explicit currency/unit and scale.",
      );
    // A number inside another number is not source evidence for the selected amount.
    const at = o.quote.indexOf(o.value);
    if (
      /[\d.,-]/.test(o.quote[at - 1] || "") ||
      /[\d.,]/.test(o.quote[at + o.value.length] || "")
    )
      throw Error(
        "Select the whole printed number, without changing its separators.",
      );
    return decimal(o.value);
  });
  if (new Set(operands.map((o) => o.unit.trim().toUpperCase())).size !== 1)
    throw Error(
      "Units, currencies and scales must match. No exchange-rate or scale conversion is inferred.",
    );
  const result: IntelligenceResult = {
    findings: operands.map((o, i) => ({
      label:
        mode === "growth"
          ? i
            ? "Current period (selected)"
            : "Previous period (selected)"
          : mode === "sum" && i === operands.length - 1
            ? "Stated total (selected)"
            : `Selected value ${i + 1}`,
      value: o.value,
      sourceId: o.sourceId,
      quote: o.quote,
      status: "extracted",
    })),
    missing: [],
    checks: [],
  };
  let detail: string,
    status: "pass" | "review" | "unavailable" = "review";
  if (mode === "sum") {
    const expected = values.slice(0, -1).reduce((a, b) => a + b, 0n),
      actual = values.at(-1)!;
    status = expected === actual ? "pass" : "review";
    detail = `Selected components total ${display(expected)}; stated total ${display(actual)}; difference ${display(actual - expected)} ${operands[0].unit}. Exact decimal arithmetic, no rounding tolerance. This checks only the selected components.`;
  } else if (mode === "difference")
    detail = `Second minus first: ${display(values[1] - values[0])} ${operands[0].unit}. Verify both selections describe the same item, quantity and reporting period before reconciling.`;
  else if (values[0] <= 0n) {
    status = "unavailable";
    detail =
      "Growth percentage is not calculated for a zero or negative baseline. Review the reporting convention.";
  } else {
    const numerator = (values[1] - values[0]) * 10000n,
      negative = numerator < 0n;
    const hundredths =
      ((negative ? -numerator : numerator) + values[0] / 2n) / values[0];
    detail = `Change: ${display(values[1] - values[0])} ${operands[0].unit}; growth ${negative ? "-" : ""}${hundredths / 100n}.${(hundredths % 100n).toString().padStart(2, "0")}% (rounded to two decimals). Period ordering and matching units were selected by you, not inferred.`;
  }
  result.checks.push({
    label:
      mode === "sum"
        ? "Arithmetic reconciliation"
        : mode === "growth"
          ? "Period-over-period change"
          : "Value comparison",
    status,
    detail,
  });
  return result;
}
