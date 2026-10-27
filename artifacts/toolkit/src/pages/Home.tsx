import { WorkflowGuide } from "@/components/ToolGuide";
import { searchTools } from '@/lib/tool-search';
import { useState } from "react";
import { Link } from "wouter";
import { CATEGORIES, TOOLS } from "@/lib/tools-registry";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useScrollRestore } from "@/hooks/useScrollRestore";

const FEATURED = ["image-compressor", "pdf-compressor", "ctc-calculator", "contacts-converter", "sql-dialect-converter", "money-value-calculator"].flatMap(slug => TOOLS.filter(tool => tool.slug === slug));

export function Home() {
  useScrollRestore("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = searchTools(TOOLS, query).filter(tool => !category || tool.category === category);
  const groups = CATEGORIES.map(item => ({ ...item, tools: filtered.filter(tool => tool.category === item.slug) })).filter(item => item.tools.length);
  const searching = terms.length > 0 || !!category;
  const allExpanded = groups.length > 0 && groups.every(group => expanded.includes(group.slug));
  function reset() { setQuery(""); setCategory(""); }

  return <div className="space-y-9 min-w-0">
    <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent p-6 md:p-10 ">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Everyday tasks, made easier</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">What do you need<br />to <span className="text-primary">get done?</span></h1>
      <p className="text-muted-foreground mt-5 mb-6">Find your next tool among {TOOLS.length} tools across {CATEGORIES.length} categories.</p>
      <div className="flex items-center gap-3 rounded-xl border bg-background p-4 max-w-2xl shadow-sm">
        <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <input type="search" aria-label="Search the tool catalogue" placeholder="Try image compression, PDF, contacts or SQL…" value={query} onChange={event => setQuery(event.target.value)} className="w-full min-w-0 bg-transparent text-base outline-offset-4" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm"><span className="text-muted-foreground">Explore:</span>{["Image", "PDF", "Contacts", "SQL"].map(term => <button key={term} onClick={() => { setQuery(term); setCategory(""); }} className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 hover:bg-background">{term}</button>)}</div>
    </section>
    {!searching && <section aria-labelledby="essentials-heading" className="space-y-4"><div><p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">A useful place to start</p><h2 id="essentials-heading" className="text-2xl font-bold">Everyday essentials</h2></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{FEATURED.map(tool => <ToolCard key={tool.slug} tool={tool} />)}</div></section>}
    {!searching && <WorkflowGuide />}
    <section aria-labelledby="directory-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4"><h2 id="directory-heading" className="text-2xl font-bold">{searching ? "Matching tools" : "Browse all tools"}</h2><label className="flex flex-wrap items-center gap-2 text-sm">Category<select aria-label="Filter tools by category" value={category} onChange={event => setCategory(event.target.value)} className="max-w-full rounded-lg border bg-background p-2"><option value="">All categories</option>{CATEGORIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label></div>
      <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "tool" : "tools"} in {groups.length} {groups.length === 1 ? "category" : "categories"}</p>{searching ? <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button> : <Button variant="ghost" size="sm" onClick={() => setExpanded(allExpanded ? [] : groups.map(group => group.slug))}>{allExpanded ? "Collapse all categories" : "Expand all categories"}</Button>}</div>
      {filtered.length === 0 ? <div className="rounded-xl border p-8 text-center"><p>No tools match your search. Try a shorter phrase or another category.</p><Button className="mt-4" variant="outline" onClick={reset}>Show all tools</Button></div> : searching ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(tool => <ToolCard key={tool.slug} tool={tool} />)}</div> : <div className="space-y-3">{groups.map(group => {
        const Icon = group.icon;
        const open = expanded.includes(group.slug);
        return <div key={group.slug} className="rounded-xl border bg-card"><h3><button type="button" aria-expanded={open} aria-controls={`home-category-${group.slug}`} onClick={() => setExpanded(previous => previous.includes(group.slug) ? previous.filter(slug => slug !== group.slug) : [...previous, group.slug])} className="flex w-full items-center gap-3 p-5 text-left font-semibold"><Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" /><span>{group.name}</span><span className="ml-auto text-sm font-normal text-muted-foreground">{group.tools.length}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button></h3><div id={`home-category-${group.slug}`} hidden={!open} className="px-5 pb-5"><p className="text-sm text-muted-foreground mb-3">{group.description}</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{group.tools.map(tool => <Link key={tool.slug} href={`/tools/${tool.slug}`} className="rounded-md p-2 text-sm hover:bg-muted hover:underline">{tool.name}{tool.category==='ai'?' · Backend · 3 free AI credits':''}</Link>)}</div></div></div>;
      })}</div>}
    </section>
    <section className="border-t pt-6 text-sm"><h2 className="font-semibold">Know how your data is handled</h2><p className="text-muted-foreground mt-1">Most tools process files in your browser. AI tools send submitted content to a server and AI provider; currency and purchasing-power tools fetch public data. Check each tool’s explanation before using sensitive information.</p><Link href="/privacy" className="inline-block mt-3 underline underline-offset-4">Read our privacy policy</Link></section>
  </div>;
}

