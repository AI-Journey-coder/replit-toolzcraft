import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireAccount } from "../middlewares/account";
import { summaryInput, summarize, SummaryError } from "../lib/summary";
const router = Router();
let active = 0;
const hits = new Map<number, { start: number; count: number }>();
router.post("/ai/summary", requireAuth, requireAccount, async (req, res) => {
  if (process.env.ENABLE_AI !== "true") {
    res.status(503).json({ message: "AI is disabled." });
    return;
  }
  let input;
  try {
    input = summaryInput(req.body);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
    return;
  }
  const now = Date.now(),
    uid = req.dbUser!.id;
  for (const [id, hit] of hits) if (now - hit.start >= 60000) hits.delete(id);
  const hit = hits.get(uid) || { start: now, count: 0 };
  hit.count++;
  hits.set(uid, hit);
  if (hit.count > 10) {
    res
      .status(429)
      .json({
        message: "Too many summary requests. Wait a minute before retrying.",
      });
    return;
  }
  if (active >= 2) {
    res.status(429).json({ message: "AI is busy. Please retry shortly." });
    return;
  }
  active++;
  try {
    res.json(await summarize(req.dbUser!.id, input));
  } catch (e) {
    res
      .status(e instanceof SummaryError ? e.status : 502)
      .json({
        message:
          e instanceof SummaryError
            ? e.message
            : "Summary failed. No credits were charged. Retry the same request.",
      });
  } finally {
    active--;
  }
});
export default router;
