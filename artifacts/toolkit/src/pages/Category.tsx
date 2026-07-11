import { useParams } from "wouter";
import { CATEGORIES, TOOLS } from "@/lib/tools-registry";
import { ToolCard } from "@/components/ToolCard";
import NotFound from "@/pages/not-found";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import { Link } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoryPage() {
  const { slug } = useParams();
  useScrollRestore(`category:${slug}`);
  const category = CATEGORIES.find(c => c.slug === slug);
  const categoryTools = TOOLS.filter(t => t.category === slug);

  if (!category) return <NotFound />;

  const Icon = category.icon;

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) window.history.back();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/">
          <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
            <Home className="h-3.5 w-3.5" />
            Home
          </span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{category.name}</span>
      </div>

      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 h-8 text-muted-foreground hover:text-foreground" onClick={handleBack}>
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-1">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categoryTools.map(tool => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {categoryTools.length === 0 && (
        <div className="text-center py-20 font-mono text-muted-foreground">
          More tools coming soon to this category.
        </div>
      )}
    </div>
  );
}
