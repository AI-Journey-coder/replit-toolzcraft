import { useEffect, useRef, useState } from "react";
import {
  splitDocumentBatch,
  type DocumentSource,
} from "@workspace/document-intelligence";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
type Item = {
  documents: DocumentSource[];
  action: string;
  documentType: string;
  question: string;
  history: never[];
  requestId: string;
  fingerprint: string;
  credits: number;
  submitted: boolean;
};
export function DocumentBatch({
  documents,
  documentType,
  disabled,
}: {
  documents: DocumentSource[];
  documentType: string;
  disabled: boolean;
}) {
  const { firebaseUser } = useAuth(),
    [action, setAction] = useState("overview"),
    [items, setItems] = useState<Item[]>([]),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const generation = useRef(0),
    stop = useRef(false),
    version = JSON.stringify(documents);
  useEffect(() => {
    generation.current++;
    stop.current = true;
    setItems([]);
    setConsent(false);
    setMessage("");
  }, [version, documentType, action, firebaseUser?.uid]);
  useEffect(
    () => () => {
      generation.current++;
      stop.current = true;
    },
    [],
  );
  async function request(path: string, method = "GET", body?: unknown) {
    if (!firebaseUser) throw Error("Sign in for background processing.");
    const r = await fetch(apiUrl(path), {
      method,
      headers: {
        Authorization: "Bearer " + (await firebaseUser.getIdToken()),
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await r.json();
    if (!r.ok) throw Error(data.message || "Batch request failed.");
    return data;
  }
  async function prepare() {
    stop.current = false;
    const g = generation.current;
    setBusy(true);
    setMessage("");
    setItems([]);
    setConsent(false);
    try {
      const queue = await request("/document-jobs");
      if (!queue.enabled) throw Error("Background worker is not enabled.");
      const chunks = splitDocumentBatch(documents),
        plan: Item[] = [];
      for (const chunk of chunks) {
        if (g !== generation.current || stop.current) return;
        const body = {
            documents: chunk,
            action,
            documentType,
            question: "",
            history: [] as never[],
          },
          quote = await request("/document-intelligence/quote", "POST", body);
        if (g !== generation.current) return;
        plan.push({
          ...body,
          requestId: crypto.randomUUID(),
          fingerprint: quote.fingerprint,
          credits: quote.credits,
          submitted: false,
        });
      }
      setItems(plan);
    } catch (e) {
      if (g === generation.current) setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    const g = generation.current;
    stop.current = false;
    setBusy(true);
    setMessage("");
    let submitted = items.filter((i) => i.submitted).length;
    try {
      for (const item of items) {
        if (item.submitted) continue;
        if (g !== generation.current || stop.current) break;
        await request("/document-jobs", "POST", { ...item, consent: true });
        if (g !== generation.current) return;
        submitted++;
        setItems((previous) =>
          previous.map((p) =>
            p.requestId === item.requestId ? { ...p, submitted: true } : p,
          ),
        );
      }
      if (g === generation.current)
        setMessage(
          `${submitted} of ${items.length} jobs submitted. Open Background processing & job history to review or cancel them. Each section is analyzed independently; this is not a whole-document synthesis.`,
        );
    } catch (e) {
      if (g === generation.current)
        setMessage(
          `${submitted} jobs accepted. ${(e as Error).message} Retry submission to reuse the same IDs without duplicate charges.`,
        );
    } finally {
      setBusy(false);
    }
  }
  if (!firebaseUser) return null;
  return (
    <details className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">
        Batch & long-document processing
      </summary>
      <p className="text-sm">
        Process all selected text as separate, contiguous sections of up to
        24,000 characters. Page labels retain character ranges. No text is
        omitted. Sections do not share context, so review their results together
        before drawing conclusions about the complete document.
      </p>
      <label className="block">
        Batch action
        <select
          className="block w-full rounded border bg-background p-2"
          disabled={busy}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="overview">Section overviews</option>
          <option value="detailed">Detailed section findings</option>
          <option value="facts">Extract facts</option>
          <option value="deadlines">Extract deadlines</option>
          <option value="amounts">Extract amounts</option>
          <option value="actions">Extract action items</option>
        </select>
      </label>
      <Button
        variant="outline"
        disabled={busy || disabled || !documents.length}
        onClick={() => void prepare()}
      >
        Prepare batch & exact credit quote
      </Button>
      {items.length > 0 && (
        <>
          <p>
            {items.length} jobs · up to{" "}
            {items.reduce((n, i) => n + i.credits, 0)} credits total, charged
            only for successful jobs.
          </p>
          <ul className="max-h-48 overflow-auto text-sm">
            {items.map((i, n) => (
              <li key={i.requestId}>
                {n + 1}. {i.documents[0].name} · {i.documents[0].pages[0].label}{" "}
                · {i.credits} credits ·{" "}
                {i.submitted ? "Submitted" : "Not submitted"}
              </li>
            ))}
          </ul>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              disabled={busy}
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I authorize the displayed jobs and maximum total credit cost.
            Successful sections can be charged even if another section fails.
            Queued text is retained for up to 24 hours.
          </label>
          <Button
            disabled={
              busy || disabled || !consent || items.every((i) => i.submitted)
            }
            onClick={() => void submit()}
          >
            Submit batch jobs
          </Button>
        </>
      )}
      {busy && (
        <Button
          variant="outline"
          onClick={() => {
            stop.current = true;
          }}
        >
          Stop further submissions
        </Button>
      )}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
