# Payment gateway shortlist — 13 September 2026

Recommendation: Razorpay as the first integration candidate; Cashfree is a close alternative with slightly lower published base pricing. Both require merchant onboarding and approval for international payments. No payment gateway has been activated in this build.

| Gateway | Standard domestic fee | International card fee |
| --- | --- | --- |
| Razorpay | 2% + GST | 3% + GST |
| Cashfree | 1.95% + GST | 2.99% + GST for Visa/Mastercard |

Sources checked: https://razorpay.com/pricing/ ; https://razorpay.com/international/ ; https://www.cashfree.com/payment-gateway-charges/

Illustrative fee on a INR 1,000 payment, with 18% GST on the gateway fee: Razorpay domestic INR 23.60 / international INR 35.40; Cashfree domestic INR 23.01 / international INR 35.28. These exclude FX, special payment methods, subscriptions, refunds/chargeback-related charges and negotiated pricing. Promotional offers have eligibility limits; use the merchant contract to confirm the actual rate.

PayPal is an optional overseas checkout method, not a standalone India domestic solution. India merchant international receipts are listed at 4.40% plus a currency-dependent fixed fee; currency conversion can cost extra. Source: https://www.paypal.com/in/business/paypal-business-fees

## Decisions required before implementation
1. Choose Razorpay or Cashfree.
2. Define what is sold: subscriptions, credit packs, or individual purchases; prices, currency, entitlements and refund rules.
3. Complete provider onboarding yourself. Configure test credentials privately in server environment/Secret Manager; do not place secrets in frontend VITE variables or chat.

## Implementation scope after those decisions
- Backend creates orders from server-owned price IDs and authenticated users.
- Hosted checkout collects payment details; ToolzCraft never handles card numbers.
- Verify checkout signatures and signed webhooks server-side; verify amount, currency and user/order ownership.
- Persist orders and webhook event IDs in the chosen database. Deduplicate retries and handle failed/cancelled payments, refunds and subscription lifecycle events.
- Grant paid access only after confirmed payment; test replayed webhooks, mismatched amounts and abandoned checkout.
- Add provider-specific CSP allowances, privacy disclosures, pricing/refund pages and test-to-live configuration.

Deployment remains dependent on database provisioning and live service verification already documented in DEPLOYMENT.md.

## Selected provider and implementation progress
The operator selected Razorpay and monthly/yearly subscriptions on 13 September 2026.

Implemented: server-only REST client for plans, subscription creation/fetch/cycle-end cancellation, test/live configuration safeguards, raw webhook signature verification, subscription Checkout signature verification, and captured payment checks. Seven mocked regression tests passed; the new module passed a standalone TypeScript check. The tests are included in test:release.

Important: this is the provider adapter, not an activated checkout. No API keys were supplied, no provider requests were made, and no HTTP payment routes or paid entitlements were enabled. Database persistence, signed webhook HTTP handling, customer checkout and access enforcement remain to be connected once prices and benefits are specified.

Next required input: monthly and yearly prices, billing currency, and exact subscriber benefits/limits. Then configure test plan IDs, explicit maximum billing cycles, and server-only test API credentials in the ignored environment/Secret Manager. Never put the key secret or webhook secret into frontend VITE variables or chat.

Recurring implementation must use Razorpay Subscriptions (not repeated one-time orders). Signature input is payment_id + '|' + the server-persisted subscription_id. An authenticated mandate alone does not prove that a paid billing period exists. Persist signed events idempotently and track paid-through dates, failures, cancellation and refunds before granting benefits. Browser-only utilities cannot be securely paywalled solely by hiding their UI.

Official references:
- https://razorpay.com/docs/payments/subscriptions/integration-guide/
- https://razorpay.com/docs/webhooks/validate-test/
- https://razorpay.com/docs/webhooks/subscriptions/
