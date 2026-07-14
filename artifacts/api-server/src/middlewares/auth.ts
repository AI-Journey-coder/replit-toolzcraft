import type { Request, Response, NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { verifyIdToken } from "../lib/firebase";

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: DecodedIdToken;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing Authorization header" });
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    req.firebaseUser = await verifyIdToken(token);
    next();
  } catch (err) {
    req.log.warn({ err }, "token verification failed");
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
