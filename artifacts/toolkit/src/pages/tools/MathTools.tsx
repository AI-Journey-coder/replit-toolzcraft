import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Delete } from "lucide-react";

// ─── Percentage Calculator ─────────────────────────────────────────────────

export function PercentageCalculator() {
  const [a1, setA1] = useState("");
  const [b1, setB1] = useState("");
  const [r1, setR1] = useState<string | null>(null);

  const [a2, setA2] = useState("");
  const [b2, setB2] = useState("");
  const [r2, setR2] = useState<string | null>(null);

  const [a3, setA3] = useState("");
  const [b3, setB3] = useState("");
  const [r3, setR3] = useState<string | null>(null);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Percentage Calculator</CardTitle>
        <CardDescription>Three modes of percentage calculation</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="of">
          <TabsList className="w-full">
            <TabsTrigger value="of" className="flex-1 text-xs" data-testid="tab-of">What is X% of Y?</TabsTrigger>
            <TabsTrigger value="what" className="flex-1 text-xs" data-testid="tab-what">X is what % of Y?</TabsTrigger>
            <TabsTrigger value="change" className="flex-1 text-xs" data-testid="tab-change">% Change</TabsTrigger>
          </TabsList>

          <TabsContent value="of" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">What is</span>
              <Input className="w-24" type="number" value={a1} onChange={e => setA1(e.target.value)} data-testid="input-a1" />
              <span className="text-sm text-muted-foreground">% of</span>
              <Input className="w-24" type="number" value={b1} onChange={e => setB1(e.target.value)} data-testid="input-b1" />
              <span className="text-sm text-muted-foreground">?</span>
            </div>
            <Button onClick={() => setR1(((Number(a1) / 100) * Number(b1)).toFixed(4))} data-testid="btn-calc1">Calculate</Button>
            {r1 !== null && <div className="p-4 bg-primary/10 rounded-lg"><span className="text-2xl font-bold text-primary">{r1}</span></div>}
          </TabsContent>

          <TabsContent value="what" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Input className="w-24" type="number" value={a2} onChange={e => setA2(e.target.value)} data-testid="input-a2" />
              <span className="text-sm text-muted-foreground">is what % of</span>
              <Input className="w-24" type="number" value={b2} onChange={e => setB2(e.target.value)} data-testid="input-b2" />
              <span className="text-sm text-muted-foreground">?</span>
            </div>
            <Button onClick={() => setR2(Number(b2) !== 0 ? ((Number(a2) / Number(b2)) * 100).toFixed(4) + "%" : "Division by zero")} data-testid="btn-calc2">Calculate</Button>
            {r2 !== null && <div className="p-4 bg-primary/10 rounded-lg"><span className="text-2xl font-bold text-primary">{r2}</span></div>}
          </TabsContent>

          <TabsContent value="change" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">From</span>
              <Input className="w-24" type="number" value={a3} onChange={e => setA3(e.target.value)} data-testid="input-a3" />
              <span className="text-sm text-muted-foreground">to</span>
              <Input className="w-24" type="number" value={b3} onChange={e => setB3(e.target.value)} data-testid="input-b3" />
            </div>
            <Button onClick={() => {
              const pct = Number(a3) !== 0 ? (((Number(b3) - Number(a3)) / Math.abs(Number(a3))) * 100).toFixed(4) : "0";
              setR3(pct);
            }} data-testid="btn-calc3">Calculate</Button>
            {r3 !== null && (
              <div className={`p-4 rounded-lg ${Number(r3) >= 0 ? "bg-green-500/10" : "bg-destructive/10"}`}>
                <span className={`text-2xl font-bold ${Number(r3) >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {Number(r3) >= 0 ? "+" : ""}{r3}%
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ─── Scientific Calculator ─────────────────────────────────────────────────

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const appendToExpr = (val: string) => {
    setExpr(prev => prev === "" && val !== "(" ? val : prev + val);
    setDisplay(prev => prev === "0" ? val : prev + val);
  };

  const clear = () => { setDisplay("0"); setExpr(""); };
  const backspace = () => {
    setExpr(prev => prev.slice(0, -1) || "");
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
  };

  const calculate = () => {
    try {
      const sanitized = expr
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString())
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/\^/g, "**");
      const result = Function('"use strict"; return (' + sanitized + ")")();
      const resultStr = parseFloat(result.toFixed(10)).toString();
      setHistory(prev => [`${expr} = ${resultStr}`, ...prev.slice(0, 9)]);
      setDisplay(resultStr);
      setExpr(resultStr);
    } catch {
      setDisplay("Error");
      setExpr("");
    }
  };

  const btnClass = "h-12 rounded-lg font-mono font-medium text-sm transition-colors";
  const numBtn = `${btnClass} bg-card hover:bg-muted border border-border`;
  const opBtn = `${btnClass} bg-muted hover:bg-muted/80`;
  const fnBtn = `${btnClass} bg-primary/10 hover:bg-primary/20 text-primary text-xs`;
  const eqBtn = `${btnClass} bg-primary text-primary-foreground hover:bg-primary/90 col-span-2`;

  const ROWS = [
    [{ l: "sin(", c: fnBtn }, { l: "cos(", c: fnBtn }, { l: "tan(", c: fnBtn }, { l: "log(", c: fnBtn }, { l: "sqrt(", c: fnBtn }],
    [{ l: "ln(", c: fnBtn }, { l: "π", c: fnBtn }, { l: "e", c: fnBtn }, { l: "^", c: opBtn }, { l: "(", c: opBtn }, { l: ")", c: opBtn }],
    [{ l: "7", c: numBtn }, { l: "8", c: numBtn }, { l: "9", c: numBtn }, { l: "/", c: opBtn }],
    [{ l: "4", c: numBtn }, { l: "5", c: numBtn }, { l: "6", c: numBtn }, { l: "*", c: opBtn }],
    [{ l: "1", c: numBtn }, { l: "2", c: numBtn }, { l: "3", c: numBtn }, { l: "-", c: opBtn }],
    [{ l: "0", c: numBtn }, { l: ".", c: numBtn }, { l: "00", c: numBtn }, { l: "+", c: opBtn }],
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Scientific Calculator</CardTitle>
          <CardDescription>Advanced calculations with trigonometry, logarithms, and more</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-muted/50 rounded-lg min-h-[70px] text-right">
            <div className="text-xs text-muted-foreground font-mono mb-1 truncate">{expr || " "}</div>
            <div className="text-3xl font-bold font-mono truncate" data-testid="display-value">{display}</div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {ROWS[0].map(({ l, c }) => (
              <button key={l} className={c} onClick={() => appendToExpr(l)} data-testid={`btn-${l.replace(/[^a-z0-9]/gi, "")}`}>{l}</button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {ROWS[1].map(({ l, c }) => (
              <button key={l} className={c} onClick={() => appendToExpr(l)} data-testid={`btn-${l.replace(/[^a-z0-9]/gi, "")}`}>{l}</button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {ROWS[2].map(({ l, c }) => (
              <button key={l} className={c} onClick={() => appendToExpr(l)} data-testid={`btn-${l.replace(/[^a-z0-9]/gi, "")}`}>{l}</button>
            ))}
            {ROWS[3].map(({ l, c }) => (
              <button key={l} className={c} onClick={() => appendToExpr(l)} data-testid={`btn-${l.replace(/[^a-z0-9]/gi, "")}`}>{l}</button>
            ))}
            {ROWS[4].map(({ l, c }) => (
              <button key={l} className={c} onClick={() => appendToExpr(l)} data-testid={`btn-${l.replace(/[^a-z0-9]/gi, "")}`}>{l}</button>
            ))}
            {ROWS[5].map(({ l, c }) => (
              <button key={l} className={c} onClick={() => appendToExpr(l)} data-testid={`btn-${l.replace(/[^a-z0-9]/gi, "")}`}>{l}</button>
            ))}
            <button className={`${btnClass} bg-destructive/10 text-destructive hover:bg-destructive/20`} onClick={clear} data-testid="btn-clear">AC</button>
            <button className={`${btnClass} bg-muted hover:bg-muted/80`} onClick={backspace} data-testid="btn-backspace"><Delete className="h-4 w-4 mx-auto" /></button>
            <button className={eqBtn} onClick={calculate} data-testid="btn-equals">=</button>
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="text-sm font-mono p-2 bg-muted/40 rounded text-muted-foreground" data-testid={`history-${i}`}>{h}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Prime Checker ─────────────────────────────────────────────────────────

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function getFactors(n: number): number[] {
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}

function nextPrime(n: number): number {
  let candidate = n + 1;
  while (!isPrime(candidate)) candidate++;
  return candidate;
}

export function PrimeChecker() {
  const [num, setNum] = useState("17");
  const [result, setResult] = useState<{ prime: boolean; factors: number[]; next: number } | null>(null);

  const check = () => {
    const n = parseInt(num);
    if (isNaN(n) || n < 1) return;
    setResult({ prime: isPrime(n), factors: getFactors(n), next: nextPrime(n) });
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Prime Number Checker</CardTitle>
        <CardDescription>Check if a number is prime and find its factors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label>Number</Label>
            <Input type="number" min={1} value={num} onChange={e => setNum(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} data-testid="input-number" />
          </div>
          <div className="self-end">
            <Button onClick={check} data-testid="btn-check">Check</Button>
          </div>
        </div>

        {result && (
          <div className="space-y-3">
            <div className={`p-5 rounded-lg text-center ${result.prime ? "bg-green-500/10 border border-green-500/20" : "bg-muted/50"}`}>
              <div className="text-4xl font-bold font-mono mb-1" data-testid="result-prime">
                {parseInt(num).toLocaleString()}
              </div>
              <div className={`text-lg font-semibold ${result.prime ? "text-green-600" : "text-muted-foreground"}`}>
                {result.prime ? "Is a Prime Number" : "Is NOT a Prime Number"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Factors</div>
                <div className="flex flex-wrap gap-1" data-testid="div-factors">
                  {result.factors.map(f => (
                    <span key={f} className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-sm">{f}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Next Prime</div>
                <div className="text-2xl font-bold text-primary font-mono" data-testid="result-next-prime">{result.next.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
