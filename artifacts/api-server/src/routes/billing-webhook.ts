import {Router,raw,type IRouter} from 'express';
import {paymentService,revokePayment,syncSubscription} from '../lib/billing';
import {verifyWebhookSignature} from '../lib/razorpay';
const router:IRouter=Router();
router.post('/api/billing/webhook',raw({type:'application/json',limit:'256kb'}),async(req,res)=>{
 const {config}=paymentService();
 if(!verifyWebhookSignature(req.body,req.headers['x-razorpay-signature'],config.webhookSecret)){res.status(400).json({message:'Invalid signature'});return;}
 let event;try{event=JSON.parse(req.body.toString('utf8'));}catch{res.status(400).json({message:'Invalid JSON'});return;}
 const subscription=event.payload?.subscription?.entity;
 const payment=event.payload?.payment?.entity;
 if(['refund.created','refund.processed','payment.dispute.created','payment.dispute.lost'].includes(event.event)){
  const id=event.payload?.refund?.entity?.payment_id??event.payload?.dispute?.entity?.payment_id??payment?.id;
  if(typeof id==='string')await revokePayment(id);
 }
 if(typeof event.event==='string'&&event.event.startsWith('subscription.')&&typeof subscription?.id==='string'){
  await syncSubscription(subscription.id, event.event==='subscription.charged'?payment?.id:undefined);
 }
 res.json({received:true});
});
export default router;
