import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCheck, Copy } from "lucide-react";

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

// ─── Word Counter ─────────────────────────────────────────────────────────

export function WordCounter() {
  const [text, setText] = useState("");

  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.trim() === "" ? 0 : text.split(/\n+/).filter(Boolean).length;
  const lines = text.trim() === "" ? 0 : text.split(/\n/).length;
  const readingTime = Math.ceil(words / 200) || 0;

  const stats = [
    { label: "Words", value: words },
    { label: "Characters", value: chars },
    { label: "Chars (no spaces)", value: charsNoSpaces },
    { label: "Sentences", value: sentences },
    { label: "Paragraphs", value: paragraphs },
    { label: "Lines", value: lines },
    { label: "Reading time", value: `~${readingTime} min`, wide: true, highlight: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Word & Character Counter</CardTitle>
          <CardDescription>Live statistics as you type</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Type or paste your text here..."
            className="min-h-[320px] resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-testid="textarea-input"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, wide, highlight }) => (
              <div key={label} className={`p-4 rounded-lg flex flex-col items-center justify-center text-center ${wide ? "col-span-2" : ""} ${highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/50"}`}>
                <span className={`text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono mt-1">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Case Converter ────────────────────────────────────────────────────────

const toCamel = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
const toPascal = (s: string) => { const c = toCamel(s); return c.charAt(0).toUpperCase() + c.slice(1); };
const toSnake = (s: string) => s.replace(/[\s-]+/g, "_").replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
const toKebab = (s: string) => s.replace(/[\s_]+/g, "-").replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
const toTitle = (s: string) => s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

export function CaseConverter() {
  const [input, setInput] = useState("Hello World Example Text");
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const cases = [
    { label: "UPPER CASE", result: input.toUpperCase() },
    { label: "lower case", result: input.toLowerCase() },
    { label: "Title Case", result: toTitle(input) },
    { label: "camelCase", result: toCamel(input) },
    { label: "PascalCase", result: toPascal(input) },
    { label: "snake_case", result: toSnake(input) },
    { label: "kebab-case", result: toKebab(input) },
    { label: "Sentence case", result: input.charAt(0).toUpperCase() + input.slice(1).toLowerCase() },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Case Converter</CardTitle>
          <CardDescription>Transform text between different cases instantly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Input Text</Label>
            <Textarea className="min-h-[100px]" value={input} onChange={e => setInput(e.target.value)} data-testid="textarea-input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cases.map(({ label, result }) => (
              <button
                key={label}
                onClick={() => copyText(result, label)}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group border border-transparent hover:border-border"
                data-testid={`btn-case-${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-0.5">{label}</div>
                  <div className="font-mono text-sm truncate max-w-[180px]">{result}</div>
                </div>
                {copied === label
                  ? <CheckCheck className="h-4 w-4 shrink-0 text-green-500" />
                  : <Copy className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                }
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Lorem Ipsum Generator ────────────────────────────────────────────────

const LOREM_SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
  "Nullam varius, turpis molestie dictum semper, enim lorem egestas quam.",
  "Aliquam erat volutpat. Integer in magna a nibh fermentum pretium.",
  "Praesent porttitor, nulla vitae posuere iaculis, arcu nisl dignissim dolor.",
  "Fusce fermentum. Nullam varius nisi in sapien tempus aliquam.",
  "Maecenas nisi dolor, sodales at arcu vitae, varius elementum enim.",
  "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
];

export function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState("paragraphs");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopy(output);

  const generate = () => {
    if (unit === "paragraphs") {
      const paras = Array.from({ length: count }, (_, i) => {
        const start = (i * 4) % LOREM_SENTENCES.length;
        return LOREM_SENTENCES.slice(start, start + 4).join(" ");
      });
      setOutput(paras.join("\n\n"));
    } else if (unit === "sentences") {
      const sents = Array.from({ length: count }, (_, i) => LOREM_SENTENCES[i % LOREM_SENTENCES.length]);
      setOutput(sents.join(" "));
    } else {
      const words = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(" ");
      setOutput(Array.from({ length: count }, (_, i) => words[i % words.length]).join(" "));
    }
  };

  useEffect(() => { generate(); }, [count, unit]);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Lorem Ipsum Generator</CardTitle>
        <CardDescription>Generate placeholder text for your designs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="space-y-2">
            <Label>Count</Label>
            <Input type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} className="w-24" data-testid="input-count" />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-[150px]" data-testid="select-unit"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
                <SelectItem value="sentences">Sentences</SelectItem>
                <SelectItem value="words">Words</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} data-testid="btn-generate">Generate</Button>
          {output && (
            <Button size="sm" variant="outline" onClick={copy} data-testid="btn-copy">
              {copied ? <CheckCheck className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>
        {output && (
          <Textarea readOnly className="min-h-[280px] text-sm leading-relaxed" value={output} data-testid="textarea-output" />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Markdown Preview ─────────────────────────────────────────────────────

const SAMPLE_MD = `# Markdown Preview

Write **bold**, *italic*, or \`code\` inline.

## Lists

- Item one
- Item two
  - Nested item

## Code Block

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> Blockquotes look great too.

[Link example](https://example.com)
`;

export function MarkdownPreview() {
  const [md, setMd] = useState(SAMPLE_MD);
  const [html, setHtml] = useState("");

  useEffect(() => {
    let active = true;
    import("marked").then(({ marked }) => {
      const result = marked.parse(md) as string;
      if (active) setHtml(result);
    });
    return () => { active = false; };
  }, [md]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Markdown Editor</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-3">
          <Textarea
            className="font-mono text-sm resize-none h-full border-0 focus-visible:ring-0 p-0"
            value={md}
            onChange={e => setMd(e.target.value)}
            data-testid="textarea-markdown"
          />
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
            data-testid="div-preview"
          />
        </CardContent>
      </Card>
    </div>
  );
}
