import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

function copyToClipboard(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

// ─── Text to Handwriting ──────────────────────────────────────────────────────
const HANDWRITING_FONTS = [
  { name: "Cursive", css: "cursive" },
  { name: "Serif Italic", css: "Georgia, serif" },
  { name: "Script", css: "'Brush Script MT', cursive" },
  { name: "Comic", css: "'Comic Sans MS', cursive" },
  { name: "Monospace", css: "'Courier New', monospace" },
];

export function TextToHandwriting() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.\nThis is a sample of handwriting simulation.");
  const [font, setFont] = useState("cursive");
  const [size, setSize] = useState(24);
  const [color, setColor] = useState("#1a1a2e");
  const [bgColor, setBgColor] = useState("#fffef0");
  const [lineHeight, setLineHeight] = useState(1.8);
  const [rotation, setRotation] = useState(0);
  const [inkNoise, setInkNoise] = useState(true);

  const lines = text.split("\n");

  const downloadAsSvg = () => {
    const lineH = size * lineHeight;
    const padding = 40;
    const svgHeight = lines.length * lineH + padding * 2;
    const svgWidth = 800;
    const svgLines = lines.map((line, i) => {
      const y = padding + (i + 1) * lineH;
      const chars = line.split("").map((char, j) => {
        const noise = inkNoise ? (Math.random() - 0.5) * 2 : 0;
        const rot = rotation + noise;
        return `<text x="${padding + j * (size * 0.6)}" y="${y}" font-family="${font}" font-size="${size}" fill="${color}" transform="rotate(${rot}, ${padding + j * size * 0.6}, ${y})">${char.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`;
      }).join("");
      return chars;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}"><rect width="${svgWidth}" height="${svgHeight}" fill="${bgColor}"/>${svgLines}</svg>`;
    const a = document.createElement("a");
    a.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    a.download = "handwriting.svg";
    a.click();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Text to Handwriting</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Text</Label>
          <Textarea value={text} onChange={e => setText(e.target.value)} className="h-24 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Font Style</Label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {HANDWRITING_FONTS.map(f => <SelectItem key={f.css} value={f.css}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Font Size: {size}px</Label>
            <Slider min={12} max={48} value={[size]} onValueChange={([v]) => setSize(v)} />
          </div>
          <div className="flex items-center gap-2">
            <Label>Ink Color</Label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Label>Paper Color</Label>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 w-16 cursor-pointer rounded" />
          </div>
          <div>
            <Label>Line Height: {lineHeight}</Label>
            <Slider min={1} max={3} step={0.1} value={[lineHeight]} onValueChange={([v]) => setLineHeight(v)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="inkNoise" checked={inkNoise} onChange={e => setInkNoise(e.target.checked)} />
            <Label htmlFor="inkNoise">Natural variation</Label>
          </div>
        </div>
        <div className="border rounded p-6 overflow-auto" style={{ background: bgColor, minHeight: 100 }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              fontFamily: font, fontSize: `${size}px`, color, lineHeight,
              transform: inkNoise ? `rotate(${(Math.random() - 0.5) * 0.5}deg)` : undefined,
              marginBottom: size * 0.3,
            }}>
              {line || " "}
            </div>
          ))}
        </div>
        <Button onClick={downloadAsSvg}>Download as SVG</Button>
      </CardContent>
    </Card>
  );
}

