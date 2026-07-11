import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }} disabled={!text}>{ok ? "✓" : <Copy className="h-3 w-3" />}</Button>;
}

// ─── Date Difference Calculator ───────────────────────────────────────────────
export function DateDifferenceCalculator() {
  const [start, setStart] = useState(() => "2024-01-01");
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));

  const diff = useMemo(() => {
    const a = new Date(start), b = new Date(end);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
    const [earlier, later, sign] = a <= b ? [a, b, 1] : [b, a, -1];
    const msTotal = (later.getTime() - earlier.getTime()) * sign;
    const totalDays = Math.round(Math.abs(msTotal) / 86400000) * sign;
    const totalWeeks = (totalDays / 7).toFixed(2);
    const totalHours = Math.round(Math.abs(msTotal) / 3600000) * sign;
    const totalMinutes = Math.round(Math.abs(msTotal) / 60000) * sign;
    let years = later.getFullYear() - earlier.getFullYear();
    let months = later.getMonth() - earlier.getMonth();
    let days = later.getDate() - earlier.getDate();
    if (days < 0) { months--; days += new Date(later.getFullYear(), later.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return { years: years * sign, months: months * sign, days: days * sign, totalDays, totalWeeks, totalHours, totalMinutes };
  }, [start, end]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Date Difference Calculator</CardTitle><CardDescription>Calculate the exact difference between two dates</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Start date</Label><Input type="date" className="font-mono" value={start} onChange={e => setStart(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>End date</Label><Input type="date" className="font-mono" value={end} onChange={e => setEnd(e.target.value)} /></div>
        </div>
        {diff && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: "Years", v: diff.years }, { label: "Months", v: diff.months }, { label: "Days", v: diff.days }].map(x => (
                <div key={x.label} className="rounded-lg border border-border p-3 text-center">
                  <div className={`text-3xl font-black font-mono ${x.v < 0 ? "text-orange-400" : "text-primary"}`}>{x.v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{x.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border overflow-hidden text-sm">
              <table className="w-full">
                <tbody className="divide-y divide-border/50">
                  {[["Total days", diff.totalDays], ["Total weeks", diff.totalWeeks], ["Total hours", diff.totalHours.toLocaleString()], ["Total minutes", diff.totalMinutes.toLocaleString()]].map(([l, v]) => (
                    <tr key={String(l)}><td className="px-3 py-2 text-muted-foreground bg-muted/30">{l}</td><td className="px-3 py-2 font-mono">{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Timezone Converter ────────────────────────────────────────────────────────
const TIMEZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Toronto","America/Vancouver","America/Sao_Paulo","America/Mexico_City",
  "America/Buenos_Aires","Europe/London","Europe/Paris","Europe/Berlin","Europe/Rome",
  "Europe/Madrid","Europe/Amsterdam","Europe/Stockholm","Europe/Zurich","Europe/Moscow",
  "Africa/Cairo","Africa/Lagos","Africa/Johannesburg","Africa/Nairobi",
  "Asia/Dubai","Asia/Karachi","Asia/Kolkata","Asia/Dhaka","Asia/Bangkok","Asia/Singapore",
  "Asia/Shanghai","Asia/Tokyo","Asia/Seoul","Asia/Hong_Kong","Asia/Taipei",
  "Australia/Sydney","Australia/Melbourne","Pacific/Auckland","Pacific/Honolulu",
];
function formatTz(date: Date, tz: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZoneName: "short" }).format(date);
  } catch { return "Invalid timezone"; }
}
export function TimezoneConverter() {
  const [dt, setDt] = useState(() => new Date().toISOString().slice(0, 16));
  const [fromTz, setFromTz] = useState("UTC");
  const [selected, setSelected] = useState(["America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo"]);
  const [addTz, setAddTz] = useState("Australia/Sydney");

  const base = useMemo(() => {
    try {
      const local = new Date(dt);
      if (isNaN(local.getTime())) return null;
      // Interpret the input datetime as being in fromTz
      const tz = fromTz;
      const formatted = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(local);
      return local;
    } catch { return null; }
  }, [dt, fromTz]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Timezone Converter</CardTitle><CardDescription>Convert a date and time across multiple world timezones</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Date & time</Label><Input type="datetime-local" className="font-mono" value={dt} onChange={e => setDt(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Source timezone</Label>
            <Select value={fromTz} onValueChange={setFromTz}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">{TIMEZONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {base && (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="bg-muted/60 text-muted-foreground"><th className="text-left px-3 py-2">Timezone</th><th className="text-left px-3 py-2">Local time</th><th className="px-2 py-2 w-8" /></tr></thead>
              <tbody className="divide-y divide-border/50">
                {selected.map(tz => (
                  <tr key={tz}>
                    <td className="px-3 py-2 font-medium">{tz}</td>
                    <td className="px-3 py-2 font-mono">{formatTz(base, tz)}</td>
                    <td className="px-2 py-2"><button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => setSelected(s => s.filter(x => x !== tz))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex gap-2">
          <Select value={addTz} onValueChange={setAddTz}>
            <SelectTrigger className="flex-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-60">{TIMEZONES.filter(t => !selected.includes(t)).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => { if (!selected.includes(addTz)) setSelected(s => [...s, addTz]); }}>Add</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Workdays Calculator ──────────────────────────────────────────────────────
export function WorkdaysCalculator() {
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); });
  const [excludeHolidays, setExcludeHolidays] = useState(false);

  const result = useMemo(() => {
    const a = new Date(start), b = new Date(end);
    if (isNaN(a.getTime()) || isNaN(b.getTime()) || a > b) return null;
    let workdays = 0, totalDays = 0;
    const cur = new Date(a);
    while (cur <= b) {
      totalDays++;
      const day = cur.getDay();
      if (day !== 0 && day !== 6) workdays++;
      cur.setDate(cur.getDate() + 1);
    }
    return { workdays, weekendDays: totalDays - workdays, totalDays };
  }, [start, end]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Workdays Calculator</CardTitle><CardDescription>Count business days (Mon–Fri) between two dates</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Start date</Label><Input type="date" className="font-mono" value={start} onChange={e => setStart(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>End date</Label><Input type="date" className="font-mono" value={end} onChange={e => setEnd(e.target.value)} /></div>
        </div>
        {result && (
          <div className="grid grid-cols-3 gap-3">
            {[{ label: "Business days", v: result.workdays, color: "text-primary" }, { label: "Weekend days", v: result.weekendDays, color: "text-orange-400" }, { label: "Total days", v: result.totalDays, color: "text-muted-foreground" }].map(x => (
              <div key={x.label} className="rounded-lg border border-border p-3 text-center">
                <div className={`text-3xl font-black font-mono ${x.color}`}>{x.v}</div>
                <div className="text-xs text-muted-foreground mt-1">{x.label}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Leap Year Checker ────────────────────────────────────────────────────────
function isLeap(y: number) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
export function LeapYearChecker() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const y = parseInt(year);
  const leap = !isNaN(y) && isLeap(y);
  const prev = !isNaN(y) ? [y-1, y-2, y-3, y-4].reverse().filter(isLeap)[0] ?? y - 4 : null;
  const next = !isNaN(y) ? [y+1, y+2, y+3, y+4].find(isLeap) ?? y + 4 : null;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader><CardTitle>Leap Year Checker</CardTitle><CardDescription>Check if a year is a leap year using the Gregorian calendar rules</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Year</Label><Input className="font-mono text-2xl h-14 text-center" value={year} onChange={e => setYear(e.target.value)} /></div>
        {!isNaN(y) && (
          <>
            <div className={`rounded-lg p-4 text-center font-bold text-lg ${leap ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
              {y} is {leap ? "" : "NOT "}a leap year
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {y} ÷ 4 = {y % 4 === 0 ? "✓ divisible" : `✗ remainder ${y % 4}`}</p>
              <p>• {y} ÷ 100 = {y % 100 === 0 ? "✓ divisible (century year)" : "✗ not a century year"}</p>
              {y % 100 === 0 && <p>• {y} ÷ 400 = {y % 400 === 0 ? "✓ divisible (valid leap)" : "✗ not divisible → NOT a leap year"}</p>}
            </div>
            {prev && next && <div className="text-xs text-muted-foreground text-center">Previous leap: <strong>{prev}</strong> &nbsp;|&nbsp; Next leap: <strong>{next}</strong></div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Countdown Timer / Stopwatch ──────────────────────────────────────────────
export function CountdownTimer() {
  const [mode, setMode] = useState<"countdown"|"stopwatch">("countdown");
  const [h, setH] = useState(0); const [m, setM] = useState(5); const [s, setSec] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fmt = (totalSec: number) => {
    const hh = Math.floor(totalSec / 3600), mm = Math.floor((totalSec % 3600) / 60), ss = totalSec % 60;
    return [hh, mm, ss].map(x => x.toString().padStart(2, "0")).join(":");
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === "countdown") setRemaining(r => { if (r <= 1) { setRunning(false); return 0; } return r - 1; });
        else setElapsed(e => e + 1);
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const startCountdown = () => {
    const total = h * 3600 + m * 60 + s;
    if (total <= 0) return;
    setRemaining(total); setRunning(true);
  };

  const total = h * 3600 + m * 60 + s;
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader><CardTitle>Countdown Timer & Stopwatch</CardTitle><CardDescription>Browser-based timer and stopwatch tools</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "countdown" ? "default" : "outline"} onClick={() => { setMode("countdown"); setRunning(false); setRemaining(0); }}>Countdown</Button>
          <Button size="sm" variant={mode === "stopwatch" ? "default" : "outline"} onClick={() => { setMode("stopwatch"); setRunning(false); setElapsed(0); }}>Stopwatch</Button>
        </div>
        {mode === "countdown" ? (
          <>
            <div className="flex gap-2 items-end justify-center">
              {[{ label: "HH", val: h, set: setH }, { label: "MM", val: m, set: setM }, { label: "SS", val: s, set: setSec }].map(({ label, val, set }) => (
                <div key={label} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <Input type="number" min={0} max={59} className="w-20 h-14 font-mono text-2xl text-center" value={val} onChange={e => set(parseInt(e.target.value) || 0)} />
                </div>
              ))}
            </div>
            {remaining > 0 && (
              <>
                <div className="text-center font-mono text-5xl font-black text-primary">{fmt(remaining)}</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${100 - pct}%` }} /></div>
              </>
            )}
            <div className="flex gap-2 justify-center">
              {!running ? <Button onClick={startCountdown} disabled={total === 0}>Start</Button> : <Button variant="outline" onClick={() => setRunning(false)}>Pause</Button>}
              <Button variant="outline" onClick={() => { setRunning(false); setRemaining(0); }}>Reset</Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center font-mono text-5xl font-black text-primary py-4">{fmt(elapsed)}</div>
            <div className="flex gap-2 justify-center">
              {!running ? <Button onClick={() => setRunning(true)}>Start</Button> : <Button variant="outline" onClick={() => setRunning(false)}>Pause</Button>}
              <Button variant="outline" onClick={() => { setRunning(false); setElapsed(0); }}>Reset</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Chmod Calculator ─────────────────────────────────────────────────────────
type Perm = { r: boolean; w: boolean; x: boolean };
export function ChmodCalculator() {
  const [perms, setPerms] = useState<[Perm, Perm, Perm]>([
    { r: true, w: true, x: false }, // owner
    { r: true, w: false, x: false }, // group
    { r: true, w: false, x: false }, // others
  ]);

  const toggle = (i: 0|1|2, k: keyof Perm) => setPerms(p => { const n = [...p] as typeof p; n[i] = { ...n[i], [k]: !n[i][k] }; return n; });
  const toNum = (p: Perm) => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
  const octal = perms.map(toNum).join("");
  const symbolic = perms.map(p => (p.r?"r":"-") + (p.w?"w":"-") + (p.x?"x":"-")).join("");

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Chmod Calculator</CardTitle><CardDescription>Calculate Unix file permissions in octal and symbolic notation</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/60 text-muted-foreground text-xs"><th className="text-left px-3 py-2">Who</th><th className="px-3 py-2">Read (4)</th><th className="px-3 py-2">Write (2)</th><th className="px-3 py-2">Execute (1)</th><th className="px-3 py-2 text-right">Octal</th></tr></thead>
            <tbody className="divide-y divide-border/50">
              {(["Owner", "Group", "Others"] as const).map((label, i) => (
                <tr key={label}>
                  <td className="px-3 py-3 font-medium">{label}</td>
                  {(["r","w","x"] as (keyof Perm)[]).map(k => (
                    <td key={k} className="px-3 py-3 text-center">
                      <input type="checkbox" checked={perms[i][k]} onChange={() => toggle(i as 0|1|2, k)} className="w-5 h-5 cursor-pointer" />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right font-mono font-bold text-primary">{toNum(perms[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Octal</div>
            <div className="text-4xl font-black font-mono text-primary">{octal}</div>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Symbolic</div>
            <div className="text-2xl font-black font-mono text-primary">{symbolic}</div>
          </div>
        </div>
        <div className="font-mono text-sm bg-muted/30 rounded-lg p-3 border border-border/50 flex items-center gap-2">
          <span className="text-muted-foreground">$</span> chmod {octal} filename
          <Button size="sm" variant="ghost" className="ml-auto h-7 px-2" onClick={() => navigator.clipboard.writeText(`chmod ${octal} filename`)}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CIDR Calculator ──────────────────────────────────────────────────────────
export function CidrCalculator() {
  const [cidr, setCidr] = useState("192.168.1.0/24");

  const result = useMemo(() => {
    try {
      const [ip, prefixStr] = cidr.split("/");
      const prefix = parseInt(prefixStr);
      if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) return null;
      const parts = ip.split(".").map(Number);
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
      const ipInt = (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
      const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
      const network = (ipInt & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;
      const toIp = (n: number) => [n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255].join(".");
      const hosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : (2 ** (32 - prefix)) - 2;
      return {
        network: toIp(network),
        broadcast: toIp(broadcast),
        mask: toIp(mask),
        wildcard: toIp(~mask >>> 0),
        first: prefix < 31 ? toIp(network + 1) : toIp(network),
        last: prefix < 31 ? toIp(broadcast - 1) : toIp(broadcast),
        hosts: hosts.toLocaleString(),
        totalIps: (2 ** (32 - prefix)).toLocaleString(),
        prefix,
      };
    } catch { return null; }
  }, [cidr]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>CIDR Calculator</CardTitle><CardDescription>Calculate network details from a CIDR notation subnet</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>CIDR notation (e.g. 192.168.1.0/24)</Label><Input className="font-mono text-lg h-11" value={cidr} onChange={e => setCidr(e.target.value)} /></div>
        {result ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-border/50">
                {[
                  ["Network address", result.network], ["Broadcast address", result.broadcast],
                  ["Subnet mask", result.mask], ["Wildcard mask", result.wildcard],
                  ["First usable host", result.first], ["Last usable host", result.last],
                  ["Usable hosts", result.hosts], ["Total IPs", result.totalIps],
                  ["Prefix length", `/${result.prefix}`],
                ].map(([l, v]) => (
                  <tr key={String(l)}>
                    <td className="px-3 py-2 text-muted-foreground bg-muted/30 w-44">{l}</td>
                    <td className="px-3 py-2 font-mono">{v}</td>
                    <td className="px-2 py-2"><CopyBtn text={String(v)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">Enter a valid CIDR notation</div>
        )}
      </CardContent>
    </Card>
  );
}
