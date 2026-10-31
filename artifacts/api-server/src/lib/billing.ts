import {randomUUID} from 'node:crypto';
import {pool} from '@workspace/db';
import {createRazorpayClient,razorpayConfig} from './razorpay';
import {checkPlan,paidPeriod} from './billing-policy';

export function paymentService(){
 const config=razorpayConfig();
 const planId=process.env.RAZORPAY_MONTHLY_PLAN_ID??'';
 if(!config||!/^plan_[a-zA-Z0-9]+$/.test(planId))throw new Error('Payments are not configured');
 return {config,planId,client:createRazorpayClient(config)};
}
export function checkoutAvailable(){
 return process.env.ENABLE_AI==='true' && !!process.env.AI_MODEL && !!(process.env.AI_PROVIDER==='openai'?process.env.OPENAI_API_KEY:process.env.GEMINI_API_KEY);
}
export async function createCheckout(userId:number){
 if(!checkoutAvailable())throw new Error('AI service must be configured before accepting payments');
 const {config,planId,client}=paymentService();
 await checkPlan(await client.fetchPlan(planId),planId);
 const paid=await pool.query(`SELECT 1 FROM billing_periods p JOIN billing_subscriptions s ON s.id=p.subscription_id WHERE p.user_id=$1 AND s.mode=$2 AND NOT p.revoked AND p.period_end>now()`,[userId,config.mode]);
 if(paid.rowCount)throw new Error('You already have a paid period. Manage your existing subscription.');
 const reference=randomUUID();
 const added=await pool.query(`INSERT INTO billing_subscriptions(id,user_id,plan_id,mode) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING id`,[reference,userId,planId,config.mode]);
 if(!added.rowCount){
  const old=await pool.query(`SELECT * FROM billing_subscriptions WHERE user_id=$1 AND mode=$2 AND status NOT IN ('cancelled','completed','expired')`,[userId,config.mode]);
  const existing=old.rows[0];
  if(existing?.status==='created'&&existing.provider_id){
   await syncSubscription(existing.provider_id);
   const current=await pool.query('SELECT status FROM billing_subscriptions WHERE id=$1',[existing.id]);
   if(current.rows[0]?.status==='created')return {keyId:config.keyId,subscriptionId:existing.provider_id,mode:config.mode};
  }
  throw new Error('A subscription already exists or creation is being confirmed. Refresh payment status; contact support if it remains pending.');
 }
 // Persist intent before the remote POST. On timeout leave it pending; never blindly create a second mandate.
 const subscription=await client.createSubscription(planId,120,reference);
 await pool.query("UPDATE billing_subscriptions SET provider_id=$2,status='created' WHERE id=$1 AND provider_id IS NULL",[reference,subscription.id]);
 return {keyId:config.keyId,subscriptionId:subscription.id as string,mode:config.mode};
}

export async function syncSubscription(providerId:string, onlyPaymentId?:string){
 const {config,client}=paymentService();
 const remote=await client.fetchSubscription(providerId);
 const reference=(remote.notes as Record<string,unknown>|undefined)?.reference;
 const found=await pool.query('SELECT * FROM billing_subscriptions WHERE mode=$1 AND (provider_id=$2 OR (id=$3 AND provider_id IS NULL))',[config.mode,providerId,typeof reference==='string'?reference:'']);
 if(!found.rowCount)return false; // Other merchant subscriptions do not belong to this app.
 const local=found.rows[0];
 const c=await pool.connect();
 try{
  await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(200,$1)',[local.user_id]);
  // Refetch after locking: old webhook deliveries cannot overwrite a newer provider state.
  const subscription=await client.fetchSubscription(providerId);
  if(subscription.plan_id!==local.plan_id||subscription.quantity!==1||(subscription.notes as Record<string,unknown>)?.reference!==local.id)throw new Error('Subscription ownership or plan mismatch');
  await checkPlan(await client.fetchPlan(local.plan_id),local.plan_id);
  await c.query('UPDATE billing_subscriptions SET provider_id=$2,status=$3 WHERE id=$1',[local.id,providerId,subscription.status]);
  let invoices:Record<string,any>[]=[];
  if(onlyPaymentId){
   const payment=await client.fetchPayment(onlyPaymentId);
   if(typeof payment.invoice_id==='string')invoices=[await client.fetchInvoice(payment.invoice_id)];
  }else{
   // Plans are capped at 120 cycles. Fetch all pages, not only the first invoice.
   for(let skip=0;skip<200;skip+=100){const page=await client.fetchInvoices(providerId,skip);const items=page.items as Record<string,any>[];if(!Array.isArray(items))throw new Error('Invalid invoice response');invoices.push(...items);if(items.length<100)break;}
  }
  for(const invoice of invoices){
   if(typeof invoice.payment_id!=='string'||invoice.subscription_id!==providerId)continue;
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[invoice.payment_id]);
   const payment=await client.fetchPayment(invoice.payment_id);
   if(Number(payment.amount_refunded)>0||payment.status==='refunded'){
    await c.query('INSERT INTO billing_revocations(payment_id) VALUES($1) ON CONFLICT DO NOTHING',[payment.id]);
    await c.query('UPDATE billing_periods SET revoked=true WHERE payment_id=$1',[payment.id]);continue;
   }
   const period=paidPeriod(invoice,payment,providerId);if(!period)continue;
   // A duplicate webhook never refills credits; refunds/disputes remain revoked even out of order.
   await c.query(`INSERT INTO billing_periods(payment_id,subscription_id,user_id,period_start,period_end,revoked)
    VALUES($1,$2,$3,to_timestamp($4),to_timestamp($5),EXISTS(SELECT 1 FROM billing_revocations WHERE payment_id=$1)) ON CONFLICT DO NOTHING`,[payment.id,local.id,local.user_id,period.start,period.end]);
  }
  await c.query('COMMIT');return true;
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
export async function ownedSubscription(userId:number){
 const {config}=paymentService();
 const r=await pool.query('SELECT * FROM billing_subscriptions WHERE user_id=$1 AND mode=$2 ORDER BY created_at DESC LIMIT 1',[userId,config.mode]);return r.rows[0];
}
export async function cancelRenewal(userId:number){
 const local=await ownedSubscription(userId);if(!local?.provider_id)throw new Error('No confirmed subscription to cancel');
 if(local.cancel_requested||['cancelled','completed','expired'].includes(local.status))return;
 await paymentService().client.cancelSubscriptionAtCycleEnd(local.provider_id);
 await pool.query('UPDATE billing_subscriptions SET cancel_requested=true WHERE id=$1',[local.id]);
 await syncSubscription(local.provider_id);
}
export async function revokePayment(paymentId:string){
 if(!/^pay_[a-zA-Z0-9]+$/.test(paymentId))throw new Error('Invalid payment ID');
 const c=await pool.connect();try{await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[paymentId]);await c.query('INSERT INTO billing_revocations(payment_id) VALUES($1) ON CONFLICT DO NOTHING',[paymentId]);await c.query('UPDATE billing_periods SET revoked=true WHERE payment_id=$1',[paymentId]);await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}



