import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function copyToClipboard(text: string) { navigator.clipboard.writeText(text).catch(() => {}); }

// ─── Unicode Table Browser ────────────────────────────────────────────────────
const UNICODE_BLOCKS: Array<{ name: string; start: number; end: number }> = [
  { name: "Basic Latin", start: 0x0000, end: 0x007F },
  { name: "Latin-1 Supplement", start: 0x0080, end: 0x00FF },
  { name: "Latin Extended-A", start: 0x0100, end: 0x017F },
  { name: "Greek and Coptic", start: 0x0370, end: 0x03FF },
  { name: "Cyrillic", start: 0x0400, end: 0x04FF },
  { name: "Hebrew", start: 0x0590, end: 0x05FF },
  { name: "Arabic", start: 0x0600, end: 0x06FF },
  { name: "Currency Symbols", start: 0x20A0, end: 0x20CF },
  { name: "Letterlike Symbols", start: 0x2100, end: 0x214F },
  { name: "Number Forms", start: 0x2150, end: 0x218F },
  { name: "Arrows", start: 0x2190, end: 0x21FF },
  { name: "Mathematical Operators", start: 0x2200, end: 0x22FF },
  { name: "Box Drawing", start: 0x2500, end: 0x257F },
  { name: "Block Elements", start: 0x2580, end: 0x259F },
  { name: "Geometric Shapes", start: 0x25A0, end: 0x25FF },
  { name: "Miscellaneous Symbols", start: 0x2600, end: 0x26FF },
  { name: "Dingbats", start: 0x2700, end: 0x27BF },
  { name: "Emoticons", start: 0x1F600, end: 0x1F64F },
  { name: "Misc Symbols & Pictographs", start: 0x1F300, end: 0x1F5FF },
  { name: "Transport and Map", start: 0x1F680, end: 0x1F6FF },
];

