# Admin operations and release gates

The /admin page requires a Firebase session and an enabled application administrator role. No account is promoted automatically.

## Implemented
- Billing reports use verified paid periods, with separate test/live environments and paginated subscriptions.
- Provider reconciliation uses the existing ownership and captured-payment checks. No manual credit grants.
- Mutation intents are persisted before admin writes. Response status is recorded on completion. Pending records require investigation; this is an operational audit trail, not tamper-proof accounting.
- API secrets and request bodies are excluded from audit records.
- Manual legacy plan updates are rejected. Legacy package records do not control Razorpay prices.
- Dashboard configuration indicators describe configuration presence, not successful service health.

Apply migrations before starting the updated API:

    node --env-file=artifacts/api-server/.env scripts/database.cjs migrate

## Remaining production gates
- Complete application-linked test checkout, webhook delivery, renewal, cancellation and refund/dispute tests; the earlier dashboard-only purchase does not establish application access.
- Configure live Razorpay credentials and webhook in the production secret store. Verify supported international payment methods with the merchant account. Current checkout charges INR only; currency preferences do not convert subscription prices.
- Establish production PostgreSQL backups, restore drills, retention, monitoring and alert delivery. Verify Cloud Run scaling and shared rate limiting.
- Add stronger administrator authentication / MFA policy and granular support/billing roles before adding more staff.
- Implement and verify privacy export/deletion workflows with billing retention rules and active-subscription handling. Existing deletion script requires billing-aware review before use.
- Validate tax/invoice and consumer-policy requirements for the countries served with the business advisers. Do not describe generic legal pages as worldwide compliance.
- Accessibility and mobile browser testing, production end-to-end tests, dependency review, load testing and a deployment rollback rehearsal remain required.
- Settlement/revenue/refund reporting currently belongs in Razorpay. This dashboard deliberately does not infer net revenue from credit allocations.

No production deployment or live financial operation is performed by these dashboard changes.

## User credit management
Users is now the default admin tab, with name/email search and activation controls. Active administrators have unlimited AI credits, enforced by a fresh database role check; request/rate limits still apply. A disabled account cannot claim credits. Manual credit balances replace (not add to) the available trial/paid allowance until explicitly reset with Use plan allowance. This does not change invoices or refill monthly ledgers. Manual balance changes require a reason, are recorded with previous/new balances and actor ID in admin_credit_changes, and share the credit-consumption database lock. Edits are rejected while reservations are pending; let the request finish or recover first.
