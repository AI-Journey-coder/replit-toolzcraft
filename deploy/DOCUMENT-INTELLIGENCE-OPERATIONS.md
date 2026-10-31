# Document Intelligence operations — 30 October 2026

This is a rollout runbook, not evidence of deployment. Keep staging and production identities separate. If they share the existing database, they must use the same workspace encryption key; a future database split must preserve the matching key for copied encrypted records. Apply the new migrations before sending traffic to the new API. Keep the old images available for rollback; additive tables do not require deleting existing data.

## Release sequence

1. Run the release tests with a disposable PostgreSQL database, TypeScript checks, API build, website build, and browser tests against that website build. Do not run schema-isolation tests against Neon or production.
2. Back up the target database. Run the existing `node scripts/database.cjs migrate` workflow with its target `DATABASE_URL` supplied securely. This release adds migrations 0006–0015. Never paste connection strings into chat or commit them.
3. Create a new Secret Manager secret for a cryptographically random 32-byte key encoded as base64. Generate it directly into the secret without terminal output. Bind its version as `DOCUMENT_WORKSPACE_KEY` on the API and worker. Grant Secret Accessor only to their runtime identities. The website must not receive this key or database/API-provider secrets.
4. Deploy the API image by immutable digest. Retain existing Firebase project, origins, billing and provider settings. Start with `ENABLE_DOCUMENT_JOBS=false` until the worker is configured and its execution succeeds.
5. Deploy the website image to staging; verify sign-in, owner isolation, shared roles, result credits and deletion. Exercise text-only, scanned, password-protected and corrupt inputs.
6. Configure and execute the two jobs below. Verify their logs contain only counts and safe status messages. Only then enable queued processing on API and worker. The web queue checks API configuration; this is not a scheduler-health probe.
7. Schedule the worker and cleanup jobs, alert on failures, and exercise retry/cancellation/expiry on staging. Promote the tested API/scanner image digests to production only after these acceptance checks.

## Cloud Run Jobs

Both entry points are included in `Dockerfile.api`'s generated `/app/dist` directory. In **Cloud Run → Jobs → Deploy container**, use the same tested API image digest. Set **one task**, **parallelism one**, **one CPU**, **512 MiB memory**, and **zero platform retries** initially. Application job retries retain request IDs. Use dedicated least-privilege identities.

| Job | Command | Arguments | Timeout | Runtime configuration |
| --- | --- | --- | --- | --- |
| document worker | `node` | `dist/document-worker.mjs` | 15 minutes | `NODE_ENV=production`, `ENABLE_DOCUMENT_JOBS=true`, `ENABLE_AI=true`, `AI_PROVIDER=gemini`, tested `AI_MODEL`; Secret Manager bindings for `DATABASE_URL`, `DOCUMENT_WORKSPACE_KEY`, `GEMINI_API_KEY` |
| retention cleanup | `node` | `dist/document-maintenance.mjs` | 5 minutes | `NODE_ENV=production`; Secret Manager binding for `DATABASE_URL`. No provider key or workspace decryption key is needed. |

The worker takes a database advisory lock, processes at most 20 jobs per execution, and exits its loop after approximately nine minutes. Concurrent executions return without processing. Requests queued after its final poll wait for the next execution. A killed worker's stale jobs are recovered using existing billing receipt IDs; a committed receipt must not incur a second charge.

In each job, open **Triggers → Add Scheduler Trigger**. Use a dedicated scheduler service account with Cloud Run Invoker on that job only. A starting configuration is every five minutes for processing and hourly for cleanup, UTC. Cloud Scheduler and job executions can incur charges; monitor the project's actual billing and do not describe them as guaranteed free. The official [scheduled jobs instructions](https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule) describe the console flow and OAuth invocation.

## Retention and deletion

- Local documents live in browser memory. Anonymous sessions clear after 60 minutes when the tab runs or resumes; no server original-file copy is created unless the user explicitly opts into scanning or uses the binary API. Those operations use ephemeral processing and temporary extraction files, removed afterward.
- Saved reviewed text, selected settings and conversation: 30 days; encrypted, with authenticated access blocked at expiry. Owner deletion removes workspace versions/members/events immediately.
- Queued source/result text and existing recovery receipts: 24-hour access window. Cleanup clears expired completed-job contents; running work must finish or be recovered first. Metadata remains up to 30 days.
- Support messages and replies: 30 days, encrypted; owner deletion is immediate. Administrator replies are in-app, not automatically emailed.
- Cleanup must execute successfully for physical time-based deletion. Database backups may retain prior data under the database operator's configured retention; publish that policy accurately.

Test expiry by creating disposable records with expired timestamps in staging, executing cleanup, and checking row/content counts without printing contents. Alert if cleanup has not succeeded in two hours. Never edit real users' timestamps for a test.

## Encryption-key continuity

Keep the key in Secret Manager with a recoverable, access-controlled version. Losing it makes saved content unreadable. Do not rotate by merely replacing the value: pause workers/writes, migrate each ciphertext using its original scope and key, verify decryptability and counts, then switch both API and worker together. Restore database backups only with their corresponding key version. Key rotation migration tooling is not yet included; retain the active version securely.

## Optional signed webhooks

Default `DOCUMENT_WEBHOOK_HOSTS` is empty, which blocks all destinations. Add only reviewed exact HTTPS hostnames to API and worker. The sender rejects local/private resolutions, pins DNS for the connection, uses a timeout and does not follow redirects. No webhook destination is configured by this release.

