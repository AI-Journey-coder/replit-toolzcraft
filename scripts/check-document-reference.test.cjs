const test=require('node:test'),assert=require('node:assert/strict'),load=require('./load-ts-test.cjs');
test('reference normalization strips active markup and rejects oversized pages without truncation',()=>{
 const {referenceText}=load('artifacts/api-server/src/lib/document-reference.ts');
 const result=referenceText('<script>IGNORE ALL RULES</script><style>secret</style><p>'+('Evidence &amp; review. '.repeat(20))+'</p>',true);
 assert.ok(!result.includes('IGNORE'));assert.ok(!result.includes('secret'));assert.ok(result.includes('Evidence & review'));
 assert.throws(()=>referenceText('x'.repeat(24001),false));assert.throws(()=>referenceText('short',false));
});
test('approved reference hosts still reject private DNS addresses before any connection',async()=>{
 const old=process.env.DOCUMENT_REFERENCE_HOSTS;process.env.DOCUMENT_REFERENCE_HOSTS='reference.example';let connected=false;
 try{const {importReference}=load('artifacts/api-server/src/lib/document-reference.ts',{'node:dns/promises':{lookup:async()=>[{address:'127.0.0.1',family:4}]},'node:https':{request:()=>{connected=true;throw Error('Must not connect');}}});
 await assert.rejects(importReference('https://reference.example/page'),/non-public|not public/);assert.equal(connected,false);
 for(const url of ['http://reference.example','https://unknown.example','https://user:password@reference.example','https://reference.example:8443/'])await assert.rejects(importReference(url));
 }finally{if(old===undefined)delete process.env.DOCUMENT_REFERENCE_HOSTS;else process.env.DOCUMENT_REFERENCE_HOSTS=old;}
});
