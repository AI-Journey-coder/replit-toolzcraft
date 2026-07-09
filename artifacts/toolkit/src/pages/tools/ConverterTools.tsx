import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

type UnitDef = { name: string; factor: number; offset?: number };
type UnitMap = Record<string, UnitDef>;

const lengthUnits: UnitMap = {
  mm: { name: "Millimeter (mm)", factor: 0.001 },
  cm: { name: "Centimeter (cm)", factor: 0.01 },
  m: { name: "Meter (m)", factor: 1 },
  km: { name: "Kilometer (km)", factor: 1000 },
  in: { name: "Inch (in)", factor: 0.0254 },
  ft: { name: "Foot (ft)", factor: 0.3048 },
  yd: { name: "Yard (yd)", factor: 0.9144 },
  mi: { name: "Mile (mi)", factor: 1609.344 },
};

const weightUnits: UnitMap = {
  mg: { name: "Milligram (mg)", factor: 0.000001 },
  g: { name: "Gram (g)", factor: 0.001 },
  kg: { name: "Kilogram (kg)", factor: 1 },
  t: { name: "Metric Ton (t)", factor: 1000 },
  oz: { name: "Ounce (oz)", factor: 0.0283495 },
  lb: { name: "Pound (lb)", factor: 0.453592 },
  stone: { name: "Stone", factor: 6.35029 },
};

const speedUnits: UnitMap = {
  "m/s": { name: "Meters/second (m/s)", factor: 1 },
  "km/h": { name: "Kilometers/hour (km/h)", factor: 1 / 3.6 },
  mph: { name: "Miles/hour (mph)", factor: 0.44704 },
  knots: { name: "Knots", factor: 0.514444 },
};

const areaUnits: UnitMap = {
  "mm²": { name: "Square Millimeter (mm²)", factor: 0.000001 },
  "cm²": { name: "Square Centimeter (cm²)", factor: 0.0001 },
  "m²": { name: "Square Meter (m²)", factor: 1 },
  "km²": { name: "Square Kilometer (km²)", factor: 1e6 },
  "in²": { name: "Square Inch (in²)", factor: 0.00064516 },
  "ft²": { name: "Square Foot (ft²)", factor: 0.092903 },
  acre: { name: "Acre", factor: 4046.86 },
  hectare: { name: "Hectare (ha)", factor: 10000 },
};

const volumeUnits: UnitMap = {
  ml: { name: "Milliliter (ml)", factor: 0.001 },
  L: { name: "Liter (L)", factor: 1 },
  "m³": { name: "Cubic Meter (m³)", factor: 1000 },
  tsp: { name: "Teaspoon (tsp)", factor: 0.00492892 },
  tbsp: { name: "Tablespoon (tbsp)", factor: 0.0147868 },
  "fl oz": { name: "Fluid Ounce (fl oz)", factor: 0.0295735 },
  cup: { name: "Cup", factor: 0.236588 },
  pt: { name: "Pint (pt)", factor: 0.473176 },
  qt: { name: "Quart (qt)", factor: 0.946353 },
  gal: { name: "Gallon (gal)", factor: 3.78541 },
};

// Temperature requires special handling (offset)
function convertTemp(val: number, from: string, to: string): number {
  // Convert to Celsius first
  let celsius: number;
  if (from === "C") celsius = val;
  else if (from === "F") celsius = (val - 32) * (5 / 9);
  else celsius = val - 273.15; // Kelvin

  if (to === "C") return celsius;
  if (to === "F") return celsius * (9 / 5) + 32;
  return celsius + 273.15; // Kelvin
}

