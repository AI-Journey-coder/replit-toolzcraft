import { Link } from "wouter";
import { TOOLS, CATEGORIES } from "@/lib/tools-registry";
import {
  ArrowRight, Shield, Zap, Lock, Globe, Star,
  DollarSign, KeyRound, Palette, Database, Code2, Braces
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";

const STATS = [
  { value: `${TOOLS.length}+`, label: "Browser tools" },
  { value: `${CATEGORIES.length}`, label: "Categories" },
  { value: "0", label: "Logins needed" },
  { value: "100%", label: "Client-side" },
];

const FEATURED = [
  {
    slug: "currency-converter",
    icon: DollarSign,
    name: "Currency Converter",
    tagline: "Live rates, 50+ currencies",
    desc: "Real-time exchange rates fetched fresh — convert any amount across major world currencies with a searchable table.",
    badge: "Live data",
    color: "from-green-500/20 to-emerald-500/5",
    border: "border-green-500/30",
  },
  {
    slug: "jwt-decoder",
    icon: KeyRound,
    name: "JWT Decoder",
    tagline: "Inspect tokens instantly",
    desc: "Paste any JSON Web Token and see its header, payload, and signature decoded in a readable format — great for debugging auth flows.",
    badge: "Dev favourite",
    color: "from-blue-500/20 to-indigo-500/5",
    border: "border-blue-500/30",
  },
  {
    slug: "color-picker",
    icon: Palette,
    name: "Color Picker",
    tagline: "HEX · RGB · HSL · harmonies",
    desc: "Pick any color and instantly get all its formats plus complementary, triadic, and analogous color harmony suggestions.",
    badge: "Designer pick",
    color: "from-purple-500/20 to-pink-500/5",
    border: "border-purple-500/30",
  },
  {
    slug: "sql-dialect-converter",
    icon: Database,
    name: "SQL Dialect Converter",
    tagline: "PostgreSQL ↔ MySQL ↔ T-SQL",
    desc: "Convert DDL and queries between five major SQL dialects. Handles type mapping, quoting styles, AUTO_INCREMENT, SERIAL, and more.",
    badge: "New",
    color: "from-orange-500/20 to-yellow-500/5",
    border: "border-orange-500/30",
  },
  {
    slug: "json-validator",
    icon: Braces,
    name: "JSON Validator",
    tagline: "Precise, pinpointed errors",
    desc: "Paste any JSON and get exact line-by-line error messages with suggestions — no more hunting for a missing comma.",
    badge: "Most used",
    color: "from-cyan-500/20 to-sky-500/5",
    border: "border-cyan-500/30",
  },
  {
    slug: "regex-tester",
    icon: Code2,
    name: "Regex Tester",
    tagline: "Live match highlighting",
    desc: "Write a regex and see every match highlighted in real time across your test string, with group capture details.",
    badge: "Popular",
    color: "from-rose-500/20 to-red-500/5",
    border: "border-rose-500/30",
  },
];

const WHY = [
  {
    icon: Zap,
    title: "Instant results",
    desc: "Every tool runs directly in your browser. No round-trips to a server — results appear as you type.",
  },
  {
    icon: Lock,
    title: "Private by design",
    desc: "Your data never leaves your device. Zero retention, zero telemetry, zero account required.",
  },
  {
    icon: Shield,
    title: "No bloat, no ads",
    desc: "Clean interfaces focused on getting the job done, not on SEO tricks or cookie banners.",
  },
  {
    icon: Globe,
    title: "Works offline",
    desc: "Once the page loads, most tools work without an internet connection — even on a plane.",
  },
];

export function Promo() {
  return (
    <div className="min-h-screen space-y-0">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative text-center py-24 px-4 overflow-hidden">
        {/* gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="flex justify-center mb-8">
          <Logo size={72} />
        </div>

        <Badge variant="secondary" className="mb-6 font-mono text-xs px-3 py-1 gap-1.5">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          {TOOLS.length}+ free browser tools
        </Badge>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
          Craft better work<br />
          <span className="text-primary">with the right tool.</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          ToolzCraft is a privacy-first utility platform — {TOOLS.length} browser tools across {CATEGORIES.length} categories.
          No login. No ads. Just precision instruments at your fingertips.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 text-base px-8 h-12">
              Explore all tools <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tools/json-validator">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12">
              Try JSON Validator
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.label} className="space-y-1">
                <div className="text-4xl font-black text-primary font-mono">{s.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured tools ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Tools people <span className="text-primary">actually love</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Picked from the most-used tools in every category. Each one solves a real problem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map(({ slug, icon: Icon, name, tagline, desc, badge, color, border }) => (
            <Link key={slug} href={`/tools/${slug}`}>
              <div className={`group relative rounded-xl border ${border} bg-gradient-to-br ${color} p-6 h-full hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-background/80 border border-border/50">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono">{badge}</Badge>
                </div>
                <h3 className="text-lg font-bold mb-1">{name}</h3>
                <p className="text-xs font-mono text-primary mb-3">{tagline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open tool <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why ToolzCraft ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Why <span className="text-primary">ToolzCraft?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built for developers, designers, and power users who care about speed and privacy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {WHY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-3 p-6">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category grid ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            {CATEGORIES.length} categories, <span className="text-primary">one platform</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From finance calculators to SQL converters — everything in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
          {CATEGORIES.map(cat => {
            const count = TOOLS.filter(t => t.category === cat.slug).length;
            const Icon = cat.icon;
            return (
              <Link key={cat.slug} href={`/category/${cat.slug}`}>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-muted/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-sm font-medium group">
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{cat.name}</span>
                  <span className="text-xs font-mono text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded-full">{count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-40 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 space-y-6 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Ready to get things done?
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything is free, forever. No account, no credit card, no catch.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2 text-base px-10 h-13">
              Start using ToolzCraft <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
