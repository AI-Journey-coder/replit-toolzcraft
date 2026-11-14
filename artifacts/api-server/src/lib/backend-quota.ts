import {randomUUID} from 'node:crypto';
import {pool} from '@workspace/db';
import {razorpayConfig} from './razorpay';

// All allocations for an account serialize in Postgres, including across Cloud Run instances.
export async function claimBackendAttempt(userId:number, database=pool){
 const c=await database.connect();
 try {
  await c.query('BEGIN');
  await c.query('SELECT pg_advisory_xact_lock(199,$1)',[userId]);
  const account=await c.query('SELECT role,disabled FROM users WHERE id=$1 FOR UPDATE',[userId]);
  if(!account.rowCount||account.rows[0].disabled){await c.query('COMMIT');return {allowed:false,subscribed:false,remaining:0};}
  if(account.rows[0].role==='admin'){await c.query('COMMIT');return {allowed:true,subscribed:false,remaining:null,unlimited:true};}
  const stale=await c.query("UPDATE ai_credit_reservations SET state='released' WHERE user_id=$1 AND state='reserved' AND created_at<now()-interval '5 minutes' RETURNING payment_id,admin_override",[userId]);
  for(const row of stale.rows){
   if(row.admin_override)await c.query('UPDATE user_credit_overrides SET remaining=LEAST(1000000,remaining+1) WHERE user_id=$1',[userId]);
   else if(row.payment_id)await c.query('UPDATE billing_periods SET used=GREATEST(0,used-1) WHERE payment_id=$1',[row.payment_id]);
   else await c.query('UPDATE backend_trials SET attempts=GREATEST(0,attempts-1) WHERE user_id=$1',[userId]);
  }
  const override=await c.query('SELECT remaining FROM user_credit_overrides WHERE user_id=$1',[userId]);
  if(override.rowCount){
   if(override.rows[0].remaining<=0){await c.query('COMMIT');return {allowed:false,subscribed:false,remaining:0};}
   const remaining=override.rows[0].remaining-1;
   await c.query('UPDATE user_credit_overrides SET remaining=$2 WHERE user_id=$1',[userId,remaining]);
   const reservation=randomUUID();await c.query('INSERT INTO ai_credit_reservations(id,user_id,admin_override) VALUES($1,$2,true)',[reservation,userId]);
   await c.query('COMMIT');return {allowed:true,subscribed:false,remaining,reservation};
  }
  const mode=razorpayConfig()?.mode ?? null;
  const paid=await c.query(`SELECT p.payment_id,p.used FROM billing_periods p JOIN billing_subscriptions s ON s.id=p.subscription_id
   WHERE p.user_id=$1 AND s.mode=$2 AND p.period_start<=now() AND p.period_end>now() AND NOT p.revoked ORDER BY p.period_end DESC LIMIT 1 FOR UPDATE OF p`,[userId,mode]);
  let remaining:number, paymentId:string|null=null;
  if(paid.rowCount){
   if(paid.rows[0].used>=100){await c.query('COMMIT');return {allowed:false,subscribed:true,remaining:0};}
   paymentId=paid.rows[0].payment_id;
   const r=await c.query('UPDATE billing_periods SET used=used+1 WHERE payment_id=$1 RETURNING used',[paymentId]);remaining=100-r.rows[0].used;
  }else{
   const r=await c.query(`INSERT INTO backend_trials(user_id,attempts) VALUES($1,1) ON CONFLICT(user_id) DO UPDATE SET attempts=backend_trials.attempts+1 WHERE backend_trials.attempts<3 RETURNING attempts`,[userId]);
   if(!r.rowCount){await c.query('COMMIT');return {allowed:false,subscribed:false,remaining:0};}remaining=3-r.rows[0].attempts;
  }
  const reservation=randomUUID();
  await c.query('INSERT INTO ai_credit_reservations(id,user_id,payment_id) VALUES($1,$2,$3)',[reservation,userId,paymentId]);
  await c.query('COMMIT');return {allowed:true,subscribed:!!paymentId,remaining,reservation};
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
export async function finishBackendAttempt(id:string,userId:number,success:boolean,database=pool){
 const c=await database.connect();try{
  await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(199,$1)',[userId]);
  const r=await c.query("UPDATE ai_credit_reservations SET state=$3 WHERE id=$1 AND user_id=$2 AND state='reserved' RETURNING payment_id,admin_override",[id,userId,success?'completed':'released']);
  if(!success&&r.rowCount){if(r.rows[0].admin_override)await c.query('UPDATE user_credit_overrides SET remaining=LEAST(1000000,remaining+1) WHERE user_id=$1',[userId]);else if(r.rows[0].payment_id)await c.query('UPDATE billing_periods SET used=GREATEST(0,used-1) WHERE payment_id=$1',[r.rows[0].payment_id]);else await c.query('UPDATE backend_trials SET attempts=GREATEST(0,attempts-1) WHERE user_id=$1',[userId]);}
  await c.query('COMMIT');
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
export async function backendAccess(userId:number){
 const account=await pool.query('SELECT role,disabled FROM users WHERE id=$1',[userId]);
 const unlimited=account.rows[0]?.role==='admin'&&!account.rows[0]?.disabled;
 const override=await pool.query('SELECT remaining FROM user_credit_overrides WHERE user_id=$1',[userId]);
 const mode=razorpayConfig()?.mode??null;
 const paid=await pool.query(`SELECT p.used,p.period_end FROM billing_periods p JOIN billing_subscriptions s ON s.id=p.subscription_id WHERE p.user_id=$1 AND s.mode=$2 AND p.period_start<=now() AND p.period_end>now() AND NOT p.revoked ORDER BY p.period_end DESC LIMIT 1`,[userId,mode]);
 const trial=await pool.query('SELECT attempts FROM backend_trials WHERE user_id=$1',[userId]);
 const sub=await pool.query('SELECT status,cancel_requested FROM billing_subscriptions WHERE user_id=$1 AND mode=$2 ORDER BY created_at DESC LIMIT 1',[userId,mode]);
 return {unlimited,creditOverride:!!override.rowCount,subscribed:!!paid.rowCount,remaining:unlimited?null:override.rowCount?override.rows[0].remaining:paid.rowCount?100-paid.rows[0].used:Math.max(0,3-(trial.rows[0]?.attempts??0)),paidUntil:paid.rows[0]?.period_end??null,status:sub.rows[0]?.status??null,cancelRequested:sub.rows[0]?.cancel_requested??false};
}
