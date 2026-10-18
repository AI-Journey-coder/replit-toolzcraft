import {preferredDate} from '@/lib/display-units';
import { usePreferences } from '@/hooks/use-preferences';
import { searchTools } from '@/lib/tool-search';
import { ToolSidebar } from '@/components/ToolSidebar';
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Search, LogIn, LogOut, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogoWordmark } from "@/components/Logo";
import { TOOLS } from "@/lib/tools-registry";
import { useAuth } from "@/hooks/use-auth";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { preferences } = usePreferences();
  const [theme, setTheme] = useState<"light" | "dark">(() => { try { return localStorage.getItem('toolzcraft.color-mode') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } });
  const [, navigate] = useLocation();
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.dataset.palette = preferences.palette;
    try { localStorage.setItem('toolzcraft.color-mode', theme); } catch { /* Theme still works for this session. */ }
  }, [theme, preferences.palette]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const filteredTools = search.trim()
    ? searchTools(TOOLS, search).slice(0, 8)
    : [];

  const handleSelect = (slug: string) => {
    navigate(`/tools/${slug}`);
    setSearch("");
    setShowResults(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex min-h-14 w-full flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-6">
          <div className="flex items-center gap-2"><Button variant="ghost" className="lg:hidden" aria-expanded={sidebarOpen} aria-controls="mobile-tool-directory" onClick={()=>setSidebarOpen(v=>!v)}>Tools</Button><Link href="/" aria-label="ToolzCraft home" className="hover:opacity-80 transition-opacity">
            <LogoWordmark />
          </Link></div>

          <div className="flex max-w-full flex-wrap items-center gap-2"><Link href="/my-tools" className="text-sm hover:underline">My tools</Link> <Link href="/subscriptions" className="text-sm font-medium text-primary hover:underline" data-testid="link-subscriptions">Subscriptions</Link>
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tools..."
                className="pl-9 h-9 w-full bg-muted/50 border-none font-sans text-xs focus-visible:ring-1 focus-visible:bg-background"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
              />
              {showResults && filteredTools.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
                  {filteredTools.map(t => (
                    <button
                      key={t.slug}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex flex-col gap-0.5"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => handleSelect(t.slug)}
                    >
                      <span className="font-medium">{t.name}</span>{t.category==='ai'&&<span className="text-xs text-primary">Backend · 3 free AI credits</span>}
                      <span className="text-xs text-muted-foreground line-clamp-1">{t.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="hidden md:flex text-xs font-sans text-muted-foreground hover:text-foreground">
                About
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle light or dark theme" className="h-9 w-9" data-testid="button-theme-toggle">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <AuthButtons />
          </div>
        </div>
      </header>

      <a href="#main-content" className="sr-only focus:not-sr-only focus:p-3">Skip to content</a>
      {sidebarOpen&&<div id="mobile-tool-directory" className="lg:hidden border-b max-h-[65vh] overflow-y-auto"><ToolSidebar onNavigate={()=>setSidebarOpen(false)}/></div>}
      <div className="flex flex-1 w-full">
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r"><div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto"><ToolSidebar/></div></aside>
        <main id="main-content" className="flex-1 min-w-0 px-4 md:px-6 py-5">{children}</main>
      </div>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-sans">
          <nav aria-label="Site information" className="flex flex-wrap justify-center gap-5 mb-4 underline underline-offset-4"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies & storage</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/accessibility">Accessibility</Link><Link href="/compliance">Policies</Link><Link href="/subscriptions">Subscriptions</Link></nav>
          <p>ToolzCraft &copy; {new Date().getFullYear()}. Precision instruments for the web. &nbsp;·&nbsp; {preferredDate(new Date(),preferences.dateFormat)}</p>
        </div>
      </footer>
    </div>
  );
}

function AuthButtons() {
  const { user, loading, configured, signOut } = useAuth();

  if (!configured || loading) return null;

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm" className="text-xs font-sans" data-testid="button-login">
          <LogIn className="h-3.5 w-3.5 mr-1" /> Sign in
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.role === "admin" && (
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="text-xs font-sans text-muted-foreground hover:text-foreground" data-testid="link-admin">
            Admin
          </Button>
        </Link>
      )}
      <span className="hidden md:flex items-center gap-1.5 text-xs font-sans text-muted-foreground" data-testid="text-username">
        <UserRound className="h-3.5 w-3.5" />
        {user.displayName || user.phoneNumber || user.email || "Account"}
      </span>
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => void signOut()} title="Sign out" data-testid="button-logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}


