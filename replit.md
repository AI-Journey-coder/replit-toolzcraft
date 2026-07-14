# ToolzCraft

A privacy-first browser utility platform with 73+ free tools across 11 categories — no login, no ads, 100% client-side.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/toolkit` — the ToolzCraft web app (React + Vite). Tools registry: `src/lib/tools-registry.ts` (source of truth); routes in `src/App.tsx`.
- `artifacts/api-server` — Express 5 API (proxied at `/api`). Auth: `src/lib/firebase.ts` (firebase-admin), `src/middlewares/auth.ts` (requireAuth), `src/routes/auth.ts` (`/auth/sync`, `/me`).
- `lib/db/src/schema/users.ts` — users, usage_events, tool_settings, premium_packages tables.
- `lib/api-spec/openapi.yaml` — API contract (codegen via Orval).
- `artifacts/toolkit/src/lib/firebase.ts`, `src/hooks/use-auth.tsx`, `src/pages/Login.tsx` — client-side Firebase auth (phone OTP + Google).

## Auth

- Firebase Authentication (user's own Firebase project). Secrets: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` (client), `FIREBASE_SERVICE_ACCOUNT_JSON` (server).
- Flow: client signs in with Firebase (phone OTP or Google popup) → sends ID token as Bearer → server verifies with firebase-admin → upserts user row on `/auth/sync`. Disabled users get 403.
- Phone and Google providers must be enabled in the Firebase console; the Replit dev domain must be in Firebase authorized domains for popup/recaptcha to work.

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
