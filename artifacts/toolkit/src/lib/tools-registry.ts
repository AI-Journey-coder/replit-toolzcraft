import {
  AppWindow, Calculator, Code2, Coins, FileText, Lock, Scale,
  Hash, Key, Percent, TrendingUp, Thermometer, Zap, Square,
  FlaskConical, Diff, Minimize2, Database, Type, AlignLeft, AlignJustify,
  Palette, Blend, ImagePlus, Tag, ReceiptText, TrendingDown, PiggyBank,
  Braces, FileJson, GitCompare, ListTree, FileSpreadsheet,
  Terminal, KeyRound, Fingerprint, Timer, GitBranch, Sparkles, Globe,
  FileCode2, Paintbrush, Settings2, Wand2
} from "lucide-react";

export type CategorySlug = "finance" | "converters" | "code" | "text" | "math" | "security" | "webdev" | "data" | "devtools" | "formatters";

export interface Category {
  name: string;
  slug: CategorySlug;
  icon: any;
  description: string;
}

export interface Tool {
  name: string;
  slug: string;
  category: CategorySlug;
  description: string;
  icon: any;
  popular?: boolean;
}

export const CATEGORIES: Category[] = [
  { name: "Finance", slug: "finance", icon: Coins, description: "Calculators for loans, investments, and more" },
  { name: "Converters", slug: "converters", icon: Scale, description: "Unit conversions for length, weight, temperature, and more" },
  { name: "Code Tools", slug: "code", icon: Code2, description: "Formatters, minifiers, and validators for code" },
  { name: "Text Tools", slug: "text", icon: FileText, description: "Word counters, case converters, and lorem ipsum" },
  { name: "Math Tools", slug: "math", icon: Calculator, description: "Percentage, scientific, and prime calculators" },
  { name: "Security", slug: "security", icon: Lock, description: "Hash generators, UUIDs, and passwords" },
  { name: "Web Dev", slug: "webdev", icon: AppWindow, description: "Color pickers, gradients, and meta tags" },
  { name: "Data Tools", slug: "data", icon: FileJson, description: "JSON, CSV, YAML, and XML converters & validators" },
  { name: "Developer Tools", slug: "devtools", icon: Terminal, description: "JWT, cURL, CRON, semver, and API developer utilities" },
  { name: "Formatters & Codegen", slug: "formatters", icon: Paintbrush, description: "Language formatters and JSON-to-code generators" },
];

