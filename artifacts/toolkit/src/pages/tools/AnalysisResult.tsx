import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Provider output is rendered as text, never injected HTML. */
export function AnalysisResult({
  result,
  title = "Result",
}: {
  result: string;
  title?: string;
}) {
  const [status, setStatus] = useState("");
  return (
    <section
      aria-label={title}
      className="space-y-4 rounded-xl border bg-primary/5 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(result);
                setStatus("Copied");
              } catch {
                setStatus("Copy unavailable. Download the result instead.");
              }
            }}
          >
            Copy result
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([result], { type: "text/plain;charset=utf-8" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download =
                title === "Summary result"
                  ? "toolzcraft-summary.txt"
                  : "toolzcraft-result.txt";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Download {title === "Summary result" ? "summary" : "result"}
          </Button>
        </div>
      </div>
      {status && (
        <p role="status" className="text-sm">
          {status}
        </p>
      )}
      <div
        data-testid="text-result"
        className="space-y-3 break-words leading-relaxed"
      >
        {result
          .split(/\n/)
          .filter((line) => line.trim())
          .map((line, i) => {
            const clean = line.replace(/^#{1,3}\s+/, "").replace(/\*\*/g, "");
            return /^[-•]\s/.test(clean) ? (
              <p key={i} className="flex gap-3">
                <span aria-hidden="true" className="text-primary">
                  •
                </span>
                <span>{clean.replace(/^[-•]\s*/, "")}</span>
              </p>
            ) : /^[^:]{1,60}:$/.test(clean.trim()) ? (
              <h3 key={i} className="pt-2 font-semibold text-primary">
                {clean}
              </h3>
            ) : (
              <p key={i}>{clean}</p>
            );
          })}
      </div>
    </section>
  );
}
