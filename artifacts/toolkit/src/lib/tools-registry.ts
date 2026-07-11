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
} from "lucide-react";

export type CategorySlug =
  | "finance" | "converters" | "code" | "text" | "math" | "security"
  | "webdev" | "data" | "devtools" | "formatters" | "sql"
  | "encoding" | "datetime" | "cssdesign" | "webstandards";

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
  { name: "Text Diff", slug: "text-diff", category: "text", description: "Compare two texts and highlight line-by-line differences", icon: Diff, popular: true },
  { name: "Find & Replace", slug: "find-replace", category: "text", description: "Find and replace text with optional regex support", icon: Search },
  { name: "Line Sorter", slug: "line-sorter", category: "text", description: "Sort and deduplicate lines alphabetically", icon: AlignJustify },
  { name: "Slug Generator", slug: "slug-generator", category: "text", description: "Generate URL-friendly slugs from any text", icon: Link },
  { name: "Extract Emails & URLs", slug: "extract-emails-urls", category: "text", description: "Extract email addresses and URLs from a block of text", icon: Search, popular: true },
  { name: "URL Parser", slug: "url-parser", category: "text", description: "Break down a URL into its individual components", icon: Link },
  { name: "Token Counter", slug: "token-counter", category: "text", description: "Count approximate tokens for LLM context windows", icon: Cpu, popular: true },
  { name: "NATO Phonetic Alphabet", slug: "nato-phonetic", category: "text", description: "Convert text to the NATO phonetic alphabet", icon: Languages },
  { name: "Text Transformer", slug: "text-transform", category: "text", description: "Reverse, repeat, or clean whitespace from text", icon: Shuffle },

  // Math
  { name: "Percentage Calculator", slug: "percentage-calculator", category: "math", description: "Calculate percentages three different ways", icon: Percent },
  { name: "Scientific Calculator", slug: "scientific-calculator", category: "math", description: "Advanced calculations with trig and logarithms", icon: Calculator, popular: true },
  { name: "Prime Checker", slug: "prime-checker", category: "math", description: "Check primality, find factors, and next prime", icon: Hash },
  { name: "GCD & LCM Calculator", slug: "gcd-lcm-calculator", category: "math", description: "Greatest common divisor and least common multiple", icon: Calculator },

  // Security
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

  // Web Dev
  { name: "Color Picker", slug: "color-picker", category: "webdev", description: "Pick colors and get HEX, RGB, HSL with harmonies", icon: Palette, popular: true },
  { name: "CSS Gradient", slug: "css-gradient", category: "webdev", description: "Build linear or radial gradients visually", icon: Blend },
  { name: "Image to Base64", slug: "image-to-base64", category: "webdev", description: "Convert images to Base64 encoded strings", icon: ImagePlus },
  { name: "Meta Tag Generator", slug: "meta-tag-generator", category: "webdev", description: "Generate SEO and social sharing meta tags", icon: Tag },
  { name: "QR Code Generator", slug: "qr-code-generator", category: "webdev", description: "Generate QR codes from any URL or text with custom colors", icon: QrCode, popular: true },

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
  { name: "Chmod Calculator", slug: "chmod-calculator", category: "devtools", description: "Calculate Unix file permissions in octal and symbolic notation", icon: FileLock2, popular: true },
  { name: "CIDR Calculator", slug: "cidr-calculator", category: "devtools", description: "Calculate CIDR ranges, subnet masks, and host counts", icon: Network, popular: true },
  { name: "Bandwidth Calculator", slug: "bandwidth-calculator", category: "devtools", description: "Calculate download time for a given file size and speed", icon: Wifi },

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

  // SQL Tools
  { name: "CSV to SQL INSERT", slug: "csv-to-sql", category: "sql", description: "Convert CSV data to SQL INSERT statements for any dialect", icon: Database, popular: true },
  { name: "SQL Dialect Converter", slug: "sql-dialect-converter", category: "sql", description: "Convert DDL/queries between PostgreSQL, MySQL, SQL Server, SQLite, Oracle", icon: GitCompare, popular: true },
  { name: "SQL Data Type Reference", slug: "sql-column-mapper", category: "sql", description: "Cross-dialect data type equivalents for all major databases", icon: ListTree },

  // Encoding & Ciphers
  { name: "Number Base Converter", slug: "number-base-converter", category: "encoding", description: "Convert between binary, octal, decimal, and hexadecimal", icon: Binary, popular: true },
  { name: "Arbitrary Base Converter", slug: "arbitrary-base-converter", category: "encoding", description: "Convert numbers between any base from 2 to 36", icon: Binary },
  { name: "Roman Numeral Converter", slug: "roman-numeral-converter", category: "encoding", description: "Convert between Roman numerals and Arabic numbers", icon: Languages },
  { name: "Number to Words", slug: "number-to-words", category: "encoding", description: "Convert any number to English word representation", icon: Languages },
  { name: "Unix Timestamp Converter", slug: "unix-timestamp-converter", category: "encoding", description: "Convert between Unix epoch timestamps and readable dates", icon: Clock, popular: true },
  { name: "ROT13 & Caesar Cipher", slug: "rot13-caesar", category: "encoding", description: "Classic letter-substitution ciphers for text encoding", icon: Shuffle },
  { name: "Morse Code Translator", slug: "morse-code", category: "encoding", description: "Convert text to and from Morse code", icon: Zap },
  { name: "IP Address Converter", slug: "ip-address-converter", category: "encoding", description: "Convert IPv4 addresses between decimal, binary, and hex", icon: Network },

  // Date & Time
  { name: "Date Difference", slug: "date-difference", category: "datetime", description: "Calculate the exact difference between two dates", icon: CalendarDays, popular: true },
  { name: "Timezone Converter", slug: "timezone-converter", category: "datetime", description: "Convert date and time across multiple world timezones", icon: Globe, popular: true },
  { name: "Workdays Calculator", slug: "workdays-calculator", category: "datetime", description: "Count business days (Mon–Fri) between two dates", icon: CalendarDays },
  { name: "Leap Year Checker", slug: "leap-year-checker", category: "datetime", description: "Check if a year is a leap year", icon: CalendarDays },
  { name: "Countdown Timer", slug: "countdown-timer", category: "datetime", description: "Browser-based countdown timer and stopwatch", icon: AlarmClock },

  // CSS & Design
  { name: "CSS Box Shadow", slug: "css-box-shadow", category: "cssdesign", description: "Build single or multi-layer CSS box shadows visually", icon: Layers, popular: true },
  { name: "WCAG Contrast Checker", slug: "wcag-contrast-checker", category: "cssdesign", description: "Check color contrast against WCAG 2.1 AA and AAA standards", icon: Contrast, popular: true },
  { name: "PX to REM Converter", slug: "px-to-rem", category: "cssdesign", description: "Convert pixel values to REM units with a configurable base", icon: AlignCenter },
  { name: "HTML Table Generator", slug: "html-table-generator", category: "cssdesign", description: "Build and preview HTML tables visually with editable cells", icon: LayoutGrid },
  { name: "Open Graph Generator", slug: "open-graph-generator", category: "webstandards", description: "Generate Open Graph and Twitter Card meta tags", icon: MonitorSmartphone, popular: true },

  // Web Standards
  { name: "robots.txt Generator", slug: "robots-txt-generator", category: "webstandards", description: "Build a robots.txt file with allow/disallow rules", icon: Globe, popular: true },
  { name: "CORS Header Generator", slug: "cors-header-generator", category: "webstandards", description: "Generate CORS headers for Nginx, Express, Apache", icon: Shield },
  { name: "CSP Header Generator", slug: "csp-header-generator", category: "webstandards", description: "Build a Content Security Policy header", icon: ShieldCheck },
  { name: ".htaccess Generator", slug: "htaccess-generator", category: "webstandards", description: "Generate Apache .htaccess for redirects, caching, security", icon: Settings2 },
];
