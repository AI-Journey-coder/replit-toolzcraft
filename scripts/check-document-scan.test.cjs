const test = require('node:test'), assert = require('node:assert/strict'), net = require('node:net');
const load = require('./load-ts-test.cjs');
test('scanner streams exact bytes and fails closed for malware, errors, and interrupted replies', async () => {
  const previous = [process.env.ENABLE_DOCUMENT_SCAN, process.env.CLAMAV_PORT];
  let reply = 'stream: OK\0', received,versionDate=new Date().toISOString();
  const server = net.createServer(socket => {
    let input = Buffer.alloc(0), offset = 10, chunks = [];
    socket.on('error',()=>{});
    socket.on('data', chunk => {
      input = Buffer.concat([input,chunk]);
      if(input.length>=9&&input.subarray(0,9).toString()==='zVERSION\0'){socket.end('ClamAV test/123/'+versionDate+'\0');return;}
      if(input.length<10)return;
      assert.equal(input.subarray(0,10).toString(),'zINSTREAM\0');
      while(input.length>=offset+4){
        const length=input.readUInt32BE(offset);
        if(input.length<offset+4+length)return;
        offset+=4;
        if(!length){received=Buffer.concat(chunks);socket.end(reply);return;}
        chunks.push(input.subarray(offset,offset+length));offset+=length;
      }
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  process.env.ENABLE_DOCUMENT_SCAN='true';process.env.CLAMAV_PORT=String(server.address().port);
  const {scanDocument}=load('artifacts/api-server/src/lib/document-scan.ts');
  try {
    const source=Buffer.alloc(150000,42);
    assert.equal(await scanDocument(source),'clean');assert.deepEqual(received,source);
    reply='stream: Test-Signature FOUND\0';assert.equal(await scanDocument(source),'blocked');
    for(const invalid of ['stream: OK','stream: OK\0stream: failure ERROR\0','size limit ERROR\0','']){
      reply=invalid;await assert.rejects(scanDocument(source));
    }
    const abort=new AbortController();abort.abort();await assert.rejects(scanDocument(source,abort.signal));
    await assert.rejects(scanDocument(Buffer.alloc(0)));
    versionDate='2000-01-01T00:00:00Z';await assert.rejects(scanDocument(source),/stale/);
    process.env.ENABLE_DOCUMENT_SCAN='false';await assert.rejects(scanDocument(source));
  } finally {
    await new Promise(resolve=>server.close(resolve));
    for(const [i,key] of ['ENABLE_DOCUMENT_SCAN','CLAMAV_PORT'].entries())if(previous[i]===undefined)delete process.env[key];else process.env[key]=previous[i];
  }
});
test('scan endpoint requires an active account, consent, binary body and fails closed', async () => {
  const express=require('../artifacts/api-server/node_modules/express');
  let calls=0, verdict='clean', available=true,extractions=0;
  const router=load('artifacts/api-server/src/routes/document-scan.ts',{
    '@workspace/db':{pool:{query:async()=>({rows:[]})}},
    '../lib/document-binary':{extractBinary:async()=>{extractions++;return {pages:[{id:'p',label:'Text',text:'synthetic'}],warnings:[]};}},
    '../middlewares/auth':{requireAuth:(req,res,next)=>req.headers.authorization?next():res.sendStatus(401)},
    '../middlewares/account':{requireAccount:(req,res,next)=>{if(req.headers.authorization==='disabled')return res.sendStatus(403);req.dbUser={id:1};next();}},
    '../lib/document-scan':{SCAN_MAX_BYTES:1024,scanConfigured:()=>available,scanDocument:async()=>{calls++;if(verdict==='error')throw Error();return verdict;}},
  }).default;
  const app=express();app.use(express.json({limit:'256kb'}));app.use(router);
  app.use((err,req,res,next)=>res.status(err.status||500).end());
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const base='http://127.0.0.1:'+server.address().port+'/document-scan';
  const send=(auth='active',query='?consent=upload-for-scan',type='application/octet-stream',body=Buffer.from('example'))=>fetch(base+query,{method:'POST',headers:{...(auth?{Authorization:auth}:{}),'Content-Type':type},body});
  try {
    assert.equal((await send('')).status,401);assert.equal((await send('disabled')).status,403);
    assert.equal((await send('active','')).status,400);
    assert.equal((await send('active',undefined,'text/plain')).status,415);assert.equal(calls,0);
    assert.equal((await send()).status,200);verdict='blocked';assert.equal((await send()).status,422);
    verdict='error';assert.equal((await send()).status,503);
    assert.equal((await send('active',undefined,undefined,Buffer.alloc(1025))).status,413);
    const prior=process.env.ENABLE_DOCUMENT_EXTRACTION;process.env.ENABLE_DOCUMENT_EXTRACTION='true';
    try{
      const extract=()=>fetch(base.replace('document-scan','document-extract')+'?format=txt&consent=upload-for-extraction',{method:'POST',headers:{Authorization:'active','Content-Type':'application/octet-stream'},body:'example'});
      verdict='blocked';assert.equal((await extract()).status,422);assert.equal(extractions,0);
      verdict='clean';assert.equal((await extract()).status,200);assert.equal(extractions,1);
    }finally{if(prior===undefined)delete process.env.ENABLE_DOCUMENT_EXTRACTION;else process.env.ENABLE_DOCUMENT_EXTRACTION=prior;}
    available=false;assert.equal((await send()).status,503);
  } finally {await new Promise(resolve=>server.close(resolve));}
});