function GenericConverter({ title, desc, units, defaultFrom, defaultTo }: {
  title: string; desc: string; units: UnitMap; defaultFrom: string; defaultTo: string;
}) {
  const [valFrom, setValFrom] = useState("1");
  const [valTo, setValTo] = useState("");
  const [unitFrom, setUnitFrom] = useState(defaultFrom);
  const [unitTo, setUnitTo] = useState(defaultTo);

  const convert = (val: string, from: string, to: string) => {
    if (!val || isNaN(Number(val))) return "";
    const n = Number(val);
    const baseVal = n * units[from].factor;
    const res = baseVal / units[to].factor;
    return parseFloat(res.toFixed(8)).toString();
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValFrom(e.target.value);
    setValTo(convert(e.target.value, unitFrom, unitTo));
  };
  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValTo(e.target.value);
    setValFrom(convert(e.target.value, unitTo, unitFrom));
  };
  const updateFromUnit = (v: string) => { setUnitFrom(v); setValTo(convert(valFrom, v, unitTo)); };
  const updateToUnit = (v: string) => { setUnitTo(v); setValTo(convert(valFrom, unitFrom, v)); };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 space-y-2 w-full">
            <Label>From</Label>
            <div className="flex gap-2">
              <Input type="number" value={valFrom} onChange={handleFromChange} data-testid="input-from" />
              <Select value={unitFrom} onValueChange={updateFromUnit}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(units).map(([key, u]) => (
                    <SelectItem key={key} value={key}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ArrowRightLeft className="h-6 w-6 text-muted-foreground mt-6 shrink-0 hidden md:block" />
          <div className="flex-1 space-y-2 w-full">
            <Label>To</Label>
            <div className="flex gap-2">
              <Input type="number" value={valTo} onChange={handleToChange} data-testid="input-to" />
              <Select value={unitTo} onValueChange={updateToUnit}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(units).map(([key, u]) => (
                    <SelectItem key={key} value={key}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LengthConverter() {
  return <GenericConverter title="Length Converter" desc="Convert between length/distance units" units={lengthUnits} defaultFrom="m" defaultTo="ft" />;
}

export function WeightConverter() {
  return <GenericConverter title="Weight Converter" desc="Convert between mass/weight units" units={weightUnits} defaultFrom="kg" defaultTo="lb" />;
}

export function SpeedConverter() {
  return <GenericConverter title="Speed Converter" desc="Convert between speed units" units={speedUnits} defaultFrom="km/h" defaultTo="mph" />;
}

export function AreaConverter() {
  return <GenericConverter title="Area Converter" desc="Convert between area units" units={areaUnits} defaultFrom="m²" defaultTo="ft²" />;
}

export function VolumeConverter() {
  return <GenericConverter title="Volume Converter" desc="Convert between volume units" units={volumeUnits} defaultFrom="L" defaultTo="gal" />;
}

// ─── Temperature Converter (special: non-linear) ──────────────────────────

export function TemperatureConverter() {
  const [valC, setValC] = useState("100");
  const [valF, setValF] = useState("");
  const [valK, setValK] = useState("");

  const handleC = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValC(v);
    const c = Number(v);
    if (!isNaN(c)) {
      setValF(parseFloat(convertTemp(c, "C", "F").toFixed(6)).toString());
      setValK(parseFloat(convertTemp(c, "C", "K").toFixed(6)).toString());
    }
  };
  const handleF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValF(v);
    const f = Number(v);
    if (!isNaN(f)) {
      setValC(parseFloat(convertTemp(f, "F", "C").toFixed(6)).toString());
      setValK(parseFloat(convertTemp(f, "F", "K").toFixed(6)).toString());
    }
  };
  const handleK = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValK(v);
    const k = Number(v);
    if (!isNaN(k)) {
      setValC(parseFloat(convertTemp(k, "K", "C").toFixed(6)).toString());
      setValF(parseFloat(convertTemp(k, "K", "F").toFixed(6)).toString());
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Temperature Converter</CardTitle><CardDescription>Convert between Celsius, Fahrenheit, and Kelvin — edit any field</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        {[
          { label: "Celsius (°C)", value: valC, handler: handleC, testid: "input-celsius" },
          { label: "Fahrenheit (°F)", value: valF, handler: handleF, testid: "input-fahrenheit" },
          { label: "Kelvin (K)", value: valK, handler: handleK, testid: "input-kelvin" },
        ].map(({ label, value, handler, testid }) => (
          <div key={label} className="space-y-1">
            <Label>{label}</Label>
            <Input type="number" value={value} onChange={handler} data-testid={testid} className="font-mono text-lg" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
