import { AiConfiguration } from "./AiConfiguration";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
export function DocumentOperations() {
  const { firebaseUser } = useAuth();
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const account = useRef(firebaseUser?.uid);
  account.current = firebaseUser?.uid;
  useEffect(() => { setData(null); setError(""); setBusy(false); }, [firebaseUser?.uid]);
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Document processing operations</h2>
      <AiConfiguration />
      <Button
        disabled={busy}
        onClick={async () => {
          const uid = firebaseUser?.uid;
          if (!uid) return;
          setBusy(true);
          setError("");
          try {
            const r = await fetch(apiUrl("/admin/document-operations"), {
              headers: {
                Authorization: "Bearer " + (await firebaseUser?.getIdToken()),
              },
            });
            const d = await r.json();
            if (!r.ok)
              throw Error(d.message || "Unable to load document operations.");
            if (account.current === uid) setData(d);
          } catch (e) {
            if (account.current === uid) setError((e as Error).message);
          } finally {
            if (account.current === uid) setBusy(false);
          }
        }}
      >
        Refresh document operations
      </Button>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded border p-4">
              Saved workspaces
              <strong className="block text-2xl">
                {data.workspaces.total}
              </strong>
            </div>
            <div className="rounded border p-4">
              Awaiting review
              <strong className="block text-2xl">
                {data.workspaces.awaiting_review}
              </strong>
            </div>
            <div className="rounded border p-4">
              Expired pending cleanup
              <strong className="block text-2xl">
                {data.workspaces.expired_pending_cleanup}
              </strong>
            </div>
          </div>
          <p>Worker enabled: {data.workerEnabled ? "Yes" : "No"}</p>
          <p className="text-sm">{data.retention}</p>
          <div className="flex flex-wrap gap-3">
            {data.states.map((s: any) => (
              <span key={s.state} className="rounded border p-2">
                {s.state}: {s.count}
              </span>
            ))}
          </div>
          <h3 className="font-semibold">All provider calls — last 30 days</h3>
          <p className="text-xs">Includes direct analysis, images, queued jobs and correction attempts. Do not add these totals to queued-job usage. Costs use current configured rates; missing usage is unpriced.</p>
          {(data.providerCalls || []).map((p:any)=><p key={[p.provider,p.model,p.kind,p.outcome].join(':')}>{p.model} · {p.kind} · {p.outcome}: {p.calls} calls · {p.input_tokens} input / {p.output_tokens} output tokens · {p.unknown_usage} calls with unknown usage · USD {p.estimated_usd ?? 'unavailable'}</p>)}
          <h3 className="font-semibold">Queued job model usage</h3>
          <h3 className="font-semibold">Server uploads — last 30 days</h3>
          <p className="text-xs">Counts and bytes only; no filenames or document text. Local-only files never reach the server and are not counted.</p>
          {(data.transfers || []).map((t:any)=><p key={t.operation+t.outcome}>{t.operation} · {t.outcome}: {t.requests} requests · {(Number(t.bytes)/1048576).toFixed(2)} MB · {(Number(t.duration_ms)/Math.max(1,Number(t.requests))/1000).toFixed(1)} s average</p>)}
          <p className="text-xs">{data.costNote}</p>
          {data.models.map((m: any, i: number) => (
            <p key={i}>
              {m.model || "Not started"} · {m.jobs} jobs · {m.input_tokens}{" "}
              input tokens · {m.output_tokens} output tokens · estimated USD{" "}
              {m.estimated_usd ?? "unavailable"}
            </p>
          ))}
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[
                    "Job",
                    "Action",
                    "State",
                    "Attempts",
                    "Failure",
                    "Estimated USD",
                  ].map((h) => (
                    <th key={h} className="p-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((j: any) => (
                  <tr key={j.id}>
                    <td className="p-2 font-mono">{j.id.slice(0, 8)}</td>
                    <td>{j.action}</td>
                    <td>{j.state}</td>
                    <td>{j.attempts}</td>
                    <td>{j.error_code || "—"}</td>
                    <td>{j.estimated_usd ?? "Unavailable"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
