import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ACTIONS } from "@workspace/document-intelligence";
export function DocumentWorkflows() {
  const { firebaseUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]),
    [workflows, setWorkflows] = useState<any[]>([]),
    [workspace, setWorkspace] = useState(""),
    [name, setName] = useState(""),
    [action, setAction] = useState("overview"),
    [question, setQuestion] = useState(""),
    [repeat, setRepeat] = useState("once"),
    [next, setNext] = useState(""),
    [credits, setCredits] = useState(1),
    [field, setField] = useState(""),
    [expected, setExpected] = useState(""),
    [webhook, setWebhook] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [enabled, setEnabled] = useState(false),
    [message, setMessage] = useState(""),
    [signingKey, setSigningKey] = useState("");
  const uid = useRef(firebaseUser?.uid);
  uid.current = firebaseUser?.uid;
  useEffect(() => {
    setWorkspaces([]);
    setWorkflows([]);
    setWorkspace("");
    setName("");
    setAction("overview");
    setQuestion("");
    setRepeat("once");
    setNext("");
    setCredits(1);
    setField("");
    setExpected("");
    setWebhook("");
    setSigningKey("");
    setConsent(false);
    setEnabled(false);
    setMessage("");
  }, [firebaseUser?.uid]);
  async function request(path: string, method = "GET", body?: unknown) {
    if (!firebaseUser) throw Error("Sign in first.");
    const account = firebaseUser.uid;
    const r = await fetch(apiUrl(path), {
      method,
      headers: {
        Authorization: "Bearer " + (await firebaseUser.getIdToken()),
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await r.json();
    if (uid.current !== account) throw Error("Account changed.");
    if (!r.ok) throw Error(data.message || "Workflow request failed.");
    return data;
  }
  async function refresh() {
    const [w, f] = await Promise.all([
      request("/document-workspaces"),
      request("/document-workflows"),
    ]);
    setWorkspaces(w.workspaces.filter((x: any) => x.role === "owner"));
    setWorkflows(f.workflows);
    setEnabled(f.enabled);
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
  const input = "block w-full rounded border bg-background p-2";
  return (
    <details className="space-y-3 rounded-xl border p-4">
      <summary className="cursor-pointer font-semibold">
        Workflow builder & scheduled reports
      </summary>
      <p className="text-sm">
        Run an analysis once or daily on the latest approved version of your
        saved workspace. Unapproved changes wait for review. Each successful run
        uses up to your selected credit cap. Workflows stop being useful when
        the workspace expires; pause or delete them at any time.
      </p>
      <Button
        variant="outline"
        disabled={busy}
        onClick={() => void run(refresh)}
      >
        Load my workflows and workspaces
      </Button>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Workflow name
          <input
            className={input}
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Owned workspace
          <select
            className={input}
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
          >
            <option value="">Choose a saved workspace</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} · {w.review_state}
              </option>
            ))}
          </select>
        </label>
        <label>
          Scheduled action
          <select
            className={input}
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Maximum credits per run
          <select
            className={input}
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          First run (UTC)
          <input
            className={input}
            type="datetime-local"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>
        <label>
          Repeat
          <select
            className={input}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
          </select>
        </label>
      </div>
      <label className="block">
        Scheduled question, target language or checklist
        <textarea
          className={input}
          value={question}
          maxLength={2000}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Conditional field (optional)
          <input
            className={input}
            value={field}
            maxLength={100}
            onChange={(e) => setField(e.target.value)}
          />
        </label>
        <label>
          Must contain this value
          <input
            className={input}
            value={expected}
            maxLength={200}
            onChange={(e) => setExpected(e.target.value)}
          />
        </label>
      </div>
      <p className="text-xs">
        If this field is absent, ambiguous or does not match, the workflow
        requests human review instead of processing.
      </p>
      <label className="block">
        Status webhook URL (optional)
        <input
          className={input}
          type="url"
          value={webhook}
          maxLength={2000}
          onChange={(e) => setWebhook(e.target.value)}
        />
      </label>
      <p className="text-xs">
        The administrator must approve its hostname. Events contain job ID,
        action and state only. Receivers must verify the HMAC signature and
        timestamp, deduplicate event IDs, and fetch results through
        authenticated API access.
      </p>
      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        I authorize this schedule to analyze approved saved versions, use up to{" "}
        {credits} credits per successful run, and send status events to the URL
        above.
      </label>
      <Button
        disabled={busy || !enabled || !consent || !name || !workspace || !next}
        onClick={() =>
          void run(async () => {
            await request("/document-workflows", "POST", {
              name,
              workspaceId: workspace,
              nextRunAt: new Date(next + "Z").toISOString(),
              consent,
              specification: {
                action,
                question,
                maxCredits: credits,
                repeat,
                webhook,
                rules: field
                  ? [{ label: field, field, operator: "contains", expected }]
                  : [],
              },
            });
            setConsent(false);
            await refresh();
            setMessage(
              "Workflow saved. It will run only when the workspace version is approved and conditions pass.",
            );
          })
        }
      >
        Create scheduled workflow
      </Button>
      {!enabled && (
        <p className="text-xs">
          Load workflows to check availability. Scheduled processing needs the
          deployed background worker.
        </p>
      )}
      {workflows.map((w) => (
        <div key={w.id} className="space-y-2 rounded border p-3 text-sm">
          <p className="font-semibold">
            {w.name} · {w.enabled ? "Enabled" : "Paused"}
          </p>
          <p>
            Next run: {new Date(w.next_run_at).toLocaleString()} ·{" "}
            {w.last_status || "Not run yet"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await request("/document-workflows/" + w.id, "PATCH", {
                    enabled: !w.enabled,
                  });
                  await refresh();
                })
              }
            >
              {w.enabled ? "Pause" : "Resume"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const d = await request(
                    "/document-workflows/" + w.id + "/signing-key",
                    "POST",
                    {},
                  );
                  setSigningKey(d.key);
                  setMessage(d.algorithm);
                })
              }
            >
              Reveal webhook verification key
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await request("/document-workflows/" + w.id, "DELETE");
                  setSigningKey("");
                  await refresh();
                })
              }
            >
              Delete workflow
            </Button>
          </div>
        </div>
      ))}
      {signingKey && (
        <label className="block">
          Webhook verification key
          <input
            className={input}
            type="password"
            value={signingKey}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <Button variant="ghost" onClick={() => setSigningKey("")}>
            Hide and clear key
          </Button>
        </label>
      )}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
