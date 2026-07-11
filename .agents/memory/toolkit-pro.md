---
name: ToolKit Pro architecture
description: Key patterns, file layout, and conventions for the ToolKit Pro React/Vite app at artifacts/toolkit
---

## Tool registration pattern
- `src/lib/tools-registry.ts` — CATEGORIES array + TOOLS array, single source of truth
- Each tool has: name, slug, category (CategorySlug), description, icon, optional `popular: true`
- Adding a new tool: add to TOOLS, add route to App.tsx, create component in `src/pages/tools/`

## ToolShell (breadcrumb + back button)
- **Centralized in App.tsx** via the `T` helper: `<Route path="...">{ () => <T component={MyTool} /> }</Route>`
- Do NOT add `<ToolShell>` inside individual tool components — App.tsx wraps all tool routes
- ToolShell reads the URL to auto-detect tool → category breadcrumb

## Why: The T helper in App.tsx
- Previously ToolShell was added per-component, leading to inconsistency. Now every /tools/* route automatically gets breadcrumbs and back button without touching individual files.
- How to apply: all new tools use the T helper in App.tsx; never add ToolShell inside a tool component

## Routing
- Wouter `<WouterRouter base={...}>`, path-based proxy routing
- Child-render syntax for wrapped routes: `<Route path="/tools/...">{() => <T component={X} />}</Route>`
- Home, Category pages use component prop directly (no ToolShell needed)

## Vite config
- `define: { global: "globalThis" }` — required for node-style libs (node-forge, etc.)
- `server.allowedHosts: true` — required for Replit proxy iframe

## Date format
- Always use: `d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })`
- Renders as "11 Jul 2026" (no commas, short month)

## Package notes
- No backend — all tools are 100% client-side
- Currency Converter fetches open.er-api.com (free, no key required, daily rates)
- node-forge for SSL cert decode; js-yaml, fast-xml-parser, js-beautify, json5, @iarna/toml all installed

## Local dev
- `pnpm --filter @workspace/toolkit run dev:local` (PORT=3000 BASE_PATH=/)

## Tool count (as of Jul 2026)
- Finance: 6, Converters: 10, Code Tools: 7, Text: 4, Math: 3, Security: 8
- Web Dev: 4, Data Tools: 10, Developer Tools: 8, Formatters & Codegen: 10, SQL Tools: 3
- Total: ~73 tools
