import { useEffect, useRef, useState } from "react";
import {
  verifyPdfSignatures,
  type SignatureCheck,
} from "@/lib/document-signatures";
import { Button } from "@/components/ui/button";
export function DocumentSignatureReview({ file }: { file?: File }) {
  const [checks, setChecks] = useState<SignatureCheck[] | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    setChecks(null);
    setError("");
  }, [file]);
  if (!file?.name.toLowerCase().endsWith(".pdf")) return null;
  return (
    <details className="space-y-3 rounded border p-3">
      <summary className="cursor-pointer font-semibold">
        Digital signature integrity · Local
      </summary>
      <p className="text-xs">
        Checks PDF/CMS cryptographic integrity locally. It does not establish
        trusted issuer identity, certificate revocation, signing time, legal
        validity or document authenticity.
      </p>
      <Button
        disabled={busy}
        variant="outline"
        onClick={async () => {
          setBusy(true);
          setError("");
          const version = generation.current;
          try {
            const result = await verifyPdfSignatures(file);
            if (generation.current === version) setChecks(result);
          } catch (e) {
            if (generation.current === version) setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Check PDF signature integrity
      </Button>
      {error && <p role="alert">{error}</p>}
      {checks?.length === 0 && (
        <p>
          No supported detached PDF signature byte ranges found. A drawn
          signature is not a digital signature.
        </p>
      )}
      {checks?.map((c) => (
        <div key={c.signature} className="rounded border p-3 text-sm">
          <p className="font-semibold">
            Signature {c.signature}: {c.integrity}
          </p>
          <p>{c.coverage}</p>
          <p>{c.detail}</p>
        </div>
      ))}
    </details>
  );
}
