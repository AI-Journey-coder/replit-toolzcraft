import { Link, useLocation } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { TOOLS, CATEGORIES } from "@/lib/tools-registry";
import { Button } from "@/components/ui/button";

interface ToolShellProps {
  children: React.ReactNode;
}

export function ToolShell({ children }: ToolShellProps) {
  const [location] = useLocation();
  const slug = location.replace("/tools/", "");
  const tool = TOOLS.find(t => t.slug === slug);
  const category = tool ? CATEGORIES.find(c => c.slug === tool.category) : undefined;

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/">
          <span className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
            <Home className="h-3.5 w-3.5" />
            Home
          </span>
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/category/${category.slug}`}>
              <span className="hover:text-foreground transition-colors cursor-pointer">{category.name}</span>
            </Link>
          </>
        )}
        {tool && (
          <>
            <span>/</span>
            <span className="text-foreground font-medium">{tool.name}</span>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2 h-8 text-muted-foreground hover:text-foreground"
        onClick={handleBack}
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>

      {children}
    </div>
  );
}
