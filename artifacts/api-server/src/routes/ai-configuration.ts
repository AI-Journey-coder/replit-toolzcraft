import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";
import { adminAudit } from "../middlewares/admin-audit";
import { modelPolicy, validateAiConfiguration } from "../lib/ai-configuration";
const router = Router();
router.use("/admin/ai-configuration", requireAuth, requireAdmin, adminAudit);
router.get("/admin/ai-configuration", async (_req, res) => {
  const policy = modelPolicy(),
    r = await pool.query(
      "SELECT * FROM ai_runtime_configuration WHERE provider=$1",
      [policy.provider],
    );
  res.json({
    provider: policy.provider,
    allowed: policy.allowed,
    model: r.rows[0]?.model || policy.fallback,
    inputRate: r.rows[0]?.input_usd_per_million ?? "",
    outputRate: r.rows[0]?.output_usd_per_million ?? "",
    rateNote: r.rows[0]?.rate_note || "",
  });
});
router.put("/admin/ai-configuration", async (req, res) => {
  let input;
  try {
    input = validateAiConfiguration(req.body);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
    return;
  }
  await pool.query(
    "INSERT INTO ai_runtime_configuration(provider,model,input_usd_per_million,output_usd_per_million,rate_note) VALUES($1,$2,$3,$4,$5) ON CONFLICT(provider) DO UPDATE SET model=excluded.model,input_usd_per_million=excluded.input_usd_per_million,output_usd_per_million=excluded.output_usd_per_million,rate_note=excluded.rate_note,updated_at=now()",
    [input.provider, input.model, input.input, input.output, input.note],
  );
  res.json({
    updated: true,
    message:
      "New provider requests use this model. In-flight calls keep their current model. Rates are estimates, not provider invoices.",
  });
});
export default router;
