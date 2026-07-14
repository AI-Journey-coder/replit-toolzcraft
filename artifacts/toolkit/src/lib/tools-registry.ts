import {
  AppWindow, Calculator, Code2, Coins, FileText, Lock, Scale,
  Hash, Key, Percent, TrendingUp, Thermometer, Zap, Square,
  FlaskConical, Diff, Minimize2, Database, Type, AlignLeft, AlignJustify,
  Palette, Blend, ImagePlus, Tag, ReceiptText, TrendingDown, PiggyBank,
  Braces, FileJson, GitCompare, ListTree, FileSpreadsheet,
  Terminal, KeyRound, Fingerprint, Timer, GitBranch, Sparkles, Globe,
  FileCode2, Paintbrush, Settings2, Wand2, ShieldCheck, FileSignature, Smartphone,
  DollarSign, HardDrive, Flame, Gauge, Bolt, Shuffle, Clock, Layers, Wifi,
  QrCode, Contrast, LayoutGrid, FileKey, Network, AlignCenter, Star,
  Search, Link, Binary, Languages, Shield, Lock as LockIcon,
  CalendarDays, AlarmClock, Cpu, MonitorSmartphone, FileLock2,
  BookOpen, Image, Barcode, Rows, Triangle, Eye, Sliders, Box,
  Repeat, FileInput, LayoutTemplate, ScanLine, Accessibility,
  Activity, RefreshCw, List, Columns, FileSearch, ChevronRight,
} from "lucide-react";

export type CategorySlug =
  | "finance" | "converters" | "code" | "text" | "math" | "security"
  | "webdev" | "data" | "devtools" | "formatters" | "sql"
  | "encoding" | "datetime" | "cssdesign" | "webstandards" | "reference" | "image"
  | "pdf" | "ocr";

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
  { name: "Converters", slug: "converters", icon: Scale, description: "Unit, currency, and measurement conversions" },
  { name: "Code Tools", slug: "code", icon: Code2, description: "Formatters, minifiers, and validators for code" },
  { name: "Text Tools", slug: "text", icon: FileText, description: "Word counters, case converters, and lorem ipsum" },
  { name: "Math Tools", slug: "math", icon: Calculator, description: "Percentage, scientific, and prime calculators" },
  { name: "Security", slug: "security", icon: Lock, description: "Hash generators, UUIDs, passwords, and encryption" },
  { name: "Web Dev", slug: "webdev", icon: AppWindow, description: "Color pickers, gradients, QR codes, and meta tags" },
  { name: "Data Tools", slug: "data", icon: FileJson, description: "JSON, CSV, YAML, and XML converters & validators" },
  { name: "Developer Tools", slug: "devtools", icon: Terminal, description: "JWT, cURL, CRON, semver, and API developer utilities" },
  { name: "Formatters & Codegen", slug: "formatters", icon: Paintbrush, description: "Language formatters and JSON-to-code generators" },
  { name: "SQL Tools", slug: "sql", icon: Database, description: "CSV to SQL, dialect converters, and data type references" },
  { name: "Encoding & Ciphers", slug: "encoding", icon: Binary, description: "Base converters, ciphers, Morse code, and number systems" },
  { name: "Date & Time", slug: "datetime", icon: CalendarDays, description: "Date calculators, timezone converter, and timers" },
  { name: "CSS & Design", slug: "cssdesign", icon: Layers, description: "Box shadows, contrast checker, PX to REM, and more" },
  { name: "Web Standards", slug: "webstandards", icon: Globe, description: "robots.txt, CORS, CSP, .htaccess, and Open Graph generators" },
  { name: "Reference", slug: "reference", icon: BookOpen, description: "ASCII table, Unicode, ARIA roles, WCAG, and cheatsheets" },
  { name: "Image Tools", slug: "image", icon: Image, description: "EXIF viewer, color picker from image, SVG to PNG, and resizer" },
  { name: "PDF Tools", slug: "pdf", icon: FileInput, description: "Merge, split, rotate, watermark, and convert PDFs — all in your browser" },
  { name: "OCR & Documents", slug: "ocr", icon: ScanLine, description: "Extract text from images and scanned PDFs with in-browser OCR" },
];

