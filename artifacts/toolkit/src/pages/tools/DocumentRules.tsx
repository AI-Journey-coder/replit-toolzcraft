import { useState } from "react";
import {
  runRules,
  duplicateInvoiceReferences,
  type DocumentSource,
  type IntelligenceResult,
  type DocumentRule,
} from "@workspace/document-intelligence";
import { Button } from "@/components/ui/button";
export function DocumentRules({
  documents,
  disabled,
  onResult,
}: {
  documents: DocumentSource[];
  disabled: boolean;
  onResult: (r: IntelligenceResult) => void;
}) {
  const [rules, setRules] = useState<DocumentRule[]>([]),
    [field, setField] = useState(""),
    [expected, setExpected] = useState(""),
    [operator, setOperator] = useState<DocumentRule["operator"]>("contains"),
    [error, setError] = useState("");
  return (
    <details className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">
        Deterministic validation rules · Free
      </summary>
      <p className="text-xs">
        Match a named field on a single source line. Repeated fields and
        ambiguous numbers require review. These checks do not certify
        authenticity or compliance.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label>
          Field label
          <input
            className="block w-full rounded border bg-background p-2"
            value={field}
            maxLength={100}
            onChange={(e) => setField(e.target.value)}
          />
        </label>
        <label>
          Condition
          <select
            className="block w-full rounded border bg-background p-2"
            value={operator}
            onChange={(e) =>
              setOperator(e.target.value as DocumentRule["operator"])
            }
          >
            {["contains", "absent", "equals", "minimum", "maximum"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Expected value
          <input
            className="block w-full rounded border bg-background p-2"
            value={expected}
            maxLength={200}
            onChange={(e) => setExpected(e.target.value)}
          />
        </label>
      </div>
      <Button
        variant="outline"
        disabled={disabled || !field.trim() || rules.length >= 30}
        onClick={() => {
          setRules([...rules, { label: field, field, operator, expected }]);
          setField("");
          setExpected("");
        }}
      >
        Add validation rule
      </Button>
      <ul>
        {rules.map((r, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span>
              {r.field} {r.operator} {r.expected}
            </span>
            <Button
              variant="ghost"
              onClick={() => setRules(rules.filter((_, j) => j !== i))}
            >
              Remove rule {i + 1}
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled || !documents.length || !rules.length}
          onClick={() => {
            try {
              onResult(runRules(documents, rules));
              setError("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Run validation rules
        </Button>
        <Button
          variant="outline"
          disabled={disabled || documents.length < 2}
          onClick={() => onResult(duplicateInvoiceReferences(documents))}
        >
          Check duplicate invoice references
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
