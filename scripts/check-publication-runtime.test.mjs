import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createServer} from '../deploy/server.mjs';
import {guideHtml} from '../deploy/publication.mjs';
const require=createRequire(import.meta.url),load=require('./load-ts-test.cjs');
test('publication input excludes private paths and unsafe slot configuration',()=>{
 const {publicationInput}=load('artifacts/api-server/src/routes/publication.ts',{'@workspace/db':{pool:{}},'../middlewares/auth':{requireAuth:()=>{}},'../middlewares/admin':{requireAdmin:()=>{}},'../middlewares/admin-audit':{adminAudit:()=>{}}});
 const draft={slug:'reading-invoices',title:'Guide',description:'A guide',content:'word '.repeat(310),published:true,noindex:false,adPlacement:'off',adSlot:'',version:0};
 assert.equal(publicationInput(draft).slug,draft.slug);
 for(const change of [{slug:'../admin'},{slug:'/tools/ai-document-intelligence'},{adPlacement:'sidebar'},{adPlacement:'after_article',adSlot:'1234567890',noindex:true},{published:true,content:'thin'}])assert.throws(()=>publicationInput({...draft,...change}));
 const html=guideHtml({...draft,body:'<script>alert(1)</script>',updated_at:'2026-10-30'},'https://toolzcraft.com');
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('adsbygoogle'));
});
test('published guides render crawlable escaped text and sitemap excludes noindex pages',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'toolzcraft-guides-'));await writeFile(path.join(root,'index.html'),'Home');
 const page={slug:'example',title:'Example <guide>',description:'Useful description',body:'Evidence & review\n\nNever execute <script>input</script>',noindex:false,updated_at:'2026-10-30'};
 const api=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');if(req.url==='/api/publication-pages')res.end(JSON.stringify([page,{...page,slug:'hidden',noindex:true}]));else if(req.url==='/api/publication-pages/example')res.end(JSON.stringify(page));else{res.statusCode=404;res.end('{}');}});
 await new Promise(r=>api.listen(0,'127.0.0.1',r));const server=createServer({root,upstream:'http://127.0.0.1:'+api.address().port,canonicalOrigin:'https://toolzcraft.com'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{const r=await fetch(base+'/guides/example');assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes('Example &lt;guide&gt;'));assert.ok(html.includes('https://toolzcraft.com/guides/example'));assert.equal((await fetch(base+'/guides/missing')).status,404);const xml=await(await fetch(base+'/guides-sitemap.xml')).text();assert.ok(xml.includes('/guides/example'));assert.ok(!xml.includes('/guides/hidden'));assert.equal((await fetch(base+'/guides')).status,200);}finally{await new Promise(r=>server.close(r));await new Promise(r=>api.close(r));await rm(root,{recursive:true,force:true});}
});
