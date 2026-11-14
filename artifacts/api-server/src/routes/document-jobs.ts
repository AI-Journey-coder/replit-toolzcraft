import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireAccount } from "../middlewares/account";
import { intelligenceInput } from "../lib/intelligence-input";
import {
  sealWorkspace,
  openWorkspace,
  vaultReady,
} from "../lib/document-vault";
const router = Router();
const validId = (id: unknown) =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
router.use("/document-jobs", requireAuth, requireAccount);
router.get("/document-jobs", async (req, res) => {
  const r = await pool.query(
    "SELECT id,action,credits,state,attempts,error_code,created_at,updated_at,expires_at FROM document_jobs WHERE user_id=$1 AND expires_at>now() ORDER BY created_at DESC LIMIT 100",
    [req.dbUser!.id],
  );
  res.json({
    enabled: process.env.ENABLE_DOCUMENT_JOBS === "true" && vaultReady(),
    jobs: r.rows,
  });
});
router.post("/document-jobs", async (req, res) => {
  if (
    process.env.ENABLE_DOCUMENT_JOBS !== "true" ||
    process.env.ENABLE_AI !== "true" ||
    !vaultReady()
  ) {
    res
      .status(503)
      .json({ message: "Background processing is not configured." });
    return;
  }
  let input;
  try {
    input = intelligenceInput(req.body);
    if (
      req.body.consent !== true ||
      req.body.fingerprint !== input.fingerprint ||
      !validId(req.body.requestId)
    )
      throw Error("Confirm the quoted cost and selected source.");
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
    const old = await c.query(
      "SELECT fingerprint,user_id FROM document_jobs WHERE id=$1",
      [req.body.requestId],
    );
    if (old.rowCount) {
      await c.query("ROLLBACK");
      if (
        old.rows[0].user_id !== req.dbUser!.id ||
        old.rows[0].fingerprint !== input.fingerprint
      ) {
        res.status(409).json({ message: "Request ID is already in use." });
        return;
      }
      res.json({ id: req.body.requestId, replayed: true });
      return;
    }
    const count = await c.query(
      "SELECT count(*)::int n FROM document_jobs WHERE user_id=$1 AND created_at>now()-interval '1 hour'",
      [req.dbUser!.id],
    );
    if (count.rows[0].n >= 30) {
      await c.query("ROLLBACK");
      res.status(429).json({
        message: "Maximum 30 queued requests per hour. Try again later.",
      });
      return;
    }
    await c.query(
      "INSERT INTO document_jobs(id,user_id,fingerprint,action,credits,payload) VALUES($1,$2,$3,$4,$5,$6)",
      [
        req.body.requestId,
        req.dbUser!.id,
        input.fingerprint,
        input.action,
        input.credits,
        sealWorkspace(input, "job:" + req.body.requestId),
      ],
    );
    await c.query("COMMIT");
    res.status(202).json({ id: req.body.requestId });
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
});
router.get("/document-jobs/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    res.sendStatus(400);
    return;
  }
  const r = await pool.query(
    "SELECT * FROM document_jobs WHERE id=$1 AND user_id=$2 AND expires_at>now()",
    [req.params.id, req.dbUser!.id],
  );
  if (!r.rowCount) {
    res.status(404).json({ message: "Job unavailable or expired." });
    return;
  }
  const j = r.rows[0];
  res.json({
    id: j.id,
    state: j.state,
    action: j.action,
    credits: j.credits,
    error: j.error_code,
    result: j.result ? openWorkspace(j.result, "result:" + j.id) : null,
    documents: j.result
      ? openWorkspace(j.payload, "job:" + j.id).documents
      : undefined,
  });
});
router.post("/document-jobs/:id/cancel", async (req, res) => {
  if (!validId(req.params.id)) {
    res.sendStatus(400);
    return;
  }
  const r = await pool.query(
    "UPDATE document_jobs SET state=CASE WHEN state='queued' THEN 'cancelled' ELSE 'cancel_requested' END,updated_at=now() WHERE id=$1 AND user_id=$2 AND state IN ('queued','running') RETURNING state",
    [req.params.id, req.dbUser!.id],
  );
  if (!r.rowCount) {
    res
      .status(409)
      .json({ message: "Job has already finished or cannot be cancelled." });
    return;
  }
  res.json({
    state: r.rows[0].state,
    message:
      "Queued jobs are cancelled without charge. Running cancellation is best effort; a result already committed can still be charged.",
  });
});
router.post("/document-jobs/:id/retry", async (req, res) => {
  if (!validId(req.params.id)) {
    res.sendStatus(400);
    return;
  }
  const r = await pool.query(
    "UPDATE document_jobs SET state='queued',error_code=NULL,updated_at=now() WHERE id=$1 AND user_id=$2 AND state='failed' AND attempts<3 AND expires_at>now() RETURNING id",
    [req.params.id, req.dbUser!.id],
  );
  if (!r.rowCount) {
    res.status(409).json({
      message: "Retry unavailable; limit is three attempts within 24 hours.",
    });
    return;
  }
  res.json({ queued: true });
});
router.delete("/document-jobs/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    res.sendStatus(400);
    return;
  }
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const r = await c.query(
      "DELETE FROM document_jobs WHERE id=$1 AND user_id=$2 AND state NOT IN ('running','cancel_requested') RETURNING id",
      [req.params.id, req.dbUser!.id],
    );
    if (!r.rowCount) {
      await c.query("ROLLBACK");
      res
        .status(409)
        .json({ message: "Cancel running work before deleting it." });
      return;
    }
    await c.query(
      "UPDATE summary_results SET result='' WHERE user_id=$1 AND request_id=$2",
      [req.dbUser!.id, req.params.id],
    );
    await c.query("COMMIT");
    res.json({ deleted: true });
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
});
export default router;
