import { pool } from "@workspace/db";
import { openWorkspace, sealWorkspace } from "./document-vault";
import { summarize, SummaryError } from "./summary";
import { analyzeEvidence } from "./intelligence-analysis";
import { intelligenceInput } from "./intelligence-input";
export async function processDocumentJob(
  database = pool,
  analyze = analyzeEvidence,
  charge = summarize,
) {
  const c = await database.connect();
  let job: any;
  try {
    await c.query("BEGIN");
    const result = await c.query(
      "SELECT * FROM document_jobs WHERE state='queued' AND attempts<3 AND expires_at>now() ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1",
    );
    if (!result.rowCount) {
      await c.query("COMMIT");
      return false;
    }
    job = result.rows[0];
    await c.query(
      "UPDATE document_jobs SET state='running',attempts=attempts+1,updated_at=now() WHERE id=$1",
      [job.id],
    );
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
  let inputTokens = 0,
    outputTokens = 0,
    model = job.model || "";
  try {
    if (process.env.ENABLE_AI !== "true")
      throw new SummaryError(503, "AI disabled");
    const flags = await database.query(
      "SELECT enabled FROM tool_settings WHERE tool_slug='ai-document-intelligence'",
    );
    if (flags.rows[0]?.enabled === false)
      throw new SummaryError(503, "AI disabled");
    const raw = openWorkspace(job.payload, "job:" + job.id),
      input = intelligenceInput(raw);
    if (input.fingerprint !== job.fingerprint || input.credits !== job.credits)
      throw Error("Job fingerprint mismatch");
    const receipt = await charge(
      job.user_id,
      {
        mode: "full",
        text: input.canonical,
        requestId: job.id,
        credits: input.credits,
      },
      database,
      async () => {
        const before = await database.query(
          "SELECT state FROM document_jobs WHERE id=$1",
          [job.id],
        );
        if (before.rows[0]?.state !== "running")
          throw new SummaryError(409, "Cancelled");
        const result = await analyze(
          input.documents,
          input.documentType,
          input.action,
          input.question,
          input.history,
          (u) => {
            inputTokens += u.inputTokens;
            outputTokens += u.outputTokens;
            model = model && model !== u.model ? "mixed models" : u.model;
          },
        );
        const after = await database.query(
          "SELECT state FROM document_jobs WHERE id=$1",
          [job.id],
        );
        if (after.rows[0]?.state !== "running")
          throw new SummaryError(409, "Cancelled");
        return JSON.stringify(result);
      },
    );
    await database.query(
      "UPDATE document_jobs SET state='completed',result=$2,error_code=NULL,input_tokens=input_tokens+$3,output_tokens=output_tokens+$4,model=$5,updated_at=now() WHERE id=$1",
      [
        job.id,
        sealWorkspace(JSON.parse(receipt.result), "result:" + job.id),
        inputTokens,
        outputTokens,
        model || null,
      ],
    );
  } catch (e) {
    const code =
      e instanceof SummaryError
        ? e.status === 402
          ? "insufficient_credits"
          : e.status === 403
            ? "account_unavailable"
            : e.status === 503
              ? "ai_disabled"
              : "retryable_conflict"
        : "processing_failed";
    await database.query(
      "UPDATE document_jobs SET state=CASE WHEN state='cancel_requested' THEN 'cancelled' ELSE 'failed' END,error_code=$2,input_tokens=input_tokens+$3,output_tokens=output_tokens+$4,model=$5,updated_at=now() WHERE id=$1",
      [job.id, code, inputTokens, outputTokens, model || null],
    );
  }
  return true;
}
