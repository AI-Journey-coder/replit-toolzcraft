import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { documentPageImage } from "@/lib/document-visual-image";
import {
  visualTableRows,
  type VisualDraft,
} from "@workspace/document-intelligence";
export function DocumentVisualReview({
  file,
  pageNumber,
  password,
  onApply,
  onReceipt,
}: {
  file?: File;
  pageNumber: number;
  password?: string;
  onApply: (text: string) => void;
  onReceipt: (id: string) => void;
}) {
  const { firebaseUser } = useAuth();
  const [image, setImage] = useState(""),
    [draft, setDraft] = useState<VisualDraft | null>(null),
    [quote, setQuote] = useState<{
      credits: number;
      fingerprint: string;
    } | null>(null),
    [consent, setConsent] = useState(false),
    [reviewed, setReviewed] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const generation = useRef(0),
    controller = useRef<AbortController | null>(null),
    requestId = useRef("");
  useEffect(() => {
    generation.current++;
    controller.current?.abort();
    setImage("");
    setDraft(null);
    setQuote(null);
    setConsent(false);
    setReviewed(false);
    setMessage("");
    requestId.current = "";
    return () => {
      generation.current++;
      controller.current?.abort();
    };
  }, [file, pageNumber, password, firebaseUser?.uid]);
  if (!file || !/\.(pdf|png|jpe?g)$/i.test(file.name)) return null;
  async function request(path: string, body: unknown) {
    if (!firebaseUser) throw Error("Sign in for visual AI.");
    const r = await fetch(apiUrl("/document-vision/" + path), {
      method: "POST",
      headers: {
        Authorization: "Bearer " + (await firebaseUser.getIdToken()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw Error(data.message || "Visual analysis failed.");
    return data;
  }
  async function run(fn: (version: number) => Promise<void>) {
    if (busy) return;
    const version = generation.current;
    setBusy(true);
    setMessage("");
    try {
      await fn(version);
    } catch (e) {
      if (version === generation.current) setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">
        Visual extraction: handwriting, forms, tables & charts
      </summary>
      <p className="text-xs">
        Optional AI review of a rendered page. Preparing the preview is local.
        Analysis sends this image to the AI provider after your confirmation.
        Handwriting, numbers, checkbox states, chart interpretations and
        signature-like marks can be wrong; review against the image before using
        them. This cannot authenticate a signature.
      </p>
      <Button
        variant="outline"
        disabled={busy}
        onClick={() =>
          void run(async (version) => {
            controller.current = new AbortController();
            const preview = await documentPageImage(
              file,
              pageNumber,
              password,
              controller.current.signal,
            );
            if (version !== generation.current) return;
            setImage(preview);
            setDraft(null);
            setQuote(null);
            setConsent(false);
            setReviewed(false);
            requestId.current = crypto.randomUUID();
          })
        }
      >
        Prepare page preview locally
      </Button>
      {image && (
        <>
          <div className="relative mx-auto max-w-xl">
            <img
              src={image}
              alt={
                "Rendered document page " + pageNumber + " for visual review"
              }
              className="w-full border"
            />
            {draft?.blocks.map((b, i) => (
              <div
                key={i}
                title={b.kind + ": " + b.text.slice(0, 150)}
                className="pointer-events-none absolute border-2 border-blue-600"
                style={{
                  left: b.box[0] * 100 + "%",
                  top: b.box[1] * 100 + "%",
                  width: (b.box[2] - b.box[0]) * 100 + "%",
                  height: (b.box[3] - b.box[1]) * 100 + "%",
                }}
              >
                <span className="bg-blue-700 px-1 text-xs text-white">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={busy || !firebaseUser}
            onClick={() =>
              void run(async (version) => {
                const q = await request("quote", { image });
                if (version === generation.current) setQuote(q);
              })
            }
          >
            Check visual extraction cost
          </Button>
          {!firebaseUser && (
            <p className="text-sm">
              Sign in to use visual AI; local OCR remains available.
            </p>
          )}
          {quote && (
            <>
              <p>
                {quote.credits} credits on successful extraction; administrator
                allowance remains unlimited.
              </p>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                Send this page image to the AI provider and charge the displayed
                credits on success.
              </label>
              <Button
                disabled={busy || !consent}
                onClick={() =>
                  void run(async (version) => {
                    onReceipt(requestId.current);
                    const data = await request("analyze", {
                      image,
                      ...quote,
                      requestId: requestId.current,
                      consent: true,
                    });
                    if (version === generation.current) {
                      setDraft(data.result);
                      setReviewed(false);
                    }
                  })
                }
              >
                Extract visual review draft
              </Button>
            </>
          )}
        </>
      )}
      {draft && (
        <div className="space-y-3">
          {draft.warnings.map((w, i) => (
            <p key={i} className="text-sm">
              Review warning: {w}
            </p>
          ))}
          {draft.blocks.map((b, i) => (
            <div key={i} className="rounded border p-3">
              <h3 className="font-semibold">
                Region {i + 1} · {b.kind} · Unverified draft
              </h3>
              <p className="whitespace-pre-wrap break-words text-sm">
                {b.text}
              </p>
              {b.cells && (
                <div className="overflow-auto">
                  <table className="text-sm">
                    <tbody>
                      {visualTableRows(b.cells).map((cells, row) => (
                        <tr key={row}>
                          {cells.map((c, j) => (
                            <td
                              key={j}
                              rowSpan={c.rowSpan}
                              colSpan={c.columnSpan}
                              className="border p-2"
                            >
                              {c.text}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs">
                    Merged-cell relationships are model-proposed and require
                    review.
                  </p>
                </div>
              )}
            </div>
          ))}
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            I checked this draft against the image and will correct any
            remaining errors in the source editor.
          </label>
          <Button
            disabled={!reviewed || busy}
            onClick={() => {
              onApply(
                "[Human-reviewed visual extraction draft — check original page]\n" +
                  draft.blocks
                    .map(
                      (b, i) =>
                        "Region " +
                        (i + 1) +
                        " (" +
                        b.kind +
                        "): " +
                        b.text +
                        (b.cells
                          ? "\n" +
                            b.cells
                              .map(
                                (c) =>
                                  `Cell row ${c.row + 1}, column ${c.column + 1}, span ${c.rowSpan}×${c.columnSpan}: ${c.text}`,
                              )
                              .join("\n")
                          : ""),
                    )
                    .join("\n\n"),
              );
              setMessage(
                "Draft copied into the source editor. Verify and correct it before analysis.",
              );
            }}
          >
            Use reviewed draft as this page’s text
          </Button>
        </div>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </details>
  );
}
