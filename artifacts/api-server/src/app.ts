import {razorpayConfig} from './lib/razorpay';
import billingWebhook from './routes/billing-webhook';
import express, { type Express, type ErrorRequestHandler } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import router from './routes';
import { logger } from './lib/logger';
import { allowedOrigin, validateRuntime } from './lib/security';
validateRuntime();
if(process.env.ENABLE_PAYMENTS==='true'){razorpayConfig();if(!/^plan_[a-zA-Z0-9]+$/.test(process.env.RAZORPAY_MONTHLY_PLAN_ID??''))throw new Error('RAZORPAY_MONTHLY_PLAN_ID is required');}
const app:Express=express();
app.disable('x-powered-by');
// Only set TRUST_PROXY to the exact trusted proxy CIDR(s), never unrestricted true.
if(process.env.TRUST_PROXY)app.set('trust proxy',process.env.TRUST_PROXY.split(',').map(x=>x.trim()));
app.use(pinoHttp({logger,serializers:{req(req){return {id:req.id,method:req.method,url:req.url?.split('?')[0]};},res(res){return {statusCode:res.statusCode};}}}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');if(!allowedOrigin(req.headers.origin)){res.status(403).json({message:'Origin not allowed'});return;}next();});
app.use(cors({origin:(origin,done)=>done(null,allowedOrigin(origin)),methods:['GET','POST','PATCH','PUT','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
app.use(billingWebhook);
app.use(express.json({limit:'256kb'}));
app.use(express.urlencoded({extended:false,limit:'16kb'}));
app.use('/api',router);
app.use((_req,res)=>{res.status(404).json({message:'Not found'});});
const handleError:ErrorRequestHandler=(err,req,res,_next)=>{if(res.headersSent){res.end();return;}const status=err?.type==='entity.too.large'?413:err instanceof SyntaxError?400:500;req.log.error({name:err?.name,status},'Request failed');res.status(status).json({message:status===413?'Request too large':status===400?'Invalid JSON':'Request failed'});};
app.use(handleError);
export default app;


