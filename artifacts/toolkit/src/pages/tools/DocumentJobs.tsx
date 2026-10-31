import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type {
  DocumentSource,
  IntelligenceResult,
} from "@workspace/document-intelligence";
type Job = {
  id: string;
  action: string;
  state: string;
  credits: number;
  attempts: number;
  error_code?: string;
};
export function DocumentJobs({
  body,
  quote,
  consent,
  disabled,
  onResult,
}: {
  body: () => unknown;
  quote: { fingerprint: string; credits: number } | null;
  consent: boolean;
  disabled: boolean;
  onResult: (r: IntelligenceResult, d: DocumentSource[]) => void;
}) {
  const { firebaseUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [enabled, setEnabled] = useState(false);
  const retry = useRef<{ fingerprint: string; id: string } | null>(null);
  const account = useRef(firebaseUser?.uid);
  account.current = firebaseUser?.uid;
  useEffect(() => {
    setJobs([]);
    setEnabled(false);
    retry.current = null;
    setMessage("");
  }, [firebaseUser?.uid]);
  async function request(path = "", method = "GET", value?: unknown) {
    if (!firebaseUser) throw Error("Sign in for queued processing.");
    const uid = firebaseUser.uid;
    const r = await fetch(apiUrl("/document-jobs" + path), {
      method,
      headers: {
        Authorization: "Bearer " + (await firebaseUser.getIdToken()),
        "Content-Type": "application/json",
      },
      ...(value ? { body: JSON.stringify(value) } : {}),
    });
    const data = await r.json();
    if (account.current !== uid)
      throw Error("Account changed; reload the queue.");
    if (!r.ok) throw Error(data.message || "Job request failed.");
    return data;
  }
  async function refresh() {
    const data = await request();
    setJobs(data.jobs);
    setEnabled(data.enabled);
    if (!data.enabled)
      setMessage(
        "The administrator must enable and schedule the background worker before queued processing is available.",
      );
  }
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!firebaseUser) return null;
  return (
    <details className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">
        Background processing & job history
      </summary>
      <p className="text-xs">
        Queued source and results are encrypted for up to 24 hours. Each job
        uses the displayed credit quote; credits settle only on success. Running
        cancellation is best effort. Refresh to see progress.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={disabled || busy}
          onClick={() => void run(refresh)}
        >
          Refresh processing jobs
        </Button>
        <Button
          disabled={disabled || busy || !enabled || !quote || !consent}
          onClick={() =>
            void run(async () => {
              if (!quote) return;
              if (retry.current?.fingerprint !== quote.fingerprint)
                retry.current = {
                  fingerprint: quote.fingerprint,
                  id: crypto.randomUUID(),
                };
              await request("", "POST", {
                ...(body() as object),
                ...quote,
                requestId: retry.current.id,
                consent: true,
              });
              await refresh();
              setMessage(
                "Queued. The background worker will process this request. Retrying this submission reuses its request ID.",
              );
            })
          }
        >
          Queue selected analysis
        </Button>
      </div>
      <div className="max-h-80 space-y-2 overflow-auto">
        {jobs.map((j) => (
          <div key={j.id} className="rounded border p-3 text-sm">
            <p>
              {j.action.replaceAll("_", " ")} · {j.state.replaceAll("_", " ")} ·{" "}
              {j.credits} credits on success · attempt {j.attempts}/3
            </p>
            {j.error_code && <p>{j.error_code.replaceAll("_", " ")}</p>}
            <div className="flex flex-wrap gap-2">
              {j.state === "completed" && (
                <Button
                  variant="outline"
                  disabled={busy || disabled}
                  onClick={() =>
                    void run(async () => {
                      const data = await request("/" + j.id);
                      onResult(data.result, data.documents);
                      setMessage(
                        "Result and its original selected source loaded.",
                      );
                    })
                  }
                >
                  Open result
                </Button>
              )}
              {["queued", "running"].includes(j.state) && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const data = await request(
                        "/" + j.id + "/cancel",
                        "POST",
                        {},
                      );
                      await refresh();
                      setMessage(data.message);
                    })
                  }
                >
                  Cancel job
                </Button>
              )}
              {j.state === "failed" && j.attempts < 3 && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await request("/" + j.id + "/retry", "POST", {});
                      await refresh();
                    })
                  }
                >
                  Retry job
                </Button>
              )}
              {!["running", "cancel_requested"].includes(j.state) && (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await request("/" + j.id, "DELETE");
                      await refresh();
                    })
                  }
                >
                  Delete job text
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </details>
  );
}
