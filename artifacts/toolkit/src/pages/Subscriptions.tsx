import {Layers, CircleCheck, CalendarDays, ShieldCheck, RotateCcw, LifeBuoy, Info, ChevronDown} from 'lucide-react';
import {usePreferences} from '@/hooks/use-preferences';
import {preferredDate} from '@/lib/display-units';
import {useEffect,useState} from 'react';
import {Link} from 'wouter';
import {useAuth} from '@/hooks/use-auth';
import {apiUrl,authedFetch} from '@/lib/api';

type Access={unlimited?:boolean;creditOverride?:boolean;subscribed:boolean;remaining:number|null;paidUntil:string|null;status:string|null;cancelRequested:boolean};
type Config={enabled:boolean;mode?:'test'|'live'};
type CheckoutReply={razorpay_payment_id:string;razorpay_subscription_id:string;razorpay_signature:string};
type RazorpayInstance={open:()=>void;on:(event:string,callback:()=>void)=>void};
declare global {interface Window {Razorpay?:new(options:Record<string,unknown>)=>RazorpayInstance}}
const planButton = 'inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const planCard = 'flex flex-col gap-4 rounded-2xl border bg-card p-6';
let checkoutScript:Promise<void>|null=null;
function loadCheckout(){
 if(window.Razorpay)return Promise.resolve();
 if(!checkoutScript)checkoutScript=new Promise<void>((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.async=true;
  const timer=setTimeout(()=>{script.remove();checkoutScript=null;reject(Error('Checkout timed out. Please retry.'));},15000);
  script.onload=()=>{clearTimeout(timer);if(window.Razorpay)resolve();else{checkoutScript=null;reject(Error('Checkout could not load.'));}};
  script.onerror=()=>{clearTimeout(timer);script.remove();checkoutScript=null;reject(Error('Checkout could not load. Check your connection or content blocker.'));};document.head.appendChild(script);
 });return checkoutScript;
}
export function Subscriptions(){ const {preferences}=usePreferences();
 const {firebaseUser}=useAuth();const [config,setConfig]=useState<Config>({enabled:false});const [access,setAccess]=useState<Access|null>(null);
 const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [confirmCancel,setConfirmCancel]=useState(false);
 const request=async<T,>(path:string,body?:unknown):Promise<T>=>{if(!firebaseUser)throw Error('Sign in first.');return authedFetch<T>(await firebaseUser.getIdToken(),path,body===undefined?undefined:{method:'POST',body:JSON.stringify(body)});};
 useEffect(()=>{let active=true;fetch(apiUrl('billing/config')).then(r=>{if(!r.ok)throw Error();return r.json();}).then(c=>{if(active)setConfig(c);}).catch(()=>{if(active)setMessage('Online billing is not connected yet. No payment can be taken.');});return()=>{active=false;};},[]);
 useEffect(()=>{let active=true;setAccess(null);if(firebaseUser)request<Access>('billing/access').then(a=>{if(active)setAccess(a);}).catch(()=>{if(active)setMessage('Account billing is unavailable. Please try again later.');});return()=>{active=false;};},[firebaseUser]);
 const refresh=async()=>{setBusy(true);try{const a=await request<Access>('billing/refresh',{});setAccess(a);setMessage(a.subscribed?'Payment confirmed. Your monthly credits are available.':'No current paid period confirmed yet. If you just paid, allow a moment for confirmation; do not pay again.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}};
 const checkout=async()=>{
  setBusy(true);setMessage('Opening secure checkout…');
  try{
   await loadCheckout();const details=await request<{keyId:string;subscriptionId:string;mode:string}>('billing/checkout',{});
   const gateway=new window.Razorpay!({key:details.keyId,subscription_id:details.subscriptionId,name:'ToolzCraft',description:'Pro Monthly · ₹199/month · 100 AI credits',
    handler:async(reply:CheckoutReply)=>{try{const a=await request<Access>('billing/verify',reply);setAccess(a);setMessage(a.subscribed?'Payment verified. Pro credits are available.':'Authorization received. Access activates when the monthly payment is confirmed. Use Refresh payment status shortly.');}catch{setMessage('Checkout returned, but payment confirmation is pending. Refresh payment status before attempting another payment.');}finally{setBusy(false);}},
    modal:{ondismiss:()=>{setBusy(false);setMessage('Checkout closed. If you paid, refresh payment status before trying again.');}},theme:{color:'#087f6b'}});
   gateway.on('payment.failed',()=>{setBusy(false);setMessage('Payment was not confirmed. Refresh payment status before retrying.');});gateway.open();
  }catch(e){setMessage((e as Error).message);setBusy(false);}
 };
 const cancel=async()=>{setBusy(true);try{setAccess(await request<Access>('billing/cancel',{}));setMessage('Renewal cancellation requested. Any remaining paid credits stay available until the paid period ends.');setConfirmCancel(false);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}};
 return <div className="max-w-5xl mx-auto space-y-8"><header className="text-center space-y-3"><p className="text-primary font-semibold">ToolzCraft plans</p><h1 className="text-4xl font-bold">Local tools stay free</h1><p>Subscribe for AI summaries, key points, document questions and translation.</p></header>
 {config.mode==='test'&&<p className="border rounded-xl p-4">Test checkout — use Razorpay test payment details only. This does not purchase live access.</p>}
 {message&&<p role="status" className="border rounded-xl p-4">{message}</p>}
 {access&&<section className="border rounded-xl p-4 space-y-2"><p>{access.unlimited?'Administrator':access.creditOverride?'Admin-assigned allowance':access.subscribed?'Pro':'Free trial'}: <strong>{access.unlimited?'Unlimited':access.remaining} AI credits remaining</strong>.</p>{access.paidUntil&&!access.unlimited&&!access.creditOverride&&<p>Current credits expire {preferredDate(new Date(access.paidUntil),preferences.dateFormat)}. Credits do not roll over.</p>}{access.cancelRequested&&<p>Renewal cancellation requested.</p>}{access.status&&<p>Subscription status: {access.status}</p>}</section>}
 <div className="grid md:grid-cols-2 gap-6"><section className={planCard}><h2 className="text-2xl font-bold">Free</h2><p><strong className="text-3xl">₹0</strong></p><ul className="list-disc pl-5 space-y-2"><li>Browser utilities including compression, PDF editing, SQL conversion and OCR</li><li>Public exchange-rate and inflation lookups</li><li>3 lifetime AI credits shared across all eight AI workflows after sign-in</li></ul><div className="mt-auto pt-2"><Link className={planButton} href="/">Explore tools</Link></div></section>
 <section className={planCard}><h2 className="text-2xl font-bold">Pro Monthly</h2><p><strong className="text-3xl">₹199</strong> / month</p><p>Total charged: ₹199 INR per billing month. No extra checkout fee is added by ToolzCraft.</p><ul className="list-disc pl-5 space-y-2"><li>100 AI credits each paid billing month</li><li>Quick AI requests: 1 credit for up to 6,000 characters. Full Document summaries: 1–4 credits, shown before confirmation</li><li>Failed requests restore the reserved credit</li><li>Cancel renewal from this page; paid access continues until expiry</li></ul>
 <div className="mt-auto pt-2">{!firebaseUser?<Link className={planButton} href="/login">Sign in to subscribe</Link>:<button className={planButton} disabled={busy||!config.enabled||access===null||!!access.subscribed||!!access.unlimited} onClick={checkout}>{access?.unlimited?'Administrator · unlimited':access?.subscribed?'Current plan':config.enabled?'Subscribe for ₹199/month':'Checkout awaiting configuration'}</button>}</div>
 </section></div>
 <p className="text-sm text-muted-foreground">Renews monthly through Razorpay until cancelled, for up to 120 billing cycles. Your bank may apply currency-conversion charges. Payment methods depend on merchant and bank support.</p>
 {firebaseUser&&config.enabled&&<section className="flex flex-wrap gap-4"><button disabled={busy} onClick={refresh} className="underline disabled:opacity-50">Refresh payment status</button>{access?.status&&!access.cancelRequested&&!['cancelled','completed','expired','creating','created'].includes(access.status)&&<button disabled={busy} onClick={()=>setConfirmCancel(true)} className="underline">Cancel renewal</button>}</section>}
 {confirmCancel&&<section className="border rounded-xl p-5 space-y-3"><p>Cancel automatic renewal? Remaining credits stay available until the paid period ends.</p><button disabled={busy} onClick={cancel} className="border rounded p-2 mr-3">Confirm cancellation</button><button disabled={busy} onClick={()=>setConfirmCancel(false)} className="underline">Keep subscription</button></section>}
 <section className="space-y-4" aria-labelledby="credits-heading">
 <div><h2 id="credits-heading" className="text-xl font-semibold">How credits work</h2><p className="text-sm text-muted-foreground mt-1">Tap a card for details.</p></div>
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
 {[
 {icon:Layers,title:'8 workflows, one balance',workflows:true,caption:'Use credits across all AI tools',detail:'Your balance is shared across AI Document Intelligence, AI Key Points, AI Document Q&A, AI Translator, invoice extraction, table extraction, scan assistance and document comparison. Signing out or changing browsers does not reset usage.'},
 {icon:CircleCheck,title:'Clear credits before processing',caption:'Charged only for successful requests',detail:'Document Intelligence local extraction, invoice checks and text comparison use no credits. Each AI analysis accepts up to 24,000 selected characters including your question and costs one credit per started 6,000 characters (maximum four), shown before confirmation. Other short AI requests use one credit within their published limits. Each question is a separate request. Responses are limited to about 2,048 tokens (pieces of text); split long translations into smaller requests.'},
 {icon:CalendarDays,title:'100 credits per paid month',caption:'Renewed after successful payment',detail:'Pro credits renew only after a successful monthly charge. Unused credits expire at the end of the paid period and do not roll over. The free trial includes 3 lifetime credits.'},
 {icon:ShieldCheck,title:'No extra usage charges',caption:'At 100 credits, wait for renewal',detail:'Once your monthly credits are used, wait for the next paid billing cycle. There are no automatic overage charges or top-ups.'},
 {icon:RotateCcw,title:'Failed request? Credit restored',caption:'Interrupted requests may take 5 minutes',detail:'Failed processing releases the reserved credit. Interrupted requests may take up to five minutes to recover on your next request. AI tools require an available AI service.'},
 {icon:LifeBuoy,title:'Cancel & get billing help',caption:'Cancellation stops future renewals',detail:'Cancellation does not automatically refund an existing charge. A refunded or disputed payment suspends the access funded by that payment.',support:true},
 ].map(({icon:Icon,title,caption,detail,support,workflows})=><details key={title} className="group rounded-xl border bg-card open:border-primary/50">
 <summary className="flex min-h-28 cursor-pointer list-none items-start gap-3 rounded-xl p-4 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true"/></span>
 <span className="min-w-0 flex-1"><span className="block font-semibold text-sm">{title}</span><span className="block text-xs text-muted-foreground mt-1">{caption}</span></span>
 <span className="flex shrink-0 items-center gap-1 text-muted-foreground mt-1"><Info className="h-4 w-4" aria-hidden="true"/><ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden="true"/><span className="sr-only">More information</span></span>
 </summary><div className="border-t px-4 py-3 text-sm text-muted-foreground"><p>{detail}</p>{workflows&&<Link href="/category/ai" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore all 8 AI workflows →</Link>}{support&&<a className="inline-block mt-3 underline text-primary break-all" href="mailto:support@toolzcraft.com">Email support@toolzcraft.com for billing errors or refunds</a>}</div>
 </details>)}
 </div>
 <p className="text-sm text-muted-foreground"><Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link> · Payments handled by Razorpay. We do not store card numbers.</p>
 </section></div>;
}
