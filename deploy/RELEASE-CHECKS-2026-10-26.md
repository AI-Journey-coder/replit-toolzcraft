# Release checks — 26 October 2026

## Implemented
- Free Summary: local extractive sentence selection, no account/provider call; up to 24,000 characters.
- Quick Summary: up to 6,000 characters, one credit.
- Full Document: one combined AI analysis of up to 24,000 characters, one credit per started 6,000 characters (1–4). This is a single provider request over the complete text, not a background multi-step job. Up to 20 PDF pages for full/free, 5 for quick. All uploads remain limited to 20 MB.
- PDFs, images/OCR and TXT reuse the local reader. Text PDFs no longer initialize OCR. DOCX is not supported. Outputs remain bounded by the existing 2,048-token provider cap. Page citations depend on extracted page markers and must be verified.
- Server-owned pricing, whole-request credit transaction, account lock, durable retry receipt. Provider errors and insufficient allowance roll back all charges. Requests are limited to two concurrent summaries and ten summary requests per account per minute on each instance. Keep staging at one instance; distributed throttling remains needed before scaling.
- Retry IDs survive reload in the same browser tab through sessionStorage without source text. Generated summaries are recoverable for 24 hours. Expired text is scrubbed on subsequent successful requests or via node scripts/database.cjs prune-summaries. Schedule cleanup before production. Receipt hashes/IDs remain for duplicate protection.
- Public pricing/privacy/guidance updated. Admin user listing bounded to 20 accounts per page (per-user credit queries remain bounded, not consolidated).
- Security patches installed for DOMPurify, markdown-it, fast-uri, body-parser, Vite and Zod. Current audit: no known vulnerabilities.

## Local evidence
- Workspace type checks and frontend/API builds passed.
- Release suite: 63 tests including 8 summary tests and an admin pagination HTTP test; real local PostgreSQL used, no database skips.
- Document workflow suite: 10 passed. Admin audit: 3 passed. Tool/search/media suites passed.
- Browser suite: 14 passed on Edge, including 390px and 1280px summary selection, TXT upload, free processing without AI calls, credit preview, disabled paid actions while signed out, real PDF extraction and corrupt PDF handling.
- New migration applied twice locally successfully and applied to the configured staging Neon database on 26 October 2026. Full-document credit success, insufficient balance, provider failure, concurrent retry, repeat recovery, admin bypass and disabled accounts tested.
- These checks do not constitute exhaustive verification of every tool, live provider integration or AdSense approval. Cloud container CI and the deployed release must also pass.

## Deployment order (staging only)
1. Pull this branch in Cloud Shell; install the locked pnpm dependencies.
2. Set DATABASE_URL from Secret Manager toolzcraft-staging-database-url:3 in the shell environment (never paste its value into chat). Run node scripts/database.cjs migrate, then unset DATABASE_URL. Migration 0005_summary_results is additive; do not revert it during an image rollback.
3. Build the API using deploy/cloudbuild.staging-api.yaml with _RELEASE set to git rev-parse --short HEAD. Update toolzcraft-staging-api to the resulting immutable digest, preserving existing environment, secrets and service identity.
4. Build the website using deploy/cloudbuild.staging-web.yaml with the same release. Update toolzcraft-staging to the resulting immutable digest.
5. Test Free while signed out, Quick with one credit and Full with at least four test credits; verify balances, repeat retry and provider failure. Check login/admin/phone and staging noindex again.

## Remaining external launch gates — not completed
- Deploy/test this revision on staging, including genuine Gemini Quick/Full results and a regular user's credit balance. The previous model smoke test is not this release's end-to-end test.
- Configure Razorpay test credentials, plan and webhook; verify captured payment, duplicate webhook, cancellation and refund effects through the deployed site. Payments remain disabled in current staging settings.
- Verify production database least-privilege access, recovery/restore drill, retention cleanup schedule, monitoring, error alerts and cloud/provider spending limits. These require cloud/account configuration, not source edits alone.
- Complete a reviewed billing-aware privacy export/deletion procedure; automatic delete-user remains deliberately disabled. No claim of worldwide legal compliance is made.
- Review production domain/TLS, Firebase domains, exact APP_ORIGIN, private API identity, live payment configuration and rollback digests before switching traffic. Do not replace the existing live service without this review.
- Keep the production AI publication gate until the online service/privacy review is complete. Confirm the live homepage's AdSense meta tag and ads.txt after deployment; submit the public domain only when ready. Ad serving remains disabled, separate from ownership verification.