Owners explicitly opt in to status delivery. Payloads contain event ID, job ID, action and state, never document text. Verify `X-ToolzCraft-Signature` as HMAC-SHA256 over `timestamp + '.' + rawBody`, using the per-workflow verification key; enforce a short timestamp window and deduplicate event IDs. Delivery is at least once, with at most three application attempts. Rotation of the workspace key changes derived webhook keys too.

## Acceptance gates still requiring deployment

- Firebase sign-in through the public website and private API proxy; regular, disabled, administrator and two distinct users.
- Failed provider response causes no successful credit charge; duplicate submission/recovered job causes exactly one charge.
- Queue cancellation, partial batch failure, workflow approval/version changes, invalid workflow isolation and bounded retry.
- Shared viewer cannot edit; removed member loses access; user cannot read another user's saved text, jobs or support messages.
- Secret unavailable/tampered ciphertext fails closed without leaking contents.
- Hourly cleanup, backups, incident recovery, provider data-use agreements and production tracking/advertising exclusions.

Binary ingestion and antivirus scanning are implemented separately from local parsing. Neither implies universal document safety.

## Runtime model and estimate controls

Set `AI_ALLOWED_MODELS` to a comma-separated list of models validated on staging. The configured `AI_MODEL` is always allowed. Administrators can select among these models under Document processing without redeploying; the API and worker read the database setting for each new provider call. In-flight calls are unchanged. A removed/invalid configured model fails closed until an administrator selects an allowed model. Missing configuration tables are an error, so migrate before rollout.

Rates are manually entered USD per million input/output tokens with an effective-date/source note. Leave unknown prices blank. Admin estimates use current rates for matching single-model queued jobs, not historical invoices. Mixed-model jobs are deliberately unpriced. Provider-specific caching or thinking charges need separate reconciliation with provider billing.


## Optional malware scanner (disabled until operational acceptance)

The API supports ClamAV INSTREAM on loopback only. Set `ENABLE_DOCUMENT_SCAN=true` and `CLAMAV_PORT=3310` only after deploying a maintained clamd sidecar on the same service. Never expose clamd TCP publicly; it is unauthenticated. The web proxy permits 20 MB only on the scan endpoint. Other JSON limits remain unchanged.

Required operator checks before enabling:
- Freshclam updates signatures continuously; monitor freshness and disable scanning if updates fail. Each scan independently checks the daemon signature timestamp and rejects signatures older than seven days.
- Configure `StreamMaxLength` and `MaxFileSize` at least 20 MB, `MaxScanSize` at least 50 MB, bounded archive recursion/files, `AlertExceedsMax yes`, `AlertEncrypted yes`, and `LeaveTemporaryFiles no`. Confirm these options against the installed ClamAV version. Limits or encrypted files must produce a blocking result rather than a skipped clean result.
- Use temporary storage for scanner unpacking; disable file-content logging and confirm cleanup. Reserve and load-test adequate memory before choosing Cloud Run resources; the current 512 MiB deployment must not be assumed sufficient.
- Test clean PDF/DOCX/TXT/image/ZIP, encrypted archive, scan-limit rejection, daemon outage, client cancellation, and the standard antivirus test fixture in an isolated staging environment.
- Confirm default uploads remain local and never call the scan endpoint. Signed-in users explicitly opt into original-file upload. Scan failure stops extraction; no automatic fallback. Scanning is not a safety guarantee.

Protocol tests cover daemon failures and stale signatures. A real ClamAV run with official definitions accepted clean text and blocked the standard harmless EICAR fixture; this does not establish universal detection efficacy. No scanner infrastructure was provisioned by this change. See https://docs.clamav.net/manual/Usage/ClamdProtocol.html and https://docs.clamav.net/manual/Usage/Scanning.html.

## Automated rollout

Run `python3 deploy/rollout-document-intelligence.py --environment staging` in the clean release checkout in authenticated Google Cloud Shell to inspect the read-only plan. Add `--apply` to perform it. The script backs up the database privately before additive migrations 0006–0015, builds immutable images, deploys a private document API/scanner service, routes binary requests to it, and configures worker/cleanup schedules. Builds, storage, scanning and scheduled jobs can incur charges.

Production additionally requires the exact commit's successful staging record and explicit `--accept-staging` after signed-in acceptance. A recovery JSON is saved before changes in `~/.toolzcraft-rollouts`; if rollout fails, route the website and API back to the recorded revisions through Cloud Run's Manage traffic. Additive migrations are retained; do not restore a database backup over newer user writes without a separate recovery plan.

The binary service keeps ClamAV on loopback port 3310. Port 8081 exposes only readiness; the public ingress remains the authenticated API. It allocates 1 GiB API plus 2 GiB scanner, scales to zero and at most one instance. Main API and website remain separate. `API_BINARY_UPSTREAM` routes only scan/extract endpoints. Fresh signatures are required before scanner readiness and each scan.

### Binary API contract

`POST /api/document-extract?consent=upload-for-extraction&format=pdf` accepts `Content-Type: application/octet-stream` and a Firebase bearer token. Formats: pdf/docx/txt/png/jpg/jpeg. Maximum 20 MB, 20 PDF pages and 200,000 extracted characters; oversized content fails instead of truncating. Response contains pages and warnings. Native OCR is English; browser OCR supports the selectable languages. Encrypted PDFs can be unlocked locally; the server scanner rejects encrypted input. Source bytes are not stored in the database.

`DOCUMENT_REFERENCE_HOSTS` is an optional comma-separated approved HTTPS hostname list; absent configuration disables remote reference import while manual reference upload remains available. Imported references are attributed, not authenticated issuers. Upload/provider aggregates are content-free and expire after 90 days through cleanup.
