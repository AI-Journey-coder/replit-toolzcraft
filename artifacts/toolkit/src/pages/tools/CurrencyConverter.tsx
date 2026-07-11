import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, RefreshCw, AlertCircle } from "lucide-react";
function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1400);
  };
  return { copiedKey, copy };
}

function fmt(n: number, decimals = 4): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(4);
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: decimals });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const MAJOR_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL",
  "MXN", "SGD", "HKD", "SEK", "NOK", "DKK", "NZD", "ZAR", "AED", "SAR",
  "KRW", "TRY", "RUB", "PLN", "THB", "IDR", "MYR", "PHP", "TWD", "PKR",
  "BDT", "VND", "NGN", "EGP", "COP", "CLP", "PEN", "ILS", "HUF", "CZK",
  "RON", "ARS", "QAR", "KWD", "BHD", "OMR", "MAD", "UGX", "KES", "GHS",
];

const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound", JPY: "Japanese Yen",
  CAD: "Canadian Dollar", AUD: "Australian Dollar", CHF: "Swiss Franc",
  CNY: "Chinese Yuan", INR: "Indian Rupee", BRL: "Brazilian Real",
  MXN: "Mexican Peso", SGD: "Singapore Dollar", HKD: "Hong Kong Dollar",
  SEK: "Swedish Krona", NOK: "Norwegian Krone", DKK: "Danish Krone",
  NZD: "New Zealand Dollar", ZAR: "South African Rand", AED: "UAE Dirham",
  SAR: "Saudi Riyal", KRW: "South Korean Won", TRY: "Turkish Lira",
  RUB: "Russian Ruble", PLN: "Polish Zloty", THB: "Thai Baht",
  IDR: "Indonesian Rupiah", MYR: "Malaysian Ringgit", PHP: "Philippine Peso",
  TWD: "Taiwan Dollar", PKR: "Pakistani Rupee", BDT: "Bangladeshi Taka",
  VND: "Vietnamese Dong", NGN: "Nigerian Naira", EGP: "Egyptian Pound",
  COP: "Colombian Peso", CLP: "Chilean Peso", PEN: "Peruvian Sol",
  ILS: "Israeli Shekel", HUF: "Hungarian Forint", CZK: "Czech Koruna",
  RON: "Romanian Leu", ARS: "Argentine Peso", QAR: "Qatari Riyal",
  KWD: "Kuwaiti Dinar", BHD: "Bahraini Dinar", OMR: "Omani Rial",
  MAD: "Moroccan Dirham", UGX: "Ugandan Shilling", KES: "Kenyan Shilling",
  GHS: "Ghanaian Cedi",
};

interface RatesResult {
  rates: Record<string, number>;
  base: string;
  updatedAt: string;
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [base, setBase] = useState("USD");
  const [ratesData, setRatesData] = useState<RatesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const { copiedKey, copy } = useCopy();

  const fetchRates = useCallback(async (baseCcy: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${baseCcy}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.result !== "success") throw new Error(json["error-type"] || "Unknown error");
      setRatesData({
        rates: json.rates,
        base: json.base_code,
        updatedAt: json.time_last_update_utc,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load exchange rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(base); }, [base, fetchRates]);

  const amt = parseFloat(amount);
  const filteredCurrencies = MAJOR_CURRENCIES.filter(c =>
    c !== base &&
    (search === "" ||
      c.toLowerCase().includes(search.toLowerCase()) ||
      (CURRENCY_NAMES[c] ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Currency Converter</CardTitle>
          <CardDescription>Live exchange rates from open.er-api.com — updated daily</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="font-mono text-lg h-11" data-testid="input-amount" />
            </div>
            <div className="w-52 space-y-1.5">
              <Label>Base currency</Label>
              <Select value={base} onValueChange={v => { setBase(v); }}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {MAJOR_CURRENCIES.map(c => (
                    <SelectItem key={c} value={c}>{c} — {CURRENCY_NAMES[c] ?? c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="icon" variant="outline" className="h-11 w-11 shrink-0" onClick={() => fetchRates(base)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {ratesData && (
            <p className="text-xs text-muted-foreground font-mono">
              Rates updated: {formatDate(ratesData.updatedAt)}
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Filter currencies</Label>
            <Input placeholder="Search currency…" value={search} onChange={e => setSearch(e.target.value)} className="h-9 text-sm" />
          </div>

          {loading && (
            <div className="text-center py-8 text-muted-foreground font-mono text-sm animate-pulse">Loading rates…</div>
          )}

          {ratesData && !loading && (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground font-mono text-xs">
                    <th className="text-left px-4 py-2.5 w-16">Code</th>
                    <th className="text-left px-4 py-2.5">Currency</th>
                    <th className="text-left px-4 py-2.5">Amount</th>
                    <th className="px-2 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filteredCurrencies.map((c, i) => {
                    const rate = ratesData.rates[c];
                    const converted = rate != null && !isNaN(amt) ? fmt(amt * rate) : "—";
                    return (
                      <tr key={c} className={`border-t border-border/50 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                        <td className="px-4 py-2.5 font-mono font-semibold text-primary">{c}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{CURRENCY_NAMES[c] ?? c}</td>
                        <td className="px-4 py-2.5 font-mono">{converted}</td>
                        <td className="px-2 py-2.5 text-right">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={converted === "—"} onClick={() => copy(converted, c)}>
                            {copiedKey === c ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCurrencies.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No currencies match "{search}"</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
    </Card>
  );
}
