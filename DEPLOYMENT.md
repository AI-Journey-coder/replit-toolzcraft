# Deployment runbook

The default release is the browser-only website. Accounts, AI, usage collection and ad serving are optional, separately reviewed services. Read VERIFICATION.md for the checks actually completed; a passing build is not approval to skip the remaining checks.

## Required operator inputs

Supply the final HTTPS domain, legal operator name, monitored support email, applicable jurisdiction and hosting choice. Review whether a public business address is required for your situation. Set these public values using artifacts/toolkit/.env.example. Values beginning VITE_ are embedded in downloaded JavaScript: never put a service-account private key, database password or Gemini key there.

## Build and local production preview

Use Node 22 and pnpm 10.34.5 from the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:new-tools
pnpm test:release
pnpm test:media
pnpm audit --audit-level high
pnpm build:local
$env:PORT='3003'
$env:STAGING='true'
pnpm serve:production
```

Visit http://localhost:3003. Stop with Ctrl+C. STAGING adds a noindex response header; remove it for the public launch. Use a free port if 3003 is occupied. This server returns real 404 responses for missing routes/assets, supports PDF/video range requests, revalidates HTML and caches hashed assets. Publish the entire generated dist/public directory atomically; do not combine old HTML with new asset files. Keep the previous complete release for rollback. Existing open tabs may need a reload after a release.

The build reads artifacts/toolkit/.env.local. After supplying the real identity/domain, rebuild and run `pnpm check:publication`. The check intentionally blocks missing identity, incomplete Firebase values and enabled AI/usage features awaiting review. Do not remove those gates merely to obtain a green result.

## Portable HTTPS hosting

Dockerfile builds a non-root web image; deploy/compose.yaml runs it behind Caddy TLS. Supply SITE_DOMAIN (hostname only), VITE_SITE_URL (the matching HTTPS origin), VITE_OPERATOR_NAME and VITE_CONTACT_EMAIL in the host environment. Optional identity/logo values are forwarded by Compose. Point DNS at the host and allow ports 80/443, then run:

```sh
docker compose -f deploy/compose.yaml build
docker compose -f deploy/compose.yaml up -d
docker compose -f deploy/compose.yaml ps
```

The supplied Compose configuration is browser-only. Docker execution has not been validated on this machine because its daemon is unavailable. Run it in staging before launch. Pin tested image digests as part of the host release process and apply routine Node/Caddy security updates. /healthz is the web liveness endpoint, not proof that optional Google/database services work.

## Optional account/API service

See GOOGLE-SERVICES.md before enabling login. Run the API separately on a private interface/network, retain its production dependencies, and set the web server's API_UPSTREAM to its private HTTP origin. Do not expose a database or unauthenticated development server publicly. The default Compose does not provision this service or PostgreSQL.

1. Provision PostgreSQL with encrypted connections as required by the provider, restricted credentials and tested backups. Set DATABASE_URL through the host secret manager.
2. On a **new empty database**, run `node scripts/database.cjs migrate`. Repeating this command uses Drizzle's migration journal. Existing databases created using schema push need a reviewed baseline; back them up and compare schemas instead of blindly applying the initial migration.
3. Set the API runtime values in artifacts/api-server/.env.example, including NODE_ENV=production, APP_ORIGIN, FIREBASE_PROJECT_ID and Firebase Admin credentials. The server fails startup on missing production essentials. Environment examples are not loaded automatically by Node; inject them through the host.
4. Build with `pnpm --filter @workspace/api-server build`, then start `node artifacts/api-server/dist/index.mjs` from the installed repository. Do not ship the bundle without its external runtime dependencies.
5. Set only verified Firebase UIDs in ADMIN_FIREBASE_UIDS before their first account sync. Existing accounts retain their role. To promote an existing enabled account after verification, run `node scripts/database.cjs promote UID`. First registration never grants administrator access automatically.
6. Verify Google sign-in, refreshed/expired/revoked tokens, disabled accounts, unauthorized admin access, CORS and the API proxy in staging. Authenticated AI has per-user limits; these limits are process-local, so multiple replicas require a shared limiter and provider budget controls before enabling AI.

Usage collection stays disabled by default. If enabled after privacy review, choose and disclose retention, schedule `node scripts/database.cjs prune-usage --apply` through your host, and monitor failures. Without --apply the command reports a dry run. USAGE_RETENTION_DAYS defaults to 30. Scheduling is not installed automatically. After verifying a private deletion request, `node scripts/database.cjs delete-user UID --apply` deletes the Firebase identity and related application records. Backups/provider logs/browser downloads are separate and need their own documented retention. Test restore and deletion workflows against synthetic accounts first.

## Release acceptance

The GitHub workflow runs typechecks, vulnerability checks, unit/HTTP/media tests, API/frontend builds, PostgreSQL migration twice and Chromium browser tests. It has been authored but not run remotely. Require its successful result before merging a release. Locally, browser fixtures can be generated with `node scripts/create-test-fixtures.cjs`; `pnpm exec playwright install chromium` and `pnpm exec playwright test` run the same browser suite on your machine.

Before opening indexing: verify HTTPS, mobile navigation, representative downloads/OCR/cancellation, real 404 status, sitemap/canonical domain, operator contact, external-service failure states, third-party notices, deployment rollback and monitoring. Test all tools you prominently advertise. The main JS bundle remains large; measure real mobile performance and split further if needed. No deployment or Google review has been performed by these code changes.
