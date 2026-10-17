const test=require('node:test'),assert=require('node:assert/strict'),express=require('../artifacts/api-server/node_modules/express'),load=require('./load-ts-test.cjs');
test('workflow endpoint validates before charging, gates allowance, and releases failed requests',async()=>{
 const old=process.env.ENABLE_AI;process.env.ENABLE_AI='true';let allowed=true,fail=false,claims=0;const finished=[];
 const router=load('artifacts/api-server/src/routes/ai.ts',{
 '../lib/document-workflows':load('artifacts/api-server/src/lib/document-workflows.ts'),
 '../lib/billing-policy':{AI_INPUT_LIMIT:6000},
 '../lib/backend-quota':{claimBackendAttempt:async()=>{claims++;return {allowed,reservation:'reservation',remaining:2}},finishBackendAttempt:async(...a)=>finished.push(a)},
 '../middlewares/auth':{requireAuth:(req,res,next)=>{if(!req.headers.authorization)return res.sendStatus(401);req.firebaseUser={uid:'synthetic-user'};next()}},
 '../middlewares/account':{requireAccount:(req,res,next)=>{req.dbUser={id:1};next()}},
 '@workspace/api-zod':{AnalyzeDocumentBody:{}},
 '../lib/ai':{completeChat:async()=>fail?'not json':JSON.stringify({complete:true,columns:['Field','Value'],rows:[['Total','10']],summary:''})}
 }).default;
 const app=express();app.use(express.json());app.use(router);const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const url='http://127.0.0.1:'+server.address().port+'/ai/workflow';const send=(body,auth=true)=>fetch(url,{method:'POST',headers:{'content-type':'application/json',...(auth?{authorization:'test'}:{})},body:JSON.stringify(body)});
 try{assert.equal((await send({task:'table',text:'Total 10'},false)).status,401);assert.equal((await send({task:'compare',text:'one'})).status,400);assert.equal(claims,0);allowed=false;assert.equal((await send({task:'table',text:'Total 10'})).status,402);assert.equal(finished.length,0);allowed=true;assert.equal((await send({task:'table',text:'Total 10'})).status,200);assert.equal(finished[0][2],true);fail=true;assert.equal((await send({task:'table',text:'Total 10'})).status,502);assert.equal(finished[1][2],false);}finally{await new Promise(r=>server.close(r));if(old===undefined)delete process.env.ENABLE_AI;else process.env.ENABLE_AI=old;}
});
