// Development-only receiver: real route/signature checks, simulated billing effects.
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { createHmac } = require('node:crypto');
const assert = require('node:assert/strict');
process.chdir(path.resolve(__dirname, '..'));
const load = require('./load-ts-test.cjs');
const env = parseEnv(fs.readFileSync('artifacts/api-server/.env', 'utf8'));
if (env.RAZORPAY_MODE !== 'test' || !env.RAZORPAY_WEBHOOK_SECRET) {
  throw new Error('Set test mode and a webhook secret in the backend .env first.');
}
const express = require(require.resolve('express', { paths: [path.resolve('artifacts/api-server')] }));
const crypto = load('artifacts/api-server/src/lib/razorpay.ts');
const calls = { sync: 0, revoke: 0 };
const router = load('artifacts/api-server/src/routes/billing-webhook.ts', {
  '../lib/razorpay': crypto,
  '../lib/billing': {
    paymentService: () => ({ config: { webhookSecret: env.RAZORPAY_WEBHOOK_SECRET } }),
    syncSubscription: async () => { calls.sync++; console.log('SIMULATED subscription sync; no access granted.'); },
    revokePayment: async () => { calls.revoke++; console.log('SIMULATED revocation; no data changed.'); },
  },
}).default;
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.on('finish', () => console.log(`Webhook receiver HTTP ${res.statusCode}`));
  next();
});
app.use(router);
app.use((_req, res) => res.status(404).json({ message: 'Webhook-only test receiver' }));
app.use((_err, _req, res, _next) => res.status(400).json({ message: 'Invalid test request' }));
const selfTest = process.argv.includes('--self-test');
const server = app.listen(selfTest ? 0 : 5051, '127.0.0.1', async () => {
  console.log('TEST ONLY: webhook receiver at http://127.0.0.1:' + server.address().port + '/api/billing/webhook');
  if (!selfTest) return;
  const url = `http://127.0.0.1:${server.address().port}/api/billing/webhook`;
  const sign = body => createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');
  const send = (body, signature) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(signature ? { 'x-razorpay-signature': signature } : {}) }, body });
  try {
    const body = JSON.stringify({ event: 'subscription.charged', payload: { subscription: { entity: { id: 'sub_localtest' } }, payment: { entity: { id: 'pay_localtest' } } } });
    assert.equal((await send(body, sign(body))).status, 200);
    assert.equal(calls.sync, 1);
    assert.equal((await send(body, '0'.repeat(64))).status, 400);
    assert.equal((await send(body)).status, 400);
    assert.equal((await send(body + ' ', sign(body))).status, 400);
    assert.equal((await send('{', sign('{'))).status, 400);
    assert.equal(calls.sync, 1);
    const refund = JSON.stringify({ event: 'refund.processed', payload: { refund: { entity: { payment_id: 'pay_localtest' } } } });
    assert.equal((await send(refund, sign(refund))).status, 200);
    assert.equal(calls.revoke, 1);
    console.log('PASS: valid signature, bad/missing signature, altered body, malformed JSON and refund dispatch.');
  } catch {
    console.error('Webhook self-test failed. No request bodies or secrets logged.');
    process.exitCode = 1;
  } finally { server.close(); }
});
server.on('error', () => { console.error('Cannot start local receiver; check whether port 5051 is in use.'); process.exitCode = 1; });
process.on('SIGINT', () => server.close());
