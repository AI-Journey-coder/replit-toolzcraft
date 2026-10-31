import { SupportRequests } from "@/components/SupportRequests";
import { DocumentBatch } from "./DocumentBatch";
import { DocumentFinancialChecks } from "./DocumentFinancialChecks";
import { useEffect, useMemo, useRef, useState } from "react";
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
  ADVANCED_TASKS,
  DOCUMENT_TYPES,
  DOCUMENT_PROFILES,
  classify,
  compareDocumentLines,
  type DiffRow,
  localInvoice,
  invoiceOverview,
  normalize,
  pagesFromText,
  validateSources,
  extractTables,
  type SourceTable,
  type ConversationTurn,
  type DocumentSource,
  type DocumentType,
  type IntelligenceAction,
  type IntelligenceResult,
  type Finding,
} from "@workspace/document-intelligence";
import { readDocument } from "@/lib/document-reader";
import { DocumentReference } from './DocumentReference';
import {
  detectDocumentLanguage,
  documentStructure,
} from "@/lib/document-metadata";
import {
  exportWord,
  exportExcel,
  expandDocumentZip,
} from "@/lib/document-package";
import { redactText } from "@/lib/document-redaction";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DocumentPreview } from "./DocumentPreview";
import { DocumentThumbnails } from "./DocumentThumbnails";
import { DocumentWorkspaceShelf } from "./DocumentWorkspaceShelf";
import { DocumentRules } from "./DocumentRules";
import { DocumentJobs } from "./DocumentJobs";
import { DocumentSignatureReview } from "./DocumentSignatureReview";
import { DocumentVisualReview } from "./DocumentVisualReview";
import { DocumentWorkflows } from "./DocumentAutomationPanel";
import { documentReminder } from "@/lib/document-calendar";
import { downloadDocumentReport } from "@/lib/document-report";
import { csv } from "@/lib/document-results";
type LocalDocument = DocumentSource & {
  file?: File;
  hash?: string;
  password?: string;
  originals: Record<string, string>;
};
const labels: Record<IntelligenceAction, string> = {
  ...(Object.fromEntries(
    Object.entries(ADVANCED_TASKS).map(([key, t]) => [key, t.label]),
  ) as Record<keyof typeof ADVANCED_TASKS, string>),
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
    [templateName, setTemplateName] = useState(""),
    [templates, setTemplates] = useState<
      { name: string; action: IntelligenceAction; question: string }[]
    >([]),
    [reportTheme, setReportTheme] = useState("classic"),
    [reportTitle, setReportTitle] = useState("Document evidence report"),
    [reportIntroduction, setReportIntroduction] = useState(""),
    [reportFooter, setReportFooter] = useState(""),
    [reminderDate, setReminderDate] = useState(""),
    [reminderIndex, setReminderIndex] = useState(0),
    [pdfPassword, setPdfPassword] = useState(""),
    [ocrLanguage, setOcrLanguage] = useState("eng"),
    [forceOcr, setForceOcr] = useState(false),
    [scanAvailable, setScanAvailable] = useState(false),
    [scanConsent, setScanConsent] = useState(false),
    [maxMegabytes, setMaxMegabytes] = useState(20),
    [maxPdfPages, setMaxPdfPages] = useState(20),
    [comparison, setComparison] = useState<DiffRow[] | null>(null),
    [redactionTerms, setRedactionTerms] = useState(""),
    [redactIdentifiers, setRedactIdentifiers] = useState(false),
    [history, setHistory] = useState<ConversationTurn[]>([]),
    [tables, setTables] = useState<SourceTable[] | null>(null),
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
    accountGeneration = useRef(0),
    previousAccount = useRef<string | null>(null),
    restoredHistory = useRef<ConversationTurn[] | null>(null),
    lock = useRef(false),
    extractLock = useRef(false),
    controller = useRef<AbortController | null>(null),
    retry = useRef<{ fingerprint: string; id: string } | null>(null),
    receipts = useRef<string[]>([]);
  const enabled = import.meta.env.VITE_ENABLE_AI === "true";
  useEffect(() => {
    let current = true;
    setScanAvailable(false); setScanConsent(false);
    if (firebaseUser) void firebaseUser.getIdToken().then(token => fetch(apiUrl('/document-scan'), { headers: { Authorization: 'Bearer ' + token } })).then(async response => {
      const data = response.ok ? await response.json() : null;
      if (current) setScanAvailable(data?.available === true);
    }).catch(() => {});
    return () => { current = false; };
  }, [firebaseUser?.uid]);
  useEffect(() => {
    const next = firebaseUser?.uid || null;
    if (previousAccount.current && previousAccount.current !== next) {
      accountGeneration.current++;
      controller.current?.abort();
      receipts.current = [];
      retry.current = null;
      setDocuments([]);
      setSelected([]);
      setFocus("");
      setQuestion("");
      setHistory([]);
      setPdfPassword("");
      setTemplates([]);
      setTemplateName("");
      setReportTitle("Document evidence report");
      setReportTheme("classic");
      setReportIntroduction("");
      setReportFooter("");
      setReminderDate("");
      setRedactionTerms("");
      changed();
      setStatus(
        "Local document workspace cleared because the signed-in account changed.",
      );
    }
    previousAccount.current = next;
  }, [firebaseUser?.uid]);
  const anonymousStarted = useRef<number | null>(null);
  useEffect(() => {
    if (firebaseUser || !documents.length) {
      anonymousStarted.current = null;
      return;
    }
    anonymousStarted.current ??= Date.now();
    const expire = () => {
      if (
        anonymousStarted.current === null ||
        Date.now() - anonymousStarted.current < 60 * 60 * 1000
      )
        return;
      controller.current?.abort();
      setDocuments([]);
      setSelected([]);
      setFocus("");
      setQuestion("");
      setHistory([]);
      setPdfPassword("");
      setRedactionTerms("");
      setTemplates([]);
      setTemplateName("");
      setReportTitle("Document evidence report");
      setReportTheme("classic");
      setReportIntroduction("");
      setReportFooter("");
      setReminderDate("");
      changed();
      setStatus(
        "Your anonymous workspace expired after 60 minutes. Local documents and results have been cleared.",
      );
      anonymousStarted.current = null;
    };
    const timer = window.setTimeout(
      expire,
      Math.max(0, 60 * 60 * 1000 - (Date.now() - anonymousStarted.current)),
    );
    window.addEventListener("focus", expire);
    document.addEventListener("visibilitychange", expire);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", expire);
      document.removeEventListener("visibilitychange", expire);
    };
  }, [!!firebaseUser, documents.length]);
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
  const sourceVersion = JSON.stringify(sources);
  useEffect(() => {
    setHistory(restoredHistory.current || []);
    restoredHistory.current = null;
  }, [sourceVersion, kind]);
  const context = action === "questions" ? history : [];
  const contextLength = context.reduce(
    (n, t) => n + t.question.length + t.answer.length,
    0,
  );
  const length =
    sources.reduce(
      (n, d) => n + d.pages.reduce((m, p) => m + p.text.length, 0),
      0,
    ) +
    question.length +
    contextLength;
  const current = documents.find((d) => d.pages.some((p) => p.id === focus));
  const page = current?.pages.find((p) => p.id === focus);
  const sourceInfo = useMemo(() => {
    const text = current?.pages.map((p) => p.text).join("\n") || "";
    return {
      language: detectDocumentLanguage(text),
      ...documentStructure(text),
    };
  }, [current]);
  const blocked = busy || reading;
  const valid =
    sources.length > 0 &&
    length <= 24000 &&
    contextLength <= 6000 &&
    context.length <= 6 &&
    sources.some((d) => d.pages.some((p) => p.text.trim()));
  function changed() {
    setComparison(null);
    setTables(null);
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
      if(!Number.isInteger(maxMegabytes)||maxMegabytes<1||maxMegabytes>20||!Number.isInteger(maxPdfPages)||maxPdfPages<1||maxPdfPages>20)throw Error('Choose whole-number extraction limits from 1 to 20.');
      const list: File[] = [];
      if (files.length > 5) throw Error('Choose up to five files at a time.');
      for (const file of Array.from(files)) {
        if (scanConsent) {
          if (!firebaseUser || !scanAvailable) throw Error('Sign in and enable an available scanner before uploading.');
          if (!file.size || file.size > maxMegabytes * 1024 * 1024) throw Error('File exceeds the configured scan size limit.');
          setStatus('Scanning ' + file.name + ' before local extraction…');
          const token = await firebaseUser.getIdToken();
          const response = await fetch(apiUrl('/document-scan?consent=upload-for-scan'), {
            method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/octet-stream' }, body: file, signal: ctrl.signal,
          });
          const outcome = await response.json().catch(() => null);
          if (!response.ok || outcome?.status !== 'clean') throw Error(outcome?.message || 'Scanning did not complete. Extraction stopped.');
        }
        if (ctrl.signal.aborted) throw Error('Extraction cancelled.');
        list.push(
          ...(file.name.toLowerCase().endsWith(".zip")
            ? await expandDocumentZip(file)
            : [file]),
        );
      }
      if (list.length + documents.length > 5)
        throw Error("Choose up to five documents in total.");
      const hashes = new Set(documents.map((d) => d.hash).filter(Boolean));
      for (const file of list) {
        if (ctrl.signal.aborted) break;
        if (file.size > maxMegabytes * 1024 * 1024)
          throw Error(file.name + ": maximum size is " + maxMegabytes + " MB.");
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
          {
            password: pdfPassword,
            language: ocrLanguage,
            forceOcr,
            maxMegabytes,
            maxPdfPages,
          },
        );
        if (ctrl.signal.aborted || !alive.current) break;
        if (!d.pages.length) throw Error("No readable pages found.");
        if (
          !d.pages.some((p) => p.text.trim()) &&
          !/\.(pdf|png|jpe?g)$/i.test(file.name)
        )
          throw Error("No text found. Choose a document with content.");
        hashes.add(hash);
        setDocuments((ds) => [
          ...ds,
          {
            ...d,
            file,
            hash,
            password: file.name.toLowerCase().endsWith(".pdf")
              ? pdfPassword
              : undefined,
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
            : scanConsent ? "Scan found no malware; files extracted locally. Scanning cannot guarantee safety. Review the source before analysis." : "Files read locally. Review the source before analysis.",
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
    let rows: DiffRow[];
    try {
      rows = compareDocumentLines(sources[0], sources[1]);
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    const findings: Finding[] = rows
      .filter((r) => r.kind !== "same")
      .map((r) => {
        const line = (r.before || r.after)!;
        return {
          label: r.kind === "added" ? "Added line" : "Removed line",
          value: line.text,
          quote: line.text,
          sourceId: line.sourceId,
          status: "extracted",
        };
      });
    if (findings.length > 500) {
      setError(
        "More than 500 changed lines. Select smaller sections to compare; no lines were silently omitted.",
      );
      return;
    }
    setComparison(rows);
    setResult({
      findings,
      missing: [],
      checks: [
        {
          label: "Text comparison",
          status: "pass",
          detail: findings.length
            ? `${findings.length} added/removed lines. Order and repeated lines are compared; moved lines appear as a removal and addition. Whitespace and empty lines are ignored. No legal significance is inferred.`
            : "No changes in the ordered non-empty text lines after whitespace normalization. Visual layout is not compared.",
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
    if (!res.ok && data?.code === "unverified_evidence")
      throw Object.assign(new Error(data.message), {code:"unverified_evidence"});
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
    history: context,
  });
  async function getQuote() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const generation = accountGeneration.current;
    try {
      const q = await request("quote", body());
      if (alive.current && generation === accountGeneration.current) {
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
    const generation = accountGeneration.current;
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
      if (alive.current && generation === accountGeneration.current) {
        const report = (kind === "invoice" || kind === "receipt") && ["overview","facts","amounts","detailed"].includes(action)
          ? invoiceOverview(data.result, sources) : data.result;
        const billing = data.replayed ? "Previously completed request. No additional credits deducted."
          : quote.unlimited ? "Unlimited account. No credits deducted."
          : "Credits used for this analysis: " + data.credits + ".";
        setResult({...report, checks:[...report.checks,{label:"Credit usage",status:"pass",detail:billing}]});
        if (action === "questions") {
          const answer = [
            ...data.result.findings.map(
              (f: Finding) => `${f.label}: ${f.value}`,
            ),
            ...data.result.missing,
          ].join("\n");
          setHistory((h) => [...h, { question, answer }]);
          setQuote(null);
          setConsent(false);
          setQuestion("");
        }
        setStatus(
          data.replayed
            ? "Recovered the existing result without another charge."
            : "Analysis complete. Review each finding against its evidence.",
        );
      }
    } catch (e) {
      if (!alive.current || generation !== accountGeneration.current) return;
      if ((e as {code?:string})?.code === "unverified_evidence" &&
          (kind === "invoice" || kind === "receipt") &&
          ["overview","facts","detailed","amounts"].includes(action)) {
        const report = localInvoice(sources);
        if (report.findings.length) {
          const detail = "AI citations could not be verified. These fields were read locally from your selected pages. No credits charged.";
          report.checks.unshift({label:"Local invoice review",status:"review",detail});
          setResult(report);
          setStatus(detail);
          setQuote(null);
          setConsent(false);
          return;
        }
      }
      setError((e as Error).message);
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
      setPdfPassword("");
      setRedactionTerms("");
      setTemplates([]);
      setTemplateName("");
      setReportTitle("Document evidence report");
      setReportTheme("classic");
      setReportIntroduction("");
      setReportFooter("");
      setReminderDate("");
      setSelected([]);
      setFocus("");
      setQuestion("");
      setHistory([]);
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
  const redact = (text: string) =>
    redactText(text, redactionTerms.split("\n"), redactIdentifiers);
  const exportResult = result
    ? {
        ...result,
        findings: result.findings.map((f) => ({
          ...f,
          label: redact(f.label),
          value: redact(f.value),
          quote: redact(f.quote),
        })),
        missing: result.missing.map(redact),
        checks: result.checks.map((c) => ({
          ...c,
          label: redact(c.label),
          detail: redact(c.detail),
        })),
      }
    : null;
  const rawExportText = () =>
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
  const exportText = () =>
    redact(
      reportTitle +
        "\n\n" +
        (reportIntroduction
          ? "Author introduction (not source evidence):\n" +
            reportIntroduction +
            "\n\n"
          : "") +
        rawExportText() +
        (reportFooter
          ? "\n\nAuthor closing note (not source evidence):\n" + reportFooter
          : ""),
    );
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
      <SupportRequests />
      <DocumentWorkflows />
      <DocumentBatch
        documents={sources}
        documentType={kind}
        disabled={blocked}
      />
      <DocumentWorkspaceShelf
        disabled={blocked}
        compare={(data, version) => {
          const incoming = validateSources(data.documents);
          if (documents.length + incoming.length > 5)
            throw Error(
              "Keep up to five documents for comparison. Remove an existing document first.",
            );
          const added = incoming.map((d) => {
            const id = crypto.randomUUID();
            const pages = d.pages.map((p, i) => ({
              ...p,
              id: id + "-saved-" + i,
            }));
            return {
              ...d,
              id,
              name: ("Saved v" + version + " · " + d.name).slice(0, 200),
              pages,
              originals: Object.fromEntries(pages.map((p) => [p.id, p.text])),
            };
          });
          changed();
          setDocuments((ds) => [...ds, ...added]);
          setSelected((ids) => [
            ...ids,
            ...added.flatMap((d) => d.pages.map((p) => p.id)),
          ]);
        }}
        snapshot={() => ({
          documents: sources,
          history,
          documentType: kind,
          action,
          question,
          templates,
          reportTemplate: {
            title: reportTitle,
            theme: reportTheme,
            introduction: reportIntroduction,
            footer: reportFooter,
          },
        })}
        restore={(data) => {
          const restored = validateSources(data.documents);
          changed();
          restoredHistory.current =
            JSON.stringify(restored) !== sourceVersion ||
            data.documentType !== kind
              ? data.history || []
              : null;
          setDocuments(
            restored.map((d) => ({
              ...d,
              originals: Object.fromEntries(d.pages.map((p) => [p.id, p.text])),
            })),
          );
          setSelected(restored.flatMap((d) => d.pages.map((p) => p.id)));
          setFocus(restored[0]?.pages[0]?.id || "");
          setKind(data.documentType);
          setAction(data.action);
          setQuestion(data.question);
          setHistory(data.history || []);
          setTemplates(data.templates || []);
          setReportTitle(
            data.reportTemplate?.title || "Document evidence report",
          );
          setReportTheme(data.reportTemplate?.theme || "classic");
          setReportIntroduction(data.reportTemplate?.introduction || "");
          setReportFooter(data.reportTemplate?.footer || "");
        }}
      />
      <DocumentJobs
        body={body}
        quote={quote}
        consent={consent}
        disabled={blocked}
        onResult={(r, d) => {
          const restored = validateSources(d);
          changed();
          setDocuments(
            restored.map((doc) => ({
              ...doc,
              originals: Object.fromEntries(
                doc.pages.map((p) => [p.id, p.text]),
              ),
            })),
          );
          setSelected(restored.flatMap((doc) => doc.pages.map((p) => p.id)));
          setFocus(restored[0]?.pages[0]?.id || "");
          setResult(r);
        }}
      />
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
          Drop PDF, DOCX, TXT, JPG, PNG or a document ZIP here. Up to 5 files,
          20 MB each and 20 pages per PDF. Standard text extraction and OCR stay
          on this device. Optional visual AI sends a page preview only after
          separate consent. Scanned text uses your selected OCR language.
        </p>
        <details className="rounded border p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Extraction settings
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {scanAvailable && <label className="sm:col-span-2 flex items-start gap-2">
              <input type="checkbox" checked={scanConsent} disabled={blocked} onChange={e => setScanConsent(e.target.checked)} />
              <span>Scan before extraction. I agree to upload original files (including ZIP contents) to ToolzCraft's malware scanner. Files are processed temporarily, not saved to my workspace or sent to AI. A failed scan stops extraction. Scanning cannot guarantee safety.</span>
            </label>}
            <label>
              Maximum file size (MB)
              <input
                type="number"
                min={1}
                max={20}
                step={1}
                value={maxMegabytes}
                disabled={blocked}
                onChange={(e) => setMaxMegabytes(Number(e.target.value))}
                className="block w-full rounded border bg-background p-2"
              />
            </label>
            <label>
              Maximum PDF pages
              <input
                type="number"
                min={1}
                max={20}
                step={1}
                value={maxPdfPages}
                disabled={blocked}
                onChange={(e) => setMaxPdfPages(Number(e.target.value))}
                className="block w-full rounded border bg-background p-2"
              />
            </label>
            <label>
              PDF password (if required)
              <input
                type="password"
                autoComplete="off"
                value={pdfPassword}
                disabled={blocked}
                onChange={(e) => setPdfPassword(e.target.value)}
                className="mt-1 block w-full rounded border bg-background p-2"
              />
            </label>
            <label>
              OCR language
              <select
                aria-label="OCR language"
                value={ocrLanguage}
                disabled={blocked}
                onChange={(e) => setOcrLanguage(e.target.value)}
                className="mt-1 block w-full rounded border bg-background p-2"
              >
                {Object.entries({
                  eng: "English",
                  "eng+hin": "English + Hindi",
                  "eng+mar": "English + Marathi",
                  fra: "French",
                  deu: "German",
                  spa: "Spanish",
                  ara: "Arabic",
                  jpn: "Japanese",
                  chi_sim: "Simplified Chinese",
                }).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 flex gap-2">
            <input
              type="checkbox"
              checked={forceOcr}
              disabled={blocked}
              onChange={(e) => setForceOcr(e.target.checked)}
            />
            OCR every PDF page, including pages with existing text (use for
            mixed scans).
          </label>
          <p className="mt-2 text-xs">
            Settings apply to newly added files. Passwords stay in this tab and
            are cleared with the workspace. OCR may download language files;
            document images stay local. Anonymous workspaces clear after 60
            minutes; suspended tabs clear when resumed.
          </p>
        </details>
        <input
          aria-label="Upload documents"
          className="block w-full min-w-0 max-w-full text-sm"
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.zip"
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
      <DocumentReference disabled={blocked || documents.length >= 5} onImport={reference=>{
        if(blocked || documents.length>=5)throw Error('Wait for the current operation or remove a document before importing.');
        changed();const id=crypto.randomUUID(),pageId=id+'-reference';
        const text='Published reference: '+reference.url+'\nRetrieved: '+reference.retrievedAt+'\n\n'+reference.text;
        const page={id:pageId,label:'Published reference',text};
        setDocuments(ds=>[...ds,{id,name:'Reference: '+new URL(reference.url).hostname,pages:[page],hash:reference.sha256,originals:{[pageId]:text}}]);
        setSelected(ids=>[...ids,pageId]);setFocus(pageId);setStatus('Reference imported. Select it with another document to compare their claims.');
      }}/>
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
                  <div className="flex gap-2">
                    <button
                      className="text-xs underline"
                      disabled={blocked || di === 0}
                      onClick={() => {
                        changed();
                        setDocuments((ds) => {
                          const copy = [...ds];
                          [copy[di - 1], copy[di]] = [copy[di], copy[di - 1]];
                          return copy;
                        });
                      }}
                    >
                      Move document earlier
                    </button>
                    <button
                      className="text-xs underline"
                      disabled={blocked || di === documents.length - 1}
                      onClick={() => {
                        changed();
                        setDocuments((ds) => {
                          const copy = [...ds];
                          [copy[di], copy[di + 1]] = [copy[di + 1], copy[di]];
                          return copy;
                        });
                      }}
                    >
                      Move document later
                    </button>
                  </div>
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
                  <DocumentThumbnails
                    file={d.file}
                    password={d.password}
                    pages={d.pages}
                    onSelect={setFocus}
                  />
                </div>
              ))}
            </aside>
            <div className="min-w-0 space-y-4 rounded-xl border p-5">
              {page && current ? (
                <>
                  <h2 className="font-semibold">
                    {current.name} · {page.label}
                  </h2>
                  <details className="rounded border p-3 text-sm">
                    <summary className="cursor-pointer">
                      Language, metadata & structure
                    </summary>
                    <p className="mt-2">
                      Estimated language: {sourceInfo.language}
                    </p>
                    <p>
                      Paragraph groups: {sourceInfo.paragraphs}. Heading
                      candidates: {sourceInfo.headings.length}.
                    </p>
                    {Object.entries(current.metadata || {}).map(
                      ([key, value]) => (
                        <p key={key} className="break-words">
                          {key}: {value}
                        </p>
                      ),
                    )}
                    {!Object.keys(current.metadata || {}).length && (
                      <p>No embedded title or author metadata found.</p>
                    )}
                    {!!sourceInfo.dates.length && (
                      <p>Date strings: {sourceInfo.dates.join(" · ")}</p>
                    )}
                    <p className="mt-2 text-xs">
                      Metadata is supplied by the file and does not establish
                      identity or authenticity. Language and headings are
                      estimates; mixed or short text may be ambiguous. Date
                      formats are not inferred.
                    </p>
                  </details>
                  {page.ocrConfidence !== undefined && (
                    <div
                      className="rounded border border-amber-500 p-3 text-sm"
                      aria-label="OCR quality"
                    >
                      <p>
                        OCR engine score: {Math.round(page.ocrConfidence)} /
                        100. This is not a probability of accuracy.
                      </p>
                      {!!page.uncertainWords?.length && (
                        <p className="mt-2">
                          Review uncertain words:{" "}
                          {page.uncertainWords.map((word, i) => (
                            <mark key={i} className="mr-2 inline-block">
                              {word}
                            </mark>
                          ))}
                        </p>
                      )}
                      <p className="mt-2">
                        Compare the text with the image before analysis.
                        Handwriting and mixed layouts need particular care.
                      </p>
                    </div>
                  )}
                  <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                    <DocumentPreview
                      password={current.password}
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
                  aria-label="Document type"
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
                  aria-label="AI action"
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
            {["questions", "checklist", "specialist"].includes(action) && (
              <div
                className="rounded-lg bg-muted/40 p-3 text-sm"
                aria-label="Document field profile"
              >
                <p className="font-medium">{kind} review profile</p>
                <p>{DOCUMENT_PROFILES[kind].fields.join(" · ")}</p>
                <Button
                  variant="outline"
                  disabled={blocked}
                  className="mt-2 h-auto whitespace-normal py-2"
                  onClick={() => {
                    setAction("checklist");
                    setQuestion(DOCUMENT_PROFILES[kind].fields.join(", "));
                    changed();
                  }}
                >
                  Use these fields as checklist
                </Button>
                <p className="mt-2 text-xs">
                  Extraction targets only; not a compliance or professional
                  review.
                </p>
              </div>
            )}
            {["questions", "checklist", "translate", "specialist"].includes(
              action,
            ) && (
              <label className="block text-sm">
                {action === "questions"
                  ? "Your question or follow-up"
                  : action === "translate"
                    ? "Target language"
                    : action === "specialist"
                      ? "Review focus (optional)"
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
            {action === "questions" && (
              <div className="space-y-3">
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Suggested questions"
                >
                  {[
                    ...DOCUMENT_PROFILES[kind].questions,
                    "What information is missing?",
                  ].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      disabled={blocked}
                      className="h-auto whitespace-normal py-2"
                      onClick={() => {
                        setQuestion(q);
                        changed();
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                {!!history.length && (
                  <section
                    aria-label="Conversation"
                    className="space-y-3 rounded border p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">
                        Conversation · {history.length} question(s)
                      </h3>
                      <Button
                        variant="outline"
                        disabled={blocked}
                        onClick={() => {
                          setHistory([]);
                          changed();
                        }}
                      >
                        New conversation
                      </Button>
                    </div>
                    {history.map((t, i) => (
                      <details key={i}>
                        <summary className="cursor-pointer break-words">
                          {t.question}
                        </summary>
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {t.answer}
                        </p>
                      </details>
                    ))}
                    <p className="text-xs">
                      Previous questions and answers are included in the next
                      request and its credit cost. Evidence is always checked
                      against the selected documents. Changing sources resets
                      this conversation.
                    </p>
                    {(contextLength > 6000 || history.length > 6) && (
                      <p role="alert">
                        Conversation limit reached. Start a new conversation; no
                        history is silently truncated.
                      </p>
                    )}
                  </section>
                )}
              </div>
            )}
            <p className="text-sm">
              {length.toLocaleString()} / 24,000 selected characters including
              your question and conversation
            </p>
            {length > 24000 && (
              <p role="alert" className="text-destructive">
                Deselect sections or shorten the reviewed text. Nothing is
                silently truncated.
              </p>
            )}
            <details className="space-y-3 rounded border p-3">
              <summary className="cursor-pointer font-semibold">
                Custom analysis templates
              </summary>
              <p className="text-xs">
                Save the current action and question/checklist. Templates stay
                in this tab unless included in an explicitly saved workspace.
              </p>
              <label className="block text-sm">
                Template name
                <input
                  className="block w-full rounded border bg-background p-2"
                  maxLength={100}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </label>
              <Button
                variant="outline"
                disabled={
                  blocked || !templateName.trim() || templates.length >= 20
                }
                onClick={() => {
                  setTemplates([
                    ...templates,
                    { name: templateName.trim(), action, question },
                  ]);
                  setTemplateName("");
                }}
              >
                Save analysis template
              </Button>
              {templates.map((t, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={blocked}
                    onClick={() => {
                      changed();
                      setAction(t.action);
                      setQuestion(t.question);
                    }}
                  >
                    Apply {t.name}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={blocked}
                    onClick={() =>
                      setTemplates(templates.filter((_, j) => j !== i))
                    }
                  >
                    Remove template {i + 1}
                  </Button>
                </div>
              ))}
            </details>
            <DocumentRules
              documents={sources}
              disabled={blocked || !valid}
              onResult={(r) => {
                changed();
                setResult(r);
              }}
            />
            <DocumentFinancialChecks
              documents={sources}
              disabled={blocked || !valid}
              onResult={(r) => {
                changed();
                setResult(r);
              }}
            />
            <DocumentSignatureReview file={current?.file} />
            <DocumentVisualReview
              file={current?.file}
              pageNumber={Number(focus.match(/-p(\d+)$/)?.[1] || 1)}
              password={current?.password}
              onReceipt={(id) => {
                if (!receipts.current.includes(id)) receipts.current.push(id);
              }}
              onApply={(text) => {
                changed();
                setDocuments((ds) =>
                  ds.map((d) => ({
                    ...d,
                    pages: d.pages.map((p) =>
                      p.id === focus ? { ...p, text } : p,
                    ),
                  })),
                );
              }}
            />
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={blocked || !valid}
                onClick={() => {
                  changed();
                  setTables(extractTables(sources));
                }}
              >
                Extract tables · Free
              </Button>
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
      {!!documents.length && (
        <section
          aria-label="Export privacy"
          className="space-y-3 rounded-xl border p-4"
        >
          <h2 className="font-semibold">Export & privacy review</h2>
          <label className="block text-sm">
            Report title
            <input
              className="block w-full rounded border bg-background p-2"
              maxLength={120}
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />
          </label>
          <details className="space-y-3 rounded border p-3">
            <summary className="cursor-pointer font-semibold">
              Custom report template
            </summary>
            <p className="text-xs">
              Add your introduction and closing note to TXT, Word, PDF and
              copied reports. These notes are explicitly labeled as authored
              content, never document evidence. The template is included when
              you save a workspace. Citations, checks and missing-information
              disclosures are always retained.
            </p>
            <label className="block">Word/PDF layout<select className="block rounded border bg-background p-2" value={reportTheme} onChange={e=>setReportTheme(e.target.value)}><option value="classic">Classic</option><option value="compact">Compact</option><option value="large-print">Large print</option></select></label>
            <label className="block">
              Report introduction
              <textarea
                className="block w-full rounded border bg-background p-2"
                maxLength={2000}
                value={reportIntroduction}
                onChange={(e) => setReportIntroduction(e.target.value)}
              />
            </label>
            <label className="block">
              Report closing note
              <textarea
                className="block w-full rounded border bg-background p-2"
                maxLength={2000}
                value={reportFooter}
                onChange={(e) => setReportFooter(e.target.value)}
              />
            </label>
          </details>
          {!!result?.findings.length && (
            <details className="space-y-3 rounded border p-3">
              <summary className="cursor-pointer font-semibold">
                Create an evidence-linked deadline reminder
              </summary>
              <p className="text-xs">
                Confirm the date yourself. Download an all-day calendar event
                with a one-day reminder; import it into your calendar. No
                notification is sent automatically.
              </p>
              <label className="block">
                Finding
                <select
                  className="block w-full rounded border bg-background p-2"
                  value={reminderIndex}
                  onChange={(e) => setReminderIndex(Number(e.target.value))}
                >
                  {result.findings.map((f, i) => (
                    <option key={i} value={i}>
                      {f.label}: {f.value.slice(0, 80)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                Confirmed deadline
                <input
                  type="date"
                  className="block rounded border bg-background p-2"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
              </label>
              <Button
                variant="outline"
                disabled={!reminderDate}
                onClick={() => {
                  try {
                    const finding = result.findings[reminderIndex];
                    if (!finding) throw Error("Select a finding.");
                    save(
                      documentReminder(
                        reminderDate,
                        redact(finding.label).slice(0, 200),
                        redact(
                          finding.value +
                            "\nEvidence: " +
                            finding.quote +
                            "\n" +
                            sourceLabel(finding.sourceId),
                        ),
                        crypto.randomUUID(),
                      ),
                      "document-reminder.ics",
                      "text/calendar;charset=utf-8",
                    );
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Download calendar reminder
              </Button>
            </details>
          )}
          <label className="block text-sm">
            Redact exact text (one phrase per line)
            <Textarea
              value={redactionTerms}
              maxLength={5000}
              onChange={(e) => setRedactionTerms(e.target.value)}
              placeholder="Names, account numbers, addresses or other text to remove from exports"
            />
          </label>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={redactIdentifiers}
              onChange={(e) => setRedactIdentifiers(e.target.checked)}
            />
            Also mask email addresses and international phone-number patterns
          </label>
          <p className="text-xs">
            Redaction applies to copied/downloaded text and reports, not the
            original file or text sent for AI analysis. Pattern detection is
            incomplete; review the preview before sharing. Source references may
            point to private originals.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                save(
                  redact(
                    sources
                      .map(
                        (d) =>
                          d.name +
                          "\n" +
                          d.pages
                            .map((p) => p.label + "\n" + p.text)
                            .join("\n\n"),
                      )
                      .join("\n\n"),
                  ),
                  "extracted-source.txt",
                )
              }
            >
              Download extracted text
            </Button>
            <Button variant="outline" disabled={blocked || !sources.length} onClick={()=>{
              try{exportWord(redact(sources.map(d=>d.name+'\n'+d.pages.map(p=>p.label+'\n'+p.text).join('\n\n')).join('\n\n')));}catch(e){setError((e as Error).message);}
            }}>Convert reviewed text to Word</Button>
            <Button variant="outline" disabled={blocked || !sources.length} onClick={async()=>{
              try{await downloadDocumentReport(redact(sources.map(d=>d.name+'\n'+d.pages.map(p=>p.label+'\n'+p.text).join('\n\n')).join('\n\n')));}catch(e){setError((e as Error).message);}
            }}>Convert reviewed text to PDF</Button>
            <p className="w-full text-xs">Conversions normalize the reviewed text and page references; they do not reproduce the original layout.</p>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    redact(
                      sources
                        .map((d) => d.pages.map((p) => p.text).join("\n\n"))
                        .join("\n\n"),
                    ),
                  );
                  setStatus("Reviewed extraction copied.");
                } catch {
                  setError(
                    "Clipboard unavailable; download the extraction instead.",
                  );
                }
              }}
            >
              Copy extracted text
            </Button>
          </div>
          {result && (
            <details>
              <summary className="cursor-pointer text-sm">
                Preview redacted report
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">
                {exportText()}
              </pre>
            </details>
          )}
        </section>
      )}
      {comparison && (
        <section
          aria-label="Side-by-side comparison"
          className="min-w-0 space-y-3 rounded-xl border p-4"
        >
          <h2 className="font-semibold">Original ↔ Revised</h2>
          <p className="text-xs">
            {sources[0]?.name} → {sources[1]?.name}. Removed and added rows
            preserve original source locations.
          </p>
          <div className="max-h-[36rem] overflow-auto">
            <div className="grid grid-cols-2 gap-2 font-semibold">
              <span>Original</span>
              <span>Revised</span>
            </div>
            {comparison.map((row, i) => (
              <div
                key={i}
                className={
                  "grid grid-cols-2 gap-2 border-b text-sm " +
                  (row.kind === "same" ? "" : "bg-primary/5")
                }
              >
                {[row.before, row.after].map((line, j) => (
                  <div key={j} className="min-w-0 p-2">
                    {line && (
                      <>
                        <span className="text-xs font-semibold">
                          {row.kind === "same"
                            ? "Unchanged"
                            : row.kind === "added"
                              ? "Added"
                              : "Removed"}
                        </span>
                        <p className="whitespace-pre-wrap break-words">
                          {line.text}
                        </p>
                        <button
                          className="text-xs underline"
                          onClick={() => {
                            setFocus(line.sourceId);
                            setEvidence({
                              label: "Compared line",
                              value: line.text,
                              quote: line.text,
                              sourceId: line.sourceId,
                              status: "extracted",
                            });
                          }}
                        >
                          View source
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
      {tables && (
        <section
          aria-label="Extracted tables"
          className="min-w-0 space-y-4 rounded-xl border p-5"
        >
          <h2 className="text-xl font-semibold">Tables & source rows</h2>
          <p className="text-sm">
            Detects consistent tab-separated or pipe-separated rows locally.
            Column names are placeholders; every original row is retained.
            Complex merged cells and visual-only tables require source review.
          </p>
          {!tables.length && (
            <p role="status">
              No consistent delimited table found. Review the extracted text or
              use the dedicated AI Table Extractor for visual layouts.
            </p>
          )}
          {tables.map((t, i) => (
            <div key={i} className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">
                  Table {i + 1} · {sourceLabel(t.sourceId)}
                </h3>
                <Button
                  variant="outline"
                  onClick={() =>
                    save(
                      csv(
                        t.rows[0].map((_, n) => "Column " + (n + 1)),
                        t.rows.map((row) => row.map(redact)),
                      ),
                      "document-table-" + (i + 1) + ".csv",
                      "text/csv;charset=utf-8",
                    )
                  }
                >
                  Export table {i + 1} CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    try {
                      exportExcel(
                        t.rows.map((row) => row.map(redact)),
                        "document-table-" + (i + 1) + ".xlsx",
                      );
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Export table {i + 1} Excel
                </Button>
              </div>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {t.rows[0].map((_, n) => (
                        <th key={n} className="border p-2 text-left">
                          Column {n + 1}
                        </th>
                      ))}
                      <th className="border p-2">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((row, n) => (
                      <tr key={n}>
                        {row.map((c, j) => (
                          <td key={j} className="border p-2">
                            {c}
                          </td>
                        ))}
                        <td className="border p-2">
                          <button
                            className="underline"
                            onClick={() => {
                              setFocus(t.sourceId);
                              setEvidence({
                                label: "Table row " + (n + 1),
                                value: t.quotes[n],
                                quote: t.quotes[n],
                                sourceId: t.sourceId,
                                status: "extracted",
                              });
                            }}
                          >
                            View row {n + 1} source
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
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
                onClick={() => {
                  try {
                    exportWord(exportText(), reportTheme);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Export Word
              </Button>
              <Button
                variant="outline"
                disabled={blocked}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await downloadDocumentReport(exportText(), reportTheme);
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
                          name: redact(d.name),
                        })),
                        ...exportResult,
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
                      (exportResult?.findings || []).map((f) => [
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
