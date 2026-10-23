import {ChevronRight} from 'lucide-react';
import { searchTools } from '@/lib/tool-search';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CATEGORIES, TOOLS } from '@/lib/tools-registry';
import { usePreferences } from '@/hooks/use-preferences';
export function ToolSidebar({onNavigate}:{onNavigate?:()=>void}) {
  const [query,setQuery]=useState('');const [location]=useLocation();const {preferences}=usePreferences();
  const visible=searchTools(TOOLS,query);
  const link=(slug:string,name:string)=><Link key={slug} href={`/tools/${slug}`} onClick={onNavigate} aria-current={location===`/tools/${slug}`?'page':undefined} className={`block rounded px-3 py-2 text-sm hover:bg-muted ${location===`/tools/${slug}`?'bg-primary/10 text-primary font-semibold':''}`}>{name}{TOOLS.find(t=>t.slug===slug)?.category==='ai'&&<span className="block text-xs text-primary">Backend · 3 free AI credits</span>}</Link>;
  return <nav aria-label="Tools by category" className="space-y-2 p-4">
    <div className="flex items-center justify-between"><h2 className="font-semibold">Tool directory</h2><span className="text-sm text-muted-foreground">{TOOLS.length}</span></div>
    <label className="block text-sm">Find a tool<input type="search" className="mt-2 w-full rounded border bg-background p-2" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search all categories"/></label>
    <Link href="/my-tools" onClick={onNavigate} className="block rounded border p-3 font-medium text-primary">★ My tools & preferences</Link>
    {!query&&preferences.favorites.length>0&&<section><h3 className="px-3 pb-1 text-sm text-muted-foreground">Favourites</h3>{preferences.favorites.map(s=>TOOLS.find(t=>t.slug===s)).filter(Boolean).map(t=>link(t!.slug,t!.name))}</section>}
    {!visible.length&&<p role="status" className="text-sm">No matching tools.</p>}
    {CATEGORIES.map(c=>{const tools=visible.filter(t=>t.category===c.slug);if(!tools.length)return null;const Icon=c.icon;return <details key={`${c.slug}-${Boolean(query)}-${location}`} open={Boolean(query)||tools.some(t=>location===`/tools/${t.slug}`)} className="group border-b last:border-b-0"><summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden"><Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true"/><span className="flex-1">{c.name} <span className="text-muted-foreground font-normal">({tools.length})</span></span><ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden="true"/></summary><div className="border-l ml-1">{tools.map(t=>link(t.slug,t.name))}</div></details>;})}
  </nav>;
}


