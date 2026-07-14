import { Router, type IRouter } from "express";
import { db, toolSettingsTable, usageEventsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RecordUsageBody } from "@workspace/api-zod";
import { verifyIdToken } from "../lib/firebase";
import { KNOWN_TOOL_SLUGS } from "../lib/tool-slugs";

const router: IRouter = Router();

const usageHits = new Map<string, { count: number; windowStart: number }>();
const USAGE_WINDOW_MS = 60_000;
const USAGE_MAX_PER_WINDOW = 60;

function usageRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = usageHits.get(ip);
  if (!entry || now - entry.windowStart > USAGE_WINDOW_MS) {
    usageHits.set(ip, { count: 1, windowStart: now });
    if (usageHits.size > 10_000) {
      for (const [key, value] of usageHits) {
        if (now - value.windowStart > USAGE_WINDOW_MS) usageHits.delete(key);
      }
    }
    return false;
  }
  entry.count += 1;
  return entry.count > USAGE_MAX_PER_WINDOW;
}

router.get("/tool-settings", async (_req, res) => {
  const rows = await db.select().from(toolSettingsTable);
  res.json(
    rows.map((r) => ({ toolSlug: r.toolSlug, enabled: r.enabled, premium: r.premium })),
  );
});

router.post("/usage", async (req, res) => {
  const parsed = RecordUsageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "toolSlug is required" });
    return;
  }
  if (!KNOWN_TOOL_SLUGS.has(parsed.data.toolSlug)) {
    res.status(400).json({ message: "Unknown tool" });
    return;
  }
  if (usageRateLimited(req.ip ?? "unknown")) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  let userId: number | null = null;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const decoded = await verifyIdToken(header.slice("Bearer ".length));
      const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.firebaseUid, decoded.uid))
        .limit(1);
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }
  }
  await db.insert(usageEventsTable).values({ toolSlug: parsed.data.toolSlug, userId });
  res.status(204).end();
});

export default router;
