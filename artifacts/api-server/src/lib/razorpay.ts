import { createHmac, timingSafeEqual } from 'node:crypto';

export type RazorpayConfig = { keyId: string; keySecret: string; webhookSecret: string; mode: 'test' | 'live' };
export function razorpayConfig(env: NodeJS.ProcessEnv = process.env): RazorpayConfig | null {
  if (env.ENABLE_PAYMENTS !== 'true') return null;
  const mode = env.RAZORPAY_MODE || 'test';
  if (mode !== 'test' && mode !== 'live') throw new Error('Invalid Razorpay mode');
  const keyId = env.RAZORPAY_KEY_ID || '', keySecret = env.RAZORPAY_KEY_SECRET || '', webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!keyId.startsWith(`rzp_${mode}_`) || !keySecret || !webhookSecret) throw new Error('Razorpay configuration is incomplete or has mismatched mode');
  if (mode === 'live' && env.ALLOW_LIVE_PAYMENTS !== 'true') throw new Error('Live payments have not been enabled');
  return {keyId, keySecret, webhookSecret, mode};
}
function validSignature(payload: string | Buffer, signature: unknown, secret: string): boolean {
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(payload).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
// orderId must come from the persisted order owned by the authenticated user.
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: unknown, secret: string): boolean {
  if (!/^order_[a-zA-Z0-9]+$/.test(orderId) || !/^pay_[a-zA-Z0-9]+$/.test(paymentId)) return false;
  return validSignature(`${orderId}|${paymentId}`, signature, secret);
}
// Pass original request bytes before express.json(), never reserialized JSON.
export function verifyWebhookSignature(rawBody: Buffer, signature: unknown, secret: string): boolean {
  return Buffer.isBuffer(rawBody) && validSignature(rawBody, signature, secret);
}
// Subscription Checkout uses payment|subscription (unlike order Checkout).
export function verifySubscriptionSignature(subscriptionId: string, paymentId: string, signature: unknown, secret: string): boolean {
  return /^sub_[a-zA-Z0-9]+$/.test(subscriptionId) && /^pay_[a-zA-Z0-9]+$/.test(paymentId) && validSignature(paymentId + '|' + subscriptionId, signature, secret);
}
export type ExpectedOrder = {id: string; amount: number; currency: string};
export function isCapturedPayment(payment: unknown, expected: ExpectedOrder): boolean {
  if (!payment || typeof payment !== 'object') return false;
  const p = payment as Record<string, unknown>;
  return p.entity === 'payment' && typeof p.id === 'string' && /^pay_[a-zA-Z0-9]+$/.test(p.id)
    && p.order_id === expected.id && p.amount === expected.amount && p.currency === expected.currency
    && p.status === 'captured' && p.captured === true && (p.amount_refunded === 0) && !p.refund_status;
}
export function createRazorpayClient(config: RazorpayConfig, transport: typeof fetch = fetch) {
  async function request(endpoint: string, body?: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Fixed origin and constrained endpoint callers prevent credential forwarding.
    const response = await transport(`https://api.razorpay.com/v1/${endpoint}`, {
      method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: {Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`, 'Content-Type': 'application/json'},
      ...(body ? {body: JSON.stringify(body)} : {}),
    });
    // Do not expose provider bodies, credentials, or customer information in errors.
    if (!response.ok) throw new Error('Payment provider request failed');
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid payment provider response');
    return data as Record<string, unknown>;
  }
  return {
    async createOrder(amount: number, currency: string, receipt: string) {
      // Values must originate from a server-owned price record, never a browser amount.
      if (!Number.isSafeInteger(amount) || amount <= 0 || !/^[A-Z]{3}$/.test(currency) || !/^[a-zA-Z0-9_-]{1,40}$/.test(receipt)) throw new Error('Invalid payment order');
      // No automatic POST retry: a timeout can mean an order already exists upstream.
      const order = await request('orders', {amount, currency, receipt, partial_payment: false});
      if (typeof order.id !== 'string' || !/^order_[a-zA-Z0-9]+$/.test(order.id) || order.amount !== amount || order.currency !== currency || order.receipt !== receipt || order.status !== 'created') throw new Error('Payment order does not match request');
      return {id: order.id, amount, currency, receipt};
    },
    async fetchPlan(planId: string) {
      if (!/^plan_[a-zA-Z0-9]+$/.test(planId)) throw new Error('Invalid plan ID');
      return request('plans/' + planId);
    },
    async createSubscription(planId: string, totalCount: number, reference: string) {
      if (!/^plan_[a-zA-Z0-9]+$/.test(planId) || !Number.isSafeInteger(totalCount) || totalCount < 1 || !/^[a-zA-Z0-9_-]{1,40}$/.test(reference)) throw new Error('Invalid subscription');
      const subscription = await request('subscriptions', {plan_id: planId, total_count: totalCount, quantity: 1, customer_notify: true, notes: {reference}});
      if (typeof subscription.id !== 'string' || !/^sub_[a-zA-Z0-9]+$/.test(subscription.id) || subscription.plan_id !== planId || subscription.total_count !== totalCount || subscription.quantity !== 1 || subscription.status !== 'created') throw new Error('Subscription does not match request');
      return subscription;
    },
    async fetchSubscription(subscriptionId: string) {
      if (!/^sub_[a-zA-Z0-9]+$/.test(subscriptionId)) throw new Error('Invalid subscription ID');
      return request('subscriptions/' + subscriptionId);
    },
    async cancelSubscriptionAtCycleEnd(subscriptionId: string) {
      if (!/^sub_[a-zA-Z0-9]+$/.test(subscriptionId)) throw new Error('Invalid subscription ID');
      return request('subscriptions/' + subscriptionId + '/cancel', {cancel_at_cycle_end: 1});
    },
    async fetchInvoice(invoiceId: string) {
      if (!/^inv_[a-zA-Z0-9]+$/.test(invoiceId)) throw new Error('Invalid invoice');
      return request('invoices/' + invoiceId);
    },
    async fetchInvoices(subscriptionId: string, skip = 0) {
      if (!/^sub_[a-zA-Z0-9]+$/.test(subscriptionId) || !Number.isSafeInteger(skip) || skip < 0) throw new Error('Invalid subscription');
      return request('invoices?subscription_id=' + subscriptionId + '&count=100&skip=' + skip);
    },
    async fetchPayment(paymentId: string) {
      if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId)) throw new Error('Invalid payment ID');
      return request(`payments/${paymentId}`);
    },
  };
}

