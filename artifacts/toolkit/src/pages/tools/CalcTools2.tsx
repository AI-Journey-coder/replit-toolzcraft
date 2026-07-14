import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";

function Field({ label, value, set, prefix = "", suffix = "", type = "number", min, placeholder, step }: any) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-muted-foreground text-sm">{prefix}</span>}
        <Input type={type} min={min} step={step} placeholder={placeholder} className={`font-mono ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}`} value={value} onChange={e => set(e.target.value)} />
        {suffix && <span className="absolute right-3 text-muted-foreground text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
function ResultCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-2xl font-black font-mono text-primary">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
const fmt = (n: number) => isNaN(n) || !isFinite(n) ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const fmtCurrency = (n: number, prefix = "$") => isNaN(n) || !isFinite(n) ? "—" : prefix + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Break-Even Calculator ────────────────────────────────────────────────────
export function BreakEvenCalculator() {
  const [mode, setMode] = useState<"basic"|"saas"|"startup"|"freelancer">("basic");
  const [fixedCosts, setFixed] = useState("5000");
  const [variableCost, setVariable] = useState("20");
  const [pricePerUnit, setPrice] = useState("50");
  const [currency, setCurrency] = useState("$");

  // SaaS
  const [mrr, setMrr] = useState("0");
  const [churn, setChurn] = useState("5");
  const [cac, setCac] = useState("200");
  const [arpu, setArpu] = useState("50");

  const basic = useMemo(() => {
    const fc = parseFloat(fixedCosts), vc = parseFloat(variableCost), p = parseFloat(pricePerUnit);
    const contribution = p - vc;
    if (contribution <= 0) return null;
    const units = fc / contribution;
    const revenue = units * p;
    const ratio = (contribution / p) * 100;
    return { units, revenue, contribution, ratio };
  }, [fixedCosts, variableCost, pricePerUnit]);

  const saas = useMemo(() => {
    const fc = parseFloat(fixedCosts), a = parseFloat(arpu), c = parseFloat(churn) / 100;
    if (a <= 0 || c <= 0) return null;
    const ltv = a / c;
    const cacVal = parseFloat(cac);
    const customers = fc / a;
    const months = fc / a;
    return { ltv, customers, cac: cacVal, ltvCac: ltv / cacVal, months };
  }, [fixedCosts, arpu, churn, cac]);

  const MODES = [{ v: "basic", l: "Basic" }, { v: "saas", l: "SaaS" }, { v: "startup", l: "Startup" }, { v: "freelancer", l: "Freelancer" }];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Break-Even Calculator</CardTitle><CardDescription>Calculate break-even point for various business models</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {MODES.map(m => <Button key={m.v} size="sm" variant={mode === m.v ? "default" : "outline"} onClick={() => setMode(m.v as any)}>{m.l}</Button>)}
        </div>
        {(mode === "basic" || mode === "startup" || mode === "freelancer") && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fixed costs / month" value={fixedCosts} set={setFixed} prefix={currency} />
              <Field label="Variable cost / unit" value={variableCost} set={setVariable} prefix={currency} />
              <Field label="Price per unit / sale" value={pricePerUnit} set={setPrice} prefix={currency} />
              <div className="space-y-1.5"><Label>Currency symbol</Label><Input className="font-mono w-20" value={currency} maxLength={3} onChange={e => setCurrency(e.target.value)} /></div>
            </div>
            {basic ? (
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Units to break even" value={fmt(basic.units)} sub="per month" />
                <ResultCard label="Revenue to break even" value={fmtCurrency(basic.revenue, currency)} sub="per month" />
                <ResultCard label="Contribution margin" value={fmtCurrency(basic.contribution, currency)} sub="per unit" />
                <ResultCard label="Contribution margin ratio" value={basic.ratio.toFixed(1) + "%"} />
              </div>
            ) : <p className="text-sm text-destructive">Price must exceed variable cost</p>}
          </>
        )}
        {mode === "saas" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Monthly fixed costs" value={fixedCosts} set={setFixed} prefix="$" />
              <Field label="ARPU (avg revenue / user)" value={arpu} set={setArpu} prefix="$" />
              <Field label="Monthly churn rate" value={churn} set={setChurn} suffix="%" />
              <Field label="Customer acquisition cost" value={cac} set={setCac} prefix="$" />
            </div>
            {saas && (
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Customers needed" value={fmt(saas.customers)} sub="to cover fixed costs" />
                <ResultCard label="LTV" value={fmtCurrency(saas.ltv)} sub="lifetime value per user" />
                <ResultCard label="LTV:CAC ratio" value={saas.ltvCac.toFixed(2) + "x"} sub="should be ≥ 3x" />
                <ResultCard label="Payback period" value={fmt(parseFloat(cac) / parseFloat(arpu)) + " mo"} sub="to recover CAC" />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Commission Calculator ─────────────────────────────────────────────────────
export function CommissionCalculator() {
  const [revenue, setRevenue] = useState("50000");
  const [rate, setRate] = useState("10");
  const [rateType, setRateType] = useState<"percent"|"flat">("percent");
  const [tiers, setTiers] = useState([
    { threshold: 10000, rate: 5 },
    { threshold: 25000, rate: 8 },
    { threshold: 50000, rate: 12 },
  ]);
  const [useTiers, setUseTiers] = useState(false);

  const rev = parseFloat(revenue) || 0;
  const flatCommission = rateType === "percent" ? rev * (parseFloat(rate) / 100) : parseFloat(rate);
  const netRevenue = rev - flatCommission;

  const tieredCommission = useMemo(() => {
    let commission = 0, remaining = rev;
    const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
    let prevThreshold = 0;
    for (const tier of sorted) {
      const band = Math.min(remaining, tier.threshold - prevThreshold);
      commission += band * (tier.rate / 100);
      remaining -= band;
      prevThreshold = tier.threshold;
      if (remaining <= 0) break;
    }
    if (remaining > 0 && sorted.length > 0) commission += remaining * (sorted[sorted.length - 1].rate / 100);
    return commission;
  }, [rev, tiers]);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Commission Calculator</CardTitle><CardDescription>Calculate flat-rate or tiered sales commissions</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <Field label="Total revenue / sales" value={revenue} set={setRevenue} prefix="$" />
        <div className="flex gap-2"><Button size="sm" variant={!useTiers ? "default" : "outline"} onClick={() => setUseTiers(false)}>Flat rate</Button><Button size="sm" variant={useTiers ? "default" : "outline"} onClick={() => setUseTiers(true)}>Tiered</Button></div>
        {!useTiers ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Commission rate" value={rate} set={setRate} suffix={rateType === "percent" ? "%" : "$"} />
            <div className="space-y-1.5"><Label>Type</Label><div className="flex gap-1"><Button size="sm" variant={rateType === "percent" ? "default" : "outline"} onClick={() => setRateType("percent")}>%</Button><Button size="sm" variant={rateType === "flat" ? "default" : "outline"} onClick={() => setRateType("flat")}>Flat $</Button></div></div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-xs">Tiers (threshold → rate %)</Label>
            {tiers.map((t, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input type="number" className="font-mono h-8 text-xs" value={t.threshold} onChange={e => setTiers(ts => ts.map((x, j) => j === i ? { ...x, threshold: parseFloat(e.target.value) || 0 } : x))} />
                <span className="text-xs text-muted-foreground">up to →</span>
                <Input type="number" className="font-mono h-8 text-xs w-20" value={t.rate} onChange={e => setTiers(ts => ts.map((x, j) => j === i ? { ...x, rate: parseFloat(e.target.value) || 0 } : x))} />
                <span className="text-xs text-muted-foreground">%</span>
                <Button size="sm" variant="ghost" className="h-7 text-destructive px-2" onClick={() => setTiers(ts => ts.filter((_, j) => j !== i))}>✕</Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setTiers(t => [...t, { threshold: 100000, rate: 15 }])}>+ Add tier</Button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <ResultCard label="Commission earned" value={fmtCurrency(useTiers ? tieredCommission : flatCommission)} />
          <ResultCard label="Net revenue" value={fmtCurrency(rev - (useTiers ? tieredCommission : flatCommission))} />
          <ResultCard label="Effective rate" value={rev > 0 ? ((useTiers ? tieredCommission : flatCommission) / rev * 100).toFixed(2) + "%" : "—"} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Date Add / Subtract ──────────────────────────────────────────────────────
export function DateAddSubtract() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("30");
  const [unit, setUnit] = useState("days");
  const [op, setOp] = useState<"add"|"sub">("add");

  const result = useMemo(() => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const n = parseInt(amount) || 0;
    const ms = { days: 86400000, weeks: 604800000, months: 0, years: 0 }[unit];
    const sign = op === "add" ? 1 : -1;
    if (unit === "months") { d.setMonth(d.getMonth() + sign * n); }
    else if (unit === "years") { d.setFullYear(d.getFullYear() + sign * n); }
    else { d.setTime(d.getTime() + sign * (ms ?? 0) * n); }
    return d;
  }, [date, amount, unit, op]);

  const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Date Add / Subtract</CardTitle><CardDescription>Add or subtract days, weeks, months, or years from any date</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Start date</Label><Input type="date" className="font-mono" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div className="flex gap-2">
          <Button size="sm" variant={op === "add" ? "default" : "outline"} onClick={() => setOp("add")}>Add +</Button>
          <Button size="sm" variant={op === "sub" ? "default" : "outline"} onClick={() => setOp("sub")}>Subtract −</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" value={amount} set={setAmount} />
          <div className="space-y-1.5"><Label>Unit</Label>
            <div className="flex gap-1 flex-wrap">
              {["days","weeks","months","years"].map(u => <Button key={u} size="sm" variant={unit === u ? "default" : "outline"} className="text-xs" onClick={() => setUnit(u)}>{u}</Button>)}
            </div>
          </div>
        </div>
        {result && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{fmtDate(result)}</div>
              <div className="text-xs text-muted-foreground mt-1">{result.toISOString().slice(0, 10)} &nbsp;|&nbsp; {result.toDateString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Group Expense Splitter ────────────────────────────────────────────────────
export function GroupExpenseSplitter() {
  const [people, setPeople] = useState(["Alice", "Bob", "Carol"]);
  const [newPerson, setNewPerson] = useState("");
  const [expenses, setExpenses] = useState([
    { desc: "Dinner", amount: 90, paidBy: "Alice" },
    { desc: "Taxi", amount: 30, paidBy: "Bob" },
    { desc: "Hotel", amount: 210, paidBy: "Carol" },
  ]);

  const addPerson = () => { if (newPerson.trim() && !people.includes(newPerson.trim())) { setPeople(p => [...p, newPerson.trim()]); setNewPerson(""); } };
  const addExpense = () => setExpenses(e => [...e, { desc: "Expense", amount: 0, paidBy: people[0] ?? "" }]);
  const removeExpense = (i: number) => setExpenses(e => e.filter((_, j) => j !== i));

  const { balances, settlements } = useMemo(() => {
    const totals: Record<string, number> = Object.fromEntries(people.map(p => [p, 0]));
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const share = people.length > 0 ? total / people.length : 0;
    expenses.forEach(e => { if (totals[e.paidBy] !== undefined) totals[e.paidBy] += e.amount; });
    const balances: Record<string, number> = {};
    people.forEach(p => { balances[p] = totals[p] - share; });
    const debts: { from: string; to: string; amount: number }[] = [];
    const creditors = people.filter(p => balances[p] > 0.01).map(p => ({ name: p, balance: balances[p] }));
    const debtors = people.filter(p => balances[p] < -0.01).map(p => ({ name: p, balance: balances[p] }));
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const amt = Math.min(creditors[i].balance, -debtors[j].balance);
      debts.push({ from: debtors[j].name, to: creditors[i].name, amount: amt });
      creditors[i].balance -= amt; debtors[j].balance += amt;
      if (Math.abs(creditors[i].balance) < 0.01) i++;
      if (Math.abs(debtors[j].balance) < 0.01) j++;
    }
    return { balances, settlements: debts };
  }, [people, expenses]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>Group Expense Splitter</CardTitle><CardDescription>Split shared expenses evenly among a group and calculate who owes whom</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>People ({people.length})</Label>
          <div className="flex gap-2 flex-wrap mb-2">
            {people.map(p => <span key={p} className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full text-xs border border-border">{p}<button onClick={() => setPeople(ps => ps.filter(x => x !== p))} className="text-muted-foreground hover:text-destructive ml-1">✕</button></span>)}
          </div>
          <div className="flex gap-2"><Input className="h-8 text-sm" value={newPerson} onChange={e => setNewPerson(e.target.value)} onKeyDown={e => e.key === "Enter" && addPerson()} placeholder="Add person…" /><Button size="sm" onClick={addPerson}>Add</Button></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center"><Label>Expenses</Label><Button size="sm" variant="outline" onClick={addExpense}>+ Add</Button></div>
          {expenses.map((exp, i) => (
            <div key={i} className="grid grid-cols-[1fr,100px,120px,auto] gap-2 items-center">
              <Input className="h-8 text-xs" value={exp.desc} onChange={e => setExpenses(es => es.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
              <Input type="number" className="h-8 text-xs font-mono" value={exp.amount} onChange={e => setExpenses(es => es.map((x, j) => j === i ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} />
              <select className="h-8 rounded-md border border-border bg-background text-xs px-2" value={exp.paidBy} onChange={e => setExpenses(es => es.map((x, j) => j === i ? { ...x, paidBy: e.target.value } : x))}>
                {people.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeExpense(i)}>✕</Button>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="bg-muted/60 text-muted-foreground"><th className="text-left px-3 py-2">Person</th><th className="text-right px-3 py-2">Paid</th><th className="text-right px-3 py-2">Share</th><th className="text-right px-3 py-2">Balance</th></tr></thead>
            <tbody className="divide-y divide-border/50">
              {people.map(p => {
                const paid = expenses.filter(e => e.paidBy === p).reduce((s, e) => s + e.amount, 0);
                const share = people.length > 0 ? expenses.reduce((s, e) => s + e.amount, 0) / people.length : 0;
                const bal = balances[p] ?? 0;
                return <tr key={p}><td className="px-3 py-2 font-medium">{p}</td><td className="px-3 py-2 text-right font-mono">${paid.toFixed(2)}</td><td className="px-3 py-2 text-right font-mono">${share.toFixed(2)}</td><td className={`px-3 py-2 text-right font-mono font-bold ${bal > 0 ? "text-green-500" : bal < 0 ? "text-red-500" : ""}`}>{bal >= 0 ? "+" : ""}{bal.toFixed(2)}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
        {settlements.length > 0 && (
          <div className="space-y-1.5">
            <Label>Settlements (who pays whom)</Label>
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm">
                <span className="font-medium text-red-500">{s.from}</span>
                <span className="text-muted-foreground">pays</span>
                <span className="font-medium text-green-500">{s.to}</span>
                <span className="ml-auto font-mono font-bold">${s.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Molecular Weight Calculator ─────────────────────────────────────────────
const ELEMENTS: Record<string, number> = {
  H:1.008,He:4.003,Li:6.941,Be:9.012,B:10.81,C:12.01,N:14.01,O:16.00,F:19.00,Ne:20.18,
  Na:22.99,Mg:24.31,Al:26.98,Si:28.09,P:30.97,S:32.07,Cl:35.45,Ar:39.95,K:39.10,Ca:40.08,
  Fe:55.85,Cu:63.55,Zn:65.38,Br:79.90,Ag:107.87,I:126.90,Au:196.97,Hg:200.59,Pb:207.2,
  Mn:54.94,Ni:58.69,Co:58.93,Cr:52.00,Ti:47.87,Ba:137.33,Sr:87.62,Mo:95.96,W:183.84,
};
function parseMolecule(formula: string): { elements: Record<string, number>; mw: number } | null {
  try {
    const count: Record<string, number> = {};
    const re = /([A-Z][a-z]?)(\d*)/g;
    let m;
    while ((m = re.exec(formula)) !== null) {
      const el = m[1], n = parseInt(m[2]) || 1;
      if (!ELEMENTS[el]) throw new Error(`Unknown element: ${el}`);
      count[el] = (count[el] ?? 0) + n;
    }
    const mw = Object.entries(count).reduce((s, [el, n]) => s + ELEMENTS[el] * n, 0);
    return { elements: count, mw };
  } catch { return null; }
}
export function MolecularWeightCalculator() {
  const [formula, setFormula] = useState("H2O");
  const result = useMemo(() => parseMolecule(formula), [formula]);

  const presets = ["H2O","CO2","NaCl","C6H12O6","H2SO4","NH3","CH4","C2H5OH","C12H22O11"];

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Molecular Weight Calculator</CardTitle><CardDescription>Calculate the molecular weight from a chemical formula</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5"><Label>Chemical formula</Label><Input className="font-mono text-xl h-12" value={formula} onChange={e => setFormula(e.target.value)} placeholder="e.g. H2O" /></div>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => <Button key={p} size="sm" variant="outline" className="font-mono text-xs h-7" onClick={() => setFormula(p)}>{p}</Button>)}
        </div>
        {result ? (
          <>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Molecular weight</div>
              <div className="text-4xl font-black font-mono text-primary">{result.mw.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground mt-1">g/mol</div>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/60 text-muted-foreground"><th className="text-left px-3 py-2">Element</th><th className="text-right px-3 py-2">Count</th><th className="text-right px-3 py-2">Atomic mass</th><th className="text-right px-3 py-2">Subtotal</th><th className="text-right px-3 py-2">%</th></tr></thead>
                <tbody className="divide-y divide-border/50">
                  {Object.entries(result.elements).map(([el, n]) => {
                    const sub = ELEMENTS[el] * n;
                    return <tr key={el}><td className="px-3 py-2 font-bold">{el}</td><td className="px-3 py-2 text-right font-mono">{n}</td><td className="px-3 py-2 text-right font-mono">{ELEMENTS[el]}</td><td className="px-3 py-2 text-right font-mono">{sub.toFixed(3)}</td><td className="px-3 py-2 text-right font-mono text-muted-foreground">{(sub/result.mw*100).toFixed(1)}%</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : formula && <p className="text-sm text-destructive">Invalid formula or unknown element</p>}
      </CardContent>
    </Card>
  );
}
