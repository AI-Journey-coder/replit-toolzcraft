import { Router, type IRouter } from "express";
import { randomBytes, createHash } from "node:crypto";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import {
  db,
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

const router: IRouter = Router();

router.use("/admin", requireAuth, requireAdmin);

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
  res.json(rows.map(toAdminUser));
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
  const [user] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(toAdminUser(user));
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

export default router;
