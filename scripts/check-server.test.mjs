import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createServer } from '../deploy/server.mjs';
test('production HTTP contract: routes, missing assets, headers, ranges and safe paths',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'toolzcraft-http-'));
 await mkdir(path.join(dir,'tools/demo'),{recursive:true});await mkdir(path.join(dir,'assets'));
 await writeFile(path.join(dir,'index.html'),'<h1>Home</h1>');await writeFile(path.join(dir,'tools/demo/index.html'),'<h1>Demo</h1>');await writeFile(path.join(dir,'assets/test-hash.js'),'0123456789');await writeFile(path.join(dir,'.env'),'SECRET');
 const server=createServer({root:dir,production:true,staging:true,canonicalOrigin:"https://toolzcraft.com"});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const requestHost=(route,host)=>new Promise((resolve,reject)=>{http.get(base+route,{headers:{host}},r=>{r.resume();r.on('end',()=>resolve({status:r.statusCode,location:r.headers.location}));}).on('error',reject);});
  const redirected=await requestHost('/tools/demo?mode=full','www.toolzcraft.com');assert.equal(redirected.status,308);assert.equal(redirected.location,'https://toolzcraft.com/tools/demo?mode=full');
  assert.equal((await requestHost('/','toolzcraft.com')).status,200);
  assert.equal((await requestHost('/healthz','www.toolzcraft.com')).status,200);
  const malicious=await requestHost('//evil.example/path','www.toolzcraft.com');assert.equal(new URL(malicious.location).origin,'https://toolzcraft.com');
  for(const route of ['/','/tools/demo','/tools/demo/'])assert.equal((await fetch(base+route)).status,200);
  for(const route of ['/missing','/assets/missing.js','/.env','/%2e%2e/private','/%5cprivate'])assert.equal((await fetch(base+route)).status,404);
  const asset=await fetch(base+'/assets/test-hash.js');assert.match(asset.headers.get('content-type'),/javascript/);assert.match(asset.headers.get('cache-control'),/immutable/);assert.equal(asset.headers.get('x-content-type-options'),'nosniff');assert.equal(asset.headers.get('x-frame-options'),'DENY');assert.equal(asset.headers.get('x-robots-tag'),'noindex, nofollow');assert.match(asset.headers.get('strict-transport-security'),/max-age/);assert.match(asset.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.match((await fetch(base)).headers.get('cache-control'),/no-cache/);
  const range=await fetch(base+'/assets/test-hash.js',{headers:{range:'bytes=2-4'}});assert.equal(range.status,206);assert.equal(await range.text(),'234');assert.equal((await fetch(base+'/assets/test-hash.js',{headers:{range:'bytes=999-'}})).status,416);
  assert.equal((await fetch(base+'/api/me')).status,503);assert.equal((await fetch(base+'/',{method:'POST'})).status,405);assert.equal(await(await fetch(base+'/assets/test-hash.js',{method:'HEAD'})).text(),'');
 }finally{await new Promise(r=>server.close(r));assert.ok(dir.startsWith(path.join(os.tmpdir(),'toolzcraft-http-')));await rm(dir,{recursive:true,force:true});}
});


test('Cloud Run identity is cached, audience-bound and retried after metadata failure',async()=>{
 const {cloudRunIdentity}=await import('../deploy/server.mjs');const aud='https://api.run.app';
 const token='header.'+Buffer.from(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.signature';
 let calls=0;const provider=cloudRunIdentity(aud,async(url,options)=>{calls++;assert.equal(url.hostname,'metadata.google.internal');assert.equal(url.searchParams.get('audience'),aud);assert.equal(options.headers['Metadata-Flavor'],'Google');return new Response(token);});
 assert.deepEqual(await Promise.all([provider(),provider()]),[token,token]);await provider();assert.equal(calls,1);
 let tries=0;const retry=cloudRunIdentity(aud,async()=>++tries===1?new Response('',{status:500}):new Response(token));await assert.rejects(retry());assert.equal(await retry(),token);
 await assert.rejects(cloudRunIdentity('https://wrong.run.app',async()=>new Response(token))());
});

test('private API proxy preserves user token and raw body, replaces spoofed service identity, fails closed',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'toolzcraft-proxy-'));let calls=0;
 const upstream=http.createServer(async(req,res)=>{calls++;const chunks=[];try{for await(const c of req)chunks.push(c);}catch{return;}res.setHeader('Content-Type','application/json');res.end(JSON.stringify({authorization:req.headers.authorization,identity:req.headers['x-serverless-authorization'],body:Buffer.concat(chunks).toString()}));});
 await new Promise(r=>upstream.listen(0,'127.0.0.1',r));let fail=false;
 const server=createServer({root,upstream:'http://127.0.0.1:'+upstream.address().port,identityProvider:async()=>{if(fail)throw Error('metadata');return 'service-token';}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/api/example';
 try{const body='{ "signed": true }';const response=await fetch(url,{method:'POST',headers:{Authorization:'Bearer firebase-user','X-Serverless-Authorization':'Bearer attacker'},body});assert.equal(response.status,200);assert.deepEqual(await response.json(),{authorization:'Bearer firebase-user',identity:'Bearer service-token',body});const large=Buffer.alloc(300000,65);assert.equal((await fetch(url,{method:'POST',body:large})).status,413);const scanned=await fetch(url.replace('/api/example','/api/document-scan?consent=upload-for-scan'),{method:'POST',body:large});assert.equal(scanned.status,200);assert.equal((await scanned.json()).body.length,large.length);const before=calls;fail=true;assert.equal((await fetch(url)).status,503);assert.equal(calls,before);}finally{await new Promise(r=>server.close(r));await new Promise(r=>upstream.close(r));await rm(root,{recursive:true,force:true});}
});
