import { Search } from "lucide-react";

type Props = { toolCount: number; categoryCount: number; query: string; onQuery: (query: string) => void; onExplore: (term: string) => void };

export function HomeHero({ toolCount, categoryCount, query, onQuery, onExplore }: Props) {
  return (
    <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent p-6 md:p-10 ">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Everyday tasks, made easier</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">What do you need<br />to <span className="text-primary">get done?</span></h1>
      <p className="text-muted-foreground mt-5 mb-6">Find your next tool among {toolCount} tools across {categoryCount} categories.</p>
      <div className="flex items-center gap-3 rounded-xl border bg-background p-4 max-w-2xl shadow-sm">
        <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <input type="search" aria-label="Search the tool catalogue" placeholder="Try image compression, PDF, contacts or SQL…" value={query} onChange={event => onQuery(event.target.value)} className="w-full min-w-0 bg-transparent text-base outline-offset-4" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm"><span className="text-muted-foreground">Explore:</span>{["Image", "PDF", "Contacts", "SQL"].map(term => <button key={term} onClick={() => onExplore(term)} className="rounded-full border border-primary/20 bg-background/70 px-3 py-1 hover:bg-background">{term}</button>)}</div>
    </section>
  );
}
