import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
export function AiConfiguration() {
  const { firebaseUser } = useAuth(),
    [data, setData] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const uid = useRef(firebaseUser?.uid);
  uid.current = firebaseUser?.uid;
  useEffect(() => {
    setData(null);
    setMessage("");
  }, [firebaseUser?.uid]);
  async function run(save = false) {
    if (!firebaseUser || busy) return;
    const account = firebaseUser.uid;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch(apiUrl("/admin/ai-configuration"), {
        method: save ? "PUT" : "GET",
        headers: {
          Authorization: "Bearer " + (await firebaseUser.getIdToken()),
          "Content-Type": "application/json",
        },
        ...(save ? { body: JSON.stringify(data) } : {}),
      });
      const d = await r.json();
      if (uid.current !== account) return;
      if (!r.ok) throw Error(d.message || "Configuration request failed.");
      if (save) setMessage(d.message);
      else setData(d);
    } catch (e) {
      if (uid.current === account) setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const input = "block w-full rounded border bg-background p-2";
  return (
    <details className="space-y-3 rounded border p-4">
      <summary className="cursor-pointer font-semibold">
        AI model & cost-rate configuration
      </summary>
      <p className="text-sm">
        Choose only deployment-approved models. Changes affect new AI calls
        without redeployment; test each model on staging first. Rates below are
        manually verified USD per million tokens, not live provider pricing or
        an invoice.
      </p>
      <Button disabled={busy} variant="outline" onClick={() => void run()}>
        Load model configuration
      </Button>
      {data && (
        <>
          <label>
            Active {data.provider} model
            <select
              className={input}
              value={data.model}
              onChange={(e) =>
                setData({
                  ...data,
                  model: e.target.value,
                  inputRate: "",
                  outputRate: "",
                  rateNote: "",
                })
              }
            >
              {data.allowed.map((m: string) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              Input USD per million tokens
              <input
                className={input}
                inputMode="decimal"
                value={data.inputRate}
                onChange={(e) =>
                  setData({ ...data, inputRate: e.target.value })
                }
              />
            </label>
            <label>
              Output USD per million tokens
              <input
                className={input}
                inputMode="decimal"
                value={data.outputRate}
                onChange={(e) =>
                  setData({ ...data, outputRate: e.target.value })
                }
              />
            </label>
          </div>
          <label>
            Rate source and effective date
            <textarea
              className={input}
              maxLength={500}
              value={data.rateNote}
              onChange={(e) => setData({ ...data, rateNote: e.target.value })}
            />
          </label>
          <Button disabled={busy} onClick={() => void run(true)}>
            Save model and rates
          </Button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
