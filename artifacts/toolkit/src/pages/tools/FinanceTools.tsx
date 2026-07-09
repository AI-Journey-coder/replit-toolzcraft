import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

// ─── EMI Calculator ────────────────────────────────────────────────────────

export function EmiCalculator() {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(24);
  const [showTable, setShowTable] = useState(false);

  const r = rate / 12 / 100;
  const n = tenure;
  const emi = r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - amount;

  const pieData = [
    { name: "Principal", value: Math.round(amount) },
    { name: "Interest", value: Math.round(totalInterest) },
  ];
  const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))"];

  const amortization = Array.from({ length: n }, (_, i) => {
    const month = i + 1;
    const interestPart = amount * r * Math.pow(1 + r, n - i) / (Math.pow(1 + r, n) - 1);
    const principalPart = emi - interestPart;
    return { month, emi: emi.toFixed(2), principal: principalPart.toFixed(2), interest: interestPart.toFixed(2) };
  });

  const fmt = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>EMI Calculator</CardTitle>
          <CardDescription>Calculate monthly loan installment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Loan Amount</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} data-testid="input-amount" />
          </div>
          <div className="space-y-2">
            <Label>Annual Interest Rate (%)</Label>
            <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} data-testid="input-rate" />
          </div>
          <div className="space-y-2">
            <Label>Tenure (months)</Label>
            <Input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} data-testid="input-tenure" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowTable(!showTable)} data-testid="btn-amortization">
            {showTable ? "Hide" : "Show"} Amortization Table
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg col-span-2">
                <div className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wider">Monthly EMI</div>
                <div className="text-3xl font-bold text-primary">₹{fmt(emi)}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wider">Total Payment</div>
                <div className="text-xl font-bold">₹{fmt(totalPayment)}</div>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg">
                <div className="text-xs text-muted-foreground font-mono mb-1 uppercase tracking-wider">Total Interest</div>
                <div className="text-xl font-bold text-destructive">₹{fmt(totalInterest)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${fmt(v)}`} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "6px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-sm font-mono mt-1">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {showTable && (
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Amortization Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-72">
              <table className="w-full text-sm font-mono">
                <thead className="sticky top-0 bg-muted text-muted-foreground">
                  <tr>
                    {["Month", "EMI", "Principal", "Interest"].map(h => (
                      <th key={h} className="px-3 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {amortization.map((row) => (
                    <tr key={row.month} className="border-t border-border/50 hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-1.5">{row.month}</td>
                      <td className="px-3 py-1.5">₹{Number(row.emi).toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-primary">₹{Number(row.principal).toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-destructive">₹{Number(row.interest).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── SIP Calculator ────────────────────────────────────────────────────────

export function SipCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const n = years * 12;
  const r = rate / 12 / 100;
  const futureValue = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = monthly * n;
  const returns = futureValue - totalInvested;

  const chartData = Array.from({ length: years }, (_, i) => {
    const months = (i + 1) * 12;
    const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    return { year: `Y${i + 1}`, invested: monthly * months, value: Math.round(fv) };
  });

  const fmt = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>SIP Calculator</CardTitle>
          <CardDescription>Estimate returns on your Systematic Investment Plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Monthly Investment (₹)</Label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} data-testid="input-monthly" />
          </div>
          <div className="space-y-2">
            <Label>Expected Annual Return (%)</Label>
            <Input type="number" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} data-testid="input-rate" />
          </div>
          <div className="space-y-2">
            <Label>Time Period (years)</Label>
            <Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} data-testid="input-years" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 gap-3">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Future Value</div>
              <div className="text-3xl font-bold text-primary">₹{fmt(futureValue)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Invested</div>
                <div className="text-xl font-bold">₹{fmt(totalInvested)}</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Returns</div>
                <div className="text-xl font-bold text-green-600">₹{fmt(returns)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                  <Tooltip formatter={(v: number) => `₹${fmt(v)}`} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "6px" }} />
                  <Area type="monotone" dataKey="invested" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" name="Invested" />
                  <Area type="monotone" dataKey="value" stackId="2" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="Total Value" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Compound Interest Calculator ─────────────────────────────────────────

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(8);
  const [time, setTime] = useState(5);
  const [freq, setFreq] = useState("12");

  const n = Number(freq);
  const amount = principal * Math.pow(1 + rate / (100 * n), n * time);
  const interest = amount - principal;

  const fmt = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Compound Interest Calculator</CardTitle>
          <CardDescription>Calculate growth with compound interest</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Principal Amount</Label>
            <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} data-testid="input-principal" />
          </div>
          <div className="space-y-2">
            <Label>Annual Rate (%)</Label>
            <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} data-testid="input-rate" />
          </div>
          <div className="space-y-2">
            <Label>Time Period (years)</Label>
            <Input type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} data-testid="input-time" />
          </div>
          <div className="space-y-2">
            <Label>Compounding Frequency</Label>
            <Select value={freq} onValueChange={setFreq}>
              <SelectTrigger data-testid="select-freq"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Annually</SelectItem>
                <SelectItem value="2">Semi-annually</SelectItem>
                <SelectItem value="4">Quarterly</SelectItem>
                <SelectItem value="12">Monthly</SelectItem>
                <SelectItem value="365">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-5 bg-primary/10 rounded-lg">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Final Amount</div>
            <div className="text-4xl font-bold text-primary">₹{fmt(amount)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Principal</div>
              <div className="text-xl font-bold">₹{fmt(principal)}</div>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Interest Earned</div>
              <div className="text-xl font-bold text-green-600">₹{fmt(interest)}</div>
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Growth</div>
            <div className="text-xl font-bold">{((interest / principal) * 100).toFixed(2)}%</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ROI Calculator ────────────────────────────────────────────────────────

export function RoiCalculator() {
  const [initial, setInitial] = useState(10000);
  const [finalVal, setFinalVal] = useState(15000);
  const [duration, setDuration] = useState(2);

  const netProfit = finalVal - initial;
  const roi = (netProfit / initial) * 100;
  const annualizedRoi = (Math.pow(finalVal / initial, 1 / duration) - 1) * 100;

  const fmt = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>ROI Calculator</CardTitle>
          <CardDescription>Return on Investment analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Initial Investment</Label>
            <Input type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} data-testid="input-initial" />
          </div>
          <div className="space-y-2">
            <Label>Final Value</Label>
            <Input type="number" value={finalVal} onChange={(e) => setFinalVal(Number(e.target.value))} data-testid="input-final" />
          </div>
          <div className="space-y-2">
            <Label>Duration (years)</Label>
            <Input type="number" step="0.5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} data-testid="input-duration" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-5 rounded-lg ${roi >= 0 ? "bg-green-500/10" : "bg-destructive/10"}`}>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">ROI</div>
            <div className={`text-4xl font-bold ${roi >= 0 ? "text-green-600" : "text-destructive"}`}>{roi.toFixed(2)}%</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Net Profit</div>
              <div className={`text-xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-destructive"}`}>₹{fmt(netProfit)}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Annualized ROI</div>
              <div className="text-xl font-bold">{annualizedRoi.toFixed(2)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tip Calculator ────────────────────────────────────────────────────────

export function TipCalculator() {
  const [bill, setBill] = useState(100);
  const [tip, setTip] = useState(15);
  const [people, setPeople] = useState(2);

  const tipAmount = bill * (tip / 100);
  const total = bill + tipAmount;
  const tipPerPerson = tipAmount / people;
  const totalPerPerson = total / people;

  const fmt = (v: number) => v.toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Tip Calculator</CardTitle>
          <CardDescription>Split the bill with ease</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Bill Amount ($)</Label>
            <Input type="number" step="0.01" value={bill} onChange={(e) => setBill(Number(e.target.value))} data-testid="input-bill" />
          </div>
          <div className="space-y-2">
            <Label>Tip Percentage</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {[10, 15, 18, 20, 25].map(t => (
                <Button key={t} size="sm" variant={tip === t ? "default" : "outline"} onClick={() => setTip(t)} data-testid={`btn-tip-${t}`}>{t}%</Button>
              ))}
            </div>
            <Input type="number" value={tip} onChange={(e) => setTip(Number(e.target.value))} data-testid="input-tip" />
          </div>
          <div className="space-y-2">
            <Label>Number of People</Label>
            <Input type="number" min={1} value={people} onChange={(e) => setPeople(Math.max(1, Number(e.target.value)))} data-testid="input-people" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-5 bg-primary/10 rounded-lg">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Per Person</div>
            <div className="text-4xl font-bold text-primary">${fmt(totalPerPerson)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Tip Amount</div>
              <div className="text-xl font-bold">${fmt(tipAmount)}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Tip Per Person</div>
              <div className="text-xl font-bold">${fmt(tipPerPerson)}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg col-span-2">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Grand Total</div>
              <div className="text-xl font-bold">${fmt(total)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── GST Calculator ────────────────────────────────────────────────────────

export function GstCalculator() {
  const [amount, setAmount] = useState(1000);
  const [gstRate, setGstRate] = useState("18");
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const rate = Number(gstRate);

  let base = amount;
  let gstAmount = 0;
  let totalAmount = 0;

  if (mode === "exclusive") {
    gstAmount = (amount * rate) / 100;
    totalAmount = amount + gstAmount;
    base = amount;
  } else {
    base = (amount * 100) / (100 + rate);
    gstAmount = amount - base;
    totalAmount = amount;
  }

  const fmt = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>GST Calculator</CardTitle>
          <CardDescription>Goods and Services Tax calculator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} data-testid="input-amount" />
          </div>
          <div className="space-y-2">
            <Label>GST Rate</Label>
            <Select value={gstRate} onValueChange={setGstRate}>
              <SelectTrigger data-testid="select-rate"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5% (Essential goods)</SelectItem>
                <SelectItem value="12">12% (Standard goods)</SelectItem>
                <SelectItem value="18">18% (Standard services)</SelectItem>
                <SelectItem value="28">28% (Luxury goods)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="flex gap-2">
              <Button size="sm" variant={mode === "exclusive" ? "default" : "outline"} onClick={() => setMode("exclusive")} data-testid="btn-exclusive">GST Exclusive</Button>
              <Button size="sm" variant={mode === "inclusive" ? "default" : "outline"} onClick={() => setMode("inclusive")} data-testid="btn-inclusive">GST Inclusive</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Results</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-5 bg-primary/10 rounded-lg">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Total Amount</div>
            <div className="text-4xl font-bold text-primary">₹{fmt(totalAmount)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Base Amount</div>
              <div className="text-xl font-bold">₹{fmt(base)}</div>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">GST ({gstRate}%)</div>
              <div className="text-xl font-bold text-orange-600">₹{fmt(gstAmount)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
