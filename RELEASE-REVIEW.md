# Staging release review — 18 October 2026

This is a focused review of authentication, administrator authorization, billing boundaries and deployment packaging. Passing checks is not a production approval.

## Reviewed controls
- Firebase verifies ID tokens and checks revocation. Protected admin routes also load the current account role and disabled state from the database.
- Role assignment uses explicit Firebase UIDs, not a client-supplied email or role. Administrators cannot disable or demote themselves through the admin endpoint.
- Checkout uses the server-owned monthly plan. Payment activation verifies subscription ownership, invoice/payment details and capture status. Duplicate payment events do not refill credits; refund/dispute revocations persist.
- Webhooks verify original request bytes using constant-time HMAC comparison. Admin mutation intent is recorded before changes run; audit-storage failure blocks the mutation.

## Corrections in this review
- Added Dockerfile.api with a separate non-root API runtime and isolated production dependencies. CI builds the image and starts it with non-secret dummy configuration. Its health check proves startup only, not database or provider connectivity.
- Added Docker context exclusions for firebase-admin.json, private keys and local credential directories.
- Disabled the legacy delete-user command before any identity/database mutation. Its old sequence deleted the Firebase identity before completing application cleanup, and did not safely resolve recurring payments or billing retention. A reviewed cancellation/anonymisation workflow is still required.
- Disabled automatic AI-provider retries: a second 25-second attempt could exceed the website proxy's 30-second timeout. A failed request must return through existing credit-release handling; the user can retry explicitly.

## Still required before public production
- Provision staging PostgreSQL, migrations and least-privilege runtime identities; configure runtime secrets and the website API_UPSTREAM. The website Dockerfile alone does not run the API.
- Test Firebase sign-in, admin authorization, Razorpay test checkout, webhook delivery, cancellation and failed/refunded payment behavior through the deployed website.
- Test Cloud Run proxy identity/network settings. The API currently has per-process request throttles; verify shared rate limiting before multiple API instances are enabled.
- Bound and paginate the admin user listing, which currently loads every account and performs per-user access lookups.
- Complete billing-aware privacy export/deletion and retention procedures, database backup restoration, monitoring and budget alerts.
- Configure live Razorpay keys/plan/webhook only after test-mode staging passes. Confirm production domain, Firebase authorized domains and public legal/contact configuration.

No production resources, live payments or main-branch merge were performed by this review.
