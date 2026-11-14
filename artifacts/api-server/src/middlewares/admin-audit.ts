import type {Request,Response,NextFunction} from 'express';
import {pool} from '@workspace/db';
// Write intent before any mutation. Never record request bodies, tokens or API secrets.
export async function adminAudit(req:Request,res:Response,next:NextFunction){
 if(['GET','HEAD','OPTIONS'].includes(req.method)){next();return;}
 const result=await pool.query('INSERT INTO admin_audit_events(actor_id,method,resource) VALUES($1,$2,$3) RETURNING id',[req.dbUser!.id,req.method,req.path.slice(0,250)]);
 let finished=false;
 const complete=()=>{if(finished)return;finished=true;
  pool.query('UPDATE admin_audit_events SET status_code=$2,completed_at=now() WHERE id=$1',[result.rows[0].id,res.writableFinished?res.statusCode:499]).catch(()=>req.log.error('Admin audit completion failed'));
 };
 res.once('finish',complete);res.once('close',complete);next();
}
