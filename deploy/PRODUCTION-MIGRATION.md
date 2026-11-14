# Public domain migration

The operator requested publishing the existing release to https://toolzcraft.com and explicitly deferred summary-quality corrections. AI is retained; payments remain disabled. This is not a claim that all production checks or AdSense review have passed.

The production Cloud Build file explicitly records that release decision. Missing configuration, invalid origins, incomplete Firebase settings and generated-page checks remain enforced. Default builds still reject unreviewed AI enablement. No credentials are included in the build.

Runtime website settings:
- PORT=8080 (Cloud Run container port)
- STAGING=false
- API_CLOUD_RUN_AUTH=true
- API_UPSTREAM=https://toolzcraft-production-api-304384284059.asia-southeast1.run.app
- service account: toolzcraft-production-web@toolzcraft-062026.iam.gserviceaccount.com
- Clear old container command and arguments; image supplies its startup command.
- Keep public website access enabled, min instances 0 and max instances 1.

The production image uses https://toolzcraft.com for canonical metadata and redirects www.toolzcraft.com with HTTP 308, preserving path/query. No DNS changes. Build has no staging marker. AdSense ownership metadata only; no ad serving.

Before traffic switch record the existing toolzcraft revision. Deploy without traffic first where available; verify health and API connectivity, then shift traffic. Retain the old revision for rollback. Public-domain login and redirects must be checked after switch. Do not delete staging until production is verified.

Known deferred checks: summary usefulness, full deployed credit checks, scheduled retention cleanup, database restore drill and least privilege, privacy export/deletion operations, monitoring/spending limits and payment integration. Existing Neon database is shared; staging tests affect the same data. Do not run destructive staging tests against it.
