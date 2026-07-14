import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function fmt(n: number, dec = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
function fmtCur(n: number) { return "$" + fmt(n); }
function copyToClipboard(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

// ─── Mortgage Calculator ──────────────────────────────────────────────────────
export function MortgageCalculator() {
  const [price, setPrice] = useState(400000);
  const [down, setDown] = useState(80000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [showTable, setShowTable] = useState(false);

  const principal = price - down;
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r > 0 ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / n;
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - principal;
  const ltvRatio = (principal / price) * 100;

  const amortization = Array.from({ length: Math.min(360, n) }, (_, i) => {
    const bal = principal * Math.pow(1 + r, i + 1) - monthly * (Math.pow(1 + r, i + 1) - 1) / r;
    const interest = (i === 0 ? principal : Math.max(0, principal * Math.pow(1 + r, i) - monthly * (Math.pow(1 + r, i) - 1) / r)) * r;
    return { month: i + 1, payment: monthly, interest, principal: monthly - interest, balance: Math.max(0, bal) };
  });

  return (
    <Card>
      <CardHeader><CardTitle>Mortgage Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Home Price ($)</Label><Input type="number" value={price} onChange={e => setPrice(+e.target.value)} /></div>
          <div><Label>Down Payment ($)</Label><Input type="number" value={down} onChange={e => setDown(+e.target.value)} /></div>
          <div><Label>Annual Interest Rate (%)</Label><Input type="number" step={0.1} value={rate} onChange={e => setRate(+e.target.value)} /></div>
          <div><Label>Loan Term (years)</Label>
            <Select value={String(years)} onValueChange={v => setYears(+v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 15, 20, 25, 30].map(y => <SelectItem key={y} value={String(y)}>{y} years</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Monthly Payment", fmtCur(monthly)],
            ["Total Paid", fmtCur(totalPaid)],
            ["Total Interest", fmtCur(totalInterest)],
            ["Loan Amount", fmtCur(principal)],
            ["Down Payment %", fmt(down / price * 100) + "%"],
            ["LTV Ratio", fmt(ltvRatio) + "%"],
          ].map(([label, value]) => (
            <div key={label} className="p-3 bg-muted rounded text-center">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="font-bold text-lg">{value}</div>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={() => setShowTable(t => !t)}>{showTable ? "Hide" : "Show"} Amortization Table</Button>
        {showTable && (
          <div className="overflow-auto max-h-64">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-muted sticky top-0">
                {["Month", "Payment", "Principal", "Interest", "Balance"].map(h => <th key={h} className="p-2 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {amortization.filter((_, i) => i % 12 === 11 || i === 0).map(row => (
                  <tr key={row.month} className="border-b hover:bg-muted/50">
                    <td className="p-2">{row.month}</td>
                    <td className="p-2">{fmtCur(row.payment)}</td>
                    <td className="p-2">{fmtCur(row.principal)}</td>
                    <td className="p-2">{fmtCur(row.interest)}</td>
                    <td className="p-2">{fmtCur(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Generic Break-Even Helper ─────────────────────────────────────────────────
function BreakEvenCard({ title, fields, calc }: { title: string; fields: Array<{ label: string; key: string; value: number; setter: (v: number) => void; unit?: string }>; calc: () => { units?: number; revenue?: number; months?: number; label: string; extra?: string[] } | null }) {
  const result = calc();
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <Label>{f.label} {f.unit && <span className="text-muted-foreground">({f.unit})</span>}</Label>
              <Input type="number" min={0} step={0.01} value={f.value} onChange={e => f.setter(+e.target.value)} />
            </div>
          ))}
        </div>
        {result && (
          <div className="p-4 bg-muted rounded space-y-2">
            <div className="text-lg font-bold">{result.label}</div>
            {result.extra?.map((e, i) => <div key={i} className="text-sm text-muted-foreground">{e}</div>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Startup Break-Even ────────────────────────────────────────────────────────
export function StartupBreakEven() {
  const [fixed, setFixed] = useState(50000);
  const [cogs, setCogs] = useState(30);
  const [price, setPrice] = useState(99);
  const margin = price - (price * cogs / 100);
  const units = margin > 0 ? Math.ceil(fixed / margin) : null;
  const revenue = units ? units * price : null;

  return <BreakEvenCard
    title="Startup Break-Even"
    fields={[
      { label: "Fixed Monthly Costs", key: "fixed", value: fixed, setter: setFixed, unit: "$" },
      { label: "Product Price", key: "price", value: price, setter: setPrice, unit: "$" },
      { label: "COGS % of Price", key: "cogs", value: cogs, setter: setCogs, unit: "%" },
    ]}
    calc={() => units ? {
      label: `Break-even: ${units.toLocaleString()} units / month`,
      extra: [`Revenue needed: ${fmtCur(revenue!)}`, `Contribution margin per unit: ${fmtCur(margin)}`, `Gross margin: ${fmt(100 - cogs)}%`],
    } : null}
  />;
}

// ─── SaaS Break-Even ──────────────────────────────────────────────────────────
export function SaasBreakEven() {
  const [fixed, setFixed] = useState(15000);
  const [mrr, setMrr] = useState(49);
  const [cac, setCac] = useState(200);
  const [churn, setChurn] = useState(5);
  const ltv = churn > 0 ? mrr / (churn / 100) : 0;
  const breakEvenCustomers = fixed > 0 ? Math.ceil(fixed / mrr) : 0;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  return <BreakEvenCard
    title="SaaS Break-Even"
    fields={[
      { label: "Monthly Fixed Costs", key: "fixed", value: fixed, setter: setFixed, unit: "$" },
      { label: "MRR per Customer", key: "mrr", value: mrr, setter: setMrr, unit: "$" },
      { label: "CAC (Customer Acquisition Cost)", key: "cac", value: cac, setter: setCac, unit: "$" },
      { label: "Monthly Churn Rate", key: "churn", value: churn, setter: setChurn, unit: "%" },
    ]}
    calc={() => ({
      label: `Break-even: ${breakEvenCustomers} paying customers`,
      extra: [
        `Customer LTV: ${fmtCur(ltv)}`,
        `LTV:CAC Ratio: ${fmt(ltvCacRatio)}x ${ltvCacRatio >= 3 ? "✓ Healthy" : "⚠ Low"}`,
        `CAC Payback: ${mrr > 0 ? Math.ceil(cac / mrr) : "∞"} months`,
      ],
    })}
  />;
}

// ─── Ecommerce Break-Even ─────────────────────────────────────────────────────
export function EcommerceBreakEven() {
  const [fixed, setFixed] = useState(5000);
  const [cogs, setCogs] = useState(25);
  const [price, setPrice] = useState(79);
  const [adSpend, setAdSpend] = useState(3000);
  const [roas, setRoas] = useState(3);
  const margin = price - cogs - (adSpend > 0 && roas > 0 ? price / roas : 0);
  const units = margin > 0 ? Math.ceil(fixed / margin) : null;

  return <BreakEvenCard
    title="Ecommerce Break-Even"
    fields={[
      { label: "Monthly Fixed Costs", key: "fixed", value: fixed, setter: setFixed, unit: "$" },
      { label: "Selling Price", key: "price", value: price, setter: setPrice, unit: "$" },
      { label: "COGS per Unit", key: "cogs", value: cogs, setter: setCogs, unit: "$" },
      { label: "Monthly Ad Spend", key: "adSpend", value: adSpend, setter: setAdSpend, unit: "$" },
      { label: "ROAS (Return on Ad Spend)", key: "roas", value: roas, setter: setRoas, unit: "x" },
    ]}
    calc={() => units ? {
      label: `Break-even: ${units.toLocaleString()} units / month`,
      extra: [`Revenue: ${fmtCur(units * price)}`, `Net margin per unit: ${fmtCur(margin)}`],
    } : { label: "Not profitable at current margins" }}
  />;
}

// ─── Crypto Break-Even ────────────────────────────────────────────────────────
export function CryptoBreakEven() {
  const [buyPrice, setBuyPrice] = useState(45000);
  const [amount, setAmount] = useState(1);
  const [fee, setFee] = useState(0.5);
  const [targetGain, setTargetGain] = useState(20);
  const totalCost = buyPrice * amount * (1 + fee / 100);
  const breakEvenPrice = totalCost / amount;
  const targetPrice = buyPrice * (1 + targetGain / 100);
  const targetProfit = (targetPrice - breakEvenPrice) * amount;

  return <BreakEvenCard
    title="Crypto Investment Break-Even"
    fields={[
      { label: "Buy Price", key: "buyPrice", value: buyPrice, setter: setBuyPrice, unit: "$" },
      { label: "Amount (coins)", key: "amount", value: amount, setter: setAmount },
      { label: "Trading Fee", key: "fee", value: fee, setter: setFee, unit: "%" },
      { label: "Target Gain", key: "targetGain", value: targetGain, setter: setTargetGain, unit: "%" },
    ]}
    calc={() => ({
      label: `Break-even price: ${fmtCur(breakEvenPrice)}`,
      extra: [
        `Total invested: ${fmtCur(totalCost)}`,
        `Target sell price: ${fmtCur(targetPrice)}`,
        `Target profit: ${fmtCur(targetProfit)}`,
        `Total return: ${fmtCur(targetPrice * amount)} (${fmt(targetGain)}%)`,
      ],
    })}
  />;
}

// ─── Time Format Converter ────────────────────────────────────────────────────
export function TimeFormatConverter() {
  const [seconds, setSeconds] = useState(3723);

  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const fromHms = (v: string) => {
    const parts = v.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0];
  };

  const formats = [
    ["Seconds", String(seconds)],
    ["HH:MM:SS", `${pad(hh)}:${pad(mm)}:${pad(ss)}`],
    ["H:MM:SS", `${hh}:${pad(mm)}:${pad(ss)}`],
    ["Minutes:Seconds", `${Math.floor(seconds / 60)}:${pad(ss)}`],
    ["Minutes (decimal)", fmt(seconds / 60)],
    ["Hours (decimal)", fmt(seconds / 3600)],
    ["Days (decimal)", fmt(seconds / 86400)],
    ["Milliseconds", String(seconds * 1000)],
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Time Format Converter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Input (seconds)</Label>
            <Input type="number" min={0} value={seconds} onChange={e => setSeconds(+e.target.value)} />
          </div>
          <div>
            <Label>Input HH:MM:SS</Label>
            <Input placeholder="1:02:03" onChange={e => { const v = fromHms(e.target.value); if (v >= 0) setSeconds(v); }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {formats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
              <span className="text-muted-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{value}</span>
                <button className="text-xs text-blue-400 hover:underline" onClick={() => copyToClipboard(value)}>copy</button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Expense Categorizer ──────────────────────────────────────────────────────
const KEYWORDS: Record<string, string[]> = {
  Food: ["restaurant", "cafe", "food", "grocery", "supermarket", "pizza", "burger", "coffee", "lunch", "dinner", "breakfast", "meal", "eat"],
  Transport: ["uber", "lyft", "taxi", "gas", "fuel", "parking", "transit", "bus", "train", "flight", "airline", "hotel"],
  Shopping: ["amazon", "ebay", "walmart", "target", "store", "shop", "mall", "clothing", "shoes", "electronics"],
  Entertainment: ["netflix", "spotify", "steam", "game", "movie", "cinema", "concert", "subscription", "music"],
  Utilities: ["electric", "water", "gas", "internet", "phone", "mobile", "insurance", "rent", "mortgage"],
  Health: ["pharmacy", "doctor", "hospital", "gym", "fitness", "medical", "dental", "health"],
  Work: ["office", "software", "saas", "tools", "equipment", "coworking", "professional"],
};

function categorize(desc: string): string {
  const lower = desc.toLowerCase();
  for (const [cat, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return "Other";
}

export function ExpenseCategorizer() {
  const [input, setInput] = useState("Amazon $45.00\nStarbucks Coffee $8.50\nNetflix $15.99\nUber ride $22.00\nCVS Pharmacy $12.35\nWhole Foods $89.50\nShell Gas Station $55.00");
  const [expenses, setExpenses] = useState<Array<{ desc: string; amount: number; category: string }>>([]);

  const analyze = () => {
    const rows = input.split("\n").filter(Boolean).map(line => {
      const amountMatch = line.match(/\$?(\d+(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
      const desc = line.replace(/\$?\d+(?:\.\d{2})?/, "").trim();
      return { desc: desc || line, amount, category: categorize(line) };
    });
    setExpenses(rows);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const CATEGORY_COLORS: Record<string, string> = {
    Food: "bg-orange-500/20 text-orange-400",
    Transport: "bg-blue-500/20 text-blue-400",
    Shopping: "bg-purple-500/20 text-purple-400",
    Entertainment: "bg-pink-500/20 text-pink-400",
    Utilities: "bg-yellow-500/20 text-yellow-400",
    Health: "bg-green-500/20 text-green-400",
    Work: "bg-cyan-500/20 text-cyan-400",
    Other: "bg-gray-500/20 text-gray-400",
  };

  return (
    <Card>
      <CardHeader><CardTitle>Expense Categorizer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Paste expenses (one per line, description and amount)</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="h-36 text-sm" />
        </div>
        <Button onClick={analyze}>Categorize</Button>
        {expenses.length > 0 && (
          <>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <div key={cat} className={`px-3 py-1 rounded text-sm font-medium ${CATEGORY_COLORS[cat] || "bg-muted"}`}>
                  {cat}: {fmtCur(amt)} ({fmt(amt / total * 100)}%)
                </div>
              ))}
            </div>
            <div className="space-y-1 max-h-56 overflow-auto">
              {expenses.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[e.category] || "bg-muted"}`}>{e.category}</span>
                  <span className="flex-1">{e.desc}</span>
                  <span className="font-mono">{fmtCur(e.amount)}</span>
                </div>
              ))}
              <div className="pt-2 border-t font-bold text-sm flex justify-between">
                <span>Total</span><span>{fmtCur(total)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Checksum Calculator ──────────────────────────────────────────────────────
function crc32(str: string): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const ch of new TextEncoder().encode(str)) crc = table[(crc ^ ch) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function ChecksumCalculator() {
  const [input, setInput] = useState("Hello, World!");
  const [checksums, setChecksums] = useState<Record<string, string>>({});

  const calculate = async () => {
    const enc = new TextEncoder().encode(input);
    const results: Record<string, string> = {};
    results["CRC32"] = crc32(input).toString(16).toUpperCase().padStart(8, "0");
    for (const algo of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const) {
      const buf = await crypto.subtle.digest(algo, enc);
      results[algo] = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    setChecksums(results);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Checksum Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Input Text</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="h-28 font-mono text-sm" />
        </div>
        <Button onClick={calculate}>Calculate Checksums</Button>
        {Object.keys(checksums).length > 0 && (
          <div className="space-y-2">
            {Object.entries(checksums).map(([algo, hash]) => (
              <div key={algo} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                <Badge variant="outline" className="min-w-[80px] justify-center">{algo}</Badge>
                <code className="flex-1 font-mono text-xs break-all">{hash}</code>
                <button className="text-xs text-blue-400 hover:underline flex-shrink-0" onClick={() => copyToClipboard(hash)}>copy</button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
