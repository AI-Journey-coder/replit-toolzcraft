---
name: Firebase auth setup
description: Non-obvious lessons from adding Firebase auth to ToolzCraft (drizzle peer variants, Express 5 typing, client auth lifecycle)
---
- Installing firebase-admin created a second pnpm peer-variant of drizzle-orm (otel vs non-otel), causing cross-package type conflicts. **Why:** drizzle-orm has an optional peer on @opentelemetry/api; firebase-admin satisfies it for api-server only. **How to apply:** add `@opentelemetry/api` to `@workspace/db` too so both packages resolve the same drizzle variant.
- Express 5 has no direct `express-serve-static-core` dependency — augment `Request` via `declare global { namespace Express { ... } }`, not `declare module "express-serve-static-core"`.
- Client auth rules: guard `onAuthStateChanged` async syncs with a version counter to prevent stale setUser; RecaptchaVerifier must be reset on Login unmount and after successful confirm; disabled-user check must be enforced server-side on both /auth/sync and /me (403).
