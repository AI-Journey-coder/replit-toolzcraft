# Local Razorpay webhook testing

This development-only receiver uses the production webhook route and signature verifier but simulates subscription sync and revocation. It never grants access, uses a database, calls Razorpay or logs payloads/secrets. It is not payment-to-access integration testing. Keep ENABLE_PAYMENTS=false until the real backend is configured.

## Start
From this repository directory run:

    node scripts/webhook-local.cjs

Endpoint: http://127.0.0.1:5051/api/billing/webhook

Run automated signed-request checks separately:

    node scripts/webhook-local.cjs --self-test

## Receive Razorpay test events
Install cloudflared from https://developers.cloudflare.com/tunnel/downloads/ then run in another terminal:

    cloudflared tunnel --url http://127.0.0.1:5051

The tunnel makes only this isolated receiver reachable through a temporary public HTTPS URL. Keep both processes running. Do not point it at the full app or expose .env files.

In Razorpay TEST mode, add a webhook with URL https://YOUR-TEMPORARY-HOST/api/billing/webhook. Copy the RAZORPAY_WEBHOOK_SECRET value from artifacts/api-server/.env into the dashboard Secret field. This is different from the API key secret. Do not paste either secret into chat.

Select subscription lifecycle events including subscription.charged, subscription.activated, subscription.cancelled, subscription.halted, subscription.completed and subscription.paused/resumed where available; also refund.created, refund.processed, payment.dispute.created and payment.dispute.lost.

Use Razorpay's test delivery if offered, or generate an event through a test subscription. Confirm HTTP 200 in Razorpay delivery logs and the local receiver log. A manual browser visit sends GET and returns 404 by design. An unsigned POST returns 400. No paid access is activated here.

Stop with Ctrl+C in both terminals. Disable the test webhook before shutting down the tunnel to prevent failed-delivery retries. The temporary hostname changes on restart, so update the dashboard URL next time.

## Next stage
Configure PostgreSQL and Firebase authentication, run migrations, configure the AI service for the paid offering, then run the real API and full checkout/access tests. Use a separate production webhook secret and a stable production URL for launch.
