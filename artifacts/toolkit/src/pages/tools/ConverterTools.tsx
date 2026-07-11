import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck } from "lucide-react";
function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1400);
  };
  return { copiedKey, copy };
}

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1e12) return n.toExponential(6);
  if (Math.abs(n) < 1e-9 && n !== 0) return n.toExponential(6);
  if (Math.abs(n) < 0.0001 && n !== 0) return n.toPrecision(6);
  return parseFloat(n.toPrecision(10)).toString();
}

// ─── Generic linear converter ───────────────────────────────────────────────

type UnitDef = { label: string; factor: number };

function ConversionTable({ value, fromKey, units }: {
  value: string;
  fromKey: string;
  units: Record<string, UnitDef>;
}) {
  const { copiedKey, copy } = useCopy();
  const num = parseFloat(value);
  const baseVal = isNaN(num) ? null : num * units[fromKey].factor;

  return (
    <div className="rounded-lg border border-border overflow-hidden mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 text-muted-foreground font-mono text-xs">
            <th className="text-left px-4 py-2.5 w-1/3">Unit</th>
            <th className="text-left px-4 py-2.5">Value</th>
            <th className="px-2 py-2.5 w-10" />
          </tr>
        </thead>
        <tbody>
          {Object.entries(units).map(([key, { label, factor }], i) => {
            const converted = baseVal === null ? "" : fmt(baseVal / factor);
            const isSource = key === fromKey;
            return (
              <tr
                key={key}
                className={`border-t border-border/50 transition-colors ${isSource ? "bg-primary/5" : i % 2 === 0 ? "" : "bg-muted/20"}`}
              >
                <td className={`px-4 py-2.5 font-medium ${isSource ? "text-primary" : ""}`}>{label}</td>
                <td className="px-4 py-2.5 font-mono">{isSource ? (value || "—") : (converted || "—")}</td>
                <td className="px-2 py-2.5 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    disabled={!converted}
                    onClick={() => copy(isSource ? value : converted, key)}
                  >
                    {copiedKey === key
                      ? <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                      : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function UnitConverter({ title, desc, units, defaultUnit }: {
  title: string;
  desc: string;
  units: Record<string, UnitDef>;
  defaultUnit: string;
}) {
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState(defaultUnit);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Value</Label>
            <Input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="font-mono text-lg h-11"
              data-testid="input-value"
            />
          </div>
          <div className="w-56 space-y-1.5">
            <Label>From unit</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="h-11" data-testid="select-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(units).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ConversionTable value={value} fromKey={fromUnit} units={units} />
      </CardContent>
    </Card>
  );
}

// ─── Unit definitions ────────────────────────────────────────────────────────

const lengthUnits: Record<string, UnitDef> = {
  mm: { label: "Millimeter (mm)", factor: 0.001 },
  cm: { label: "Centimeter (cm)", factor: 0.01 },
  m:  { label: "Meter (m)",        factor: 1 },
  km: { label: "Kilometer (km)",   factor: 1000 },
  in: { label: "Inch (in)",        factor: 0.0254 },
  ft: { label: "Foot (ft)",        factor: 0.3048 },
  yd: { label: "Yard (yd)",        factor: 0.9144 },
  mi: { label: "Mile (mi)",        factor: 1609.344 },
  nmi:{ label: "Nautical Mile (nmi)", factor: 1852 },
  ly: { label: "Light Year (ly)",  factor: 9.461e15 },
};

const weightUnits: Record<string, UnitDef> = {
  mg:    { label: "Milligram (mg)",    factor: 0.000001 },
  g:     { label: "Gram (g)",          factor: 0.001 },
  kg:    { label: "Kilogram (kg)",     factor: 1 },
  t:     { label: "Metric Ton (t)",    factor: 1000 },
  oz:    { label: "Ounce (oz)",        factor: 0.0283495 },
  lb:    { label: "Pound (lb)",        factor: 0.453592 },
  stone: { label: "Stone",            factor: 6.35029 },
  lton:  { label: "Long Ton (UK)",     factor: 1016.05 },
  ston:  { label: "Short Ton (US)",    factor: 907.185 },
};

const speedUnits: Record<string, UnitDef> = {
  "m/s":   { label: "Meters/sec (m/s)",     factor: 1 },
  "km/h":  { label: "Kilometers/hr (km/h)", factor: 1 / 3.6 },
  "mph":   { label: "Miles/hr (mph)",        factor: 0.44704 },
  "knots": { label: "Knots (kn)",            factor: 0.514444 },
  "ft/s":  { label: "Feet/sec (ft/s)",       factor: 0.3048 },
  "mach":  { label: "Mach (at sea level)",   factor: 340.29 },
};

const areaUnits: Record<string, UnitDef> = {
  "mm²":    { label: "Square Millimeter (mm²)",  factor: 0.000001 },
  "cm²":    { label: "Square Centimeter (cm²)",  factor: 0.0001 },
  "m²":     { label: "Square Meter (m²)",        factor: 1 },
  "km²":    { label: "Square Kilometer (km²)",   factor: 1e6 },
  "in²":    { label: "Square Inch (in²)",        factor: 0.00064516 },
  "ft²":    { label: "Square Foot (ft²)",        factor: 0.092903 },
  "yd²":    { label: "Square Yard (yd²)",        factor: 0.836127 },
  "acre":   { label: "Acre",                     factor: 4046.86 },
  "hectare":{ label: "Hectare (ha)",             factor: 10000 },
  "mi²":    { label: "Square Mile (mi²)",        factor: 2.59e6 },
};

const volumeUnits: Record<string, UnitDef> = {
  ml:      { label: "Milliliter (ml)",         factor: 0.001 },
  L:       { label: "Liter (L)",               factor: 1 },
  "m³":    { label: "Cubic Meter (m³)",        factor: 1000 },
  "cm³":   { label: "Cubic Centimeter (cm³)",  factor: 0.001 },
  "in³":   { label: "Cubic Inch (in³)",        factor: 0.016387 },
  "ft³":   { label: "Cubic Foot (ft³)",        factor: 28.3168 },
  tsp:     { label: "Teaspoon (tsp)",          factor: 0.00492892 },
  tbsp:    { label: "Tablespoon (tbsp)",        factor: 0.0147868 },
  "fl oz": { label: "Fluid Ounce (fl oz)",     factor: 0.0295735 },
  cup:     { label: "Cup (US)",                factor: 0.236588 },
  pt:      { label: "Pint (pt)",               factor: 0.473176 },
  qt:      { label: "Quart (qt)",              factor: 0.946353 },
  gal:     { label: "Gallon (US gal)",         factor: 3.78541 },
  "gal-uk":{ label: "Gallon (UK gal)",         factor: 4.54609 },
};

const dataUnits: Record<string, UnitDef> = {
  bit:  { label: "Bit (b)",          factor: 1 },
  byte: { label: "Byte (B)",         factor: 8 },
  KB:   { label: "Kilobyte (KB)",    factor: 8000 },
  MB:   { label: "Megabyte (MB)",    factor: 8e6 },
  GB:   { label: "Gigabyte (GB)",    factor: 8e9 },
  TB:   { label: "Terabyte (TB)",    factor: 8e12 },
  PB:   { label: "Petabyte (PB)",    factor: 8e15 },
  KiB:  { label: "Kibibyte (KiB)",   factor: 8 * 1024 },
  MiB:  { label: "Mebibyte (MiB)",   factor: 8 * 1024 ** 2 },
  GiB:  { label: "Gibibyte (GiB)",   factor: 8 * 1024 ** 3 },
  TiB:  { label: "Tebibyte (TiB)",   factor: 8 * 1024 ** 4 },
};

const energyUnits: Record<string, UnitDef> = {
  J:    { label: "Joule (J)",           factor: 1 },
  kJ:   { label: "Kilojoule (kJ)",      factor: 1000 },
  cal:  { label: "Calorie (cal)",       factor: 4.184 },
  kcal: { label: "Kilocalorie (kcal)",  factor: 4184 },
  Wh:   { label: "Watt-hour (Wh)",      factor: 3600 },
  kWh:  { label: "Kilowatt-hour (kWh)", factor: 3.6e6 },
  BTU:  { label: "BTU",                 factor: 1055.06 },
  eV:   { label: "Electronvolt (eV)",   factor: 1.602e-19 },
};

const pressureUnits: Record<string, UnitDef> = {
  Pa:   { label: "Pascal (Pa)",         factor: 1 },
  kPa:  { label: "Kilopascal (kPa)",    factor: 1000 },
  MPa:  { label: "Megapascal (MPa)",    factor: 1e6 },
  bar:  { label: "Bar",                 factor: 100000 },
  mbar: { label: "Millibar (mbar)",     factor: 100 },
  psi:  { label: "PSI (lbf/in²)",       factor: 6894.76 },
  atm:  { label: "Atmosphere (atm)",    factor: 101325 },
  mmHg: { label: "mmHg (Torr)",         factor: 133.322 },
  inHg: { label: "Inch Hg (inHg)",      factor: 3386.39 },
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export function LengthConverter() {
  return <UnitConverter title="Length Converter" desc="Convert between length and distance units" units={lengthUnits} defaultUnit="m" />;
}
export function WeightConverter() {
  return <UnitConverter title="Weight & Mass Converter" desc="Convert between weight and mass units" units={weightUnits} defaultUnit="kg" />;
}
export function SpeedConverter() {
  return <UnitConverter title="Speed Converter" desc="Convert between speed units" units={speedUnits} defaultUnit="km/h" />;
}
export function AreaConverter() {
  return <UnitConverter title="Area Converter" desc="Convert between area units" units={areaUnits} defaultUnit="m²" />;
}
export function VolumeConverter() {
  return <UnitConverter title="Volume Converter" desc="Convert between volume and capacity units" units={volumeUnits} defaultUnit="L" />;
}
export function DataStorageConverter() {
  return <UnitConverter title="Data Storage Converter" desc="Convert between digital data units (bits, bytes, KB, GB…)" units={dataUnits} defaultUnit="GB" />;
}
export function EnergyConverter() {
  return <UnitConverter title="Energy Converter" desc="Convert between energy units (joules, calories, kWh…)" units={energyUnits} defaultUnit="kJ" />;
}
export function PressureConverter() {
  return <UnitConverter title="Pressure Converter" desc="Convert between pressure units (Pa, PSI, bar, atm…)" units={pressureUnits} defaultUnit="bar" />;
}

// ─── Temperature (non-linear) ────────────────────────────────────────────────

function convertTemp(val: number, from: string, to: string): number {
  let celsius: number;
  if (from === "C") celsius = val;
  else if (from === "F") celsius = (val - 32) * (5 / 9);
  else celsius = val - 273.15;
  if (to === "C") return celsius;
  if (to === "F") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

const tempUnits = ["C", "F", "K"];
const tempLabels: Record<string, string> = { C: "Celsius (°C)", F: "Fahrenheit (°F)", K: "Kelvin (K)" };

export function TemperatureConverter() {
  const [value, setValue] = useState("100");
  const [fromUnit, setFromUnit] = useState("C");
  const { copiedKey, copy } = useCopy();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Temperature Converter</CardTitle>
          <CardDescription>Convert between Celsius, Fahrenheit, and Kelvin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Value</Label>
              <Input type="number" value={value} onChange={e => setValue(e.target.value)} className="font-mono text-lg h-11" data-testid="input-value" />
            </div>
            <div className="w-52 space-y-1.5">
              <Label>From unit</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tempUnits.map(u => <SelectItem key={u} value={u}>{tempLabels[u]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 text-muted-foreground font-mono text-xs">
                  <th className="text-left px-4 py-2.5 w-1/3">Unit</th>
                  <th className="text-left px-4 py-2.5">Value</th>
                  <th className="px-2 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {tempUnits.map((u, i) => {
                  const num = parseFloat(value);
                  const converted = isNaN(num) ? "—" : fmt(convertTemp(num, fromUnit, u));
                  const isSource = u === fromUnit;
                  return (
                    <tr key={u} className={`border-t border-border/50 ${isSource ? "bg-primary/5" : i % 2 === 0 ? "" : "bg-muted/20"}`}>
                      <td className={`px-4 py-2.5 font-medium ${isSource ? "text-primary" : ""}`}>{tempLabels[u]}</td>
                      <td className="px-4 py-2.5 font-mono">{isSource ? (value || "—") : converted}</td>
                      <td className="px-2 py-2.5 text-right">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copy(isSource ? value : converted, u)}>
                          {copiedKey === u ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      </CardContent>
    </Card>
  );
}
