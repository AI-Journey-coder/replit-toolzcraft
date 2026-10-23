# Run ToolzCraft locally

This checkout includes information pages, corrected public claims, contextual tool guidance, route metadata, optional tracking and Windows-compatible local startup. No ad scripts are enabled and no changes have been pushed to GitHub.

## Quick start on Windows

Install Node.js 22.18+ (Node.js 24 LTS recommended). Open PowerShell in this folder:

```powershell
.\Start-Local.ps1
```

If your PowerShell policy blocks scripts, run these commands directly instead:

```powershell
npm.cmd exec --yes --package=pnpm@10 -- pnpm install --frozen-lockfile
npm.cmd exec --yes --package=pnpm@10 -- pnpm build:local
npm.cmd exec --yes --package=pnpm@10 -- pnpm --filter @workspace/toolkit serve
```

Open http://localhost:3000. Press Ctrl+C in the terminal to stop. The launcher builds and serves the compiled app; rerun it after changing source or frontend environment values. For live editing with hot reload, run `npm.cmd exec --yes --package=pnpm@10 -- pnpm dev:local` instead. The browser-only preview needs no Firebase account, API key or database. Currency rates and OCR resources still require internet access. AI requests show an unavailable message until explicitly enabled. Usage tracking is off by default.

## What to review

- Visit `/`, `/about`, `/contact`, `/privacy`, `/terms` and several `/tools/...` pages.
- Resize to a narrow/mobile window and use keyboard navigation. Check the footer links.
- Try Number Base Converter with decimal 255: expect binary 11111111 and hexadecimal FF. Inspect its guide and related tools.
- Reload a tool URL directly. Check its browser title and description in DevTools.
- Inspect `/login` without Firebase settings: it should explain that sign-in is unavailable.
- Visit an AI tool: the data-transfer notice appears before inputs and an attempted submission explains that AI is unavailable.
- In DevTools Network, browser-only tools must not submit `/api/usage` by default.

## Optional backend and Firebase

Copy `artifacts/toolkit/.env.example` to `artifacts/toolkit/.env.local`. Set the three Firebase web values only if you want real sign-in. Enable Google/Phone in Firebase and authorize your test hostname. Firebase phone authentication requires an appropriate hosted test domain; localhost is not a substitute for testing the deployed phone flow.

The browser API proxy forwards `/api` to http://127.0.0.1:5000. To use auth/AI/admin, provide a disposable local PostgreSQL database, then run in a second PowerShell terminal:

```powershell
$env:DATABASE_URL = 'postgresql://USER:PASSWORD@localhost:5432/toolzcraft'
$env:PORT = '5000'
$env:VITE_FIREBASE_PROJECT_ID = 'your-project-id'
# Optional privileged server credential; never place it in a VITE_ variable:
# $env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content -Raw -LiteralPath 'path-to-private-service-account.json'
npm.cmd exec --yes --package=pnpm@10 -- pnpm --filter @workspace/db push
npm.cmd exec --yes --package=pnpm@10 -- pnpm --filter @workspace/api-server build
npm.cmd exec --yes --package=pnpm@10 -- pnpm --filter @workspace/api-server start
```

Schema push changes the database named by DATABASE_URL; use a disposable local database. The first synced user becomes admin. Do not expose an empty production database to public registration before establishing the intended admin.

For AI, supply GEMINI_API_KEY on the server (or AI_PROVIDER=openai and OPENAI_API_KEY), set VITE_ENABLE_AI=true in the frontend `.env.local`, and restart Vite. For optional visit tracking, set VITE_ENABLE_USAGE_TRACKING=true. Do not enable it without reviewing the privacy text and retention practices.

## Build checks

```powershell
npm.cmd exec --yes --package=pnpm@10 -- pnpm typecheck
npm.cmd exec --yes --package=pnpm@10 -- pnpm build:local
```

The frontend output is `artifacts/toolkit/dist/public`. To inspect it, run `npm.cmd exec --yes --package=pnpm@10 -- pnpm --filter @workspace/toolkit serve`. Production hosting must serve the SPA fallback for valid app routes. Builds now generate tool-specific initial HTML headings, titles and descriptions, with metadata also updated by JavaScript. Serve existing generated files before the SPA fallback. See NEW-TOOLS.md for the new tools and review checklist.

## Before publication or AdSense submission

1. Set VITE_CONTACT_EMAIL to a monitored private mailbox and review policy text, operator identity, enabled vendors, retention and applicable obligations. The current policy accurately states that ads are disabled; it is not a completed advertising privacy policy.
2. Review each tool for correctness. Category-specific guidance is a starting point, not a claim that every tool has a unique editorial guide. Expand high-value tools with tested examples and original explanations.
3. Choose the real HTTPS domain. Set VITE_SITE_URL and rebuild to generate canonical URLs and a sitemap, and test crawler rendering and deep links after deployment. A sitemap or SSR alone does not guarantee AdSense approval.
4. Complete the site-verification method supplied by your own AdSense account. Do not invent publisher IDs or ads.txt entries.
5. Before enabling ads, update privacy disclosures and implement Google's required consent solution for applicable regions. Configure ad exclusions for login, admin, error and other non-content screens. Review placements to avoid accidental clicks near copy/download/action buttons.
6. Test the live domain on mobile, verify all tools and links, and submit only when the site is complete. No automatic scan or code change can guarantee approval.

Official references: https://support.google.com/adsense/answer/7299563 and https://support.google.com/publisherpolicies/answer/10502938
