import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Metadata is available only to the Cloud Run runtime; tokens never reach the browser.
export function cloudRunIdentity(audience, transport=fetch) {
 let cached='', expires=0, pending;
 return async () => {
  if(cached && Date.now()<expires) return cached;
  if(pending) return pending;
  pending=(async()=>{
   const url=new URL('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity');
   url.searchParams.set('audience',audience);url.searchParams.set('format','full');
   const response=await transport(url,{headers:{'Metadata-Flavor':'Google'},redirect:'error',signal:AbortSignal.timeout(5000)});
   if(!response.ok)throw new Error('Service identity unavailable');
   const token=(await response.text()).trim();
   if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))throw new Error('Invalid service identity');
   const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());
   if(claims.aud!==audience||!Number.isFinite(claims.exp)||claims.exp*1000<Date.now()+60000)throw new Error('Expired or mismatched service identity');
   cached=token;expires=Math.min(claims.exp*1000-60000,Date.now()+300000);return token;
  })();
  try{return await pending;}finally{pending=undefined;}
 };
}

const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.zip':'application/zip','.whl':'application/zip','.pdf':'application/pdf','.woff2':'font/woff2'};
export function createServer({root=path.resolve('artifacts/toolkit/dist/public'),upstream=process.env.API_UPSTREAM,production=process.env.NODE_ENV==='production',staging=process.env.STAGING==='true',cloudRunAuth=process.env.API_CLOUD_RUN_AUTH==='true',identityProvider}={}){
 root=fs.realpathSync(root);
 let api;if(upstream){api=new URL(upstream);if(!['http:','https:'].includes(api.protocol)||api.username||api.password||api.pathname!=='/'||api.search||api.hash)throw new Error('API_UPSTREAM must be an HTTP(S) origin without credentials or path.');}
 if(cloudRunAuth&&(!api||api.protocol!=='https:'))throw new Error('Cloud Run authentication requires an HTTPS API_UPSTREAM.');
 const getIdentity=identityProvider||(cloudRunAuth?cloudRunIdentity(api.origin):null);
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  // same-origin-allow-popups preserves the Firebase Google sign-in popup.
  res.setHeader('Cross-Origin-Opener-Policy','same-origin-allow-popups');
  if(production)res.setHeader('Strict-Transport-Security','max-age=31536000');
  if(staging)res.setHeader('X-Robots-Tag','noindex, nofollow');
  // Allow only the external services this app currently uses. unsafe-eval is
  // retained for the legacy TOML parser and Python runtime; styles are dynamic.
  res.setHeader('Content-Security-Policy',"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://checkout.razorpay.com https://cdn.jsdelivr.net https://www.google.com https://www.gstatic.com https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com blob: https://open.er-api.com https://api.worldbank.org https://api.country.is https://cdn.jsdelivr.net https://tessdata.projectnaptha.com https://www.google.com https://www.gstatic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseapp.com; worker-src 'self' blob:; frame-src https://api.razorpay.com https://checkout.razorpay.com https://www.google.com https://*.firebaseapp.com; media-src 'self' blob: data:; form-action 'self'");
  const finish=(status,message)=>{res.statusCode=status;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(req.method==='HEAD'?undefined:message);};
  let pathname;try{const raw=(req.url||'/').split('?')[0];pathname=decodeURIComponent(raw);if(!pathname.startsWith('/')||pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').some(x=>x==='..'||x.startsWith('.')))return finish(404,'Not found');}catch{return finish(400,'Invalid URL');}
  if(pathname==='/healthz')return finish(200,'ok');
  if(pathname==='/api'||pathname.startsWith('/api/')){
   if(!api)return finish(503,'Online features are not enabled.');
   const headers={...req.headers,host:api.host};delete headers['forwarded'];delete headers['x-forwarded-for'];delete headers['x-forwarded-host'];delete headers['x-forwarded-proto'];delete headers['x-serverless-authorization'];
   if(getIdentity){try{headers['x-serverless-authorization']='Bearer '+await getIdentity();}catch{return finish(503,'Online service authentication unavailable');}}
   if(req.destroyed||res.destroyed)return;
   const proxy=(api.protocol==='https:'?https:http).request(new URL(req.url,api),{method:req.method,headers,timeout:30000},r=>{res.statusCode=r.statusCode||502;for(const [k,v] of Object.entries(r.headers))if(v!==undefined&&!['connection','transfer-encoding','content-security-policy'].includes(k))res.setHeader(k,v);res.setHeader('Cache-Control','no-store');r.pipe(res);});
   let size=0;req.on('data',chunk=>{size+=chunk.length;if(size>262144){proxy.destroy();if(!res.headersSent)finish(413,'Request body too large');}});proxy.on('timeout',()=>proxy.destroy());proxy.on('error',()=>{if(!res.headersSent)finish(502,'Online service unavailable');else res.destroy();});res.on('close',()=>proxy.destroy());req.pipe(proxy);return;
  }
  if(!['GET','HEAD'].includes(req.method||'')){res.setHeader('Allow','GET, HEAD');return finish(405,'Method not allowed');}
  let file=path.join(root,pathname);try{let stat=fs.statSync(file);if(stat.isDirectory()){file=path.join(file,'index.html');stat=fs.statSync(file);}if(!stat.isFile())return finish(404,'Not found');const real=fs.realpathSync(file);if(!real.startsWith(root+path.sep))return finish(404,'Not found');
   const extension=path.extname(file).toLowerCase();if(!MIME[extension])return finish(404,'Not found');
   res.setHeader('Content-Type',MIME[extension]);res.setHeader('Cache-Control',extension==='.html'?'no-cache, max-age=0, must-revalidate':pathname.startsWith('/assets/')?'public, max-age=31536000, immutable': 'no-cache, max-age=0, must-revalidate');
   let start=0,end=stat.size-1;res.setHeader('Accept-Ranges','bytes');if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!m||(!m[1]&&!m[2]))return finish(416,'Invalid byte range');if(!m[1])start=Math.max(0,stat.size-Number(m[2]));else start=Number(m[1]);if(m[1]&&m[2])end=Math.min(end,Number(m[2]));if(start>end||start>=stat.size){res.setHeader('Content-Range',`bytes */${stat.size}`);return finish(416,'Range not satisfiable');}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
   res.setHeader('Content-Length',Math.max(0,end-start+1));if(req.method==='HEAD'||stat.size===0)return res.end();const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
  }catch{return finish(404,'Not found');}
 });
 server.requestTimeout=30000;server.headersTimeout=15000;return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||8080);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
 const server=createServer();server.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`ToolzCraft server listening on ${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),10000).unref();});
}