export function UnicodeTableBrowser() {
  const [block, setBlock] = useState("Basic Latin");
  const [selected, setSelected] = useState<{ char: string; code: number } | null>(null);
  const currentBlock = UNICODE_BLOCKS.find(b => b.name === block)!;

  const chars = useMemo(() => {
    const arr = [];
    for (let i = currentBlock.start; i <= Math.min(currentBlock.end, currentBlock.start + 511); i++) {
      try { const c = String.fromCodePoint(i); arr.push({ char: c, code: i }); } catch { }
    }
    return arr;
  }, [currentBlock]);

  return (
    <Card>
      <CardHeader><CardTitle>Unicode Table Browser</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Unicode Block</Label>
          <Select value={block} onValueChange={setBlock}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNICODE_BLOCKS.map(b => <SelectItem key={b.name} value={b.name}>{b.name} (U+{b.start.toString(16).toUpperCase().padStart(4, "0")}–U+{b.end.toString(16).toUpperCase().padStart(4, "0")})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {selected && (
          <div className="flex items-center gap-4 p-3 rounded border bg-muted">
            <div className="text-5xl">{selected.char}</div>
            <div>
              <div className="font-mono">U+{selected.code.toString(16).toUpperCase().padStart(4, "0")}</div>
              <div className="text-sm text-muted-foreground">Decimal: {selected.code}</div>
              <div className="text-sm text-muted-foreground">HTML: &amp;#{selected.code};</div>
            </div>
            <Button size="sm" onClick={() => copyToClipboard(selected.char)}>Copy Char</Button>
          </div>
        )}
        <div className="grid grid-cols-16 gap-0.5 max-h-72 overflow-auto" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
          {chars.map(({ char, code }) => (
            <button key={code} className="h-8 w-full flex items-center justify-center rounded text-sm hover:bg-primary/20 border border-transparent hover:border-primary/30 transition-colors" title={`U+${code.toString(16).toUpperCase().padStart(4, "0")}`} onClick={() => setSelected({ char, code })}>
              {char}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">{chars.length} characters shown (click to inspect)</div>
      </CardContent>
    </Card>
  );
}

// ─── Unicode Character Lookup ─────────────────────────────────────────────────
export function UnicodeCharLookup() {
  const [query, setQuery] = useState("€");
  const [results, setResults] = useState<Array<{ char: string; code: number; name: string }>>([]);

  const lookup = () => {
    const found: Array<{ char: string; code: number; name: string }> = [];
    const q = query.trim();
    if (!q) return;
    if (q.startsWith("U+") || q.startsWith("u+")) {
      const code = parseInt(q.slice(2), 16);
      if (!isNaN(code)) { try { found.push({ char: String.fromCodePoint(code), code, name: `U+${code.toString(16).toUpperCase().padStart(4, "0")}` }); } catch { } }
    } else if (/^\d+$/.test(q)) {
      const code = parseInt(q);
      try { found.push({ char: String.fromCodePoint(code), code, name: `U+${code.toString(16).toUpperCase().padStart(4, "0")}` }); } catch { }
    } else {
      for (const char of q) {
        const code = char.codePointAt(0)!;
        found.push({ char, code, name: `U+${code.toString(16).toUpperCase().padStart(4, "0")}` });
      }
    }
    setResults(found);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Unicode Character Lookup</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Enter character(s), code point (U+20AC), or decimal (8364)</Label>
          <div className="flex gap-2">
            <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && lookup()} className="font-mono" />
            <Button onClick={lookup}>Lookup</Button>
          </div>
        </div>
        {results.map(({ char, code, name }) => (
          <div key={code} className="grid grid-cols-2 gap-2 p-3 rounded border">
            <div className="text-5xl font-mono col-span-2 text-center py-2">{char}</div>
            {[
              ["Character", char],
              ["Code Point", name],
              ["Decimal", String(code)],
              ["Hex", "0x" + code.toString(16).toUpperCase()],
              ["HTML Entity (dec)", `&#${code};`],
              ["HTML Entity (hex)", `&#x${code.toString(16).toUpperCase()};`],
              ["CSS Content", `\\${code.toString(16).toUpperCase()}`],
              ["UTF-8 Bytes", Array.from(new TextEncoder().encode(char)).map(b => "0x" + b.toString(16).toUpperCase().padStart(2, "0")).join(" ")],
              ["JSON Escape", JSON.stringify(char)],
              ["URL Encode", encodeURIComponent(char)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between p-1.5 bg-muted rounded text-xs">
                <span className="text-muted-foreground">{label}</span>
                <div className="flex items-center gap-1">
                  <code className="font-mono">{value}</code>
                  <button className="text-blue-400 hover:underline" onClick={() => copyToClipboard(value)}>copy</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Invisible Character Detector ────────────────────────────────────────────
const INVISIBLE_CHARS: Record<number, string> = {
  0x00: "NULL",
  0x08: "BACKSPACE",
  0x09: "TAB",
  0x0A: "LINE FEED",
  0x0B: "VERTICAL TAB",
  0x0C: "FORM FEED",
  0x0D: "CARRIAGE RETURN",
  0x1B: "ESCAPE",
  0xA0: "NO-BREAK SPACE",
  0xAD: "SOFT HYPHEN",
  0x200B: "ZERO WIDTH SPACE",
  0x200C: "ZERO WIDTH NON-JOINER",
  0x200D: "ZERO WIDTH JOINER",
  0x200E: "LEFT-TO-RIGHT MARK",
  0x200F: "RIGHT-TO-LEFT MARK",
  0x2028: "LINE SEPARATOR",
  0x2029: "PARAGRAPH SEPARATOR",
  0x2060: "WORD JOINER",
  0x2061: "FUNCTION APPLICATION",
  0x2062: "INVISIBLE TIMES",
  0x2063: "INVISIBLE SEPARATOR",
  0x2064: "INVISIBLE PLUS",
  0xFEFF: "ZERO WIDTH NO-BREAK SPACE (BOM)",
  0xFFFE: "NON-CHARACTER",
  0xFFFF: "NON-CHARACTER",
};

export function InvisibleCharDetector() {
  const [input, setInput] = useState("Hello\u200BWorld\uFEFF!\u200C\u200D");
  const [found, setFound] = useState<Array<{ char: string; code: number; name: string; pos: number }>>([]);

  const detect = () => {
    const results: Array<{ char: string; code: number; name: string; pos: number }> = [];
    let pos = 0;
    for (const char of input) {
      const code = char.codePointAt(0)!;
      if (code in INVISIBLE_CHARS && code !== 0x09 && code !== 0x0A) {
        results.push({ char, code, name: INVISIBLE_CHARS[code], pos });
      }
      pos += char.length;
    }
    setFound(results);
  };

  const clean = input.replace(/[\u200B-\u200F\u2028\u2029\u2060-\u2064\uFEFF\uFFFE\uFFFF\u00AD]/g, "");

  return (
    <Card>
      <CardHeader><CardTitle>Invisible Character Detector</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Input Text (paste text that may contain invisible characters)</Label>
          <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-sm h-28" />
        </div>
        <div className="flex gap-2">
          <Button onClick={detect}>Detect Invisible Chars</Button>
          <Button variant="outline" onClick={() => copyToClipboard(clean)}>Copy Cleaned Text</Button>
        </div>
        {found.length === 0 ? (
          <div className="text-sm text-green-400 p-2 rounded bg-green-500/10">✓ No invisible characters detected (run detection first)</div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-medium">{found.length} invisible character(s) found:</div>
            {found.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                <Badge variant="outline">pos {f.pos}</Badge>
                <code className="text-xs">U+{f.code.toString(16).toUpperCase().padStart(4, "0")}</code>
                <span className="text-sm">{f.name}</span>
              </div>
            ))}
          </div>
        )}
        <div>
          <Label>Reference — Common Invisible Characters</Label>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(INVISIBLE_CHARS).slice(0, 12).map(([code, name]) => (
              <div key={code} className="flex gap-2 p-1 rounded">
                <code className="text-muted-foreground">U+{Number(code).toString(16).toUpperCase().padStart(4, "0")}</code>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Developer Cheatsheets ────────────────────────────────────────────────────
const CHEATSHEETS: Record<string, Array<{ section: string; items: Array<{ cmd: string; desc: string }> }>> = {
  Git: [
    { section: "Setup", items: [
      { cmd: "git init", desc: "Initialize a new repo" },
      { cmd: "git clone <url>", desc: "Clone a remote repo" },
      { cmd: "git config --global user.name \"Name\"", desc: "Set username" },
    ]},
    { section: "Basic Workflow", items: [
      { cmd: "git status", desc: "Show working tree status" },
      { cmd: "git add .", desc: "Stage all changes" },
      { cmd: "git commit -m \"msg\"", desc: "Commit with message" },
      { cmd: "git push origin main", desc: "Push to remote" },
      { cmd: "git pull", desc: "Fetch and merge from remote" },
    ]},
    { section: "Branching", items: [
      { cmd: "git branch", desc: "List branches" },
      { cmd: "git checkout -b <branch>", desc: "Create and switch branch" },
      { cmd: "git merge <branch>", desc: "Merge branch into current" },
      { cmd: "git rebase <branch>", desc: "Rebase onto branch" },
      { cmd: "git branch -d <branch>", desc: "Delete branch" },
    ]},
    { section: "History", items: [
      { cmd: "git log --oneline", desc: "Compact log" },
      { cmd: "git diff", desc: "Show unstaged changes" },
      { cmd: "git stash", desc: "Stash changes temporarily" },
      { cmd: "git stash pop", desc: "Apply stashed changes" },
      { cmd: "git reset --hard HEAD", desc: "Discard all changes" },
    ]},
  ],
  Linux: [
    { section: "Files", items: [
      { cmd: "ls -la", desc: "List files with details" },
      { cmd: "cd <dir>", desc: "Change directory" },
      { cmd: "pwd", desc: "Print working directory" },
      { cmd: "cp <src> <dst>", desc: "Copy file" },
      { cmd: "mv <src> <dst>", desc: "Move/rename file" },
      { cmd: "rm -rf <dir>", desc: "Remove directory recursively" },
      { cmd: "find . -name \"*.js\"", desc: "Find files by name" },
      { cmd: "grep -r \"text\" .", desc: "Search text in files" },
    ]},
    { section: "Permissions", items: [
      { cmd: "chmod 755 file", desc: "Set permissions" },
      { cmd: "chown user:group file", desc: "Change ownership" },
      { cmd: "sudo command", desc: "Run as superuser" },
    ]},
    { section: "Process", items: [
      { cmd: "ps aux", desc: "List all processes" },
      { cmd: "kill -9 <pid>", desc: "Force kill process" },
      { cmd: "top / htop", desc: "Interactive process monitor" },
      { cmd: "nohup cmd &", desc: "Run in background" },
    ]},
    { section: "Network", items: [
      { cmd: "curl -X POST <url> -d '<body>'", desc: "HTTP POST request" },
      { cmd: "netstat -tlnp", desc: "List open ports" },
      { cmd: "ssh user@host", desc: "SSH connect" },
      { cmd: "scp file user@host:path", desc: "Copy file via SSH" },
    ]},
  ],
  Vim: [
    { section: "Modes", items: [
      { cmd: "i", desc: "Enter Insert mode" },
      { cmd: "Esc", desc: "Return to Normal mode" },
      { cmd: "v", desc: "Visual mode" },
      { cmd: "V", desc: "Visual Line mode" },
      { cmd: ":", desc: "Command mode" },
    ]},
    { section: "Navigation", items: [
      { cmd: "h j k l", desc: "Left / Down / Up / Right" },
      { cmd: "w / b", desc: "Next / previous word" },
      { cmd: "gg / G", desc: "First / last line" },
      { cmd: "0 / $", desc: "Line start / end" },
      { cmd: "Ctrl+f / Ctrl+b", desc: "Page down / up" },
    ]},
    { section: "Editing", items: [
      { cmd: "dd", desc: "Delete line" },
      { cmd: "yy", desc: "Yank (copy) line" },
      { cmd: "p / P", desc: "Paste after / before" },
      { cmd: "u", desc: "Undo" },
      { cmd: "Ctrl+r", desc: "Redo" },
      { cmd: ":%s/old/new/g", desc: "Replace all occurrences" },
    ]},
    { section: "Files", items: [
      { cmd: ":w", desc: "Save file" },
      { cmd: ":q", desc: "Quit" },
      { cmd: ":wq", desc: "Save and quit" },
      { cmd: ":q!", desc: "Quit without saving" },
    ]},
  ],
  Regex: [
    { section: "Anchors", items: [
      { cmd: "^", desc: "Start of string" },
      { cmd: "$", desc: "End of string" },
      { cmd: "\\b", desc: "Word boundary" },
    ]},
    { section: "Quantifiers", items: [
      { cmd: "*", desc: "0 or more" },
      { cmd: "+", desc: "1 or more" },
      { cmd: "?", desc: "0 or 1 (optional)" },
      { cmd: "{n}", desc: "Exactly n times" },
      { cmd: "{n,m}", desc: "Between n and m times" },
    ]},
    { section: "Character Classes", items: [
      { cmd: ".", desc: "Any character (except newline)" },
      { cmd: "\\d", desc: "Digit [0-9]" },
      { cmd: "\\w", desc: "Word character [a-zA-Z0-9_]" },
      { cmd: "\\s", desc: "Whitespace" },
      { cmd: "[abc]", desc: "Character set" },
      { cmd: "[^abc]", desc: "Negated character set" },
    ]},
    { section: "Groups", items: [
      { cmd: "(abc)", desc: "Capturing group" },
      { cmd: "(?:abc)", desc: "Non-capturing group" },
      { cmd: "(?=abc)", desc: "Lookahead" },
      { cmd: "(?!abc)", desc: "Negative lookahead" },
      { cmd: "a|b", desc: "Alternation (a or b)" },
    ]},
  ],
  Docker: [
    { section: "Images", items: [
      { cmd: "docker pull <image>", desc: "Pull image" },
      { cmd: "docker build -t <name> .", desc: "Build image" },
      { cmd: "docker images", desc: "List images" },
      { cmd: "docker rmi <image>", desc: "Remove image" },
    ]},
    { section: "Containers", items: [
      { cmd: "docker run -d -p 80:80 <image>", desc: "Run container in background" },
      { cmd: "docker ps", desc: "List running containers" },
      { cmd: "docker ps -a", desc: "List all containers" },
      { cmd: "docker stop <id>", desc: "Stop container" },
      { cmd: "docker rm <id>", desc: "Remove container" },
      { cmd: "docker exec -it <id> bash", desc: "Open shell in container" },
    ]},
    { section: "Compose", items: [
      { cmd: "docker-compose up -d", desc: "Start services in background" },
      { cmd: "docker-compose down", desc: "Stop and remove services" },
      { cmd: "docker-compose logs -f", desc: "Follow logs" },
    ]},
  ],
};

export function DeveloperCheatsheets() {
  const [tab, setTab] = useState("Git");
  const [search, setSearch] = useState("");
  const sheets = CHEATSHEETS[tab];
  const filtered = sheets.map(section => ({
    ...section,
    items: section.items.filter(item => !search || item.cmd.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())),
  })).filter(s => s.items.length > 0);

  return (
    <Card>
      <CardHeader><CardTitle>Developer Cheatsheets</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            {Object.keys(CHEATSHEETS).map(k => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <Input placeholder="Filter commands..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="space-y-4 max-h-[500px] overflow-auto">
          {filtered.map(section => (
            <div key={section.section}>
              <div className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">{section.section}</div>
              <div className="space-y-1">
                {section.items.map(item => (
                  <div key={item.cmd} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 group">
                    <code className="text-xs bg-muted rounded px-2 py-1 min-w-[200px] font-mono">{item.cmd}</code>
                    <span className="text-sm text-muted-foreground flex-1">{item.desc}</span>
                    <button className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 hover:underline" onClick={() => copyToClipboard(item.cmd)}>copy</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
