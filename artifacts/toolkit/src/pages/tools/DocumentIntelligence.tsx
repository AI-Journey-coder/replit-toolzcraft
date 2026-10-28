import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  FileText,
  Upload,
  SearchCheck,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  ACTIONS,
  DOCUMENT_TYPES,
  classify,
  localInvoice,
  normalize,
  pagesFromText,
  validateSources,
  type DocumentSource,
  type DocumentType,
  type IntelligenceAction,
  type IntelligenceResult,
  type Finding,
} from "@workspace/document-intelligence";
import { readDocument } from "@/lib/document-reader";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DocumentPreview } from "./DocumentPreview";
import { downloadDocumentReport } from "@/lib/document-report";
import { csv } from "@/lib/document-results";
type LocalDocument = DocumentSource & {
  file?: File;
  hash?: string;
  originals: Record<string, string>;
};
const labels: Record<IntelligenceAction, string> = {
  overview: "Executive overview",
  detailed: "Detailed findings",
  facts: "Key facts",
  deadlines: "Dates & deadlines",
  amounts: "Financial amounts",
  actions: "Action items",
  simplify: "Explain simply",
  questions: "Ask a question",
  compare: "Compare documents",
  checklist: "Check required information",
};
const example = `[Page 1]\nInvoice\nInvoice number  DEMO-104\nDate of issue September 1, 2026\nDate due September 1, 2026\nExample Software Pvt. Ltd.\nBill to\nDemo Customer\ninvideo AI - Basic\nSeptember 1–October 1, 2026\nSubtotal ₹850.00\nTotal excluding tax ₹720.34\nSGST - INDIA 9% incl. on ₹720.34 ₹64.83\nCGST - INDIA 9% incl. on ₹720.34 ₹64.83\nTotal ₹850.00\nAmount due ₹850.00\nHSN/SAC - 998314`;
function save(
  content: string,
  name: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function DocumentIntelligence() {
  const { firebaseUser, user } = useAuth();
  const [documents, setDocuments] = useState<LocalDocument[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [focus, setFocus] = useState(""),
    [kind, setKind] = useState<DocumentType>("general"),
    [action, setAction] = useState<IntelligenceAction>("overview"),
    [question, setQuestion] = useState(""),
    [result, setResult] = useState<IntelligenceResult | null>(null),
    [evidence, setEvidence] = useState<Finding | null>(null),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [reading, setReading] = useState(false),
    [consent, setConsent] = useState(false),
    [quote, setQuote] = useState<{
      fingerprint: string;
      credits: number;
      unlimited: boolean;
    } | null>(null);
  const alive = useRef(true),
    lock = useRef(false),
    extractLock = useRef(false),
    controller = useRef<AbortController | null>(null),
    retry = useRef<{ fingerprint: string; id: string } | null>(null),
    receipts = useRef<string[]>([]);
  const enabled = import.meta.env.VITE_ENABLE_AI === "true";
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  const sources: DocumentSource[] = documents
    .map((d) => ({
      id: d.id,
      name: d.name,
      pages: d.pages.filter((p) => selected.includes(p.id)),
    }))
    .filter((d) => d.pages.length);
  const length =
    sources.reduce(
      (n, d) => n + d.pages.reduce((m, p) => m + p.text.length, 0),
      0,
    ) + question.length;
  const current = documents.find((d) => d.pages.some((p) => p.id === focus));
  const page = current?.pages.find((p) => p.id === focus);
  const blocked = busy || reading;
  const valid =
    sources.length > 0 &&
    length <= 24000 &&
    sources.some((d) => d.pages.some((p) => p.text.trim()));
  function changed() {
    setResult(null);
    setEvidence(null);
    setQuote(null);
    setConsent(false);
    setError("");
    setStatus("");
    retry.current = null;
  }
  function addText(text: string) {
    if (documents.length >= 5) {
      setError("Remove a document before adding another (maximum 5).");
      return;
    }
    changed();
    const id = crypto.randomUUID();
    const pages = pagesFromText(text, id);
    setDocuments((ds) => [
      ...ds,
      {
        id,
        name: "Pasted document " + (ds.length + 1),
        pages,
        originals: Object.fromEntries(pages.map((p) => [p.id, p.text])),
      },
    ]);
    setSelected((s) => [...s, ...pages.map((p) => p.id)]);
    setFocus(pages[0].id);
    setKind(classify(text));
  }
  async function upload(files: FileList | File[]) {
    if (extractLock.current || lock.current) return;
    extractLock.current = true;
    setReading(true);
    changed();
    const ctrl = new AbortController();
    controller.current = ctrl;
    try {
      const list = Array.from(files);
      if (list.length + documents.length > 5)
        throw Error("Choose up to five documents in total.");
      const hashes = new Set(documents.map((d) => d.hash).filter(Boolean));
      for (const file of list) {
        if (ctrl.signal.aborted) break;
        if (file.size > 20 * 1024 * 1024)
          throw Error(file.name + ": maximum size is 20 MB.");
        const hash = Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
          ),
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (hashes.has(hash))
          throw Error(file.name + ": this file is already in the workspace.");
        const id = crypto.randomUUID();
        const d = await readDocument(
          file,
          id,
          (s) => alive.current && setStatus(s),
          ctrl.signal,
        );
        if (ctrl.signal.aborted || !alive.current) break;
        if (!d.pages.length || !d.pages.some((p) => p.text.trim()))
          throw Error("No text found. Try a clearer scan.");
        hashes.add(hash);
        setDocuments((ds) => [
          ...ds,
          {
            ...d,
            file,
            hash,
            originals: Object.fromEntries(d.pages.map((p) => [p.id, p.text])),
          },
        ]);
        setSelected((s) => [...s, ...d.pages.map((p) => p.id)]);
        setFocus(d.pages[0].id);
        setKind(classify(d.pages.map((p) => p.text).join("\n")));
      }
      if (alive.current)
        setStatus(
          ctrl.signal.aborted
            ? "Extraction cancelled. Completed documents remain available."
            : "Files read locally. Review the source before analysis.",
        );
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      extractLock.current = false;
      if (alive.current) setReading(false);
    }
  }
  function localReview() {
    changed();
    try {
      validateSources(sources);
      if (kind === "invoice" || kind === "receipt")
        setResult(localInvoice(sources));
      else
        setResult({
          findings: [],
          missing: [],
          checks: [
            {
              label: "Source review",
              status: "pass",
              detail:
                sources.length +
                " document(s), " +
                sources.reduce((n, d) => n + d.pages.length, 0) +
                " selected sections. Read and correct the source before using AI. No facts have been inferred.",
            },
          ],
        });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function localCompare() {
    changed();
    if (sources.length !== 2) {
      setError(
        "Select exactly two documents, original first and revised second.",
      );
      return;
    }
    const lines = (d: DocumentSource) =>
      d.pages.flatMap((p) =>
        p.text
          .split("\n")
          .filter((s) => s.trim())
          .map((s) => ({ text: s, page: p.id })),
      );
    const a = lines(sources[0]),
      b = lines(sources[1]),
      aSet = new Set(a.map((l) => normalize(l.text))),
      bSet = new Set(b.map((l) => normalize(l.text)));
    const findings: Finding[] = [
      ...a
        .filter((l) => !bSet.has(normalize(l.text)))
        .map((l) => ({
          label: "Removed line",
          value: l.text,
          sourceId: l.page,
          quote: l.text,
          status: "extracted" as const,
        })),
      ...b
        .filter((l) => !aSet.has(normalize(l.text)))
        .map((l) => ({
          label: "Added line",
          value: l.text,
          sourceId: l.page,
          quote: l.text,
          status: "extracted" as const,
        })),
    ];
    if (findings.length > 500) {
      setError(
        "More than 500 changed lines. Select smaller sections to compare; no lines were silently omitted.",
      );
      return;
    }
    setResult({
      findings,
      missing: [],
      checks: [
        {
          label: "Text comparison",
          status: "pass",
          detail: findings.length
            ? `${findings.length} added/removed lines. This ignores whitespace, line order and repetition counts; it does not assess meaning or legal significance.`
            : "No added or removed normalized lines. This does not check layout, ordering or repeated-line counts.",
        },
      ],
    });
  }
  async function request(path: string, body: unknown) {
    if (!firebaseUser) throw Error("Sign in for AI analysis.");
    const res = await fetch(apiUrl("/document-intelligence/" + path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await firebaseUser.getIdToken()),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok)
      throw Error(
        data?.message ||
          "Connection interrupted. Retry unchanged input to recover the existing request.",
      );
    return data;
  }
  const body = () => ({
    documents: sources,
    documentType: kind,
    action,
    question,
  });
  async function getQuote() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const q = await request("quote", body());
      if (alive.current) {
        setQuote(q);
        setConsent(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function analyze() {
    if (lock.current || !quote || !consent) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setResult(null);
    setEvidence(null);
    try {
      if (retry.current?.fingerprint !== quote.fingerprint) {
        const key =
          "intelligence-retry:" + firebaseUser!.uid + ":" + quote.fingerprint;
        let id = crypto.randomUUID();
        try {
          const old = JSON.parse(sessionStorage.getItem(key) || "null");
          if (old && Date.now() - old.at < 86400000) id = old.id;
          else
            sessionStorage.setItem(key, JSON.stringify({ id, at: Date.now() }));
        } catch {}
        retry.current = { fingerprint: quote.fingerprint, id };
      }
      const id = retry.current.id;
      if (!receipts.current.includes(id)) receipts.current.push(id);
      const data = await request("analyze", {
        ...body(),
        fingerprint: quote.fingerprint,
        consent: true,
        requestId: id,
      });
      if (alive.current) {
        setResult(data.result);
        setStatus(
          data.replayed
            ? "Recovered the existing result without another charge."
            : "Analysis complete. Review each finding against its evidence.",
        );
      }
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function clear() {
    if (blocked || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (firebaseUser && receipts.current.length) {
        for (let i = 0; i < receipts.current.length; i += 100)
          await request("clear", {
            requestIds: receipts.current.slice(i, i + 100),
          });
        receipts.current = [];
      }
      setDocuments([]);
      setSelected([]);
      setFocus("");
      setQuestion("");
      changed();
      setStatus(
        "Local sources cleared. Any saved analysis text from this workspace has been cleared; accounting receipts are retained.",
      );
    } catch (e) {
      setError(
        "Could not clear saved analysis text. Your local workspace is retained so you can retry. " +
          (e as Error).message,
      );
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  const sourceLabel = (id: string) => {
    const d = documents.find((d) => d.pages.some((p) => p.id === id));
    return d ? `${d.name} · ${d.pages.find((p) => p.id === id)!.label}` : id;
  };
  const exportText = () =>
    result
      ? result.findings
          .map(
            (f) =>
              `${f.label}: ${f.value}\nSource: ${sourceLabel(f.sourceId)}\nEvidence: ${f.quote}\nStatus: ${f.status}`,
          )
          .join("\n\n") +
        "\n\nMissing: " +
        result.missing.join("; ") +
        "\n" +
        result.checks
          .map((c) => `${c.label} (${c.status}): ${c.detail}`)
          .join("\n")
      : "";
  return (
    <div className="min-w-0 space-y-6">
      <header className="rounded-2xl border bg-primary/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">
              SOURCE → UNDERSTANDING → EVIDENCE
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              AI Document Intelligence
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Review your documents, extract meaningful facts, check amounts and
              ask questions. Every AI finding comes with a source excerpt.
            </p>
          </div>
          <ShieldCheck className="h-9 w-9 text-primary" />
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <span>1 · Add documents</span>
          <ArrowRight className="h-4 w-4" />
          <span>2 · Review source</span>
          <ArrowRight className="h-4 w-4" />
          <span>3 · Analyze & verify</span>
        </div>
      </header>
      <section
        className="space-y-4 rounded-xl border p-5"
        aria-label="Add documents"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!blocked) void upload(e.dataTransfer.files);
        }}
      >
        <h2 className="flex items-center gap-2 font-semibold">
          <Upload className="h-5 w-5" />
          Add documents
        </h2>
        <p className="text-sm">
          Drop PDF, DOCX, TXT, JPG or PNG files here. Up to 5 files, 20 MB each
          and 20 pages per PDF. Extraction stays on this device. Scanned text
          currently uses English OCR.
        </p>
        <input
          aria-label="Upload documents"
          className="block w-full min-w-0 max-w-full text-sm"
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
          disabled={blocked}
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={blocked}
            onClick={() => addText("")}
          >
            Paste text
          </Button>
          <Button
            variant="outline"
            disabled={blocked}
            onClick={() => addText(example)}
          >
            Try invoice example
          </Button>
          {reading && (
            <Button
              variant="outline"
              onClick={() => controller.current?.abort()}
            >
              Cancel extraction
            </Button>
          )}
          {!!documents.length && (
            <Button
              variant="outline"
              disabled={blocked}
              onClick={() => void clear()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear workspace
            </Button>
          )}
        </div>
      </section>
      {status && (
        <p role="status" className="rounded-lg bg-muted p-3 text-sm">
          {status}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive p-3 text-destructive"
        >
          {error}
        </p>
      )}
      {!!documents.length && (
        <>
          <section
            className="grid min-w-0 gap-5 xl:grid-cols-[15rem_1fr]"
            aria-label="Review source"
          >
            <aside className="space-y-3 rounded-xl border p-4">
              <h2 className="font-semibold">Documents & sections</h2>
              {documents.map((d, di) => (
                <div key={d.id} className="space-y-2 border-b pb-3">
                  <input
                    aria-label={"Document " + (di + 1) + " name"}
                    className="w-full rounded border bg-background p-2 text-sm"
                    value={d.name}
                    disabled={blocked}
                    maxLength={200}
                    onChange={(e) => {
                      setDocuments((ds) =>
                        ds.map((x) =>
                          x.id === d.id ? { ...x, name: e.target.value } : x,
                        ),
                      );
                      changed();
                    }}
                  />
                  <button
                    className="text-xs underline"
                    disabled={blocked}
                    onClick={() => {
                      setDocuments((ds) => ds.filter((x) => x.id !== d.id));
                      setSelected((s) =>
                        s.filter((id) => !d.pages.some((p) => p.id === id)),
                      );
                      changed();
                    }}
                  >
                    Remove document
                  </button>
                  {d.pages.map((p, pi) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label={"Include " + d.name + " " + p.label}
                        checked={selected.includes(p.id)}
                        disabled={blocked}
                        onChange={(e) => {
                          setSelected((s) =>
                            e.target.checked
                              ? [...s, p.id]
                              : s.filter((id) => id !== p.id),
                          );
                          changed();
                        }}
                      />
                      <button
                        className={
                          "flex-1 rounded p-2 text-left text-sm " +
                          (focus === p.id ? "bg-primary/15 font-semibold" : "")
                        }
                        onClick={() => setFocus(p.id)}
                      >
                        {p.label}
                      </button>
                      {pi > 0 && (
                        <button
                          aria-label={"Move " + p.label + " earlier"}
                          disabled={blocked}
                          className="text-sm"
                          onClick={() => {
                            setDocuments((ds) =>
                              ds.map((x) => {
                                if (x.id !== d.id) return x;
                                const pages = [...x.pages];
                                [pages[pi - 1], pages[pi]] = [
                                  pages[pi],
                                  pages[pi - 1],
                                ];
                                return { ...x, pages };
                              }),
                            );
                            changed();
                          }}
                        >
                          ↑
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </aside>
            <div className="min-w-0 space-y-4 rounded-xl border p-5">
              {page && current ? (
                <>
                  <h2 className="font-semibold">
                    {current.name} · {page.label}
                  </h2>
                  <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                    <DocumentPreview
                      file={current.file}
                      page={Number(page.id.match(/-p(\d+)$/)?.[1] || 1) - 1}
                    />
                    <label className="min-w-0 text-sm">
                      Reviewed source text
                      <Textarea
                        rows={16}
                        value={page.text}
                        disabled={blocked}
                        onChange={(e) => {
                          setDocuments((ds) =>
                            ds.map((d) => ({
                              ...d,
                              pages: d.pages.map((p) =>
                                p.id === page.id
                                  ? { ...p, text: e.target.value }
                                  : p,
                              ),
                            })),
                          );
                          changed();
                        }}
                      />
                      {page.text !== current.originals[page.id] && (
                        <span className="block pt-2 text-amber-600">
                          User-corrected text. Evidence is checked against this
                          reviewed version.
                        </span>
                      )}
                    </label>
                  </div>
                  {evidence && (
                    <blockquote className="border-l-4 border-primary bg-primary/5 p-4">
                      <strong>Selected evidence</strong>
                      <p className="whitespace-pre-wrap break-words">
                        {evidence.quote}
                      </p>
                    </blockquote>
                  )}
                </>
              ) : (
                <p>Select a document section.</p>
              )}
            </div>
          </section>
          <section
            className="space-y-4 rounded-xl border p-5"
            aria-label="Analysis actions"
          >
            <h2 className="flex items-center gap-2 font-semibold">
              <SearchCheck className="h-5 w-5" />
              Analyze & verify
            </h2>
            <div className="flex flex-wrap gap-4">
              <label className="text-sm">
                Document type{" "}
                <select
                  className="block rounded border bg-background p-2"
                  value={kind}
                  disabled={blocked}
                  onChange={(e) => {
                    setKind(e.target.value as DocumentType);
                    changed();
                  }}
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                AI action{" "}
                <select
                  className="block max-w-full rounded border bg-background p-2"
                  value={action}
                  disabled={blocked}
                  onChange={(e) => {
                    setAction(e.target.value as IntelligenceAction);
                    changed();
                  }}
                >
                  {ACTIONS.map((a) => (
                    <option key={a} value={a}>
                      {labels[a]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Type detection is a suggestion; correct it if needed. Source
              selection controls what is analyzed.
            </p>
            {["questions", "checklist"].includes(action) && (
              <label className="block text-sm">
                {action === "questions"
                  ? "Your question (include context for follow-ups)"
                  : "Required fields or checklist"}
                <Textarea
                  value={question}
                  maxLength={2000}
                  disabled={blocked}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    changed();
                  }}
                  placeholder="e.g. Which taxes make up the total, and when is payment due?"
                />
              </label>
            )}
            <p className="text-sm">
              {length.toLocaleString()} / 24,000 selected characters including
              your question
            </p>
            {length > 24000 && (
              <p role="alert" className="text-destructive">
                Deselect sections or shorten the reviewed text. Nothing is
                silently truncated.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={blocked || !valid}
                onClick={localReview}
                className="h-auto max-w-full whitespace-normal py-2 text-center"
              >
                Review & validate locally · Free
              </Button>
              <Button
                variant="outline"
                disabled={blocked || !valid || sources.length !== 2}
                onClick={localCompare}
              >
                Compare text · Free
              </Button>
              {enabled && firebaseUser ? (
                <Button
                  disabled={blocked || !valid}
                  onClick={() => void getQuote()}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Check AI cost
                </Button>
              ) : (
                <Link
                  href="/login"
                  className="self-center text-sm underline text-primary"
                >
                  {enabled
                    ? "Sign in for AI analysis"
                    : "AI is unavailable in this build"}
                </Link>
              )}
            </div>
            {quote && (
              <div className="space-y-3 rounded-lg bg-primary/5 p-4">
                <p className="font-semibold">
                  {quote.unlimited
                    ? "Unlimited administrator allowance"
                    : quote.credits +
                      " credit" +
                      (quote.credits === 1 ? "" : "s") +
                      " on success"}
                </p>
                <label className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    disabled={blocked}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  Send the selected reviewed text to the AI provider. Original
                  files remain local. Findings are saved for retry recovery for
                  a 24-hour recovery window. Saved text remains until you clear
                  it or retention cleanup runs. Clear workspace removes this
                  session’s saved analysis text; accounting receipts remain.
                </label>
                <Button
                  disabled={blocked || !consent}
                  onClick={() => void analyze()}
                >
                  {busy ? "Analyzing evidence…" : "Run " + labels[action]}
                </Button>
                <p className="text-xs">
                  Failed validation does not charge credits. If a connection
                  fails after completion, retry unchanged input to recover the
                  same result. Keep this page open while processing.
                </p>
              </div>
            )}
          </section>
        </>
      )}
      {result && (
        <section
          className="min-w-0 space-y-5 rounded-xl border p-5"
          aria-label="Evidence-backed results"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Findings & evidence</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => save(exportText(), "document-report.txt")}
              >
                Export TXT
              </Button>
              <Button
                variant="outline"
                disabled={blocked}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await downloadDocumentReport(exportText());
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(exportText());
                    setStatus("Report copied.");
                  } catch {
                    setError("Clipboard unavailable. Use an export instead.");
                  }
                }}
              >
                Copy report
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  save(
                    JSON.stringify(
                      {
                        documents: sources.map((d) => ({
                          id: d.id,
                          name: d.name,
                        })),
                        ...result,
                      },
                      null,
                      2,
                    ),
                    "document-report.json",
                    "application/json",
                  )
                }
              >
                Export JSON
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  save(
                    csv(
                      ["Finding", "Value", "Source", "Quote", "Status"],
                      result.findings.map((f) => [
                        f.label,
                        f.value,
                        f.sourceId,
                        f.quote,
                        f.status,
                      ]),
                    ),
                    "document-findings.csv",
                    "text/csv;charset=utf-8",
                  )
                }
              >
                Export CSV
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.checks.map((c, i) => (
              <div
                key={i}
                className={
                  "rounded-lg border p-4 " +
                  (c.status === "pass" ? "border-primary/50" : "")
                }
              >
                <p className="font-semibold">
                  {c.label} ·{" "}
                  {c.status === "pass"
                    ? "Checked"
                    : c.status === "review"
                      ? "Review needed"
                      : "Not established"}
                </p>
                <p className="mt-2 text-sm">{c.detail}</p>
              </div>
            ))}
          </div>
          {result.missing.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">
                Not established in the selected source
              </h3>
              <ul className="list-disc pl-5">
                {result.missing.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {result.findings.map((f, i) => (
              <article
                key={i}
                className="min-w-0 space-y-2 rounded-xl bg-muted/40 p-4"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold">{f.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {f.status === "analysis"
                      ? "AI interpretation"
                      : f.status === "review"
                        ? "Needs review"
                        : "Extracted"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-lg">
                  {f.value}
                </p>
                <button
                  className="text-sm underline text-primary"
                  onClick={() => {
                    setFocus(f.sourceId);
                    setEvidence(f);
                    document
                      .querySelector('[aria-label="Review source"]')
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <FileText className="mr-1 inline h-4 w-4" />
                  View source ·{" "}
                  {
                    documents
                      .flatMap((d) => d.pages)
                      .find((p) => p.id === f.sourceId)?.label
                  }
                </button>
                <details className="text-sm">
                  <summary className="cursor-pointer">Source excerpt</summary>
                  <blockquote className="mt-2 whitespace-pre-wrap break-words border-l-2 pl-3">
                    {f.quote}
                  </blockquote>
                </details>
              </article>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            A matching excerpt establishes provenance, not document authenticity
            or professional verification. Review AI interpretations and any
            ambiguous extracted fields.
          </p>
        </section>
      )}
    </div>
  );
}
