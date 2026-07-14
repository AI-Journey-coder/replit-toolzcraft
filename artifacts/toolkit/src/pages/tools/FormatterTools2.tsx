import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import js_beautify from "js-beautify";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function stats(before: string, after: string) {
  return `${before.length} → ${after.length} chars (${before.split("\n").length} → ${after.split("\n").length} lines)`;
}

// ─── JavaScript Formatter ─────────────────────────────────────────────────────
export function JavaScriptFormatter() {
  const [input, setInput] = useState(`function greet(name){if(!name){name="World"}const msg="Hello, "+name+"!";console.log(msg);return msg;}`);
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");

  const format = () => {
    setOutput(js_beautify(input, { indent_size: +indent, e4x: true, jslint_happy: false }));
  };

  return (
    <Card>
      <CardHeader><CardTitle>JavaScript Formatter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <Label>Indent size:</Label>
          <Select value={indent} onValueChange={setIndent}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["2", "4", "8"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={format}>Format</Button>
        </div>
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-32" placeholder="Paste JavaScript here..." />
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{stats(input, output)}</Badge>
              <Button size="sm" onClick={() => copyToClipboard(output)}>Copy</Button>
            </div>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{output}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── TypeScript Formatter ─────────────────────────────────────────────────────
export function TypeScriptFormatter() {
  const [input, setInput] = useState(`interface User{id:number;name:string;email:string;}function getUser(id:number):Promise<User>{return fetch('/api/users/'+id).then(r=>r.json());}`);
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");

  const format = () => {
    setOutput(js_beautify(input, { indent_size: +indent, e4x: true }));
  };

  return (
    <Card>
      <CardHeader><CardTitle>TypeScript Formatter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <Label>Indent size:</Label>
          <Select value={indent} onValueChange={setIndent}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["2", "4"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={format}>Format</Button>
        </div>
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-32" placeholder="Paste TypeScript here..." />
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{stats(input, output)}</Badge>
              <Button size="sm" onClick={() => copyToClipboard(output)}>Copy</Button>
            </div>
            <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-64">{output}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── HTML Minifier ────────────────────────────────────────────────────────────
function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+>/g, ">")
    .replace(/<\s+/g, "<")
    .trim();
}

export function HtmlMinifier() {
  const [input, setInput] = useState(`<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Page title -->
    <title>Hello World</title>
    <meta charset="UTF-8" />
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>Welcome to my page.</p>
  </body>
</html>`);
  const [output, setOutput] = useState("");

  const minify = () => setOutput(minifyHtml(input));
  const savings = output ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <Card>
      <CardHeader><CardTitle>HTML Minifier</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" placeholder="Paste HTML here..." />
        <Button onClick={minify}>Minify HTML</Button>
        {output && (
          <div className="space-y-2">
            <Badge variant="outline">{savings}% smaller — {input.length} → {output.length} bytes</Badge>
            <div className="relative">
              <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-32 whitespace-pre-wrap break-all">{output}</pre>
              <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── CSS Minifier ─────────────────────────────────────────────────────────────
function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};:,>~+])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/^\s+|\s+$/g, "")
    .trim();
}

export function CssMinifier() {
  const [input, setInput] = useState(`.container {
  display: flex;
  flex-direction: column;
  /* center items */
  align-items: center;
  padding: 16px 24px;
}

.button {
  background-color: #6366f1;
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
}`);
  const [output, setOutput] = useState("");

  const minify = () => setOutput(minifyCss(input));
  const savings = output ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <Card>
      <CardHeader><CardTitle>CSS Minifier</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" placeholder="Paste CSS here..." />
        <Button onClick={minify}>Minify CSS</Button>
        {output && (
          <div className="space-y-2">
            <Badge variant="outline">{savings}% smaller — {input.length} → {output.length} bytes</Badge>
            <div className="relative">
              <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-24 whitespace-pre-wrap break-all">{output}</pre>
              <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── XML Minifier ─────────────────────────────────────────────────────────────
function minifyXml(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+>/g, ">")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function XmlMinifier() {
  const [input, setInput] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<config>
  <!-- Database settings -->
  <database>
    <host>localhost</host>
    <port>5432</port>
    <name>myapp</name>
  </database>
  <cache enabled="true">
    <ttl>300</ttl>
  </cache>
</config>`);
  const [output, setOutput] = useState("");

  const minify = () => setOutput(minifyXml(input));
  const savings = output ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <Card>
      <CardHeader><CardTitle>XML Minifier</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" />
        <Button onClick={minify}>Minify XML</Button>
        {output && (
          <div className="space-y-2">
            <Badge variant="outline">{savings}% smaller — {input.length} → {output.length} bytes</Badge>
            <div className="relative">
              <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-24 whitespace-pre-wrap break-all">{output}</pre>
              <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SVG Minifier ─────────────────────────────────────────────────────────────
function minifySvg(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s*([=><\/])\s*/g, "$1")
    .replace(/\s+(xmlns:\w+="[^"]*")/g, " $1")
    .trim();
}

export function SvgMinifier() {
  const [input, setInput] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by Illustrator -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
  <!-- Circle shape -->
  <circle cx="12" cy="12" r="10" />
  <path d="M12 8v4l3 3" />
</svg>`);
  const [output, setOutput] = useState("");

  const minify = () => setOutput(minifySvg(input));
  const savings = output ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <Card>
      <CardHeader><CardTitle>SVG Minifier / Optimizer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-40" />
        <Button onClick={minify}>Minify SVG</Button>
        {output && (
          <div className="space-y-2">
            <Badge variant="outline">{savings}% smaller — {input.length} → {output.length} bytes</Badge>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-center items-center h-24 bg-muted rounded border" dangerouslySetInnerHTML={{ __html: output }} />
              <div className="relative">
                <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-24 whitespace-pre-wrap break-all">{output}</pre>
                <Button size="sm" className="absolute top-2 right-2" onClick={() => copyToClipboard(output)}>Copy</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── DDL Formatter ─────────────────────────────────────────────────────────────
function formatDdl(sql: string): string {
  const keywords = ["CREATE TABLE", "CREATE INDEX", "ALTER TABLE", "DROP TABLE", "ADD CONSTRAINT", "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "NOT NULL", "DEFAULT", "UNIQUE", "CHECK", "ADD COLUMN", "DROP COLUMN"];
  let result = sql;
  keywords.forEach(kw => { result = result.replace(new RegExp(kw, "gi"), kw); });
  result = result
    .replace(/\s+/g, " ")
    .replace(/\(\s*/g, "(\n  ")
    .replace(/,\s*/g, ",\n  ")
    .replace(/\s*\)/g, "\n)")
    .replace(/\s*;/g, ";\n")
    .trim();
  return result;
}

export function DdlFormatter() {
  const [input, setInput] = useState(`CREATE TABLE users(id SERIAL PRIMARY KEY,name VARCHAR(255) NOT NULL,email VARCHAR(255) UNIQUE NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,role_id INTEGER REFERENCES roles(id));`);
  const [output, setOutput] = useState("");

  const format = () => setOutput(formatDdl(input));

  return (
    <Card>
      <CardHeader><CardTitle>DDL Formatter</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs h-32" placeholder="Paste CREATE TABLE, ALTER TABLE, etc." />
        <Button onClick={format}>Format DDL</Button>
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
