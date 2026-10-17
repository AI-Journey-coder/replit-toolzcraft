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
 const server=createServer({root:dir,production:true,staging:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const route of ['/','/tools/demo','/tools/demo/'])assert.equal((await fetch(base+route)).status,200);
  for(const route of ['/missing','/assets/missing.js','/.env','/%2e%2e/private','/%5cprivate'])assert.equal((await fetch(base+route)).status,404);
  const asset=await fetch(base+'/assets/test-hash.js');assert.match(asset.headers.get('content-type'),/javascript/);assert.match(asset.headers.get('cache-control'),/immutable/);assert.equal(asset.headers.get('x-content-type-options'),'nosniff');assert.equal(asset.headers.get('x-frame-options'),'DENY');assert.equal(asset.headers.get('x-robots-tag'),'noindex, nofollow');assert.match(asset.headers.get('strict-transport-security'),/max-age/);assert.match(asset.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.match((await fetch(base)).headers.get('cache-control'),/no-cache/);
  const range=await fetch(base+'/assets/test-hash.js',{headers:{range:'bytes=2-4'}});assert.equal(range.status,206);assert.equal(await range.text(),'234');assert.equal((await fetch(base+'/assets/test-hash.js',{headers:{range:'bytes=999-'}})).status,416);
  assert.equal((await fetch(base+'/api/me')).status,503);assert.equal((await fetch(base+'/',{method:'POST'})).status,405);assert.equal(await(await fetch(base+'/assets/test-hash.js',{method:'HEAD'})).text(),'');
 }finally{await new Promise(r=>server.close(r));assert.ok(dir.startsWith(path.join(os.tmpdir(),'toolzcraft-http-')));await rm(dir,{recursive:true,force:true});}
});
