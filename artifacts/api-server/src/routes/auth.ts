import { Router, type IRouter } from "express";
import { count, eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { SyncUserResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function toApiUser(u: typeof usersTable.$inferSelect) {
  return SyncUserResponse.parse({
    id: u.id,
    firebaseUid: u.firebaseUid,
    phoneNumber: u.phoneNumber,
    email: u.email,
    displayName: u.displayName,
    photoUrl: u.photoUrl,
    role: u.role,
    plan: u.plan,
  });
}

router.post("/auth/sync", requireAuth, async (req, res) => {
  const fb = req.firebaseUser!;
  const values = {
    firebaseUid: fb.uid,
    phoneNumber: fb.phone_number ?? null,
    email: fb.email ?? null,
    displayName: (fb.name as string | undefined) ?? null,
    photoUrl: (fb.picture as string | undefined) ?? null,
  };
  const user = await db.transaction(async (tx) => {
    // Advisory lock serializes concurrent first sign-ins so exactly one
    // account can ever be auto-promoted to admin.
    await tx.execute(sql`select pg_advisory_xact_lock(874230911)`);
    const [{ n: userCount }] = (await tx
      .select({ n: count() })
      .from(usersTable)) as [{ n: number }];
    const [row] = await tx
      .insert(usersTable)
      .values(userCount === 0 ? { ...values, role: "admin" } : values)
      .onConflictDoUpdate({
        target: usersTable.firebaseUid,
        set: { ...values, lastLoginAt: new Date() },
      })
      .returning();
    return row!;
  });
  if (user!.disabled) {
    res.status(403).json({ message: "Account is disabled" });
    return;
  }
  res.json(toApiUser(user!));
});

router.get("/me", requireAuth, async (req, res) => {
  const fb = req.firebaseUser!;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.firebaseUid, fb.uid))
    .limit(1);
  if (!user) {
    res.status(401).json({ message: "User not found; call /auth/sync first" });
    return;
  }
  if (user.disabled) {
    res.status(403).json({ message: "Account is disabled" });
    return;
  }
  res.json(toApiUser(user));
});

export default router;
