import {backendAccess} from '../lib/backend-quota';
import { Router, type IRouter } from "express";
import { randomBytes, createHash } from "node:crypto";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import {
  db,
  pool,
  usersTable,
  usageEventsTable,
  toolSettingsTable,
  premiumPackagesTable,
  apiKeysTable,
} from "@workspace/db";
import {
  AdminUpdateUserBody,
  AdminUpsertToolBody,
  AdminCreateApiKeyBody,
  AdminUpdateApiKeyBody,
  AdminCreatePackageBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";
import { KNOWN_TOOL_SLUGS } from "../lib/tool-slugs";

import {adminAudit} from '../middlewares/admin-audit';
import {checkoutAvailable,paymentService,syncSubscription} from '../lib/billing';
const router: IRouter = Router();

router.use("/admin", requireAuth, requireAdmin, adminAudit);

function toAdminUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    firebaseUid: u.firebaseUid,
    phoneNumber: u.phoneNumber,
    email: u.email,
    displayName: u.displayName,
    photoUrl: u.photoUrl,
    role: u.role,
    plan: u.plan,
    disabled: u.disabled,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt.toISOString(),
  };
}

router.get("/admin/users", async (_req, res) => {
  const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(await Promise.all(rows.map(async u=>({...toAdminUser(u),access:await backendAccess(u.id)}))));
});

router.patch("/admin/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = AdminUpdateUserBody.safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }
  if (req.dbUser!.id === id && (parsed.data.disabled === true || parsed.data.role === "user")) {
    res.status(400).json({ message: "You cannot disable or demote your own account" });
    return;
  }
  if(parsed.data.plan!==undefined){res.status(400).json({message:'Use credit controls; paid plans are payment-driven.'});return;}
  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({...toAdminUser(user),access:await backendAccess(user.id)});
});

router.get("/admin/tools", async (_req, res) => {
  const rows = await db.select().from(toolSettingsTable);
  res.json(
    rows.map((r) => ({ toolSlug: r.toolSlug, enabled: r.enabled, premium: r.premium })),
  );
});

router.put("/admin/tools/:slug", async (req, res) => {
  const parsed = AdminUpsertToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "enabled and premium are required" });
    return;
  }
  if (!KNOWN_TOOL_SLUGS.has(req.params.slug!)) {
    res.status(400).json({ message: "Unknown tool" });
    return;
  }
  const values = {
    toolSlug: req.params.slug!,
    enabled: parsed.data.enabled,
    premium: parsed.data.premium,
  };
  const [row] = await db
    .insert(toolSettingsTable)
    .values(values)
    .onConflictDoUpdate({
      target: toolSettingsTable.toolSlug,
      set: { enabled: values.enabled, premium: values.premium, updatedAt: new Date() },
    })
    .returning();
  res.json({ toolSlug: row!.toolSlug, enabled: row!.enabled, premium: row!.premium });
});

function toPackage(p: typeof premiumPackagesTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    currency: p.currency,
    periodDays: p.periodDays,
    active: p.active,
  };
}

router.get("/admin/packages", async (_req, res) => {
  const rows = await db.select().from(premiumPackagesTable).orderBy(premiumPackagesTable.id);
  res.json(rows.map(toPackage));
});

router.post("/admin/packages", async (req, res) => {
  const parsed = AdminCreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid package data" });
    return;
  }
  const [row] = await db.insert(premiumPackagesTable).values(parsed.data).returning();
  res.status(201).json(toPackage(row!));
});

router.patch("/admin/packages/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = AdminCreatePackageBody.safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }
  const [row] = await db
    .update(premiumPackagesTable)
    .set(parsed.data)
    .where(eq(premiumPackagesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ message: "Package not found" });
    return;
  }
  res.json(toPackage(row));
});

router.delete("/admin/packages/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  await db.delete(premiumPackagesTable).where(eq(premiumPackagesTable.id, id));
  res.status(204).end();
});

router.get("/admin/stats", async (_req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [totalUsers] = await db.select({ n: count() }).from(usersTable);
  const [totalEvents] = await db.select({ n: count() }).from(usageEventsTable);
  const [recentEvents] = await db
    .select({ n: count() })
    .from(usageEventsTable)
    .where(gte(usageEventsTable.createdAt, sevenDaysAgo));
  const topTools = await db
    .select({
      toolSlug: usageEventsTable.toolSlug,
      count: sql<number>`count(*)::int`,
    })
    .from(usageEventsTable)
    .groupBy(usageEventsTable.toolSlug)
    .orderBy(desc(sql`count(*)`))
    .limit(10);
  res.json({
    totalUsers: totalUsers!.n,
    totalEvents: totalEvents!.n,
    eventsLast7Days: recentEvents!.n,
    topTools,
  });
});

function toApiKeyInfo(k: typeof apiKeysTable.$inferSelect) {
  return {
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    active: k.active,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
  };
}

router.get("/admin/api-keys", async (_req, res) => {
  const rows = await db.select().from(apiKeysTable).orderBy(desc(apiKeysTable.createdAt));
  res.json(rows.map(toApiKeyInfo));
});

