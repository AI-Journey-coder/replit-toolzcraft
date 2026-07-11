import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, CheckCheck, Download } from "lucide-react";

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return { copied, copy };
}

function CopyBtn({ text }: { text: string }) {
  const { copied, copy } = useCopy(text);
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={copy} disabled={!text}>
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function DownloadBtn({ text, filename }: { text: string; filename: string }) {
  const download = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={download} disabled={!text}>
      <Download className="h-3.5 w-3.5" />
      Download
    </Button>
  );
}

// ─── CSV → SQL INSERT ─────────────────────────────────────────────────────────

function parseCsv(raw: string): { headers: string[]; rows: string[][] } {
  const lines = raw.trim().split(/\r?\n/);
  if (!lines.length) return { headers: [], rows: [] };
  const parse = (line: string) => {
    const result: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        result.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  };
  const headers = parse(lines[0]);
  const rows = lines.slice(1).filter(l => l.trim()).map(parse);
  return { headers, rows };
}

function quoteIdent(name: string, dialect: string): string {
  if (dialect === "mysql") return "`" + name + "`";
  if (dialect === "mssql") return "[" + name + "]";
  return '"' + name + '"'; // pg, sqlite, oracle
}

function quoteVal(v: string): string {
  const n = v.trim();
  if (n === "" || n.toLowerCase() === "null") return "NULL";
  if (/^-?\d+(\.\d+)?$/.test(n)) return n;
  return "'" + v.replace(/'/g, "''") + "'";
}

export function CsvToSql() {
  const [csv, setCsv] = useState("id,name,email,age\n1,Alice,alice@example.com,30\n2,Bob,bob@example.com,25\n3,Carol,carol@example.com,35");
  const [table, setTable] = useState("users");
  const [dialect, setDialect] = useState("pg");
  const [batchSize, setBatchSize] = useState(500);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generate = () => {
    setError("");
    try {
      const { headers, rows } = parseCsv(csv);
      if (!headers.length) throw new Error("No headers found in CSV");
      if (!rows.length) throw new Error("No data rows found in CSV");

      const qi = (n: string) => quoteIdent(n, dialect);
      const cols = headers.map(h => qi(h.trim())).join(", ");
      const tbl = qi(table.trim() || "my_table");

      const batches: string[] = [];
      for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        const vals = chunk.map(row => {
          const cells = headers.map((_, j) => quoteVal(row[j] ?? ""));
          return `  (${cells.join(", ")})`;
        });
        batches.push(`INSERT INTO ${tbl} (${cols})\nVALUES\n${vals.join(",\n")};`);
      }
      setOutput(batches.join("\n\n"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion error");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>CSV to SQL INSERT</CardTitle>
        <CardDescription>Convert CSV data into SQL INSERT statements for any database dialect</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5 col-span-1">
            <Label>Table name</Label>
            <Input value={table} onChange={e => setTable(e.target.value)} placeholder="users" className="font-mono" />
          </div>
          <div className="space-y-1.5 col-span-1">
            <Label>SQL dialect</Label>
            <Select value={dialect} onValueChange={setDialect}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pg">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL / MariaDB</SelectItem>
                <SelectItem value="mssql">SQL Server (T-SQL)</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
                <SelectItem value="oracle">Oracle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-1">
            <Label>Rows per INSERT</Label>
            <Input type="number" value={batchSize} onChange={e => setBatchSize(Math.max(1, parseInt(e.target.value) || 500))} className="font-mono" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>CSV Input</Label>
          <Textarea className="font-mono text-xs min-h-[140px]" value={csv} onChange={e => setCsv(e.target.value)} placeholder="id,name,email&#10;1,Alice,alice@example.com" data-testid="textarea-csv" />
        </div>

        <Button onClick={generate} disabled={!csv.trim()} data-testid="btn-generate">Generate SQL</Button>

        {error && <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">{error}</div>}

        {output && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>SQL Output</Label>
              <div className="flex gap-2">
                <CopyBtn text={output} />
                <DownloadBtn text={output} filename={`${table}_insert.sql`} />
              </div>
            </div>
            <pre className="p-3 bg-muted/50 rounded-md font-mono text-xs overflow-auto border border-border/50 max-h-[400px]" data-testid="text-output">{output}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SQL Dialect Converter ────────────────────────────────────────────────────

type Dialect = "pg" | "mysql" | "mssql" | "sqlite" | "oracle";

const TYPE_MAP: Record<string, Record<Dialect, string>> = {
  // Auto-increment / serial
  "serial":          { pg: "SERIAL", mysql: "INT AUTO_INCREMENT", mssql: "INT IDENTITY(1,1)", sqlite: "INTEGER", oracle: "NUMBER GENERATED ALWAYS AS IDENTITY" },
  "bigserial":       { pg: "BIGSERIAL", mysql: "BIGINT AUTO_INCREMENT", mssql: "BIGINT IDENTITY(1,1)", sqlite: "INTEGER", oracle: "NUMBER GENERATED ALWAYS AS IDENTITY" },
  "auto_increment":  { pg: "SERIAL", mysql: "INT AUTO_INCREMENT", mssql: "INT IDENTITY(1,1)", sqlite: "INTEGER", oracle: "NUMBER GENERATED ALWAYS AS IDENTITY" },
  // Integers
  "tinyint":   { pg: "SMALLINT", mysql: "TINYINT", mssql: "TINYINT", sqlite: "INTEGER", oracle: "NUMBER(3)" },
  "smallint":  { pg: "SMALLINT", mysql: "SMALLINT", mssql: "SMALLINT", sqlite: "INTEGER", oracle: "NUMBER(5)" },
  "int":       { pg: "INTEGER", mysql: "INT", mssql: "INT", sqlite: "INTEGER", oracle: "NUMBER(10)" },
  "integer":   { pg: "INTEGER", mysql: "INT", mssql: "INT", sqlite: "INTEGER", oracle: "NUMBER(10)" },
  "bigint":    { pg: "BIGINT", mysql: "BIGINT", mssql: "BIGINT", sqlite: "INTEGER", oracle: "NUMBER(19)" },
  // Floats
  "float":     { pg: "REAL", mysql: "FLOAT", mssql: "FLOAT", sqlite: "REAL", oracle: "FLOAT" },
  "double":    { pg: "DOUBLE PRECISION", mysql: "DOUBLE", mssql: "FLOAT", sqlite: "REAL", oracle: "BINARY_DOUBLE" },
  "real":      { pg: "REAL", mysql: "FLOAT", mssql: "REAL", sqlite: "REAL", oracle: "BINARY_FLOAT" },
  "numeric":   { pg: "NUMERIC", mysql: "DECIMAL", mssql: "NUMERIC", sqlite: "NUMERIC", oracle: "NUMBER" },
  "decimal":   { pg: "NUMERIC", mysql: "DECIMAL", mssql: "DECIMAL", sqlite: "NUMERIC", oracle: "NUMBER" },
  // Strings
  "varchar":   { pg: "VARCHAR", mysql: "VARCHAR", mssql: "NVARCHAR", sqlite: "TEXT", oracle: "VARCHAR2" },
  "nvarchar":  { pg: "VARCHAR", mysql: "VARCHAR", mssql: "NVARCHAR", sqlite: "TEXT", oracle: "NVARCHAR2" },
  "char":      { pg: "CHAR", mysql: "CHAR", mssql: "NCHAR", sqlite: "TEXT", oracle: "CHAR" },
  "text":      { pg: "TEXT", mysql: "TEXT", mssql: "NVARCHAR(MAX)", sqlite: "TEXT", oracle: "CLOB" },
  "tinytext":  { pg: "TEXT", mysql: "TINYTEXT", mssql: "NVARCHAR(255)", sqlite: "TEXT", oracle: "VARCHAR2(255)" },
  "mediumtext":{ pg: "TEXT", mysql: "MEDIUMTEXT", mssql: "NVARCHAR(MAX)", sqlite: "TEXT", oracle: "CLOB" },
  "longtext":  { pg: "TEXT", mysql: "LONGTEXT", mssql: "NVARCHAR(MAX)", sqlite: "TEXT", oracle: "CLOB" },
  "clob":      { pg: "TEXT", mysql: "LONGTEXT", mssql: "NVARCHAR(MAX)", sqlite: "TEXT", oracle: "CLOB" },
  // Date/time
  "date":      { pg: "DATE", mysql: "DATE", mssql: "DATE", sqlite: "TEXT", oracle: "DATE" },
  "time":      { pg: "TIME", mysql: "TIME", mssql: "TIME", sqlite: "TEXT", oracle: "TIMESTAMP" },
  "datetime":  { pg: "TIMESTAMP", mysql: "DATETIME", mssql: "DATETIME2", sqlite: "TEXT", oracle: "DATE" },
  "timestamp": { pg: "TIMESTAMP", mysql: "TIMESTAMP", mssql: "DATETIME2", sqlite: "TEXT", oracle: "TIMESTAMP" },
  // Boolean
  "bool":      { pg: "BOOLEAN", mysql: "TINYINT(1)", mssql: "BIT", sqlite: "INTEGER", oracle: "NUMBER(1)" },
  "boolean":   { pg: "BOOLEAN", mysql: "TINYINT(1)", mssql: "BIT", sqlite: "INTEGER", oracle: "NUMBER(1)" },
  "bit":       { pg: "BOOLEAN", mysql: "TINYINT(1)", mssql: "BIT", sqlite: "INTEGER", oracle: "NUMBER(1)" },
  // Binary
  "blob":      { pg: "BYTEA", mysql: "BLOB", mssql: "VARBINARY(MAX)", sqlite: "BLOB", oracle: "BLOB" },
  "bytea":     { pg: "BYTEA", mysql: "BLOB", mssql: "VARBINARY(MAX)", sqlite: "BLOB", oracle: "BLOB" },
  "binary":    { pg: "BYTEA", mysql: "BINARY", mssql: "BINARY", sqlite: "BLOB", oracle: "RAW" },
  // UUID/JSON
  "uuid":      { pg: "UUID", mysql: "CHAR(36)", mssql: "UNIQUEIDENTIFIER", sqlite: "TEXT", oracle: "CHAR(36)" },
  "json":      { pg: "JSONB", mysql: "JSON", mssql: "NVARCHAR(MAX)", sqlite: "TEXT", oracle: "CLOB" },
  "jsonb":     { pg: "JSONB", mysql: "JSON", mssql: "NVARCHAR(MAX)", sqlite: "TEXT", oracle: "CLOB" },
};

function convertDialect(sql: string, from: Dialect, to: Dialect): string {
  let result = sql;

  // Quote identifiers conversion
  if (from === "mysql" && to !== "mysql") {
    result = result.replace(/`([^`]+)`/g, '"$1"');
  }
  if (from === "mssql" && to !== "mssql") {
    result = result.replace(/\[([^\]]+)\]/g, '"$1"');
  }
  if (to === "mysql") {
    result = result.replace(/"([^"]+)"/g, "`$1`");
  }
  if (to === "mssql") {
    result = result.replace(/"([^"]+)"/g, "[$1]");
  }

  // Type conversions (case-insensitive)
  for (const [srcType, targets] of Object.entries(TYPE_MAP)) {
    const fromType = targets[from] ?? srcType.toUpperCase();
    const toType = targets[to];
    if (!toType || fromType === toType) continue;
    // Match type with optional parentheses
    const re = new RegExp(`\\b${escapeRe(fromType)}\\b(\\s*\\([^)]*\\))?`, "gi");
    result = result.replace(re, (_m, parens) => {
      // Preserve parens when target keeps them (e.g. VARCHAR(255) -> NVARCHAR(255))
      if (parens && /\(/.test(toType)) return toType + parens;
      if (parens && !["TEXT", "CLOB", "BYTEA", "BLOB", "JSONB"].includes(toType)) return toType + parens;
      return toType;
    });
  }

  // Auto-increment syntax
  if (to === "pg") {
    result = result.replace(/\bINT\s+AUTO_INCREMENT\b/gi, "SERIAL");
    result = result.replace(/\bBIGINT\s+AUTO_INCREMENT\b/gi, "BIGSERIAL");
  }
  if (to === "mysql") {
    result = result.replace(/\bSERIAL\b/gi, "INT AUTO_INCREMENT");
    result = result.replace(/\bBIGSERIAL\b/gi, "BIGINT AUTO_INCREMENT");
    result = result.replace(/\bINT\s+IDENTITY\(\d+,\s*\d+\)\b/gi, "INT AUTO_INCREMENT");
    result = result.replace(/\bBIGINT\s+IDENTITY\(\d+,\s*\d+\)\b/gi, "BIGINT AUTO_INCREMENT");
  }
  if (to === "mssql") {
    result = result.replace(/\bSERIAL\b/gi, "INT IDENTITY(1,1)");
    result = result.replace(/\bBIGSERIAL\b/gi, "BIGINT IDENTITY(1,1)");
    result = result.replace(/\bINT\s+AUTO_INCREMENT\b/gi, "INT IDENTITY(1,1)");
    result = result.replace(/\bBIGINT\s+AUTO_INCREMENT\b/gi, "BIGINT IDENTITY(1,1)");
  }

  // NOW() vs GETDATE() vs CURRENT_TIMESTAMP
  if (to === "mssql") result = result.replace(/\bNOW\(\)/gi, "GETDATE()");
  if (to === "pg" || to === "mysql" || to === "sqlite") result = result.replace(/\bGETDATE\(\)/gi, "NOW()");

  // LIMIT/TOP syntax
  if (from === "pg" || from === "mysql" || from === "sqlite") {
    if (to === "mssql") {
      // Move LIMIT to SELECT TOP
      result = result.replace(/\bSELECT\b/gi, (m) => m);
      result = result.replace(/\bLIMIT\s+(\d+)\s*(OFFSET\s+\d+)?\s*;?$/gim, (_, n) => `-- LIMIT ${n} (use SELECT TOP ${n} ... or ROW_NUMBER() for MSSQL)\n`);
    }
  }

  return result;
}

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

const DIALECT_LABELS: Record<Dialect, string> = {
  pg: "PostgreSQL",
  mysql: "MySQL / MariaDB",
  mssql: "SQL Server (T-SQL)",
  sqlite: "SQLite",
  oracle: "Oracle",
};

export function SqlDialectConverter() {
  const [sql, setSql] = useState(`CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  score DECIMAL(10, 2),
  avatar BYTEA
);`);
  const [from, setFrom] = useState<Dialect>("pg");
  const [to, setTo] = useState<Dialect>("mysql");
  const output = from === to ? sql : convertDialect(sql, from, to);

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>SQL Dialect Converter</CardTitle>
        <CardDescription>Convert DDL and queries between PostgreSQL, MySQL, SQL Server, SQLite, and Oracle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label>From</Label>
            <Select value={from} onValueChange={v => setFrom(v as Dialect)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(DIALECT_LABELS) as Dialect[]).map(d => (
                  <SelectItem key={d} value={d}>{DIALECT_LABELS[d]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>To</Label>
            <Select value={to} onValueChange={v => setTo(v as Dialect)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(DIALECT_LABELS) as Dialect[]).map(d => (
                  <SelectItem key={d} value={d}>{DIALECT_LABELS[d]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Input SQL ({DIALECT_LABELS[from]})</Label>
            <Textarea className="font-mono text-xs min-h-[260px]" value={sql} onChange={e => setSql(e.target.value)} data-testid="textarea-input" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label>Output SQL ({DIALECT_LABELS[to]})</Label>
              <div className="flex gap-1.5">
                <CopyBtn text={output} />
                <DownloadBtn text={output} filename="converted.sql" />
              </div>
            </div>
            <pre className="p-3 bg-muted/50 rounded-md font-mono text-xs overflow-auto border border-border/50 min-h-[260px] whitespace-pre-wrap" data-testid="text-output">{output}</pre>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Note:</span> This is a best-effort conversion covering ~30 common data types and syntax patterns. Always review the output — stored procedures, functions, and advanced dialect features may need manual adjustment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SQL Column Type Mapper (cheat sheet) ────────────────────────────────────

export function SqlColumnMapper() {
  const [search, setSearch] = useState("");
  const filteredTypes = Object.entries(TYPE_MAP).filter(([t]) =>
    search === "" || t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>SQL Data Type Reference</CardTitle>
        <CardDescription>Cross-dialect data type equivalents — PostgreSQL, MySQL, SQL Server, SQLite, Oracle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Filter types…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-9 text-sm" />
        <div className="rounded-lg border border-border overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/60 font-mono text-muted-foreground">
                <th className="text-left px-3 py-2.5 border-r border-border/50 font-semibold">Generic / Source</th>
                <th className="text-left px-3 py-2.5 border-r border-border/50 text-blue-400">PostgreSQL</th>
                <th className="text-left px-3 py-2.5 border-r border-border/50 text-orange-400">MySQL</th>
                <th className="text-left px-3 py-2.5 border-r border-border/50 text-cyan-400">SQL Server</th>
                <th className="text-left px-3 py-2.5 border-r border-border/50 text-green-400">SQLite</th>
                <th className="text-left px-3 py-2.5 text-yellow-400">Oracle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTypes.map(([t, targets], i) => (
                <tr key={t} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                  <td className="px-3 py-2 font-mono font-semibold border-r border-border/50 uppercase">{t}</td>
                  <td className="px-3 py-2 font-mono border-r border-border/50">{targets.pg}</td>
                  <td className="px-3 py-2 font-mono border-r border-border/50">{targets.mysql}</td>
                  <td className="px-3 py-2 font-mono border-r border-border/50">{targets.mssql}</td>
                  <td className="px-3 py-2 font-mono border-r border-border/50">{targets.sqlite}</td>
                  <td className="px-3 py-2 font-mono">{targets.oracle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
