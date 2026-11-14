import { Router } from "express";
import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireAccount } from "../middlewares/account";
import { requireAdmin } from "../middlewares/admin";
import { adminAudit } from "../middlewares/admin-audit";
import {
  openWorkspace,
  sealWorkspace,
  vaultReady,
} from "../lib/document-vault";
const router = Router();
const validId = (v: unknown) =>
  typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);
router.use("/support-requests", requireAuth, requireAccount);
router.use("/admin/support-requests", requireAuth, requireAdmin, adminAudit);
const present = (r: any) => ({
  id: r.id,
  category: r.category,
  status: r.status,
  createdAt: r.created_at,
  expiresAt: r.expires_at,
  ...openWorkspace(r.ciphertext, "support:" + r.id),
  response: r.response
    ? openWorkspace(r.response, "support-response:" + r.id)
    : null,
});
router.get("/support-requests", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM support_requests WHERE user_id=$1 AND expires_at>now() ORDER BY created_at DESC LIMIT 50",
    [req.dbUser!.id],
  );
  res.json({ configured: vaultReady(), requests: r.rows.map(present) });
});
router.post("/support-requests", async (req, res) => {
  const { title, message, category, consent } = req.body || {};
  if (!vaultReady()) {
    res.status(503).json({
      message:
        "Private support storage is not configured. Contact support@toolzcraft.com.",
    });
    return;
  }
  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.length > 120 ||
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 4000 ||
    !["problem", "feedback", "billing"].includes(category) ||
    consent !== true
  ) {
    res.status(400).json({
      message:
        "Enter a title, message (up to 4,000 characters), category, and consent to share with support.",
    });
    return;
  }
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
      req.dbUser!.id,
    ]);
    const count = await c.query(
      "SELECT count(*)::int n FROM support_request_submissions WHERE user_id=$1 AND created_at>now()-interval '1 day'",
      [req.dbUser!.id],
    );
    if (count.rows[0].n >= 5) {
      await c.query("ROLLBACK");
      res.status(429).json({
        message:
          "Maximum five requests per day. Update your existing issue through support instead.",
      });
      return;
    }
    await c.query("DELETE FROM support_request_submissions WHERE user_id=$1 AND created_at<=now()-interval '1 day'", [req.dbUser!.id]);
    await c.query("INSERT INTO support_request_submissions(user_id) VALUES($1)", [req.dbUser!.id]);
    const id = randomUUID();
    await c.query(
      "INSERT INTO support_requests(id,user_id,category,ciphertext) VALUES($1,$2,$3,$4)",
      [
        id,
        req.dbUser!.id,
        category,
        sealWorkspace(
          { title: title.trim(), message: message.trim() },
          "support:" + id,
        ),
      ],
    );
    await c.query("COMMIT");
    res.status(201).json({ id });
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
});
router.delete("/support-requests/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    res.sendStatus(400);
    return;
  }
  await pool.query("DELETE FROM support_requests WHERE id=$1 AND user_id=$2", [
    req.params.id,
    req.dbUser!.id,
  ]);
  res.json({ deleted: true });
});
router.get("/admin/support-requests", async (req, res) => {
  const offset = Number(req.query.offset || 0);
  if (!Number.isInteger(offset) || offset < 0 || offset > 100000) {
    res.sendStatus(400);
    return;
  }
  const r = await pool.query(
    "SELECT * FROM support_requests WHERE expires_at>now() ORDER BY created_at DESC,id LIMIT 50 OFFSET $1",
    [offset],
  );
  res.json({ requests: r.rows.map(present), offset });
});
router.patch("/admin/support-requests/:id", async (req, res) => {
  const { status, response } = req.body || {};
  if (
    !validId(req.params.id) ||
    !["open", "in_progress", "resolved"].includes(status) ||
    typeof response !== "string" ||
    response.length > 4000
  ) {
    res.sendStatus(400);
    return;
  }
  const r = await pool.query(
    "UPDATE support_requests SET status=$2,response=$3,updated_at=now() WHERE id=$1 AND expires_at>now() RETURNING id",
    [
      req.params.id,
      status,
      response.trim()
        ? sealWorkspace(response.trim(), "support-response:" + req.params.id)
        : null,
    ],
  );
  if (!r.rowCount) {
    res.sendStatus(404);
    return;
  }
  res.json({ updated: true });
});
export default router;
