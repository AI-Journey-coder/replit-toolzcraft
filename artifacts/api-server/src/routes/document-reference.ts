import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireAccount } from '../middlewares/account';
import { importReference } from '../lib/document-reference';
const router=Router(),hits=new Map<number,number>();let active=0;
router.use('/document-reference',requireAuth,requireAccount);
router.get('/document-reference',(_req,res)=>res.json({hosts:(process.env.DOCUMENT_REFERENCE_HOSTS||'').split(',').map(s=>s.trim()).filter(Boolean)}));
router.post('/document-reference',async(req,res)=>{
 if(typeof req.body?.url!=='string'||req.body.url.length>2000||req.body.consent!==true){res.status(400).json({message:'Provide an approved public URL and consent to retrieve it.'});return;}
 const now=Date.now();for(const [id,t] of hits)if(now-t>60000)hits.delete(id);
 if(active>=2||hits.has(req.dbUser!.id)||hits.size>=10000){res.status(429).json({message:'Wait one minute before importing another reference.'});return;}
 hits.set(req.dbUser!.id,now);active++;
 try{res.json(await importReference(req.body.url));}catch(e){res.status(400).json({message:(e as Error).message});}finally{active--;}
});
export default router;
