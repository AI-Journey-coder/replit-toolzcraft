import {
  AppWindow, Calculator, Code2, Coins, FileText, Lock, Scale,
  Hash, Key, Percent, TrendingUp, Thermometer, Zap, Square,
  FlaskConical, Diff, Minimize2, Database, Type, AlignLeft, AlignJustify,
  Palette, Blend, ImagePlus, Tag, ReceiptText, TrendingDown, PiggyBank
} from "lucide-react";

export type CategorySlug = "finance" | "converters" | "code" | "text" | "math" | "security" | "webdev";

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
];