router.post("/admin/api-keys", async (req, res) => {
  const parsed = AdminCreateApiKeyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "name is required" });
    return;
  }
  const secret = `tzc_${randomBytes(24).toString("base64url")}`;
  const keyHash = createHash("sha256").update(secret).digest("hex");
  const keyPrefix = secret.slice(0, 12);
  const [row] = await db
    .insert(apiKeysTable)
    .values({ name: parsed.data.name, keyHash, keyPrefix, userId: req.dbUser!.id })
    .returning();
  res.status(201).json({
    id: row!.id,
    name: row!.name,
    keyPrefix: row!.keyPrefix,
    active: row!.active,
    key: secret,
  });
});

router.patch("/admin/api-keys/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = AdminUpdateApiKeyBody.safeParse(req.body);
  if (!Number.isInteger(id) || !parsed.success) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }
  const [row] = await db
    .update(apiKeysTable)
    .set({ active: parsed.data.active })
    .where(eq(apiKeysTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ message: "API key not found" });
    return;
  }
  res.json(toApiKeyInfo(row));
});

router.delete("/admin/api-keys/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  await db.delete(apiKeysTable).where(eq(apiKeysTable.id, id));
  res.status(204).end();
});

router.get('/admin/operations',async(req,res)=>{
 const mode=req.query.mode==='live'?'live':'test';
 const offset=Math.max(0,Math.min(1000000,Number(req.query.offset)||0));
 const [subscriptions,totals,audit]=await Promise.all([
  pool.query(`SELECT s.id,s.user_id,s.provider_id,s.mode,s.status,s.cancel_requested,s.created_at,
   p.payment_id,p.period_end,p.used,p.revoked
   FROM billing_subscriptions s LEFT JOIN LATERAL
   (SELECT payment_id,period_end,used,revoked FROM billing_periods WHERE subscription_id=s.id ORDER BY period_end DESC LIMIT 1) p ON true
   WHERE s.mode=$1 ORDER BY s.created_at DESC,s.id LIMIT 51 OFFSET $2`,[mode,Math.floor(offset)]),
  pool.query(`SELECT count(*)::int AS paid_periods,
   count(*) FILTER(WHERE NOT p.revoked AND p.period_start<=now() AND p.period_end>now())::int AS current_periods,
   count(*) FILTER(WHERE p.revoked)::int AS revoked_periods,
   COALESCE(sum(p.used),0)::int AS credits_used
   FROM billing_periods p JOIN billing_subscriptions s ON s.id=p.subscription_id WHERE s.mode=$1`,[mode]),
  pool.query('SELECT id,actor_id,method,resource,status_code,created_at FROM admin_audit_events ORDER BY created_at DESC,id DESC LIMIT 50')
 ]);
 let configured=false;try{configured=!!paymentService();}catch{}
 res.json({mode,subscriptions:subscriptions.rows.slice(0,50),hasMore:subscriptions.rows.length>50,totals:totals.rows[0],audit:audit.rows,
  configuration:{paymentsConfigured:configured,checkoutConfigured:configured&&checkoutAvailable(),runtimeMode:process.env.RAZORPAY_MODE||'test',firebaseConfigured:!!process.env.FIREBASE_PROJECT_ID}});
});
router.post('/admin/subscriptions/:id/refresh',async(req,res)=>{
 const row=await pool.query('SELECT provider_id,mode FROM billing_subscriptions WHERE id=$1',[req.params.id]);
 if(!row.rowCount){res.status(404).json({message:'Subscription not found'});return;}
 const local=row.rows[0];
 if(!local.provider_id||local.mode!==paymentService().config.mode){res.status(409).json({message:'No provider ID or billing mode differs from server configuration.'});return;}
 await syncSubscription(local.provider_id);res.json({ok:true});
});
router.put('/admin/users/:id/credits',async(req,res)=>{
 const id=Number(req.params.id),remaining=req.body?.remaining,reason=req.body?.reason;
 if(!Number.isSafeInteger(id)||id<=0||(remaining!==null&&(!Number.isInteger(remaining)||remaining<0||remaining>1000000))||typeof reason!=='string'||!reason.trim()||reason.length>300){res.status(400).json({message:'Enter 0–1,000,000 credits (or null to reset) and a reason up to 300 characters.'});return;}
 const c=await pool.connect();try{await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(199,$1)',[id]);
 const user=await c.query('SELECT role FROM users WHERE id=$1 FOR UPDATE',[id]);if(!user.rowCount||user.rows[0].role==='admin'){await c.query('ROLLBACK');res.status(409).json({message:'User not found or already has unlimited administrator credits.'});return;}
 const pending=await c.query("SELECT 1 FROM ai_credit_reservations WHERE user_id=$1 AND state='reserved' LIMIT 1",[id]);if(pending.rowCount){await c.query('ROLLBACK');res.status(409).json({message:'Wait for this user’s pending AI request to finish or recover before changing credits.'});return;}
 const old=await c.query('SELECT remaining FROM user_credit_overrides WHERE user_id=$1',[id]);
 if(remaining===null)await c.query('DELETE FROM user_credit_overrides WHERE user_id=$1',[id]);else await c.query('INSERT INTO user_credit_overrides(user_id,remaining) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET remaining=EXCLUDED.remaining',[id,remaining]);
 await c.query('INSERT INTO admin_credit_changes(actor_id,user_id,previous_remaining,new_remaining,reason) VALUES($1,$2,$3,$4,$5)',[req.dbUser!.id,id,old.rows[0]?.remaining??null,remaining,reason.trim()]);await c.query('COMMIT');res.json(await backendAccess(id));
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
});
export default router;
