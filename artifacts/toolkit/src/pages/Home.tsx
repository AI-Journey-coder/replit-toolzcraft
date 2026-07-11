import { Link } from "wouter";
import { CATEGORIES, TOOLS } from "@/lib/tools-registry";
import { ToolCard } from "@/components/ToolCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { useScrollRestore } from "@/hooks/useScrollRestore";

const POPULAR = TOOLS.filter(t => t.popular).slice(0, 8);

export function Home() {
  useScrollRestore("home");
  const [search, setSearch] = useState("");
  const filteredTools = search
    ? TOOLS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="text-center space-y-6 max-w-2xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Precision tools for <span className="text-primary">every task.</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          No login. No ads. Just instant, reliable utilities running directly in your browser.
        </p>
      </section>

      {search ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Search Results</h2>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-mono">No tools found matching "{search}"</div>
          )}
        </section>
      ) : (
        <>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                const count = TOOLS.filter(t => t.category === category.slug).length;
                return (
                  <Link key={category.slug} href={`/category/${category.slug}`}>
                    <Card className="hover:border-primary hover:shadow-sm transition-all cursor-pointer group h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <div className="p-2 bg-muted rounded-md text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-mono bg-muted px-2 py-1 rounded-full text-muted-foreground">{count}</span>
                        </div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Popular Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {POPULAR.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
