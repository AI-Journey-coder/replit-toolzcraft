import { Source } from "./DocumentWorkflows";
import { AnalysisResult } from "./AnalysisResult";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { getAuth } from "firebase/auth";
import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

const MAX_CHARS = 6000;

type Task = "summarize" | "key-points" | "qa" | "translate";

async function analyze(body: {
  task: Task;
  text: string;
  question?: string;
  targetLanguage?: string;
}): Promise<string> {
  if (import.meta.env.VITE_ENABLE_AI !== "true")
    throw new Error(
      "AI analysis is unavailable in this preview. Browser-only tools remain available.",
    );
  const user = getAuth().currentUser;
  if (!user) throw new Error("Sign in to use AI tools.");
  const token = await user.getIdToken();
  const res = await fetch(apiUrl("/ai/analyze"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 402 && data?.code === "SUBSCRIPTION_REQUIRED")
    throw new Error("SUBSCRIPTION_REQUIRED");
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed: ${res.status}`);
  }
  return data.result as string;
}

function useAiTool() {
  const [text, updateText] = useState("");
  const { firebaseUser, user } = useAuth();
  const [consent, setConsent] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const lock = useRef(false);
  const setText = (v: string) => {
    updateText(v);
    setResult("");
    setError("");
    setConsent(false);
  };
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (body: Omit<Parameters<typeof analyze>[0], "text">) => {
    if (lock.current || extracting || !consent || !firebaseUser || !text.trim())
      return;
    if (
      text.length +
        (body.question?.length || 0) +
        (body.targetLanguage?.length || 0) >
      MAX_CHARS
    ) {
      setError(
        "Shorten the document to 6,000 characters before continuing. Nothing has been sent.",
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setResult("");
    try {
      setResult(await analyze({ ...body, text }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return {
    text,
    setText,
    result,
    setResult,
    error,
    busy,
    run,
    firebaseUser,
    user,
    consent,
    setConsent,
    extracting,
    setExtracting,
  };
}

function TextInput({
  t,
  extra = 0,
}: {
  t: ReturnType<typeof useAiTool>;
  extra?: number;
}) {
  const enabled = import.meta.env.VITE_ENABLE_AI === "true";
  return (
    <div className="space-y-3">
      <Source
        label="Document text"
        value={t.text}
        onChange={t.setText}
        disabled={t.busy}
        onBusyChange={t.setExtracting}
      />
      <p className="text-sm">
        {(t.text.length + extra).toLocaleString()} / 6,000 characters including
        options ·{" "}
        {t.user?.role === "admin"
          ? "Unlimited administrator credits"
          : "1 credit per successful request"}
      </p>
      {t.text.length + extra > MAX_CHARS && (
        <p role="alert" className="text-destructive">
          Select a shorter section. Your full input is preserved; nothing has
          been sent or truncated.
        </p>
      )}
      {!enabled ? (
        <p>AI is unavailable in this build.</p>
      ) : !t.firebaseUser ? (
        <Link href="/login" className="underline text-primary">
          Sign in to use AI
        </Link>
      ) : (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={t.consent}
            disabled={t.busy || t.extracting}
            onChange={(e) => t.setConsent(e.target.checked)}
          />
          Send this reviewed text to the AI provider.{" "}
          {t.user?.role === "admin"
            ? "Uses your unlimited admin allowance."
            : "Uses 1 credit on success."}{" "}
          The original file stays local.
        </label>
      )}
    </div>
  );
}
function canRun(t: ReturnType<typeof useAiTool>, extra = 0) {
  return (
    import.meta.env.VITE_ENABLE_AI === "true" &&
    !!t.firebaseUser &&
    t.consent &&
    !t.busy &&
    !t.extracting &&
    !!t.text.trim() &&
    t.text.length + extra <= MAX_CHARS
  );
}
function ResultBox({
  result,
  error,
  busy,
}: {
  result: string;
  error: string;
  busy: boolean;
}) {
  if (busy) return <p role="status">Reading your document…</p>;
  if (error)
    return (
      <div role="alert" className="text-destructive">
        {error === "SUBSCRIPTION_REQUIRED" ? (
          <Link href="/subscriptions">
            Your credits are used. View subscription and credits.
          </Link>
        ) : (
          error
        )}
      </div>
    );
  return result ? <AnalysisResult result={result} /> : null;
}

// ─── AI Summarizer ────────────────────────────────────────────────────────────
export { SummaryModes as AiSummarizer } from "./SummaryModes";

// ─── AI Key Points ────────────────────────────────────────────────────────────
export function AiKeyPoints() {
  const t = useAiTool();
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Key Points Extractor</CardTitle>
        <CardDescription>
          Pull out the important names, dates, figures, and decisions from any
          text.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput t={t} />
        <Button
          onClick={() => t.run({ task: "key-points" })}
          disabled={!canRun(t)}
          data-testid="button-run"
        >
          <Sparkles className="h-4 w-4 mr-2" /> Extract key points
        </Button>
        <ResultBox result={t.result} error={t.error} busy={t.busy} />
      </CardContent>
    </Card>
  );
}

// ─── AI Document Q&A ──────────────────────────────────────────────────────────
export function AiDocumentQa() {
  const t = useAiTool();
  const [question, setQuestion] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Document Q&amp;A</CardTitle>
        <CardDescription>
          Ask questions about a document — answers come only from the text you
          provide.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput t={t} extra={question.length} />
        <div className="space-y-2">
          <Label>Your question</Label>
          <Input
            value={question}
            disabled={t.busy}
            onChange={(e) => {
              setQuestion(e.target.value);
              t.setResult("");
            }}
            placeholder="e.g. What is the total amount due?"
            data-testid="input-question"
          />
        </div>
        <Button
          onClick={() => t.run({ task: "qa", question })}
          disabled={!canRun(t, question.length) || !question.trim()}
          data-testid="button-run"
        >
          <Sparkles className="h-4 w-4 mr-2" /> Get answer
        </Button>
        <ResultBox result={t.result} error={t.error} busy={t.busy} />
      </CardContent>
    </Card>
  );
}

// ─── AI Translator ────────────────────────────────────────────────────────────
const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Arabic",
  "Russian",
  "Japanese",
  "Korean",
  "Chinese (Simplified)",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Urdu",
];

export function AiTranslator() {
  const t = useAiTool();
  const [language, setLanguage] = useState("English");
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Document Translator</CardTitle>
        <CardDescription>
          Translate document text into another language while preserving meaning
          and structure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput t={t} extra={language.length} />
        <div className="space-y-2">
          <Label>Translate to</Label>
          <Select
            disabled={t.busy}
            value={language}
            onValueChange={(v) => {
              setLanguage(v);
              t.setResult("");
            }}
          >
            <SelectTrigger className="w-64" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => t.run({ task: "translate", targetLanguage: language })}
          disabled={!canRun(t, language.length)}
          data-testid="button-run"
        >
          <Sparkles className="h-4 w-4 mr-2" /> Translate
        </Button>
        <ResultBox result={t.result} error={t.error} busy={t.busy} />
      </CardContent>
    </Card>
  );
}
