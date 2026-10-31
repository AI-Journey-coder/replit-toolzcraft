import { Router } from "express";
import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireAccount } from "../middlewares/account";
import { workflowSpec } from "../lib/document-automation";
import { sealWorkspace, vaultReady } from "../lib/document-vault";
import { webhookSigningKey } from "../lib/document-webhook";
const router = Router();
const id = (v: unknown) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
router.use("/document-workflows", requireAuth, requireAccount);
router.get("/document-workflows", async (req, res) => {
  const r = await pool.query(
    "SELECT id,workspace_id,name,enabled,next_run_at,last_run_at,last_status FROM document_workflows WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
    [req.dbUser!.id],
  );
  res.json({
    enabled: process.env.ENABLE_DOCUMENT_JOBS === "true" && vaultReady(),
    workflows: r.rows,
  });
});
router.post("/document-workflows", async (req, res) => {
  let spec, when: Date;
  try {
    spec = workflowSpec(req.body?.specification);
    when = new Date(req.body?.nextRunAt);
    if (
      !id(req.body.workspaceId) ||
      typeof req.body.name !== "string" ||
      !req.body.name.trim() ||
      req.body.name.length > 120 ||
      !Number.isFinite(when.getTime()) ||
      when.getTime() < Date.now() - 300000 ||
      when.getTime() > Date.now() + 30 * 86400000 ||
      req.body.consent !== true
    )
      throw Error(
        "Choose a workspace, name, start within 30 days, and confirm recurring credit use.",
      );
    if (process.env.ENABLE_DOCUMENT_JOBS !== "true" || !vaultReady())
      throw Error("Scheduled processing is not configured.");
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
    return;
  }
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
      req.dbUser!.id,
    ]);
    const workspace = await c.query(
      "SELECT id FROM document_workspaces WHERE id=$1 AND owner_id=$2 AND expires_at>now()",
      [req.body.workspaceId, req.dbUser!.id],
    );
    if (!workspace.rowCount) {
      await c.query("ROLLBACK");
      res.status(404).json({ message: "Owned workspace not found." });
      return;
    }
    const count = await c.query(
      "SELECT count(*)::int n FROM document_workflows WHERE user_id=$1",
      [req.dbUser!.id],
    );
    if (count.rows[0].n >= 10) {
      await c.query("ROLLBACK");
      res
        .status(409)
        .json({ message: "Maximum 10 workflows. Delete one first." });
      return;
    }
    const workflowId = randomUUID();
    await c.query(
      "INSERT INTO document_workflows(id,user_id,workspace_id,name,specification,next_run_at) VALUES($1,$2,$3,$4,$5,$6)",
      [
        workflowId,
        req.dbUser!.id,
        req.body.workspaceId,
        req.body.name.trim(),
        sealWorkspace(spec, "workflow:" + workflowId),
        when,
      ],
    );
    await c.query("COMMIT");
    res.status(201).json({ id: workflowId });
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
});
router.patch("/document-workflows/:id", async (req, res) => {
  if (!id(req.params.id) || typeof req.body?.enabled !== "boolean") {
    res.sendStatus(400);
    return;
  }
  const r = await pool.query(
    "UPDATE document_workflows SET enabled=$3 WHERE id=$1 AND user_id=$2 RETURNING id",
    [req.params.id, req.dbUser!.id, req.body.enabled],
  );
  if (!r.rowCount) {
    res.sendStatus(404);
    return;
  }
  res.json({ updated: true });
});
router.post("/document-workflows/:id/signing-key", async (req, res) => {
  if (!id(req.params.id)) {
    res.sendStatus(400);
    return;
  }
  const r = await pool.query(
    "SELECT id FROM document_workflows WHERE id=$1 AND user_id=$2",
    [req.params.id, req.dbUser!.id],
  );
  if (!r.rowCount) {
    res.sendStatus(404);
    return;
  }
  res.json({
    key: webhookSigningKey(String(req.params.id)),
    algorithm:
      'HMAC-SHA256(timestamp + "." + raw request body). Reject old timestamps and deduplicate event IDs.',
  });
});
router.delete("/document-workflows/:id", async (req, res) => {
  if (!id(req.params.id)) {
    res.sendStatus(400);
    return;
  }
  await pool.query(
    "DELETE FROM document_workflows WHERE id=$1 AND user_id=$2",
    [req.params.id, req.dbUser!.id],
  );
  res.json({ deleted: true });
});
export default router;