export const TOOLS: Tool[] = [
  // ── Finance ──────────────────────────────────────────────────────────────
  { name: "EMI Calculator", slug: "emi-calculator", category: "finance", description: "Calculate equated monthly installments for loans", icon: Coins, popular: true },
  { name: "SIP Calculator", slug: "sip-calculator", category: "finance", description: "Estimate returns on systematic investment plans", icon: TrendingUp, popular: true },
  { name: "Compound Interest", slug: "compound-interest", category: "finance", description: "Calculate compound interest with multiple frequencies", icon: PiggyBank },
  { name: "ROI Calculator", slug: "roi-calculator", category: "finance", description: "Return on investment analysis with annualized ROI", icon: TrendingDown },
  { name: "Tip Calculator", slug: "tip-calculator", category: "finance", description: "Calculate and split tip amounts between people", icon: ReceiptText },
  { name: "GST Calculator", slug: "gst-calculator", category: "finance", description: "Calculate GST inclusive and exclusive amounts", icon: Percent },
  { name: "Mortgage Calculator", slug: "mortgage-calculator", category: "finance", description: "Calculate mortgage payments and amortization schedule", icon: Coins, popular: true },
  { name: "Commission Calculator", slug: "commission-calculator", category: "finance", description: "Calculate sales commission with tiered rates", icon: Percent },
  { name: "Group Expense Splitter", slug: "group-expense-splitter", category: "finance", description: "Split group expenses and calculate who owes whom", icon: DollarSign, popular: true },
  { name: "Startup Break-Even", slug: "startup-break-even", category: "finance", description: "Calculate break-even point for a startup", icon: TrendingUp },
  { name: "SaaS Break-Even", slug: "saas-break-even", category: "finance", description: "Calculate SaaS break-even with MRR, CAC, and churn", icon: TrendingUp },
  { name: "Ecommerce Break-Even", slug: "ecommerce-break-even", category: "finance", description: "Calculate ecommerce break-even including ad spend", icon: TrendingUp },
  { name: "Crypto Break-Even", slug: "crypto-break-even", category: "finance", description: "Calculate break-even price for crypto investments", icon: TrendingUp },
  { name: "Basic Break-Even", slug: "break-even-calculator", category: "finance", description: "Calculate break-even units, revenue, and margin", icon: TrendingUp },
  { name: "Expense Categorizer", slug: "expense-categorizer", category: "finance", description: "Paste expenses and auto-categorize them by type", icon: ReceiptText },

  // ── Converters ───────────────────────────────────────────────────────────
  { name: "Currency Converter", slug: "currency-converter", category: "converters", description: "Live exchange rates for 50+ currencies worldwide", icon: DollarSign, popular: true },
  { name: "Length Converter", slug: "length-converter", category: "converters", description: "Convert between mm, cm, m, km, in, ft, yd, mi", icon: Scale, popular: true },
  { name: "Weight & Mass", slug: "weight-converter", category: "converters", description: "Convert between mg, g, kg, oz, lb, stone, tons", icon: Scale },
  { name: "Temperature", slug: "temperature-converter", category: "converters", description: "Convert between Celsius, Fahrenheit, and Kelvin", icon: Thermometer, popular: true },
  { name: "Speed Converter", slug: "speed-converter", category: "converters", description: "Convert between m/s, km/h, mph, knots, Mach", icon: Zap },
  { name: "Area Converter", slug: "area-converter", category: "converters", description: "Convert between mm², m², km², ft², acre, hectare", icon: Square },
  { name: "Volume Converter", slug: "volume-converter", category: "converters", description: "Convert between ml, L, tsp, cup, pt, gal, and more", icon: FlaskConical },
  { name: "Data Storage", slug: "data-storage-converter", category: "converters", description: "Convert between bits, bytes, KB, MB, GB, TB, KiB…", icon: HardDrive },
  { name: "Energy Converter", slug: "energy-converter", category: "converters", description: "Convert between joules, calories, kWh, BTU, eV", icon: Bolt },
  { name: "Pressure Converter", slug: "pressure-converter", category: "converters", description: "Convert between Pa, PSI, bar, atm, mmHg, inHg", icon: Gauge },

  // ── Code ─────────────────────────────────────────────────────────────────
  { name: "JSON Formatter", slug: "json-formatter", category: "code", description: "Format, minify, and validate JSON data", icon: Code2, popular: true },
  { name: "Base64 Encode/Decode", slug: "base64", category: "code", description: "Encode or decode Base64 strings and files", icon: Code2, popular: true },
  { name: "URL Encode/Decode", slug: "url-encode", category: "code", description: "Percent-encode or decode URL strings", icon: Code2 },
  { name: "Regex Tester", slug: "regex-tester", category: "code", description: "Test regex patterns with live match highlighting", icon: Code2, popular: true },
  { name: "Code Diff", slug: "code-diff", category: "code", description: "Compare two code snippets line by line", icon: Diff },
  { name: "JS/CSS Minifier", slug: "js-minifier", category: "code", description: "Minify JavaScript or CSS to reduce file size", icon: Minimize2 },
  { name: "SQL Formatter", slug: "sql-formatter", category: "code", description: "Format and beautify SQL queries", icon: Database },

  // ── Text ──────────────────────────────────────────────────────────────────
  { name: "Word Counter", slug: "word-counter", category: "text", description: "Count words, characters, sentences, and reading time", icon: FileText, popular: true },
  { name: "Case Converter", slug: "case-converter", category: "text", description: "Convert text between upper, camel, snake, and more", icon: Type },
  { name: "Lorem Ipsum", slug: "lorem-ipsum", category: "text", description: "Generate placeholder text paragraphs or sentences", icon: AlignLeft },
  { name: "Markdown Preview", slug: "markdown-preview", category: "text", description: "Live markdown editor with rendered HTML preview", icon: AlignJustify },
  { name: "Text Diff", slug: "text-diff", category: "text", description: "Compare two texts and highlight line-by-line differences", icon: Diff, popular: true },
  { name: "Find & Replace", slug: "find-replace", category: "text", description: "Find and replace text with optional regex support", icon: Search },
  { name: "Line Sorter", slug: "line-sorter", category: "text", description: "Sort and deduplicate lines alphabetically", icon: AlignJustify },
  { name: "Slug Generator", slug: "slug-generator", category: "text", description: "Generate URL-friendly slugs from any text", icon: Link },
  { name: "Extract Emails & URLs", slug: "extract-emails-urls", category: "text", description: "Extract email addresses and URLs from a block of text", icon: Search, popular: true },
  { name: "URL Parser", slug: "url-parser", category: "text", description: "Break down a URL into its individual components", icon: Link },
  { name: "Token Counter", slug: "token-counter", category: "text", description: "Count approximate tokens for LLM context windows", icon: Cpu, popular: true },
  { name: "NATO Phonetic Alphabet", slug: "nato-phonetic", category: "text", description: "Convert text to the NATO phonetic alphabet", icon: Languages },
  { name: "Text Transformer", slug: "text-transform", category: "text", description: "Reverse, repeat, or clean whitespace from text", icon: Shuffle },
  { name: "Markdown to HTML", slug: "markdown-to-html", category: "text", description: "Convert Markdown to HTML and back", icon: FileCode2, popular: true },
  { name: "HTML to Markdown", slug: "html-to-markdown", category: "text", description: "Convert HTML to clean Markdown", icon: FileCode2 },
  { name: "CSV Column Extractor", slug: "csv-column-extractor", category: "text", description: "Extract specific columns from CSV data", icon: Columns },
  { name: "Readability Score", slug: "readability-score", category: "text", description: "Analyze text readability with Flesch-Kincaid score", icon: Activity },
  { name: "Fancy / Zalgo Text", slug: "fancy-text", category: "text", description: "Generate decorative Unicode text styles", icon: Sparkles },
  { name: "Text to Speech", slug: "text-to-speech", category: "text", description: "Convert text to spoken audio in the browser", icon: Zap },
  { name: "Prompt Formatter", slug: "prompt-formatter", category: "text", description: "Format and structure AI prompts", icon: Wand2, popular: true },
  { name: "Text to ASCII Art", slug: "text-to-ascii-art", category: "text", description: "Convert text to large ASCII art characters", icon: Type },
  { name: "Text to Handwriting", slug: "text-to-handwriting", category: "text", description: "Render text in a handwriting-style font", icon: FileText },
  { name: "Prompt to JSON", slug: "prompt-to-json", category: "text", description: "Convert natural language descriptions to JSON structure", icon: Wand2 },
  { name: "Markdown README Guide", slug: "markdown-readme-guide", category: "text", description: "README.md templates for different project types", icon: BookOpen },
  { name: "Punycode Converter", slug: "punycode-converter", category: "text", description: "Encode and decode internationalized domain names", icon: Globe },

  // ── Math ─────────────────────────────────────────────────────────────────
  { name: "Percentage Calculator", slug: "percentage-calculator", category: "math", description: "Calculate percentages three different ways", icon: Percent },
  { name: "Scientific Calculator", slug: "scientific-calculator", category: "math", description: "Advanced calculations with trig and logarithms", icon: Calculator, popular: true },
  { name: "Prime Checker", slug: "prime-checker", category: "math", description: "Check primality, find factors, and next prime", icon: Hash },
  { name: "GCD & LCM Calculator", slug: "gcd-lcm-calculator", category: "math", description: "Greatest common divisor and least common multiple", icon: Calculator },
  { name: "Molecular Weight Calculator", slug: "molecular-weight-calculator", category: "math", description: "Calculate molecular weight from chemical formulas", icon: FlaskConical },

  // ── Security ─────────────────────────────────────────────────────────────
  { name: "Hash Generator", slug: "hash-generator", category: "security", description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes", icon: Hash, popular: true },
  { name: "UUID Generator", slug: "uuid-generator", category: "security", description: "Generate random UUIDs in multiple formats", icon: Key },
  { name: "Password Generator", slug: "password-generator", category: "security", description: "Generate cryptographically secure passwords", icon: Lock, popular: true },
  { name: "MD5 Hash Generator", slug: "md5-generator", category: "security", description: "Generate the MD5 digest of any text", icon: Hash },
  { name: "SHA-256 Generator", slug: "sha256-generator", category: "security", description: "Generate a SHA-256 digest using Web Crypto", icon: Hash, popular: true },
  { name: "SSL Cert Decoder", slug: "ssl-cert-decoder", category: "security", description: "Decode PEM certificates and inspect subject, issuer, validity", icon: ShieldCheck, popular: true },
  { name: "SAML Decoder", slug: "saml-decoder", category: "security", description: "Decode base64 SAMLRequest/SAMLResponse into readable XML", icon: FileSignature },
  { name: "IMEI Validator", slug: "imei-validator", category: "security", description: "Validate a 15-digit IMEI using the Luhn algorithm", icon: Smartphone },
  { name: "Password Strength", slug: "password-strength-checker", category: "security", description: "Analyze password entropy and check security requirements", icon: ShieldCheck },
  { name: "AES Encryption", slug: "aes-encrypt-decrypt", category: "security", description: "Encrypt and decrypt text with AES-256-GCM (Web Crypto)", icon: FileLock2, popular: true },
  { name: "HMAC Generator", slug: "hmac-generator", category: "security", description: "Generate HMAC message authentication codes", icon: FileKey },
  { name: "Random Number Generator", slug: "random-number-generator", category: "security", description: "Generate cryptographically secure random numbers", icon: Sparkles },
  { name: "Passphrase Generator", slug: "passphrase-generator", category: "security", description: "Generate memorable random passphrases", icon: Lock },
  { name: "Bcrypt Generator", slug: "bcrypt-generator", category: "security", description: "Generate and verify bcrypt password hashes", icon: Hash, popular: true },
  { name: "SRI Hash Generator", slug: "sri-hash-generator", category: "security", description: "Generate Subresource Integrity hashes for CDN assets", icon: ShieldCheck },
  { name: "TOTP Generator", slug: "totp-generator", category: "security", description: "Generate Time-based One-Time Passwords (TOTP/Google Authenticator)", icon: Timer, popular: true },
  { name: "RSA Key Generator", slug: "rsa-key-generator", category: "security", description: "Generate RSA public/private key pairs in the browser", icon: Key },
  { name: "Hash Identifier", slug: "hash-identifier", category: "security", description: "Identify the algorithm used to create a hash string", icon: Search },
  { name: "Checksum Calculator", slug: "checksum-calculator", category: "security", description: "Calculate CRC32 and SHA checksums for text", icon: Hash },

  // ── Web Dev ───────────────────────────────────────────────────────────────
  { name: "Color Picker", slug: "color-picker", category: "webdev", description: "Pick colors and get HEX, RGB, HSL with harmonies", icon: Palette, popular: true },
  { name: "CSS Gradient", slug: "css-gradient", category: "webdev", description: "Build linear or radial gradients visually", icon: Blend },
  { name: "Image to Base64", slug: "image-to-base64", category: "webdev", description: "Convert images to Base64 encoded strings", icon: ImagePlus },
  { name: "Meta Tag Generator", slug: "meta-tag-generator", category: "webdev", description: "Generate SEO and social sharing meta tags", icon: Tag },
  { name: "QR Code Generator", slug: "qr-code-generator", category: "webdev", description: "Generate QR codes from any URL or text with custom colors", icon: QrCode, popular: true },
  { name: "HTML5 Boilerplate", slug: "html5-boilerplate", category: "webdev", description: "Generate a complete HTML5 boilerplate with SEO, OG, and GTM", icon: FileCode2, popular: true },
  { name: "Heading Hierarchy Checker", slug: "heading-hierarchy-checker", category: "webdev", description: "Check H1-H6 nesting and accessibility of HTML headings", icon: List },
  { name: "Font Preview", slug: "font-preview", category: "webdev", description: "Preview text in web-safe and popular fonts", icon: Type },
  { name: "Placeholder Image Generator", slug: "placeholder-image-generator", category: "webdev", description: "Generate SVG placeholder images with custom size and text", icon: Image },
  { name: "Barcode Generator", slug: "barcode-generator", category: "webdev", description: "Generate barcodes in CODE128, EAN13, QR, and more", icon: Barcode, popular: true },
  { name: "Changelog Formatter", slug: "changelog-formatter", category: "webdev", description: "Format changelogs in Keep a Changelog style", icon: FileText },
  { name: "Favicon Generator", slug: "favicon-generator", category: "webdev", description: "Generate favicons from text or emoji at multiple sizes", icon: Star },

  // ── Data Tools ────────────────────────────────────────────────────────────
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
  { name: "TOML to JSON", slug: "toml-to-json", category: "data", description: "Convert TOML configuration files to JSON", icon: FileJson },
  { name: "JSON to TOML", slug: "json-to-toml", category: "data", description: "Convert JSON data to TOML format", icon: FileJson },
  { name: "INI to JSON", slug: "ini-to-json", category: "data", description: "Convert INI configuration files to JSON", icon: FileJson },
  { name: "YAML to XML", slug: "yaml-to-xml", category: "data", description: "Convert YAML documents to XML format", icon: FileJson },
  { name: "CSV to XML", slug: "csv-to-xml", category: "data", description: "Convert CSV data to XML format", icon: FileSpreadsheet },
  { name: "JSON Minifier", slug: "json-minifier", category: "data", description: "Minify JSON by removing whitespace", icon: Minimize2 },
  { name: "JSON Table Viewer", slug: "json-table-viewer", category: "data", description: "View JSON arrays as sortable, filterable tables", icon: LayoutGrid },
  { name: "Properties to JSON", slug: "properties-to-json", category: "data", description: "Convert Java .properties files to JSON", icon: FileJson },
  { name: "Structured Data Generator", slug: "structured-data-generator", category: "data", description: "Generate JSON-LD structured data for SEO", icon: FileJson },
  { name: "JSON Schema Validator", slug: "json-schema-validator", category: "data", description: "Validate JSON data against a JSON Schema", icon: ShieldCheck, popular: true },
  { name: "YAML Diff", slug: "yaml-diff", category: "data", description: "Compare two YAML documents side by side", icon: GitCompare },
  { name: "YAML to Properties", slug: "yaml-to-properties", category: "data", description: "Convert YAML to Java .properties format", icon: FileJson },
  { name: "TOML to YAML", slug: "toml-to-yaml", category: "data", description: "Convert TOML configuration to YAML format", icon: FileJson },
  { name: "XML to CSV", slug: "xml-to-csv", category: "data", description: "Convert XML list structures to CSV format", icon: FileSpreadsheet },
  { name: "Properties to YAML", slug: "properties-to-yaml", category: "data", description: "Convert .properties files to YAML format", icon: FileJson },
  { name: "JSON Mock Generator", slug: "json-mock-generator", category: "data", description: "Generate realistic mock JSON data from field definitions", icon: Sparkles, popular: true },
  { name: "SOAP XML to JSON", slug: "soap-xml-to-json", category: "data", description: "Extract and convert SOAP XML responses to JSON", icon: FileJson },

  // ── Developer Tools ───────────────────────────────────────────────────────
  { name: "JWT Decoder", slug: "jwt-decoder", category: "devtools", description: "Decode and inspect JSON Web Tokens", icon: KeyRound, popular: true },
  { name: "JWT Builder", slug: "jwt-builder", category: "devtools", description: "Encode and sign JSON Web Tokens", icon: KeyRound },
  { name: "HTTP Status Lookup", slug: "http-status-lookup", category: "devtools", description: "Look up HTTP status codes and their meanings", icon: Globe, popular: true },
  { name: "User Agent Parser", slug: "user-agent-parser", category: "devtools", description: "Parse user agent strings into components", icon: Fingerprint },
  { name: "CRON Parser", slug: "cron-parser", category: "devtools", description: "Parse and explain CRON expressions", icon: Timer },
  { name: "Semver Calculator", slug: "semver-calculator", category: "devtools", description: "Parse, compare, and bump semantic versions", icon: GitBranch },
  { name: "NanoID Generator", slug: "nanoid-generator", category: "devtools", description: "Generate compact, URL-friendly unique IDs", icon: Sparkles },
  { name: "cURL Converter", slug: "curl-converter", category: "devtools", description: "Convert curl commands to fetch, Python, or Node.js", icon: Terminal, popular: true },
  { name: "Chmod Calculator", slug: "chmod-calculator", category: "devtools", description: "Calculate Unix file permissions in octal and symbolic notation", icon: FileLock2, popular: true },
  { name: "CIDR Calculator", slug: "cidr-calculator", category: "devtools", description: "Calculate CIDR ranges, subnet masks, and host counts", icon: Network, popular: true },
  { name: "Bandwidth Calculator", slug: "bandwidth-calculator", category: "devtools", description: "Calculate download time for a given file size and speed", icon: Wifi },
  { name: "API Response Viewer", slug: "api-response-viewer", category: "devtools", description: "Format and analyze API responses (JSON, XML, text)", icon: Eye, popular: true },
  { name: "JSONPath Tester", slug: "jsonpath-tester", category: "devtools", description: "Test JSONPath expressions against JSON data", icon: FileSearch, popular: true },
  { name: "GraphQL Formatter", slug: "graphql-formatter", category: "devtools", description: "Beautify and format GraphQL queries and schemas", icon: Code2 },
  { name: "Dockerfile Builder", slug: "dockerfile-builder", category: "devtools", description: "Generate Dockerfiles interactively for Node, Python, Go, Java", icon: Box, popular: true },
  { name: "DNS Record Reference", slug: "dns-record-reference", category: "devtools", description: "Reference for A, AAAA, CNAME, MX, TXT, and other DNS records", icon: Globe },
  { name: "OpenAPI Validator", slug: "openapi-validator", category: "devtools", description: "Validate OpenAPI/Swagger YAML and JSON specs", icon: ShieldCheck },

  // ── Formatters & Codegen ──────────────────────────────────────────────────
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
  { name: "JavaScript Formatter", slug: "javascript-formatter", category: "formatters", description: "Beautify and format JavaScript code", icon: Code2 },
  { name: "TypeScript Formatter", slug: "typescript-formatter", category: "formatters", description: "Beautify and format TypeScript code", icon: Code2 },
  { name: "HTML Minifier", slug: "html-minifier", category: "formatters", description: "Compress HTML by removing comments and whitespace", icon: Minimize2 },
  { name: "CSS Minifier", slug: "css-minifier", category: "formatters", description: "Compress CSS to reduce file size", icon: Minimize2 },
  { name: "XML Minifier", slug: "xml-minifier", category: "formatters", description: "Compress XML by removing whitespace and comments", icon: Minimize2 },
  { name: "SVG Minifier", slug: "svg-minifier", category: "formatters", description: "Compress and optimize SVG files", icon: Minimize2 },
  { name: "DDL Formatter", slug: "ddl-formatter", category: "formatters", description: "Format DDL statements (CREATE TABLE, ALTER TABLE)", icon: Database },

  // ── SQL Tools ─────────────────────────────────────────────────────────────
  { name: "CSV to SQL INSERT", slug: "csv-to-sql", category: "sql", description: "Convert CSV data to SQL INSERT statements for any dialect", icon: Database, popular: true },
  { name: "SQL Dialect Converter", slug: "sql-dialect-converter", category: "sql", description: "Convert DDL/queries between PostgreSQL, MySQL, SQL Server, SQLite, Oracle", icon: GitCompare, popular: true },
  { name: "SQL Data Type Reference", slug: "sql-column-mapper", category: "sql", description: "Cross-dialect data type equivalents for all major databases", icon: ListTree },

  // ── Encoding & Ciphers ────────────────────────────────────────────────────
  { name: "Number Base Converter", slug: "number-base-converter", category: "encoding", description: "Convert between binary, octal, decimal, and hexadecimal", icon: Binary, popular: true },
  { name: "Arbitrary Base Converter", slug: "arbitrary-base-converter", category: "encoding", description: "Convert numbers between any base from 2 to 36", icon: Binary },
  { name: "Roman Numeral Converter", slug: "roman-numeral-converter", category: "encoding", description: "Convert between Roman numerals and Arabic numbers", icon: Languages },
  { name: "Number to Words", slug: "number-to-words", category: "encoding", description: "Convert any number to English word representation", icon: Languages },
  { name: "Unix Timestamp Converter", slug: "unix-timestamp-converter", category: "encoding", description: "Convert between Unix epoch timestamps and readable dates", icon: Clock, popular: true },
  { name: "ROT13 & Caesar Cipher", slug: "rot13-caesar", category: "encoding", description: "Classic letter-substitution ciphers for text encoding", icon: Shuffle },
  { name: "Morse Code Translator", slug: "morse-code", category: "encoding", description: "Convert text to and from Morse code", icon: Zap },
  { name: "IP Address Converter", slug: "ip-address-converter", category: "encoding", description: "Convert IPv4 addresses between decimal, binary, and hex", icon: Network },
  { name: "Base32 Encoder/Decoder", slug: "base32-codec", category: "encoding", description: "Encode and decode Base32 strings", icon: Binary },
  { name: "Base58 Encoder/Decoder", slug: "base58-codec", category: "encoding", description: "Encode and decode Base58 (Bitcoin-style) strings", icon: Binary },
  { name: "HTML Entity Encoder", slug: "html-entity-codec", category: "encoding", description: "Encode and decode HTML entities", icon: Code2 },
  { name: "ASCII ↔ Hex", slug: "ascii-hex-converter", category: "encoding", description: "Convert ASCII characters to hex codes and back", icon: Binary },
  { name: "Binary ↔ Text", slug: "binary-text-converter", category: "encoding", description: "Convert between binary representation and text", icon: Binary },
  { name: "UTF-8 Byte Viewer", slug: "utf8-byte-viewer", category: "encoding", description: "View UTF-8 byte sequences for any text", icon: Eye },
  { name: "Braille Translator", slug: "braille-translator", category: "encoding", description: "Convert text to and from Braille Unicode characters", icon: Languages },
  { name: "Unicode Escape", slug: "unicode-escape", category: "encoding", description: "Escape and unescape Unicode sequences (\\uXXXX)", icon: Code2 },

  // ── Date & Time ───────────────────────────────────────────────────────────
  { name: "Date Difference", slug: "date-difference", category: "datetime", description: "Calculate the exact difference between two dates", icon: CalendarDays, popular: true },
  { name: "Timezone Converter", slug: "timezone-converter", category: "datetime", description: "Convert date and time across multiple world timezones", icon: Globe, popular: true },
  { name: "Workdays Calculator", slug: "workdays-calculator", category: "datetime", description: "Count business days (Mon–Fri) between two dates", icon: CalendarDays },
  { name: "Leap Year Checker", slug: "leap-year-checker", category: "datetime", description: "Check if a year is a leap year", icon: CalendarDays },
  { name: "Countdown Timer", slug: "countdown-timer", category: "datetime", description: "Browser-based countdown timer and stopwatch", icon: AlarmClock },
  { name: "Date Add/Subtract", slug: "date-add-subtract", category: "datetime", description: "Add or subtract days, months, years from any date", icon: CalendarDays },
  { name: "Time Format Converter", slug: "time-format-converter", category: "datetime", description: "Convert between seconds, HH:MM:SS, minutes, and hours", icon: Clock },

  // ── CSS & Design ──────────────────────────────────────────────────────────
  { name: "CSS Box Shadow", slug: "css-box-shadow", category: "cssdesign", description: "Build single or multi-layer CSS box shadows visually", icon: Layers, popular: true },
  { name: "WCAG Contrast Checker", slug: "wcag-contrast-checker", category: "cssdesign", description: "Check color contrast against WCAG 2.1 AA and AAA standards", icon: Contrast, popular: true },
  { name: "PX to REM Converter", slug: "px-to-rem", category: "cssdesign", description: "Convert pixel values to REM units with a configurable base", icon: AlignCenter },
  { name: "HTML Table Generator", slug: "html-table-generator", category: "cssdesign", description: "Build and preview HTML tables visually with editable cells", icon: LayoutGrid },
  { name: "CSS Border Radius", slug: "css-border-radius", category: "cssdesign", description: "Build CSS border radius shapes visually", icon: Square },
  { name: "CSS Text Shadow", slug: "css-text-shadow", category: "cssdesign", description: "Generate CSS text shadows with live preview", icon: Type },
  { name: "CSS Glassmorphism", slug: "css-glassmorphism", category: "cssdesign", description: "Generate CSS glassmorphism effect code", icon: Layers },
  { name: "CSS Transform", slug: "css-transform", category: "cssdesign", description: "Build CSS transform (rotate, scale, skew) visually", icon: RefreshCw },
  { name: "CSS Flexbox", slug: "css-flexbox", category: "cssdesign", description: "Build and preview CSS flexbox layouts interactively", icon: Rows },
  { name: "CSS Grid", slug: "css-grid", category: "cssdesign", description: "Build and preview CSS grid layouts interactively", icon: LayoutGrid },
  { name: "CSS Filter", slug: "css-filter", category: "cssdesign", description: "Generate CSS filter effects (blur, brightness, contrast…)", icon: Sliders },
  { name: "CSS Clip Path", slug: "css-clip-path", category: "cssdesign", description: "Generate CSS clip-path polygon shapes", icon: Triangle },
  { name: "CSS Animation Builder", slug: "css-animation-builder", category: "cssdesign", description: "Build CSS keyframe animations with live preview", icon: Zap },
  { name: "CSS Scrollbar", slug: "css-scrollbar", category: "cssdesign", description: "Generate custom CSS scrollbar styles", icon: Sliders },
  { name: "CSS Triangle", slug: "css-triangle", category: "cssdesign", description: "Generate CSS triangle shapes using borders", icon: Triangle },
  { name: "Color Converter", slug: "color-converter", category: "cssdesign", description: "Convert between HEX, RGB, HSL, HSV, and CMYK", icon: Palette, popular: true },
  { name: "Color Math", slug: "color-math", category: "cssdesign", description: "Mix, lighten, darken, and complement colors", icon: Blend },
  { name: "Color Blindness Simulator", slug: "color-blindness-simulator", category: "cssdesign", description: "Simulate how colors appear with different vision types", icon: Eye },
  { name: "Mesh Gradient Generator", slug: "mesh-gradient", category: "cssdesign", description: "Generate CSS mesh gradient backgrounds", icon: Blend, popular: true },
  { name: "Tailwind Color Picker", slug: "tailwind-color-picker", category: "cssdesign", description: "Browse and copy all Tailwind CSS color values", icon: Palette },
  { name: "Color Palette Generator", slug: "color-palette-generator", category: "cssdesign", description: "Generate tints, shades, and harmonic color palettes", icon: Palette, popular: true },
  { name: "Color Safe Palette", slug: "color-safe-palette", category: "cssdesign", description: "Generate WCAG-compliant accessible color palettes", icon: ShieldCheck },
  { name: "SVG to CSS", slug: "svg-to-css", category: "cssdesign", description: "Convert SVG code to CSS background-image data URI", icon: Code2 },

  // ── Web Standards ─────────────────────────────────────────────────────────
  { name: "Open Graph Generator", slug: "open-graph-generator", category: "webstandards", description: "Generate Open Graph and Twitter Card meta tags", icon: MonitorSmartphone, popular: true },
  { name: "robots.txt Generator", slug: "robots-txt-generator", category: "webstandards", description: "Build a robots.txt file with allow/disallow rules", icon: Globe, popular: true },
  { name: "CORS Header Generator", slug: "cors-header-generator", category: "webstandards", description: "Generate CORS headers for Nginx, Express, Apache", icon: Shield },
  { name: "CSP Header Generator", slug: "csp-header-generator", category: "webstandards", description: "Build a Content Security Policy header", icon: ShieldCheck },
  { name: ".htaccess Generator", slug: "htaccess-generator", category: "webstandards", description: "Generate Apache .htaccess for redirects, caching, security", icon: Settings2 },
  { name: ".htpasswd Generator", slug: "htpasswd-generator", category: "webstandards", description: "Generate .htpasswd entries for HTTP Basic Authentication", icon: Lock },
  { name: "Sitemap Generator", slug: "sitemap-generator", category: "webstandards", description: "Generate XML sitemaps from URL lists", icon: Globe },
  { name: "ARIA Roles Reference", slug: "aria-roles-reference", category: "webstandards", description: "Complete reference for ARIA roles and accessibility attributes", icon: Accessibility },
  { name: "WCAG Reference", slug: "wcag-reference", category: "webstandards", description: "WCAG 2.1 guidelines reference with A, AA, AAA levels", icon: ShieldCheck },
  { name: "HTTP Status Codes", slug: "http-status-codes-reference", category: "webstandards", description: "Complete reference for all HTTP status codes", icon: Globe },

  // ── Reference ─────────────────────────────────────────────────────────────
  { name: "ASCII Table", slug: "ascii-table", category: "reference", description: "Complete ASCII character code reference table", icon: Hash },
  { name: "HTML Entities Reference", slug: "html-entities-reference", category: "reference", description: "HTML entity codes and special character reference", icon: Code2 },
  { name: "HTTP Headers Reference", slug: "http-headers-reference", category: "reference", description: "Reference for HTTP request and response headers", icon: Globe },
  { name: "MIME Types Reference", slug: "mime-types-reference", category: "reference", description: "Common MIME types reference list", icon: FileText },
  { name: "Unicode Table", slug: "unicode-table", category: "reference", description: "Browse Unicode character blocks and copy characters", icon: Languages, popular: true },
  { name: "Unicode Character Lookup", slug: "unicode-char-lookup", category: "reference", description: "Look up Unicode characters by code point", icon: Search },
  { name: "Invisible Char Detector", slug: "invisible-char-detector", category: "reference", description: "Detect zero-width and invisible Unicode characters", icon: Eye },
  { name: "Developer Cheatsheets", slug: "developer-cheatsheets", category: "reference", description: "Quick-reference cheatsheets for Git, Linux, Vim, Regex, Docker", icon: BookOpen, popular: true },
  { name: "DNS Record Reference", slug: "dns-record-reference-ref", category: "reference", description: "Reference for A, AAAA, CNAME, MX, TXT, and other DNS records", icon: Network },

  // ── Image Tools ────────────────────────────────────────────────────────────
  { name: "EXIF Viewer", slug: "exif-viewer", category: "image", description: "View EXIF metadata from JPEG images in your browser", icon: Eye, popular: true },
  { name: "Color Picker from Image", slug: "color-picker-from-image", category: "image", description: "Upload an image and click any pixel to pick its color", icon: Palette, popular: true },
  { name: "Color Palette from Image", slug: "color-palette-from-image", category: "image", description: "Extract dominant color palette from any image", icon: Palette },
  { name: "SVG to PNG Converter", slug: "svg-to-png", category: "image", description: "Convert SVG code to PNG at any scale", icon: Image },
  { name: "Image Resizer", slug: "image-resizer", category: "image", description: "Resize and compress images in the browser", icon: Image, popular: true },

  // ── PDF Tools ──────────────────────────────────────────────────────────────
  { name: "Merge PDF", slug: "merge-pdf", category: "pdf", description: "Combine multiple PDFs into one file, in order", icon: Layers, popular: true },
  { name: "Split PDF", slug: "split-pdf", category: "pdf", description: "Extract selected pages or ranges into a new PDF", icon: Rows, popular: true },
  { name: "Images to PDF", slug: "images-to-pdf", category: "pdf", description: "Convert JPG and PNG images into a single PDF", icon: ImagePlus },
  { name: "PDF to Images", slug: "pdf-to-images", category: "pdf", description: "Render each PDF page as a downloadable PNG", icon: Image },
  { name: "Rotate PDF", slug: "rotate-pdf", category: "pdf", description: "Rotate all pages by 90, 180, or 270 degrees", icon: RefreshCw },
  { name: "Watermark PDF", slug: "watermark-pdf", category: "pdf", description: "Stamp a text watermark across every page", icon: FileSignature },
  { name: "PDF Page Numbers", slug: "pdf-page-numbers", category: "pdf", description: "Add page numbers in any corner or center", icon: Hash },
  { name: "PDF Metadata Editor", slug: "pdf-metadata", category: "pdf", description: "View and edit PDF title, author, and keywords", icon: Tag },
  { name: "PDF Text Extractor", slug: "pdf-text-extract", category: "pdf", description: "Extract selectable text from PDFs page by page", icon: FileSearch },

  // ── OCR & Documents ────────────────────────────────────────────────────────
  { name: "Image to Text (OCR)", slug: "image-ocr", category: "ocr", description: "Extract text from photos and screenshots in 12 languages", icon: ScanLine, popular: true },
  { name: "PDF OCR", slug: "pdf-ocr", category: "ocr", description: "Recognize text in scanned PDFs, page by page", icon: FileSearch, popular: true },
];
