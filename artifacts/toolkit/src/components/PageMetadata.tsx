import policies from '@/lib/policy-content.json';
import { useEffect } from "react";
import { useLocation } from "wouter";
import { TOOLS, CATEGORIES } from "@/lib/tools-registry";

export function PageMetadata() {
  const [location] = useLocation();
  useEffect(() => {
    const tool = TOOLS.find(t => location === `/tools/${t.slug}`);
    const category = CATEGORIES.find(c => location === `/category/${c.slug}`);
    const pages: Record<string, string> = { "/": "Browser Tools", "/about": "About", "/privacy": "Privacy policy", "/terms": "Terms of use", "/contact": "Contact", "/login": "Sign in", "/admin": "Administration", "/promo": "Explore ToolzCraft" };
    for(const [slug,p] of Object.entries(policies))pages["/"+slug]=p.title;
    pages["/my-tools"]="My tools";pages["/logo-gallery"]="Logo gallery";
    const title = `${tool?.name ?? category?.name ?? pages[location] ?? "Page not found"} | ToolzCraft`;
    const description = tool?.description ?? category?.description ?? "Practical browser utilities for text, code, calculations, images and documents, with guidance and clear data-handling information.";
    document.title = title;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const configured = import.meta.env.VITE_SITE_URL;
    if (configured) {
      try { const origin = new URL(configured); if (origin.protocol === 'https:') {
        canonical ??= Object.assign(document.createElement('link'), {rel:'canonical'});
        canonical.href = new URL(location, origin.origin).href; document.head.appendChild(canonical);
      } } catch { /* Leave canonical unset until a valid deployment URL is configured. */ }
    }
    document.getElementById('tool-structured-data')?.remove();
    if(tool) { const script=document.createElement('script');script.id='tool-structured-data';script.type='application/ld+json';script.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebApplication',name:tool.name,description:tool.description,applicationCategory:'UtilitiesApplication',operatingSystem:'Web browser'});document.head.appendChild(script); }
    for (const [selector, value] of [["meta[name='description']", description], ["meta[property='og:title']", title], ["meta[property='og:description']", description], ["meta[name='twitter:title']", title], ["meta[name='twitter:description']", description], ["meta[name='robots']", ["/login","/admin","/my-tools","/logo-gallery"].includes(location) || (!tool && !category && !pages[location]) ? "noindex, follow" : "index, follow"]]) {
      document.querySelector(selector)?.setAttribute("content", value);
    }
  }, [location]);
  return null;
}
