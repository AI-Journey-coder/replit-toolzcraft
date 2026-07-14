import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

const MAX_CHARS = 60000;

type Task = "summarize" | "key-points" | "qa" | "translate";

async function analyze(body: {
  task: Task;
  text: string;
  question?: string;
  targetLanguage?: string;
}): Promise<string> {
  const res = await fetch(apiUrl("/ai/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed: ${res.status}`);
  }
  return data.result as string;
}

function useAiTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (body: Omit<Parameters<typeof analyze>[0], "text">) => {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    setResult("");
    try {
      setResult(await analyze({ ...body, text: text.slice(0, MAX_CHARS) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return { text, setText, result, error, busy, run };
}

function TextInput({
  text,
  setText,
  placeholder,
}: {
  text: string;
  setText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Document text</Label>
        <span className="text-xs text-muted-foreground">
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </span>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
        placeholder={placeholder}
        rows={10}
        data-testid="input-document-text"
      />
      <p className="text-xs text-muted-foreground">
        Tip: use the PDF Text Extractor or OCR tools to pull text out of files first.
      </p>
    </div>
  );
}

function ResultBox({ result, error, busy }: { result: string; error: string; busy: boolean }) {
  if (busy) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="status-analyzing">
        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
      </div>
    );
  }
  if (error) {
    return <p className="text-sm text-destructive" data-testid="text-error">{error}</p>;
  }
  if (!result) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Result</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigator.clipboard.writeText(result)}
          data-testid="button-copy-result"
        >
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
      </div>
      <Textarea value={result} readOnly rows={12} data-testid="text-result" />
    </div>
  );
}

// ─── AI Summarizer ────────────────────────────────────────────────────────────
export function AiSummarizer() {
  const t = useAiTool();
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Document Summarizer</CardTitle>
        <CardDescription>Paste any document text and get a concise summary with key bullet points.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput text={t.text} setText={t.setText} placeholder="Paste your document text here…" />
        <Button onClick={() => t.run({ task: "summarize" })} disabled={t.busy || !t.text.trim()} data-testid="button-run">
          <Sparkles className="h-4 w-4 mr-2" /> Summarize
        </Button>
        <ResultBox result={t.result} error={t.error} busy={t.busy} />
      </CardContent>
    </Card>
  );
}

// ─── AI Key Points ────────────────────────────────────────────────────────────
export function AiKeyPoints() {
  const t = useAiTool();
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Key Points Extractor</CardTitle>
        <CardDescription>Pull out the important names, dates, figures, and decisions from any text.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput text={t.text} setText={t.setText} placeholder="Paste your document text here…" />
        <Button onClick={() => t.run({ task: "key-points" })} disabled={t.busy || !t.text.trim()} data-testid="button-run">
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
        <CardDescription>Ask questions about a document — answers come only from the text you provide.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput text={t.text} setText={t.setText} placeholder="Paste your document text here…" />
        <div className="space-y-2">
          <Label>Your question</Label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is the total amount due?"
            data-testid="input-question"
          />
        </div>
        <Button
          onClick={() => t.run({ task: "qa", question })}
          disabled={t.busy || !t.text.trim() || !question.trim()}
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
  "English", "Hindi", "Spanish", "French", "German", "Portuguese", "Italian",
  "Arabic", "Russian", "Japanese", "Korean", "Chinese (Simplified)", "Bengali",
  "Tamil", "Telugu", "Marathi", "Gujarati", "Urdu",
];

export function AiTranslator() {
  const t = useAiTool();
  const [language, setLanguage] = useState("English");
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Document Translator</CardTitle>
        <CardDescription>Translate document text into another language while preserving meaning and structure.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TextInput text={t.text} setText={t.setText} placeholder="Paste the text you want to translate…" />
        <div className="space-y-2">
          <Label>Translate to</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-64" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => t.run({ task: "translate", targetLanguage: language })}
          disabled={t.busy || !t.text.trim()}
          data-testid="button-run"
        >
          <Sparkles className="h-4 w-4 mr-2" /> Translate
        </Button>
        <ResultBox result={t.result} error={t.error} busy={t.busy} />
      </CardContent>
    </Card>
  );
}
