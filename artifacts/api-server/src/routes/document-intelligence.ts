import { Router } from "express";
import { createHash } from "node:crypto";
import {
  ACTIONS,
  DOCUMENT_TYPES,
  validateSources,
  validateConversation,
  verifiedResult,
  intelligencePrompt,
  type IntelligenceAction,
  type DocumentType,
} from "@workspace/document-intelligence";
import { requireAuth } from "../middlewares/auth";
import { requireAccount } from "../middlewares/account";
import { summarize, SummaryError } from "../lib/summary";
import { completeChat } from "../lib/ai";
import { analyzeEvidence } from "../lib/intelligence-analysis";
import { pool } from "@workspace/db";
const router = Router();
let active = 0;
const hits = new Map<number, { at: number; count: number }>();
export { intelligenceInput } from "../lib/intelligence-input";
import { intelligenceInput } from "../lib/intelligence-input";
router.use("/document-intelligence", requireAuth, requireAccount);
router.post("/document-intelligence/clear", async (req, res) => {
  const ids = req.body?.requestIds;
  if (
    !Array.isArray(ids) ||
    ids.length > 100 ||
    ids.some(
      (id) =>
        typeof id !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        ),
    )
  ) {
    res.status(400).json({ message: "Invalid receipt selection." });
    return;
  }
  try {
    await pool.query(
      "UPDATE summary_results SET result='' WHERE user_id=$1 AND request_id=ANY($2::uuid[])",
      [req.dbUser!.id, ids],
    );
    res.json({ cleared: true });
  } catch {
    res
      .status(503)
      .json({ message: "Could not clear stored results. Please retry." });
  }
});
router.use("/document-intelligence", async (req, res, next) => {
  if (process.env.ENABLE_AI !== "true") {
    res
      .status(503)
      .json({ message: "AI analysis is disabled. Local review still works." });
    return;
  }
  const flags = await pool.query(
    "SELECT enabled FROM tool_settings WHERE tool_slug='ai-document-intelligence'",
  );
  if (flags.rows[0]?.enabled === false) {
    res.status(503).json({
      message:
        "Document AI is temporarily disabled by the administrator. Local tools remain available.",
    });
    return;
  }
  next();
});
router.post("/document-intelligence/quote", (req, res) => {
  try {
    const input = intelligenceInput(req.body);
    res.json({
      fingerprint: input.fingerprint,
      credits: input.credits,
      unlimited: req.dbUser!.role === "admin",
    });
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
});
router.post("/document-intelligence/analyze", async (req, res) => {
  let input;
  try {
    input = intelligenceInput(req.body);
    if (
      req.body.fingerprint !== input.fingerprint ||
      typeof req.body.requestId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        req.body.requestId,
      ) ||
      req.body.consent !== true
    )
      throw Error(
        "Review the current cost and confirm this source before submitting.",
      );
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
    return;
  }
  const now = Date.now(),
    uid = req.dbUser!.id;
  for (const [id, h] of hits) if (now - h.at > 60000) hits.delete(id);
  const hit = hits.get(uid) || { at: now, count: 0 };
  hit.count++;
  hits.set(uid, hit);
  if (hit.count > 10 || active >= 2) {
    res.status(429).json({
      message: "AI is busy. Wait a moment and retry the unchanged request.",
    });
    return;
  }
  active++;
  try {
    // The existing atomic receipt ledger reserves all credits, validates output before
    // committing, and replays an identical request ID without another provider charge.
    const receipt = await summarize(
      uid,
      {
        mode: "full",
        text: input.canonical,
        credits: input.credits,
        requestId: req.body.requestId,
      },
      undefined,
      async () => {
        return JSON.stringify(
          await analyzeEvidence(
            input.documents,
            input.documentType,
            input.action,
            input.question,
            input.history,
          ),
        );
      },
    );
    res.json({ ...receipt, result: JSON.parse(receipt.result) });
  } catch (e) {
    res.status(e instanceof SummaryError ? e.status : 502).json({
      message:
        e instanceof SummaryError
          ? e.message
          : "Analysis could not be completed with valid source evidence. No credits charged for failed processing. Retry the unchanged request.",
    });
  } finally {
    active--;
  }
});
export default router;
