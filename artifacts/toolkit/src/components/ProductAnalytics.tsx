import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
export function ProductAnalytics() {
  const { firebaseUser } = useAuth(),
    [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const uid = useRef(firebaseUser?.uid);
  uid.current = firebaseUser?.uid;
  useEffect(() => {
    setData(null);
    setError("");
  }, [firebaseUser?.uid]);
  return (
    <section className="space-y-4 rounded border p-4">
      <h2 className="text-lg font-semibold">Signup conversion & repeat use</h2>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          if (!firebaseUser) return;
          const account = firebaseUser.uid;
          setBusy(true);
          setError("");
          try {
            const r = await fetch(apiUrl("/admin/product-analytics"), {
              headers: {
                Authorization: "Bearer " + (await firebaseUser.getIdToken()),
              },
            });
            const d = await r.json();
            if (uid.current !== account) return;
            if (!r.ok) throw Error(d.message || "Unable to load analytics.");
            setData(d);
          } catch (e) {
            if (uid.current === account) setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Load conversion and retention
      </Button>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <p className="text-sm">{data.scope}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Signups", data.outcomes.signups],
              ["Activated in first 7 days", data.outcomes.activated],
              ["Live payment conversion", data.outcomes.paid],
            ].map(([label, count]) => (
              <div key={label} className="rounded border p-3">
                <p>{label}</p>
                <strong className="text-2xl">{count}</strong>
                <p className="text-xs">
                  {data.outcomes.signups
                    ? (
                        ((count as number) / data.outcomes.signups) *
                        100
                      ).toFixed(1)
                    : "0"}
                  % of signup cohort
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[
                    "Signup week",
                    "Signups",
                    "Mature accounts",
                    "Activated mature accounts",
                    "Returned in days 7–13",
                    "Repeat-use rate",
                  ].map((h) => (
                    <th key={h} className="p-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.weeks.map((w: any) => (
                  <tr key={w.week}>
                    <td className="p-2">{w.week}</td>
                    <td>{w.signups}</td>
                    <td>{w.eligible}</td>
                    <td>{w.activated}</td>
                    <td>{w.retained}</td>
                    <td>
                      {w.activated
                        ? ((w.retained / w.activated) * 100).toFixed(1) + "%"
                        : "Not yet measurable"}
                    </td>
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
