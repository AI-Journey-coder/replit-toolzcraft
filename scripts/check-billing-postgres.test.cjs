const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto'),load=require('./load-ts-test.cjs');
const {Pool}=require(require.resolve('pg',{paths:[path.resolve('lib/db')]}));
const url=process.env.BILLING_TEST_DATABASE_URL;
test('billing and credit ledger on real PostgreSQL',{skip:!url},async(t)=>{
 const schema='billing_test_'+crypto.randomBytes(8).toString('hex');const root=new Pool({connectionString:url});await root.query(`CREATE SCHEMA ${schema}`);
 const pool=new Pool({connectionString:url,options:`-c search_path=${schema}`,max:20});
 let mode='test',created=0;const remotes=new Map(),invoices=new Map(),payments=new Map();
 const config=()=>({mode,keyId:'rzp_test_fixture',keySecret:'fixture',webhookSecret:'fixture'});
 const client={fetchPlan:async(id)=>({id,period:'monthly',interval:1,item:{amount:19900,currency:'INR'}}),
  createSubscription:async(plan,total,reference)=>{created++;const s={id:'sub_'+created,plan_id:plan,total_count:total,quantity:1,status:'created',notes:{reference}};remotes.set(s.id,s);return s;},
  fetchSubscription:async(id)=>{assert.ok(remotes.has(id));return {...remotes.get(id)};},fetchPayment:async(id)=>{assert.ok(payments.has(id));return {...payments.get(id)};},fetchInvoice:async(id)=>invoices.get(id),fetchInvoices:async(id)=>({items:[...invoices.values()].filter(i=>i.subscription_id===id)}),
  cancelSubscriptionAtCycleEnd:async(id)=>{remotes.get(id).scheduled=true;return remotes.get(id);}};
 const provider={razorpayConfig:config,createRazorpayClient:()=>client};const policy=load('artifacts/api-server/src/lib/billing-policy.ts');
 const quota=load('artifacts/api-server/src/lib/backend-quota.ts',{'@workspace/db':{pool},'./razorpay':provider});
 const billing=load('artifacts/api-server/src/lib/billing.ts',{'@workspace/db':{pool},'./razorpay':provider,'./billing-policy':policy});
 const oldAi={ENABLE_AI:process.env.ENABLE_AI,AI_MODEL:process.env.AI_MODEL,AI_PROVIDER:process.env.AI_PROVIDER,GEMINI_API_KEY:process.env.GEMINI_API_KEY};Object.assign(process.env,{ENABLE_AI:'true',AI_MODEL:'fixture',AI_PROVIDER:'gemini',GEMINI_API_KEY:'fixture'});
 const oldPlan=process.env.RAZORPAY_MONTHLY_PLAN_ID;process.env.RAZORPAY_MONTHLY_PLAN_ID='plan_fixture';
 try{
  for(const name of ['0000_initial','0001_backend_trials','0002_billing','0003_admin_audit','0004_admin_credits'])await pool.query(fs.readFileSync(`lib/db/migrations/${name}.sql`,'utf8'));
  const user=async(uid)=>(await pool.query('INSERT INTO users(firebase_uid) VALUES($1) RETURNING id',[uid])).rows[0].id;
  const u=await user('trial'),p=await user('paid');
  await t.test('three trial credits are atomic under 20 parallel requests and failures restore exactly once',async()=>{
   const r=await Promise.all(Array.from({length:20},()=>quota.claimBackendAttempt(u)));assert.equal(r.filter(x=>x.allowed).length,3);
   const id=r.find(x=>x.allowed).reservation;await Promise.all([quota.finishBackendAttempt(id,u,false),quota.finishBackendAttempt(id,u,false)]);
   assert.equal((await quota.backendAccess(u)).remaining,1);assert.equal((await quota.claimBackendAttempt(u)).allowed,true);assert.equal((await quota.claimBackendAttempt(u)).allowed,false);
  });
  await t.test('abandoned reservations recover and successful completion cannot be refunded twice',async()=>{
   await pool.query("UPDATE ai_credit_reservations SET created_at=now()-interval '6 minutes' WHERE user_id=$1",[u]);
   const r=await quota.claimBackendAttempt(u);assert.equal(r.remaining,2);await quota.finishBackendAttempt(r.reservation,u,true);await quota.finishBackendAttempt(r.reservation,u,false);assert.equal((await quota.backendAccess(u)).remaining,2);
  });
  await t.test('administrators have unlimited credits without reservations; disabled admins are denied',async()=>{
   const a=await user('admin-test');await pool.query("UPDATE users SET role='admin' WHERE id=$1",[a]);
   const claims=await Promise.all(Array.from({length:6},()=>quota.claimBackendAttempt(a)));assert.ok(claims.every(r=>r.allowed&&r.unlimited&&r.remaining===null&&!r.reservation));
   assert.equal((await quota.backendAccess(a)).unlimited,true);assert.equal((await pool.query('SELECT count(*)::int AS n FROM ai_credit_reservations WHERE user_id=$1',[a])).rows[0].n,0);
   await pool.query('UPDATE users SET disabled=true WHERE id=$1',[a]);assert.equal((await quota.claimBackendAttempt(a)).allowed,false);
  });
  await t.test('manual balances are atomic, failed requests restore once, and reset restores trial allowance',async()=>{
   const a=await user('override-test');await pool.query('INSERT INTO user_credit_overrides(user_id,remaining) VALUES($1,2)',[a]);
   const claims=await Promise.all(Array.from({length:8},()=>quota.claimBackendAttempt(a)));assert.equal(claims.filter(r=>r.allowed).length,2);assert.equal((await quota.backendAccess(a)).remaining,0);
   const ids=claims.filter(r=>r.allowed).map(r=>r.reservation);await Promise.all([quota.finishBackendAttempt(ids[0],a,false),quota.finishBackendAttempt(ids[0],a,false)]);assert.equal((await quota.backendAccess(a)).remaining,1);
   await quota.finishBackendAttempt(ids[1],a,true);await pool.query('DELETE FROM user_credit_overrides WHERE user_id=$1',[a]);assert.equal((await quota.backendAccess(a)).remaining,3);
  });
  await t.test('stale manual reservations restore the manual balance, not trial credits',async()=>{
   const a=await user('stale-override');await pool.query('INSERT INTO user_credit_overrides(user_id,remaining) VALUES($1,1)',[a]);await quota.claimBackendAttempt(a);
   await pool.query("UPDATE ai_credit_reservations SET created_at=now()-interval '6 minutes' WHERE user_id=$1",[a]);const next=await quota.claimBackendAttempt(a);assert.equal(next.allowed,true);assert.equal(next.remaining,0);assert.equal((await pool.query('SELECT count(*)::int AS n FROM backend_trials WHERE user_id=$1',[a])).rows[0].n,0);
  });
  let subscription;
  await t.test('parallel checkout creates only one provider mandate',async()=>{
   const r=await Promise.allSettled(Array.from({length:8},()=>billing.createCheckout(p)));assert.equal(created,1);subscription=r.find(x=>x.status==='fulfilled').value.subscriptionId;
  });
  await t.test('authorization alone never grants paid access',async()=>{remotes.get(subscription).status='authenticated';await billing.syncSubscription(subscription);assert.equal((await quota.backendAccess(p)).subscribed,false);});
  const now=Math.floor(Date.now()/1000),invoice={id:'inv_first',subscription_id:subscription,status:'paid',payment_id:'pay_first',amount:19900,amount_paid:19900,currency:'INR',billing_start:now-100,billing_end:now-100+30*86400};
  invoices.set(invoice.id,invoice);payments.set('pay_first',{id:'pay_first',invoice_id:invoice.id,amount:19900,currency:'INR',status:'captured',captured:true,amount_refunded:0,refund_status:null});remotes.get(subscription).status='active';
  await t.test('captured invoice activates credits and duplicate events never reset usage',async()=>{
   await billing.syncSubscription(subscription,'pay_first');assert.equal((await quota.backendAccess(p)).remaining,100);
   const r=await quota.claimBackendAttempt(p);await quota.finishBackendAttempt(r.reservation,p,true);await Promise.all([billing.syncSubscription(subscription),billing.syncSubscription(subscription)]);assert.equal((await quota.backendAccess(p)).remaining,99);
  });
  await t.test('100 monthly credits cannot be exceeded under concurrency',async()=>{const r=await Promise.all(Array.from({length:110},()=>quota.claimBackendAttempt(p)));assert.equal(r.filter(x=>x.allowed).length,99);assert.equal((await quota.backendAccess(p)).remaining,0);});
  await t.test('test purchases never grant live credits',async()=>{mode='live';assert.equal((await quota.backendAccess(p)).subscribed,false);mode='test';});
  await t.test('cancel at cycle end preserves current paid access',async()=>{await billing.cancelRenewal(p);const a=await quota.backendAccess(p);assert.equal(a.subscribed,true);assert.equal(a.cancelRequested,true);assert.ok(remotes.get(subscription).scheduled);});
  await t.test('refund/dispute revokes access and a later charged delivery cannot resurrect it',async()=>{await billing.revokePayment('pay_first');await billing.syncSubscription(subscription);assert.equal((await quota.backendAccess(p)).subscribed,false);});
  await t.test('revocation before activation is preserved',async()=>{const inv={...invoice,id:'inv_second',payment_id:'pay_second',billing_start:now-200,billing_end:now-200+30*86400};invoices.set(inv.id,inv);payments.set(inv.payment_id,{...payments.get('pay_first'),id:inv.payment_id,invoice_id:inv.id});await billing.revokePayment('pay_second');await billing.syncSubscription(subscription);assert.equal((await quota.backendAccess(p)).subscribed,false);});
  await t.test('other accounts cannot consume a paid account entitlement',async()=>{const other=await user('other');assert.equal((await quota.backendAccess(other)).subscribed,false);});
  await t.test('signed raw webhook is required and retries do not trust an unsigned event',async()=>{
   const express=require(require.resolve('express',{paths:[path.resolve('artifacts/api-server')]}));const realProvider=load('artifacts/api-server/src/lib/razorpay.ts');let synced=0;
   const router=load('artifacts/api-server/src/routes/billing-webhook.ts',{'../lib/billing':{paymentService:()=>({config:config()}),revokePayment:billing.revokePayment,syncSubscription:async()=>{synced++;}},'../lib/razorpay':realProvider}).default;
   const app=express();app.use(router);app.use(express.json());const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
   const body=JSON.stringify({event:'subscription.charged',payload:{subscription:{entity:{id:subscription}},payment:{entity:{id:'pay_first'}}}});const signature=crypto.createHmac('sha256','fixture').update(body).digest('hex');
   try{for(const [sig,status]of [['0'.repeat(64),400],[signature,200]]){const r=await fetch(`http://127.0.0.1:${server.address().port}/api/billing/webhook`,{method:'POST',headers:{'Content-Type':'application/json','x-razorpay-signature':sig},body});assert.equal(r.status,status);}assert.equal(synced,1);}finally{await new Promise(r=>server.close(r));}
  });
 }finally{for(const [k,v]of Object.entries(oldAi)){if(v===undefined)delete process.env[k];else process.env[k]=v;}if(oldPlan===undefined)delete process.env.RAZORPAY_MONTHLY_PLAN_ID;else process.env.RAZORPAY_MONTHLY_PLAN_ID=oldPlan;await pool.end();await root.query(`DROP SCHEMA ${schema} CASCADE`);await root.end();}
});

