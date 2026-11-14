import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
export function SupportRequests({ admin = false }: { admin?: boolean }) {
  const { firebaseUser } = useAuth(),
    [requests, setRequests] = useState<any[]>([]),
    [title, setTitle] = useState(""),
    [message, setMessage] = useState(""),
    [category, setCategory] = useState("problem"),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [drafts, setDrafts] = useState<
      Record<string, { status: string; response: string }>
    >({}),
    [offset, setOffset] = useState(0);
  const account = useRef(firebaseUser?.uid);
  account.current = firebaseUser?.uid;
  useEffect(() => {
    setRequests([]);
    setTitle("");
    setMessage("");
    setCategory("problem");
    setConsent(false);
    setNotice("");
    setDrafts({});
    setOffset(0);
  }, [firebaseUser?.uid]);
  async function request(path = "", method = "GET", body?: unknown) {
    if (!firebaseUser) throw Error("Sign in to use private support requests.");
    const uid = firebaseUser.uid;
    const r = await fetch(
      apiUrl((admin ? "/admin" : "") + "/support-requests" + path),
      {
        method,
        headers: {
          Authorization: "Bearer " + (await firebaseUser.getIdToken()),
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
    const d = await r.json();
    if (uid !== account.current) throw Error("Account changed.");
    if (!r.ok) throw Error(d.message || "Support request failed.");
    return d;
  }
  async function load(at = offset) {
    const d = await request(admin ? "?offset=" + at : "");
    setRequests(d.requests);
    setOffset(at);
    setDrafts(
      Object.fromEntries(
        d.requests.map((r: any) => [
          r.id,
          { status: r.status, response: r.response || "" },
        ]),
      ),
    );
  }
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!firebaseUser)
    return (
      <p className="text-sm">
        For help, contact{" "}
        <a className="underline" href="mailto:support@toolzcraft.com">
          support@toolzcraft.com
        </a>
        . Sign in to track a support request here.
      </p>
    );
  const input = "block w-full rounded border bg-background p-2";
  return (
    <details className="space-y-3 rounded border p-4" open={admin}>
      <summary className="cursor-pointer font-semibold">
        {admin ? "Support inbox" : "Report a problem or send feedback"}
      </summary>
      <Button
        variant="outline"
        disabled={busy}
        onClick={() => void run(() => load(0))}
      >
        Refresh support requests
      </Button>
      {!admin && (
        <>
          <p className="text-sm">
            Only what you type below is shared with support. Do not include
            document contents, passwords or payment-card details. Messages are
            encrypted, visible to support administrators, and expire after 30
            days. No email is sent automatically.
          </p>
          <label className="block">
            Support category
            <select
              className={input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="problem">Problem</option>
              <option value="feedback">Feedback</option>
              <option value="billing">Billing</option>
            </select>
          </label>
          <label className="block">
            Support title
            <input
              className={input}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block">
            Support message
            <textarea
              className={input}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            Share this message with ToolzCraft support.
          </label>
          <Button
            disabled={busy || !consent || !title.trim() || !message.trim()}
            onClick={() =>
              void run(async () => {
                await request("", "POST", {
                  title,
                  message,
                  category,
                  consent,
                });
                setTitle("");
                setMessage("");
                setConsent(false);
                await load();
                setNotice(
                  "Request saved. Check here for the support response.",
                );
              })
            }
          >
            Submit support request
          </Button>
        </>
      )}
      {requests.map((r) => (
        <article key={r.id} className="space-y-2 rounded border p-3">
          <h3 className="font-semibold">{r.title}</h3>
          <p className="text-xs">
            {r.category} · {r.status} ·{" "}
            {new Date(r.createdAt).toLocaleDateString()}
          </p>
          <p className="whitespace-pre-wrap break-words">{r.message}</p>
          {r.response && (
            <p className="whitespace-pre-wrap rounded bg-muted p-2">
              Support: {r.response}
            </p>
          )}
          {admin ? (
            <>
              <label>
                Status
                <select
                  className={input}
                  value={drafts[r.id]?.status || r.status}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [r.id]: { ...drafts[r.id], status: e.target.value },
                    })
                  }
                >
                  {["open", "in_progress", "resolved"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Response visible to the user
                <textarea
                  className={input}
                  maxLength={4000}
                  value={drafts[r.id]?.response || ""}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [r.id]: { ...drafts[r.id], response: e.target.value },
                    })
                  }
                />
              </label>
              <Button
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await request("/" + r.id, "PATCH", drafts[r.id]);
                    await load();
                  })
                }
              >
                Save support response
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Delete this support request and its response?",
                  )
                )
                  void run(async () => {
                    await request("/" + r.id, "DELETE");
                    await load();
                  });
              }}
            >
              Delete support request
            </Button>
          )}
        </article>
      ))}
      {admin && (
        <div className="flex gap-2">
          <Button
            disabled={busy || offset === 0}
            onClick={() => void run(() => load(Math.max(0, offset - 50)))}
          >
            Previous requests
          </Button>
          <Button
            disabled={busy || requests.length < 50}
            onClick={() => void run(() => load(offset + 50))}
          >
            Next requests
          </Button>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </details>
  );
}
