import { useEffect, useState } from "react";
import {
  checkFinancialCalculation,
  type FinancialOperand,
} from "@workspace/document-intelligence";
import type {
  DocumentSource,
  IntelligenceResult,
} from "@workspace/document-intelligence";
import { Button } from "@/components/ui/button";

export function DocumentFinancialChecks({
  documents,
  disabled,
  onResult,
}: {
  documents: DocumentSource[];
  disabled: boolean;
  onResult: (result: IntelligenceResult) => void;
}) {
  const [mode, setMode] = useState<"sum" | "difference" | "growth">("sum"),
    [operands, setOperands] = useState<FinancialOperand[]>([]),
    [source, setSource] = useState(""),
    [quote, setQuote] = useState(""),
    [value, setValue] = useState(""),
    [unit, setUnit] = useState(""),
    [error, setError] = useState("");
  const version = JSON.stringify(documents);
  useEffect(() => {
    setOperands([]);
    setSource("");
    setQuote("");
    setValue("");
    setUnit("");
    setError("");
  }, [version]);
  const pages = documents.flatMap((d) =>
      d.pages.map((p) => ({ ...p, name: d.name })),
    ),
    input = "block w-full rounded border bg-background p-2";
  return (
    <details className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">
        Financial arithmetic & reconciliation · Free
      </summary>
      <p className="text-sm">
        Select exact printed values and their evidence. No currency, scale,
        reporting period or line-item match is guessed. Use plain decimals;
        formatted or ambiguous numbers need source review first.
      </p>
      <label className="block">
        Calculation
        <select
          className={input}
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as typeof mode);
            setOperands([]);
            setError("");
          }}
        >
          <option value="sum">
            Components versus stated total (add total last)
          </option>
          <option value="difference">
            Compare two amounts (second minus first)
          </option>
          <option value="growth">
            Year/period growth (previous first, current second)
          </option>
        </select>
      </label>
      <label className="block">
        Financial source page
        <select
          className={input}
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setQuote("");
            setValue("");
          }}
        >
          <option value="">Choose evidence page</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Exact financial evidence excerpt
        <textarea
          className={input}
          value={quote}
          maxLength={2000}
          onChange={(e) => setQuote(e.target.value)}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Printed decimal value
          <input
            className={input}
            value={value}
            maxLength={40}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <label>
          Currency/unit and scale
          <input
            className={input}
            placeholder="e.g. INR units or USD millions"
            value={unit}
            maxLength={40}
            onChange={(e) => setUnit(e.target.value)}
          />
        </label>
      </div>
      <Button
        variant="outline"
        disabled={
          disabled ||
          !source ||
          !quote ||
          !value ||
          !unit ||
          operands.length >= (mode === "sum" ? 20 : 2)
        }
        onClick={() => {
          setOperands([...operands, { sourceId: source, quote, value, unit }]);
          setQuote("");
          setValue("");
        }}
      >
        Add source value
      </Button>
      <ol className="space-y-2">
        {operands.map((o, i) => (
          <li
            key={i}
            className="flex flex-wrap items-center justify-between gap-2 rounded border p-2"
          >
            <span>
              {i + 1}. {o.value} {o.unit}
            </span>
            <Button
              variant="ghost"
              onClick={() => setOperands(operands.filter((_, j) => i !== j))}
            >
              Remove value {i + 1}
            </Button>
          </li>
        ))}
      </ol>
      <Button
        disabled={disabled || operands.length < 2}
        onClick={() => {
          try {
            onResult(checkFinancialCalculation(documents, mode, operands));
            setError("");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Verify selected calculation
      </Button>
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
