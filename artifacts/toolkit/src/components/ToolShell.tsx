import {ToolTerms} from '@/components/ToolTerms';
import { usePreferences } from '@/hooks/use-preferences';
import { ToolGuide } from "@/components/ToolGuide";
import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { TOOLS, CATEGORIES } from "@/lib/tools-registry";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface ToolShellProps {
  children: React.ReactNode;
}

export function ToolShell({ children }: ToolShellProps) {
  const content=useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const {preferences,toggleFavorite}=usePreferences();
  const { firebaseUser } = useAuth();
  const slug = location.replace("/tools/", "");
  const tool = TOOLS.find(t => t.slug === slug);
  const category = tool ? CATEGORIES.find(c => c.slug === tool.category) : undefined;

  useEffect(() => {
    if (!tool || import.meta.env.VITE_ENABLE_USAGE_TRACKING !== "true") return;
    (async () => {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (firebaseUser) {
          headers.Authorization = `Bearer ${await firebaseUser.getIdToken()}`;
        }
        await fetch(apiUrl("usage"), {
          method: "POST",
          headers,
          body: JSON.stringify({ toolSlug: tool.slug }),
        });
      } catch {
        /* usage tracking is best-effort */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.slug]);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 animate-in fade-in duration-300">
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

      {tool?.category === "ai" && <p className="rounded-lg border p-4 text-sm">Backend · 3 free AI credits per account, shared across AI tools. <Link href="/subscriptions" className="underline">View subscriptions</Link>. Submitting sends your text to our server and configured AI provider. Avoid confidential information. AI output can be incorrect; check it against your source.</p>}
      {tool&&<Button variant="outline" aria-pressed={preferences.favorites.includes(tool.slug)} onClick={()=>toggleFavorite(tool.slug)}>{preferences.favorites.includes(tool.slug)?'★ Saved to favourites':'☆ Add to favourites'}</Button>}
      {tool&&<ToolTerms content={content} name={tool.name}/>}
      <div ref={content} className="space-y-4">{children}
      {tool && <ToolGuide tool={tool} />}</div>
    </div>
  );
}


