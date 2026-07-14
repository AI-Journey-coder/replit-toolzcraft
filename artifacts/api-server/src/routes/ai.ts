import { Router, type IRouter } from "express";
import { AnalyzeDocumentBody } from "@workspace/api-zod";
import { completeChat } from "../lib/ai";

const router: IRouter = Router();

const aiHits = new Map<string, { count: number; windowStart: number }>();
const AI_WINDOW_MS = 60_000;
const AI_MAX_PER_WINDOW = 10;

function aiRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = aiHits.get(ip);
  if (!entry || now - entry.windowStart > AI_WINDOW_MS) {
    aiHits.set(ip, { count: 1, windowStart: now });
    if (aiHits.size > 10_000) {
      for (const [key, value] of aiHits) {
        if (now - value.windowStart > AI_WINDOW_MS) aiHits.delete(key);
      }
    }
    return false;
  }
  entry.count += 1;
  return entry.count > AI_MAX_PER_WINDOW;
}

const SYSTEM_PROMPT =
  "You are a precise document-analysis assistant. Work only with the text the user provides. Respond in plain text (no markdown formatting symbols like ** or ##). Be concise and accurate; if the text does not contain the answer, say so.";

function buildPrompt(input: {
  task: string;
  text: string;
  question?: string;
  targetLanguage?: string;
}): string | null {
  switch (input.task) {
    case "summarize":
      return `Summarize the following document in a short paragraph followed by 3-5 bullet points (use "-" for bullets).\n\nDocument:\n${input.text}`;
    case "key-points":
      return `Extract the key points from the following document as a plain list (use "-" for bullets). Include important names, dates, figures, and decisions.\n\nDocument:\n${input.text}`;
    case "qa":
      if (!input.question?.trim()) return null;
      return `Answer the question using only the document below. If the answer is not in the document, say "The document does not contain this information."\n\nQuestion: ${input.question}\n\nDocument:\n${input.text}`;
    case "translate":
      if (!input.targetLanguage?.trim()) return null;
      return `Translate the following document into ${input.targetLanguage}. Preserve the meaning and structure. Output only the translation.\n\nDocument:\n${input.text}`;
    default:
      return null;
  }
}

router.post("/ai/analyze", async (req, res) => {
  const parsed = AnalyzeDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }
  const prompt = buildPrompt(parsed.data);
  if (!prompt) {
    res.status(400).json({
      message:
        parsed.data.task === "qa"
          ? "A question is required"
          : parsed.data.task === "translate"
            ? "A target language is required"
            : "Unsupported task",
    });
    return;
  }
  if (aiRateLimited(req.ip ?? "unknown")) {
    res.status(429).json({ message: "Too many requests — try again in a minute" });
    return;
  }
  try {
    const result = await completeChat(SYSTEM_PROMPT, prompt);
    res.json({ result });
  } catch (err) {
    req.log.error({ err }, "AI analysis failed");
    res.status(502).json({ message: "AI provider error — please try again" });
  }
});

export default router;