// ─── Prompt to JSON Converter ─────────────────────────────────────────────────
function inferSchema(text: string): Record<string, unknown> {
  const schema: Record<string, unknown> = {};
  const fieldPatterns = [
    { regex: /\b(name|title|label|heading)\b/i, key: "name", type: "string", example: "John Doe" },
    { regex: /\b(email|e-mail)\b/i, key: "email", type: "string", example: "john@example.com" },
    { regex: /\b(phone|mobile|tel)\b/i, key: "phone", type: "string", example: "+1-555-0100" },
    { regex: /\b(age)\b/i, key: "age", type: "integer", example: 25 },
    { regex: /\b(date|birthday|dob|created_at)\b/i, key: "date", type: "string", example: "2024-01-15" },
    { regex: /\b(address|location|city|country)\b/i, key: "address", type: "string", example: "123 Main St" },
    { regex: /\b(price|cost|amount|salary)\b/i, key: "price", type: "number", example: 99.99 },
    { regex: /\b(description|bio|notes|content|body)\b/i, key: "description", type: "string", example: "Some description here" },
    { regex: /\b(id|uuid|identifier)\b/i, key: "id", type: "string", example: "abc-123" },
    { regex: /\b(status|state)\b/i, key: "status", type: "string", example: "active" },
    { regex: /\b(tags|categories|labels)\b/i, key: "tags", type: "array", example: ["tag1", "tag2"] },
    { regex: /\b(active|enabled|visible|published)\b/i, key: "active", type: "boolean", example: true },
    { regex: /\b(count|quantity|total|number)\b/i, key: "count", type: "integer", example: 10 },
    { regex: /\b(url|link|href|website)\b/i, key: "url", type: "string", example: "https://example.com" },
    { regex: /\b(image|photo|avatar|thumbnail)\b/i, key: "imageUrl", type: "string", example: "https://example.com/image.jpg" },
    { regex: /\b(user|author|owner|created_by)\b/i, key: "userId", type: "string", example: "user_123" },
  ];
  for (const p of fieldPatterns) {
    if (p.regex.test(text)) schema[p.key] = p.example;
  }
  return schema;
}

