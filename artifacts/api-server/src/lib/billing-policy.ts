export const MONTHLY_AMOUNT = 19900;
export const MONTHLY_CREDITS = 100;
export const AI_INPUT_LIMIT = 6000;
export function checkPlan(plan: Record<string, any>, id: string) {
  if (plan.id !== id || plan.period !== 'monthly' || plan.interval !== 1 ||
      plan.item?.amount !== MONTHLY_AMOUNT || plan.item?.currency !== 'INR') {
    throw new Error('Monthly plan must be INR 199.00 every month');
  }
}
// A mandate/authorization or active status alone never grants paid credits.
export function paidPeriod(invoice: Record<string, any>, payment: Record<string, any>, subscriptionId: string) {
  if (invoice.subscription_id !== subscriptionId || invoice.status !== 'paid' ||
      invoice.payment_id !== payment.id || invoice.id !== payment.invoice_id ||
      invoice.amount !== MONTHLY_AMOUNT || invoice.amount_paid !== MONTHLY_AMOUNT ||
      invoice.currency !== 'INR' || payment.amount !== MONTHLY_AMOUNT || payment.currency !== 'INR' ||
      payment.status !== 'captured' || payment.captured !== true || payment.amount_refunded !== 0 || payment.refund_status) return null;
  const start = invoice.billing_start, end = invoice.billing_end;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start <= 0 || end <= start ||
      end - start > 32 * 86400 || end - start < 27 * 86400) return null;
  return {start, end};
}
