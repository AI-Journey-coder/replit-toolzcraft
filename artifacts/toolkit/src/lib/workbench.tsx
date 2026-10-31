import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function download(data: BlobPart, name: string, type = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export const size = (n: number) => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;
export function useJob() {
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [error, setError] = useState('');
  const current = useRef<AbortController | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => { current.current?.abort(); cleanup.current?.(); }, []);
  const cancel = () => { current.current?.abort(); current.current = null; cleanup.current?.(); cleanup.current = null; setBusy(false); setStatus('Cancelled. You can start again.'); };
  const run = async (fn: (signal: AbortSignal, report: (s: string) => void, onCancel: (fn: () => void) => void) => Promise<void>) => {
    if (current.current) return;
    const controller = new AbortController(); current.current = controller;
    setBusy(true); setError(''); setStatus('Preparing…');
    try { await fn(controller.signal, s => { if (!controller.signal.aborted) setStatus(s); }, fn => { if (controller.signal.aborted) fn(); else cleanup.current = fn; }); }
    catch (e) { if (!controller.signal.aborted) { setError(e instanceof Error ? e.message : String(e)); setStatus(''); } }
    finally { if (current.current === controller) { current.current = null; cleanup.current = null; setBusy(false); } }
  };
  return { busy, status, error, run, cancel };
}
export type Job = ReturnType<typeof useJob>;
export function Workbench({ title, intro, children, job }: { title: string; intro: string; children: ReactNode; job?: Job }) {
  return <section className="w-full rounded-xl border bg-card p-5 md:p-6 space-y-6">
    <header className="space-y-2"><h1 className="text-2xl font-bold">{title}</h1><p className="text-muted-foreground">{intro}</p></header>
    {children}
    {job && <div aria-live="polite" className="space-y-3">{job.status && <p role="status">{job.status}</p>}{job.error && <p role="alert" className="text-destructive">{job.error}</p>}{job.busy && <Button variant="outline" onClick={job.cancel}>Cancel processing</Button>}</div>}
  </section>;
}
export const field = 'w-full rounded-md border bg-background px-3 py-2 text-base';
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-2"><span className="font-medium">{label}</span>{children}</label>; }
export const yieldUi = () => new Promise<void>(resolve => setTimeout(resolve, 0));

