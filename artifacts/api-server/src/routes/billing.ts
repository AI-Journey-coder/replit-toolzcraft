import {Router,type IRouter} from 'express';
import {requireAuth} from '../middlewares/auth';
import {requireAccount} from '../middlewares/account';
import {backendAccess} from '../lib/backend-quota';
import {checkoutAvailable,cancelRenewal,createCheckout,ownedSubscription,paymentService,syncSubscription} from '../lib/billing';
import {verifySubscriptionSignature} from '../lib/razorpay';
const router:IRouter=Router();
router.get('/billing/config',(_req,res)=>{try{const {config}=paymentService();res.json({enabled:checkoutAvailable(),mode:config.mode,amount:19900,currency:'INR',credits:100});}catch{res.json({enabled:false,amount:19900,currency:'INR',credits:100});}});
router.use('/billing',requireAuth,requireAccount);
router.get('/billing/access',async(req,res)=>{res.json(await backendAccess(req.dbUser!.id));});
// Bound provider API traffic; the database unique index is the cross-instance duplicate-mandate guard.
const actions=new Map<string,number>();
router.use('/billing', (req,res,next)=>{if(req.method==='GET'){next();return;}const id=String(req.dbUser!.id)+req.path,now=Date.now();if((actions.get(id)??0)>now-3000){res.status(429).json({message:'Wait a few seconds before trying again.'});return;}if(actions.size>10000)for(const [key,time]of actions)if(time<now-60000)actions.delete(key);actions.set(id,now);next();});
router.post('/billing/checkout',async(req,res)=>{try{res.json(await createCheckout(req.dbUser!.id));}catch{res.status(409).json({message:'Checkout unavailable or a subscription already exists. Refresh payment status before retrying; contact support if pending.'});}});
router.post('/billing/verify',async(req,res)=>{
 const local=await ownedSubscription(req.dbUser!.id);const {config}=paymentService();
 if(!local?.provider_id||!verifySubscriptionSignature(local.provider_id,req.body?.razorpay_payment_id,req.body?.razorpay_signature,config.keySecret)){res.status(400).json({message:'Payment verification failed'});return;}
 await syncSubscription(local.provider_id,req.body.razorpay_payment_id);
 res.json(await backendAccess(req.dbUser!.id));
});
router.post('/billing/refresh',async(req,res)=>{const local=await ownedSubscription(req.dbUser!.id);if(local?.provider_id)await syncSubscription(local.provider_id);res.json(await backendAccess(req.dbUser!.id));});
router.post('/billing/cancel',async(req,res)=>{await cancelRenewal(req.dbUser!.id);res.json(await backendAccess(req.dbUser!.id));});
export default router;

