import { Router } from 'express';
import { pool } from '@workspace/db';
import { requireAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/admin';
import { adminAudit } from '../middlewares/admin-audit';
const router=Router();
export function publicationInput(body:any){
  const {slug,title,description,content,published,noindex,adPlacement,adSlot,version}=body||{};
  if(typeof slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>80||typeof title!=='string'||!title.trim()||title.length>100||typeof description!=='string'||description.length>180||typeof content!=='string'||content.length>30000||typeof published!=='boolean'||typeof noindex!=='boolean'||!['off','after_article'].includes(adPlacement)||typeof adSlot!=='string'||(adSlot&&!/^\d{10}$/.test(adSlot))||!Number.isInteger(version)||version<0)throw Error('Check the slug, text lengths, placement and revision.');
  if(published&&content.trim().length<600)throw Error('Published guides need substantive content (at least 600 characters). This minimum does not establish AdSense eligibility.');
  if(adPlacement!=='off'&&(!published||noindex||!adSlot||content.trim().split(/\s+/).length<300))throw Error('An ad placement needs a published, indexable guide with at least 300 words and a slot ID.');
  return {slug,title:title.trim(),description:description.trim(),content,published,noindex,adPlacement,adSlot,version};
}
router.get('/publication-pages',async(_req,res)=>{const r=await pool.query('SELECT slug,title,description,noindex,updated_at FROM publication_pages WHERE published=true ORDER BY updated_at DESC LIMIT 200');res.json(r.rows);});
router.get('/publication-pages/:slug',async(req,res)=>{const r=await pool.query('SELECT slug,title,description,body,noindex,ad_placement,ad_slot,updated_at FROM publication_pages WHERE slug=$1 AND published=true',[req.params.slug]);if(!r.rows.length){res.sendStatus(404);return;}res.json(r.rows[0]);});
router.use('/admin/publication-pages',requireAuth,requireAdmin,adminAudit);
router.get('/admin/publication-pages',async(_req,res)=>{const r=await pool.query('SELECT * FROM publication_pages ORDER BY updated_at DESC LIMIT 200');res.json(r.rows);});
router.put('/admin/publication-pages',async(req,res)=>{
  let p;try{p=publicationInput(req.body);}catch(e){res.status(400).json({message:(e as Error).message});return;}
  const c=await pool.connect();try{
    await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(205,1)');
    if(p.version===0){const count=await c.query('SELECT count(*)::int n FROM publication_pages');if(count.rows[0].n>=200){await c.query('ROLLBACK');res.status(409).json({message:'The guide catalogue is limited to 200 pages.'});return;}}
    const r=await c.query('INSERT INTO publication_pages(slug,title,description,body,published,noindex,ad_placement,ad_slot) SELECT $1,$2,$3,$4,$5,$6,$7,$8 WHERE $9=0 ON CONFLICT(slug) DO NOTHING RETURNING version',[p.slug,p.title,p.description,p.content,p.published,p.noindex,p.adPlacement,p.adSlot,p.version]);
    const updated=r.rowCount?r:await c.query('UPDATE publication_pages SET title=$2,description=$3,body=$4,published=$5,noindex=$6,ad_placement=$7,ad_slot=$8,version=version+1,updated_at=now() WHERE slug=$1 AND version=$9 RETURNING version',[p.slug,p.title,p.description,p.content,p.published,p.noindex,p.adPlacement,p.adSlot,p.version]);
    if(!updated.rowCount){await c.query('ROLLBACK');res.status(409).json({message:'This guide changed. Reload before saving.'});return;}
    await c.query('COMMIT');res.json({version:updated.rows[0].version});
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
});
export default router;
