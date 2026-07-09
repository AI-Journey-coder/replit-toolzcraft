import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Moon, Sun, Search, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold font-mono text-lg tracking-tight hover:text-primary transition-colors">
            <Wrench className="h-5 w-5" />
            <span>ToolKit Pro</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tools..."
                className="pl-9 h-9 w-full bg-muted/50 border-none font-mono text-xs focus-visible:ring-1 focus-visible:bg-background"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9" data-testid="button-theme-toggle">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-mono">
          <p>ToolKit Pro &copy; {new Date().getFullYear()}. Precision instruments for the web.</p>
        </div>
      </footer>
    </div>
  );
}
