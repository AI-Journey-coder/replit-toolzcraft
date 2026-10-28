import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { TOOLS } from '@/lib/tools-registry';
export const CURRENCIES = Intl.supportedValuesOf('currency');
export const LOGOS = ['original','monogram','brackets','tiles','orbit','diamond'] as const;
export type LogoId = typeof LOGOS[number];
export type Preferences = { dateFormat: 'dmy-text'|'mdy'|'dmy'|'iso'; favorites: string[]; currency: string; logo: LogoId; palette: 'jade' | 'indigo' };
const key = 'toolzcraft.preferences.v1';
const defaults: Preferences = { favorites: [], dateFormat:'dmy-text', currency: 'USD', palette: 'jade', logo: LOGOS.includes(import.meta.env.VITE_DEFAULT_LOGO as LogoId) ? import.meta.env.VITE_DEFAULT_LOGO as LogoId : 'original' };
function read(): Preferences {
  try { const p=JSON.parse(localStorage.getItem(key)||'null'); return {
    favorites: Array.isArray(p?.favorites) ? [...new Set<string>(p.favorites.map((s:unknown)=>s==='ai-summarizer'?'ai-document-intelligence':s).filter((s:unknown)=>TOOLS.some(t=>t.slug===s)))] : [],
    dateFormat: ['dmy-text','mdy','dmy','iso'].includes(p?.dateFormat)?p.dateFormat:'dmy-text',
    currency: CURRENCIES.includes(p?.currency) ? p.currency : defaults.currency,
    palette: localStorage.getItem('toolzcraft.palette') === 'indigo' ? 'indigo' : 'jade',
    logo: LOGOS.includes(p?.logo) ? p.logo : defaults.logo,
  }; } catch { return defaults; }
}
const Context=createContext<{preferences:Preferences; update:(p:Partial<Preferences>)=>void; toggleFavorite:(slug:string)=>void; reset:()=>void; storageError:string} | null>(null);
export function PreferencesProvider({children}:{children:ReactNode}) {
  const [preferences,setPreferences]=useState(read),[storageError,setError]=useState('');
  useEffect(()=>{try{localStorage.setItem('toolzcraft.palette',preferences.palette);const {palette,...stored}=preferences;localStorage.setItem(key,JSON.stringify(stored));setError('');}catch{setError('Browser storage is unavailable. Changes last only until this page closes.');}},[preferences]);
  useEffect(()=>{const sync=(e:StorageEvent)=>{if(e.key===key||e.key==='toolzcraft.palette'||e.key===null)setPreferences(read());};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  const update=(p:Partial<Preferences>)=>setPreferences(old=>({...old,...p}));
  const toggleFavorite=(slug:string)=>setPreferences(old=>({...old,favorites:old.favorites.includes(slug)?old.favorites.filter(s=>s!==slug):[...old.favorites,slug]}));
  return <Context.Provider value={{preferences,update,toggleFavorite,reset:()=>setPreferences(defaults),storageError}}>{children}</Context.Provider>;
}
export function usePreferences(){const value=useContext(Context);if(!value)throw new Error('Preferences provider missing');return value;}
