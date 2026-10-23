const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),crypto=require('node:crypto');
const ts=require('../node_modules/typescript');const exportsForTest={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('artifacts/api-server/src/lib/razorpay.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsForTest,require,Buffer,process,AbortSignal,fetch});
const {razorpayConfig,verifyCheckoutSignature,verifyWebhookSignature,isCapturedPayment,createRazorpayClient}=exportsForTest;
const secret='synthetic-test-secret',sign=value=>crypto.createHmac('sha256',secret).update(value).digest('hex');
test('payments default off and live requires matching explicit configuration',()=>{
 assert.equal(razorpayConfig({}),null);
 assert.throws(()=>razorpayConfig({ENABLE_PAYMENTS:'true'}));
 const env={ENABLE_PAYMENTS:'true',RAZORPAY_MODE:'test',RAZORPAY_KEY_ID:'rzp_test_example',RAZORPAY_KEY_SECRET:secret,RAZORPAY_WEBHOOK_SECRET:secret};
 assert.equal(razorpayConfig(env).mode,'test');
 assert.throws(()=>razorpayConfig({...env,RAZORPAY_MODE:'live'}));
 assert.throws(()=>razorpayConfig({...env,RAZORPAY_MODE:'live',RAZORPAY_KEY_ID:'rzp_live_example'}));
});
test('checkout verifies persisted order and payment IDs; rejects forged signatures',()=>{
 const signature=sign('order_123|pay_123');
 assert.ok(verifyCheckoutSignature('order_123','pay_123',signature,secret));
 for(const value of [null,'',signature.slice(1),'x'.repeat(64)])assert.equal(verifyCheckoutSignature('order_123','pay_123',value,secret),false);
 assert.equal(verifyCheckoutSignature('order_456','pay_123',signature,secret),false);
 assert.equal(verifyCheckoutSignature('order_123','pay_456',signature,secret),false);
});
test('webhook verifies exact raw bytes',()=>{
 const raw=Buffer.from('{ "event": "payment.captured" }');
 assert.ok(verifyWebhookSignature(raw,sign(raw),secret));
 assert.equal(verifyWebhookSignature(Buffer.from(JSON.stringify(JSON.parse(raw))),sign(raw),secret),false);
 assert.equal(verifyWebhookSignature(raw,sign(raw),'wrong'),false);
});
test('only matching captured non-refunded payments qualify',()=>{
 const expected={id:'order_123',amount:10000,currency:'INR'};
 const p={entity:'payment',id:'pay_123',order_id:'order_123',amount:10000,currency:'INR',status:'captured',captured:true,amount_refunded:0,refund_status:null};
 assert.ok(isCapturedPayment(p,expected));
 for(const change of [{amount:1},{currency:'USD'},{order_id:'order_456'},{status:'authorized'},{captured:false},{amount_refunded:1},{refund_status:'partial'}])assert.equal(isCapturedPayment({...p,...change},expected),false);
});
test('orders validate amount and provider response and use fixed origin without redirects',async()=>{
 let count=0;
 const client=createRazorpayClient({keyId:'rzp_test_example',keySecret:secret},async(url,options)=>{count++;assert.equal(url,'https://api.razorpay.com/v1/orders');assert.equal(options.redirect,'error');const body=JSON.parse(options.body);assert.equal(body.partial_payment,false);return {ok:true,json:async()=>({...body,id:'order_123',status:'created'})};});
 assert.equal((await client.createOrder(10000,'INR','receipt_1')).id,'order_123');
 await assert.rejects(()=>client.createOrder(1.5,'INR','receipt_1'));assert.equal(count,1);
 await assert.rejects(()=>client.fetchPayment('../orders'));
 const wrong=createRazorpayClient({keyId:'x',keySecret:secret},async()=>({ok:true,json:async()=>({id:'order_123',amount:1,currency:'INR',receipt:'receipt_1',status:'created'})}));
 await assert.rejects(()=>wrong.createOrder(10000,'INR','receipt_1'));
});

test('subscription checkout uses payment then persisted subscription, not order signature',()=>{
 const verify=exportsForTest.verifySubscriptionSignature;
 assert.ok(verify('sub_123','pay_123',sign('pay_123|sub_123'),secret));
 assert.equal(verify('sub_123','pay_123',sign('sub_123|pay_123'),secret),false);
 assert.equal(verify('sub_456','pay_123',sign('pay_123|sub_123'),secret),false);
});
test('subscription requests use server plan, explicit cycles and end-of-cycle cancellation',async()=>{
 const calls=[];
 const client=createRazorpayClient({keyId:'rzp_test_example',keySecret:secret},async(url,options)=>{calls.push({url,options});const body=JSON.parse(options.body);return {ok:true,json:async()=>({...body,id:'sub_123',status:'created'})};});
 await client.createSubscription('plan_123',12,'reference_1');
 assert.equal(calls[0].url,'https://api.razorpay.com/v1/subscriptions');
 assert.equal(JSON.parse(calls[0].options.body).customer_notify,true);
 await client.cancelSubscriptionAtCycleEnd('sub_123');
 assert.equal(JSON.parse(calls[1].options.body).cancel_at_cycle_end,1);
 await assert.rejects(()=>client.createSubscription('plan_123',0,'reference_1'));
 await assert.rejects(()=>client.fetchSubscription('../orders'));
});