export const TOOLS: Tool[] = [
  // Finance
  { name: "EMI Calculator", slug: "emi-calculator", category: "finance", description: "Calculate equated monthly installments for loans", icon: Coins, popular: true },
  { name: "SIP Calculator", slug: "sip-calculator", category: "finance", description: "Estimate returns on systematic investment plans", icon: TrendingUp, popular: true },
  { name: "Compound Interest", slug: "compound-interest", category: "finance", description: "Calculate compound interest with multiple frequencies", icon: PiggyBank },
  { name: "ROI Calculator", slug: "roi-calculator", category: "finance", description: "Return on investment analysis with annualized ROI", icon: TrendingDown },
  { name: "Tip Calculator", slug: "tip-calculator", category: "finance", description: "Calculate and split tip amounts between people", icon: ReceiptText },
  { name: "GST Calculator", slug: "gst-calculator", category: "finance", description: "Calculate GST inclusive and exclusive amounts", icon: Percent },

  // Converters
  { name: "Length Converter", slug: "length-converter", category: "converters", description: "Convert between mm, cm, m, km, in, ft, yd, mi", icon: Scale, popular: true },
  { name: "Weight Converter", slug: "weight-converter", category: "converters", description: "Convert between mg, g, kg, oz, lb, stone", icon: Scale },
  { name: "Temperature Converter", slug: "temperature-converter", category: "converters", description: "Convert between Celsius, Fahrenheit, and Kelvin", icon: Thermometer, popular: true },
  { name: "Speed Converter", slug: "speed-converter", category: "converters", description: "Convert between m/s, km/h, mph, and knots", icon: Zap },
  { name: "Area Converter", slug: "area-converter", category: "converters", description: "Convert between mm², m², km², ft², acre, hectare", icon: Square },
  { name: "Volume Converter", slug: "volume-converter", category: "converters", description: "Convert between ml, L, tsp, cup, pt, gal, and more", icon: FlaskConical },

  // Code
  { name: "JSON Formatter", slug: "json-formatter", category: "code", description: "Format, minify, and validate JSON data", icon: Code2, popular: true },
  { name: "Base64 Encode/Decode", slug: "base64", category: "code", description: "Encode or decode Base64 strings and files", icon: Code2, popular: true },
  { name: "URL Encode/Decode", slug: "url-encode", category: "code", description: "Percent-encode or decode URL strings", icon: Code2 },
  { name: "Regex Tester", slug: "regex-tester", category: "code", description: "Test regex patterns with live match highlighting", icon: Code2, popular: true },
  { name: "Code Diff", slug: "code-diff", category: "code", description: "Compare two code snippets line by line", icon: Diff },
  { name: "JS/CSS Minifier", slug: "js-minifier", category: "code", description: "Minify JavaScript or CSS to reduce file size", icon: Minimize2 },
  { name: "SQL Formatter", slug: "sql-formatter", category: "code", description: "Format and beautify SQL queries", icon: Database },

  // Text
  { name: "Word Counter", slug: "word-counter", category: "text", description: "Count words, characters, sentences, and reading time", icon: FileText, popular: true },
  { name: "Case Converter", slug: "case-converter", category: "text", description: "Convert text between upper, camel, snake, and more", icon: Type },
  { name: "Lorem Ipsum", slug: "lorem-ipsum", category: "text", description: "Generate placeholder text paragraphs or sentences", icon: AlignLeft },
  { name: "Markdown Preview", slug: "markdown-preview", category: "text", description: "Live markdown editor with rendered HTML preview", icon: AlignJustify },

  // Math
  { name: "Percentage Calculator", slug: "percentage-calculator", category: "math", description: "Calculate percentages three different ways", icon: Percent },
  { name: "Scientific Calculator", slug: "scientific-calculator", category: "math", description: "Advanced calculations with trig and logarithms", icon: Calculator, popular: true },
  { name: "Prime Checker", slug: "prime-checker", category: "math", description: "Check primality, find factors, and next prime", icon: Hash },

  // Security
  { name: "Hash Generator", slug: "hash-generator", category: "security", description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes", icon: Hash, popular: true },
  { name: "UUID Generator", slug: "uuid-generator", category: "security", description: "Generate random UUIDs in multiple formats", icon: Key },
  { name: "Password Generator", slug: "password-generator", category: "security", description: "Generate cryptographically secure passwords", icon: Lock, popular: true },

  // Web Dev
  { name: "Color Picker", slug: "color-picker", category: "webdev", description: "Pick colors and get HEX, RGB, HSL with harmonies", icon: Palette, popular: true },
  { name: "CSS Gradient", slug: "css-gradient", category: "webdev", description: "Build linear or radial gradients visually", icon: Blend },
  { name: "Image to Base64", slug: "image-to-base64", category: "webdev", description: "Convert images to Base64 encoded strings", icon: ImagePlus },
  { name: "Meta Tag Generator", slug: "meta-tag-generator", category: "webdev", description: "Generate SEO and social sharing meta tags", icon: Tag },

  // Data Tools
  { name: "JSON Validator", slug: "json-validator", category: "data", description: "Validate JSON with detailed error messages", icon: Braces, popular: true },
  { name: "JSON Diff", slug: "json-diff", category: "data", description: "Compare two JSON documents structurally", icon: GitCompare },
  { name: "JSON Tree Viewer", slug: "json-tree-viewer", category: "data", description: "Explore JSON data as a collapsible tree", icon: ListTree },
  { name: "JSON Schema Generator", slug: "json-schema-generator", category: "data", description: "Generate JSON schema from sample JSON data", icon: FileJson },
  { name: "JSON to CSV", slug: "json-to-csv", category: "data", description: "Convert JSON arrays to CSV format", icon: FileSpreadsheet },
  { name: "CSV to JSON", slug: "csv-to-json", category: "data", description: "Convert CSV data to JSON format", icon: FileSpreadsheet, popular: true },
  { name: "JSON to YAML", slug: "json-to-yaml", category: "data", description: "Convert JSON data to YAML format", icon: FileJson },
  { name: "YAML to JSON", slug: "yaml-to-json", category: "data", description: "Convert YAML to JSON format", icon: FileJson },
  { name: "JSON to XML", slug: "json-to-xml", category: "data", description: "Convert JSON data to XML format", icon: FileJson },
  { name: "XML to JSON", slug: "xml-to-json", category: "data", description: "Convert XML documents to JSON format", icon: FileJson },

  // Developer Tools
  { name: "JWT Decoder", slug: "jwt-decoder", category: "devtools", description: "Decode and inspect JSON Web Tokens", icon: KeyRound, popular: true },
  { name: "JWT Builder", slug: "jwt-builder", category: "devtools", description: "Encode and sign JSON Web Tokens", icon: KeyRound },
  { name: "HTTP Status Lookup", slug: "http-status-lookup", category: "devtools", description: "Look up HTTP status codes and their meanings", icon: Globe, popular: true },
  { name: "User Agent Parser", slug: "user-agent-parser", category: "devtools", description: "Parse user agent strings into components", icon: Fingerprint },
  { name: "CRON Parser", slug: "cron-parser", category: "devtools", description: "Parse and explain CRON expressions", icon: Timer },
  { name: "Semver Calculator", slug: "semver-calculator", category: "devtools", description: "Parse, compare, and bump semantic versions", icon: GitBranch },
  { name: "NanoID Generator", slug: "nanoid-generator", category: "devtools", description: "Generate compact, URL-friendly unique IDs", icon: Sparkles },
  { name: "cURL Converter", slug: "curl-converter", category: "devtools", description: "Convert curl commands to fetch, Python, or Node.js", icon: Terminal, popular: true },

  // Formatters & Codegen
  { name: "HTML Formatter", slug: "html-formatter", category: "formatters", description: "Beautify and indent HTML code", icon: FileCode2, popular: true },
  { name: "CSS Formatter", slug: "css-formatter", category: "formatters", description: "Beautify and format CSS code", icon: Paintbrush },
  { name: "XML Formatter", slug: "xml-formatter", category: "formatters", description: "Beautify and indent XML documents", icon: FileCode2 },
  { name: "YAML Formatter", slug: "yaml-formatter", category: "formatters", description: "Beautify and format YAML documents", icon: Settings2 },
  { name: "TOML Formatter", slug: "toml-formatter", category: "formatters", description: "Beautify and format TOML configuration files", icon: Settings2 },
  { name: "JSON5 Formatter", slug: "json5-formatter", category: "formatters", description: "Format JSON5 with comments and trailing commas", icon: FileJson },
  { name: "JSON to Python Dict", slug: "json-to-python-dict", category: "formatters", description: "Convert JSON to Python dictionary syntax", icon: FileCode2 },
  { name: "JSON to Go Struct", slug: "json-to-go-struct", category: "formatters", description: "Generate Go structs from JSON data", icon: FileCode2 },
  { name: "JSON to Java Class", slug: "json-to-java-class", category: "formatters", description: "Generate Java classes from JSON data", icon: FileCode2 },
  { name: "Regex Visualizer", slug: "regex-visualizer", category: "formatters", description: "Turn regex patterns into plain English explanations", icon: Wand2, popular: true },
];
