const test=require('node:test'),assert=require('node:assert/strict'),load=require('./load-ts-test.cjs');
const policy=load('artifacts/api-server/src/lib/billing-policy.ts');
const invoice={id:'inv_1',subscription_id:'sub_1',status:'paid',payment_id:'pay_1',amount:19900,amount_paid:19900,currency:'INR',billing_start:1700000000,billing_end:1700000000+30*86400};
const payment={id:'pay_1',invoice_id:'inv_1',amount:19900,currency:'INR',status:'captured',captured:true,amount_refunded:0,refund_status:null};
test('paid period requires exact linked captured payment, correct amount and monthly interval',()=>{
 assert.ok(policy.paidPeriod(invoice,payment,'sub_1'));
 for(const change of [{subscription_id:'sub_other'},{status:'issued'},{payment_id:'pay_other'},{amount:100},{currency:'USD'},{billing_end:invoice.billing_start+400*86400},{billing_start:null}])assert.equal(policy.paidPeriod({...invoice,...change},payment,'sub_1'),null);
 for(const change of [{status:'authorized'},{captured:false},{invoice_id:'inv_other'},{amount:100},{amount_refunded:1},{refund_status:'partial'}])assert.equal(policy.paidPeriod(invoice,{...payment,...change},'sub_1'),null);
});
test('plan rejects client discounts, annual plans and other currencies',()=>{
 const p={id:'plan_1',period:'monthly',interval:1,item:{amount:19900,currency:'INR'}};policy.checkPlan(p,'plan_1');
 for(const change of [{period:'yearly'},{interval:2},{id:'plan_2'},{item:{amount:1,currency:'INR'}},{item:{amount:19900,currency:'USD'}}])assert.throws(()=>policy.checkPlan({...p,...change},'plan_1'));
});