export function PromptToJson() {
  const [prompt, setPrompt] = useState("Create a user profile with name, email, age, bio, profile image, active status, and join date");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"schema" | "example" | "typescript">("example");

  const convert = () => {
    const schema = inferSchema(prompt);
    if (Object.keys(schema).length === 0) {
      schema["field1"] = "value1";
      schema["field2"] = 42;
    }

    if (mode === "example") {
      setOutput(JSON.stringify(schema, null, 2));
    } else if (mode === "schema") {
      const jsonSchema: Record<string, unknown> = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        type: "object",
        required: Object.keys(schema),
        properties: Object.fromEntries(Object.entries(schema).map(([k, v]) => [k, {
          type: Array.isArray(v) ? "array" : typeof v,
          ...(Array.isArray(v) ? { items: { type: "string" } } : {}),
          description: `The ${k} field`,
        }])),
      };
      setOutput(JSON.stringify(jsonSchema, null, 2));
    } else {
      const fields = Object.entries(schema).map(([k, v]) => {
        const t = Array.isArray(v) ? "string[]" : typeof v === "number" ? "number" : typeof v === "boolean" ? "boolean" : "string";
        return `  ${k}: ${t};`;
      }).join("\n");
      setOutput(`interface Generated {\n${fields}\n}`);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Prompt to JSON Converter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Describe your data structure in natural language</Label>
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="h-24 text-sm" placeholder="e.g., A product with name, price, description, image, and category tags" />
        </div>
        <div className="flex gap-2 items-center">
          <Select value={mode} onValueChange={v => setMode(v as typeof mode)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="example">JSON Example</SelectItem>
              <SelectItem value="schema">JSON Schema</SelectItem>
              <SelectItem value="typescript">TypeScript Interface</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={convert}>Generate</Button>
        </div>
        {output && (
          <div className="relative">
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{output}</pre>
            <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Markdown README Guide ────────────────────────────────────────────────────
const README_TEMPLATES: Record<string, string> = {
  "Open Source Library": `# 📦 Project Name

> One-line description of what your project does.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://badge.fury.io/js/package-name.svg)](https://www.npmjs.com/package/package-name)

## Features

- ✅ Feature one
- ✅ Feature two
- ✅ Feature three

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Usage

\`\`\`javascript
import { thing } from 'package-name';

thing.doSomething();
\`\`\`

## API Reference

### \`doSomething(options)\`

| Parameter | Type | Description |
| --- | --- | --- |
| options | object | Configuration options |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

MIT © [Your Name](https://github.com/yourusername)`,

  "Web App": `# 🚀 App Name

A brief description of what your web app does.

## Live Demo

[https://your-app.vercel.app](https://your-app.vercel.app)

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Deployment:** Vercel / Railway

## Getting Started

\`\`\`bash
# Clone the repository
git clone https://github.com/username/repo.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

## Environment Variables

\`\`\`env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
\`\`\`

## Screenshots

![Screenshot](screenshot.png)

## License

MIT`,

  "CLI Tool": `# 🛠️ tool-name

A command-line tool that does X, Y, Z.

## Installation

\`\`\`bash
npm install -g tool-name
\`\`\`

## Usage

\`\`\`
tool-name [options] <input>

Options:
  -h, --help      Show help
  -v, --version   Show version
  -o, --output    Output file path
\`\`\`

## Examples

\`\`\`bash
# Basic usage
tool-name input.txt

# With output file
tool-name input.txt -o output.txt
\`\`\`

## License

MIT`,

  "Minimal": `# Project Name

Description.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## License

MIT`,
};

export function MarkdownReadmeGuide() {
  const [template, setTemplate] = useState("Open Source Library");
  const [output, setOutput] = useState(README_TEMPLATES["Open Source Library"]);

  return (
    <Card>
      <CardHeader><CardTitle>Markdown README Guide</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {Object.keys(README_TEMPLATES).map(t => (
            <Button key={t} size="sm" variant={template === t ? "default" : "outline"} onClick={() => { setTemplate(t); setOutput(README_TEMPLATES[t]); }}>{t}</Button>
          ))}
        </div>
        <div className="relative">
          <Textarea value={output} onChange={e => setOutput(e.target.value)} className="font-mono text-xs h-96" />
          <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
        </div>
        <div className="text-xs text-muted-foreground">Edit the template to match your project, then copy it into your README.md</div>
      </CardContent>
    </Card>
  );
}

// ─── Punycode Converter ────────────────────────────────────────────────────────
function toAscii(domain: string): string {
  try {
    const url = new URL("https://" + domain);
    return url.hostname;
  } catch {
    return domain;
  }
}

function fromPunycode(input: string): string {
  try {
    const labels = input.split(".");
    return labels.map(label => {
      if (!label.startsWith("xn--")) return label;
      const decoded = decodeURIComponent(escape(atob(label.slice(4))));
      return decoded;
    }).join(".");
  } catch {
    return input;
  }
}

export function PunycodeTool() {
  const [input, setInput] = useState("münchen.de");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const convert = () => {
    if (mode === "encode") {
      setOutput(toAscii(input));
    } else {
      setOutput(fromPunycode(input));
    }
  };

  const examples = {
    encode: ["münchen.de", "中文.com", "日本語.jp", "ελληνικά.gr"],
    decode: ["xn--mnchen-3ya.de", "xn--fiq228c.com", "xn--wgbh1c.eg"],
  };

  return (
    <Card>
      <CardHeader><CardTitle>Punycode Converter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={mode === "encode" ? "default" : "outline"} onClick={() => setMode("encode")}>Unicode → Punycode</Button>
          <Button size="sm" variant={mode === "decode" ? "default" : "outline"} onClick={() => setMode("decode")}>Punycode → Unicode</Button>
        </div>
        <div>
          <Label>Input Domain</Label>
          <div className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} className="font-mono" />
            <Button onClick={convert}>Convert</Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground">Examples:</span>
          {examples[mode].map(ex => (
            <button key={ex} className="px-2 py-1 rounded border hover:bg-muted font-mono" onClick={() => setInput(ex)}>{ex}</button>
          ))}
        </div>
        {output && (
          <div className="relative">
            <Label>Result</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded">
              <code className="font-mono flex-1">{output}</code>
              <Button size="sm" onClick={() => copyToClipboard(output)}>Copy</Button>
            </div>
          </div>
        )}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
          <strong>Punycode</strong> is used in Internationalized Domain Names (IDN). Unicode domains like <code>münchen.de</code> are stored in DNS as ASCII-compatible encoding: <code>xn--mnchen-3ya.de</code>
        </div>
      </CardContent>
    </Card>
  );
}
