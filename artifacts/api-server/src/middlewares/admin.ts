import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      dbUser?: User;
    }
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const fb = req.firebaseUser;
  if (!fb) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.firebaseUid, fb.uid))
    .limit(1);
  if (!user || user.disabled) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  req.dbUser = user;
  next();
}
