import { Router } from "express";
import { createHash } from "node:crypto";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireAccount } from "../middlewares/account";
import { summarize, SummaryError } from "../lib/summary";
import { completeVision } from "../lib/ai";
import {
  VISUAL_PROMPT,
  validateVisualDraft,
} from "@workspace/document-intelligence";
const router = Router();
let active = 0;
const hits = new Map<number, { at: number; count: number }>();
export function visualInput(body: any) {
  const image = body?.image;
  if (
    typeof image !== "string" ||
    !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(image) ||
    image.length > 210000
  )
    throw Error("Use a PNG preview up to 150 KB.");
  const bytes = Buffer.from(image.slice(image.indexOf(",") + 1), "base64");
  if (
    bytes.length < 33 ||
    !bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    bytes.toString("ascii", 12, 16) !== "IHDR"
  )
    throw Error("Invalid PNG image.");
  const width = bytes.readUInt32BE(16),
    height = bytes.readUInt32BE(20);
  if (
    !width ||
    !height ||
    width > 1600 ||
    height > 1600 ||
    width * height > 2000000
  )
    throw Error("Preview dimensions exceed limits.");
  return {
    image,
    credits: 2,
    fingerprint: createHash("sha256")
      .update("visual-v1\n" + image)
      .digest("hex"),
  };
}
router.use(
  "/document-vision",
  requireAuth,
  requireAccount,
  async (req, res, next) => {
    if (process.env.ENABLE_AI !== "true") {
      res.status(503).json({ message: "AI is unavailable." });
      return;
    }
    const flags = await pool.query(
      "SELECT enabled FROM tool_settings WHERE tool_slug='ai-document-intelligence'",
    );
    if (flags.rows[0]?.enabled === false) {
      res.status(503).json({ message: "Document AI is disabled." });
      return;
    }
    next();
  },
);
router.post("/document-vision/quote", (req, res) => {
  try {
    const { fingerprint, credits } = visualInput(req.body);
    res.json({ fingerprint, credits });
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
});
router.post("/document-vision/analyze", async (req, res) => {
  let input;
  try {
    input = visualInput(req.body);
    if (
      req.body.consent !== true ||
      input.fingerprint !== req.body.fingerprint ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        req.body.requestId || "",
      )
    )
      throw Error("Confirm the image and quoted cost first.");
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
    return;
  }
  const uid = req.dbUser!.id,
    now = Date.now();
  for (const [id, h] of hits) if (now - h.at > 60000) hits.delete(id);
  const hit = hits.get(uid) || { at: now, count: 0 };
  hit.count++;
  hits.set(uid, hit);
  if (active >= 2 || hit.count > 5) {
    res
      .status(429)
      .json({ message: "Visual analysis is busy. Retry in a minute." });
    return;
  }
  active++;
  try {
    const receipt = await summarize(
      uid,
      {
        mode: "full",
        text: "visual-v1\n" + input.image,
        credits: input.credits,
        requestId: req.body.requestId,
      },
      undefined,
      async () =>
        JSON.stringify(
          validateVisualDraft(await completeVision(VISUAL_PROMPT, input.image)),
        ),
    );
    res.json({ ...receipt, result: JSON.parse(receipt.result) });
  } catch (e) {
    res.status(e instanceof SummaryError ? e.status : 502).json({
      message:
        e instanceof SummaryError
          ? e.message
          : "Visual extraction could not produce a complete review draft. No credits charged for failed processing. Try a smaller section.",
    });
  } finally {
    active--;
  }
});
export default router;
