import { AnalysisResult } from "./AnalysisResult";
import { useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { freeSummary } from "@/lib/free-summary";
import { Source } from "./DocumentWorkflows";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
type Mode = "free" | "quick" | "full";
export function SummaryModes() {
  const { firebaseUser, user } = useAuth();
  const [mode, setMode] = useState<Mode>("free"),
    [text, setText] = useState(""),
    [result, setResult] = useState(""),
    [busy, setBusy] = useState(false),
    [consent, setConsent] = useState(false),
    [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const retry = useRef<{ key: string; id: string } | null>(null);
  const lock = useRef(false);
  const limit = mode === "quick" ? 6000 : 24000;
  const cost = mode === "free" ? 0 : Math.max(1, Math.ceil(text.length / 6000));
  const enabled = import.meta.env.VITE_ENABLE_AI === "true";
  function reset() {
    setResult("");
    setError("");
    setConsent(false);
    retry.current = null;
  }
  async function run() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setResult("");
    try {
      if (mode === "free") {
        setResult(freeSummary(text));
        return;
      }
      if (
        !enabled ||
        !firebaseUser ||
        !consent ||
        !text.trim() ||
        text.length > limit
      )
        throw Error("Review the text and sign in before continuing.");
      const key = mode + "\n" + text;
      if (retry.current?.key !== key) {
        const digest = Array.from(
          new Uint8Array(
            await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(firebaseUser.uid + "\n" + key),
            ),
          ),
        )
          .map((n) => n.toString(16).padStart(2, "0"))
          .join("");
        let id = crypto.randomUUID();
        try {
          const stored = JSON.parse(
            sessionStorage.getItem("summary-retry:" + digest) || "null",
          );
          if (stored && Date.now() - stored.time < 86400000) id = stored.id;
          else
            sessionStorage.setItem(
              "summary-retry:" + digest,
              JSON.stringify({ id, time: Date.now() }),
            );
        } catch {
          /* Storage is optional; in-memory retries still work. */
        }
        retry.current = { key, id };
      }
      const response = await fetch(apiUrl("/ai/summary"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (await firebaseUser.getIdToken()),
        },
        body: JSON.stringify({ mode, text, requestId: retry.current.id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw Error(
          data?.message ||
            "Connection interrupted. Retry without changing the text to avoid a duplicate charge.",
        );
      setResult(data.result);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not finish. Retry the same request.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Document Summarizer</CardTitle>
        <p>
          Choose a free local summary or AI analysis. Upload a document, review
          the text, then summarize.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <fieldset
          disabled={busy || extracting}
          className="grid min-w-0 gap-3 md:grid-cols-3"
        >
          <legend className="mb-2 font-semibold">Summary mode</legend>
          {(
            [
              [
                "free",
                "Free Summary",
                "Selects important original sentences. No AI rewriting or sign-in.",
                "Free · runs on your device",
              ],
              [
                "quick",
                "Quick Summary",
                "AI overview and key points. Up to 6,000 characters.",
                "1 credit",
              ],
              [
                "full",
                "Full Document",
                "Combined AI overview and findings. Up to 24,000 characters / 20 PDF pages.",
                "1 credit per 6,000 characters; maximum 4",
              ],
            ] as const
          ).map(([id, title, description, price]) => (
            <label
              key={id}
              className={
                "cursor-pointer rounded-xl border p-4 space-y-2 " +
                (mode === id ? "border-primary bg-primary/10" : "")
              }
            >
              <span className="flex gap-2 font-semibold">
                <input
                  type="radio"
                  aria-label={title}
                  name="summary-mode"
                  value={id}
                  checked={mode === id}
                  onChange={() => {
                    setMode(id);
                    reset();
                  }}
                />
                {title}
              </span>
              <p className="text-sm">{description}</p>
              <p className="text-sm font-semibold text-primary">{price}</p>
            </label>
          ))}
        </fieldset>
        <Button
          variant="outline"
          disabled={busy || extracting}
          onClick={() => {
            setText(
              "Project review — 12 October 2026. The team agreed to launch the pilot on 2 November 2026 with 40 customers. The budget is ₹85,000, including ₹15,000 for support. Priya will finish accessibility testing by 25 October. Omar will send customer invitations by 28 October. The payment integration is still untested; launch depends on a successful test. No decision was made about international expansion.",
            );
            reset();
          }}
        >
          Try an example
        </Button>
        <Source
          label="Document to summarize"
          value={text}
          onChange={(v) => {
            setText(v);
            reset();
          }}
          disabled={busy}
          maxPages={mode === "quick" ? 5 : 20}
          onBusyChange={setExtracting}
        />
        <p className="text-sm">
          {text.length.toLocaleString()} / {limit.toLocaleString()} characters ·{" "}
          {mode === "free"
            ? "No credits used"
            : user?.role === "admin"
              ? "Administrator: unlimited credits"
              : cost +
                " credit" +
                (cost === 1 ? "" : "s") +
                " for this summary"}
        </p>
        {text.length > limit && (
          <p role="alert" className="text-destructive">
            {mode === "quick"
              ? "Choose Full Document or shorten the text."
              : "Shorten the text to 24,000 characters."}{" "}
            Nothing is silently truncated.
          </p>
        )}
        {mode !== "free" && (
          <>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={consent}
                disabled={busy}
                onChange={(e) => setConsent(e.target.checked)}
              />
              Send this reviewed text to the AI provider and use{" "}
              {user?.role === "admin"
                ? "my unlimited admin allowance"
                : cost + " credit" + (cost === 1 ? "" : "s")}
              . The original file stays local.
            </label>
            <p className="text-xs text-muted-foreground">
              The generated summary is saved to recover retries. Retry unchanged
              text within 24 hours without another charge. Source text is not
              saved by ToolzCraft. AI can make mistakes; verify findings and any
              page references against the source.
            </p>
            {!enabled ? (
              <p>
                AI modes are unavailable in this build. Free Summary works
                locally.
              </p>
            ) : (
              !firebaseUser && (
                <Link className="underline text-primary" href="/login">
                  Sign in for AI summaries
                </Link>
              )
            )}
          </>
        )}
        <Button
          data-testid="button-run"
          disabled={
            busy ||
            extracting ||
            !text.trim() ||
            text.length > limit ||
            (mode !== "free" && (!consent || !firebaseUser || !enabled))
          }
          onClick={() => void run()}
        >
          {busy
            ? "Preparing summary…"
            : mode === "free"
              ? "Create free summary"
              : "Summarize · " +
                (user?.role === "admin"
                  ? "Unlimited"
                  : cost + " credit" + (cost === 1 ? "" : "s"))}
        </Button>
        {busy && (
          <p role="status">
            Processing the reviewed text. Please keep this page open.
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {result && (
          <>
            <p className="text-sm text-muted-foreground">
              {mode === "free"
                ? "Original sentences selected locally; this is not an AI interpretation. For a rewritten overview and findings, choose Quick Summary."
                : "Check important facts and figures against your source."}
            </p>
            <AnalysisResult result={result} title="Summary result" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
