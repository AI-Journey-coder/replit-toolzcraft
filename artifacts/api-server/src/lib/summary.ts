import { createHash } from "node:crypto";
import { pool } from "@workspace/db";
import { claimBackendAttempt, finishBackendAttempt } from "./backend-quota";
import { completeChat } from "./ai";
import { ANALYSIS_SYSTEM, summaryPrompt } from "./ai-prompts";
export function summaryInput(body: any) {
  if (
    !body ||
    !["quick", "full"].includes(body.mode) ||
    typeof body.text !== "string" ||
    !body.text.trim() ||
    typeof body.requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      body.requestId,
    )
  )
    throw Error("Invalid summary request.");
  const limit = body.mode === "quick" ? 6000 : 24000;
  if (body.text.length > limit)
    throw Error("Document exceeds " + limit.toLocaleString() + " characters.");
  return {
    mode: body.mode as "quick" | "full",
    text: body.text as string,
    requestId: body.requestId as string,
    credits: Math.ceil(body.text.length / 6000),
  };
}
export class SummaryError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
// One transaction owns the entire charge, provider result and retry receipt.
// Reuse the existing one-credit ledger without independently committing partial charges.
export async function summarize(
  userId: number,
  input: ReturnType<typeof summaryInput>,
  database = pool,
  generate = completeChat,
) {
  const c = await database.connect();
  try {
    await c.query("BEGIN");
    const lock = await c.query(
      "SELECT pg_try_advisory_xact_lock(199,$1) AS locked",
      [userId],
    );
    if (!lock.rows[0].locked)
      throw new SummaryError(
        409,
        "Another request is processing. Wait, then retry this summary.",
      );
    const account = await c.query(
      "SELECT role,disabled FROM users WHERE id=$1 FOR UPDATE",
      [userId],
    );
    if (!account.rowCount || account.rows[0].disabled)
      throw new SummaryError(403, "Account unavailable.");
    await c.query(
      "UPDATE summary_results SET result='' WHERE user_id=$1 AND created_at<now()-interval '24 hours' AND result<>''",
      [userId],
    );
    const hash = createHash("sha256")
      .update(input.mode + "\n" + input.text)
      .digest("hex");
    const old = await c.query(
      "SELECT input_hash,result,credits,created_at FROM summary_results WHERE user_id=$1 AND request_id=$2",
      [userId, input.requestId],
    );
    if (old.rowCount) {
      if (old.rows[0].input_hash !== hash)
        throw new SummaryError(
          409,
          "This request ID belongs to different text. Start a new summary.",
        );
      if (
        !old.rows[0].result ||
        Date.now() - new Date(old.rows[0].created_at).getTime() > 86400000
      )
        throw new SummaryError(
          409,
          "This retry has expired. Start a new summary.",
        );
      await c.query("COMMIT");
      return {
        result: old.rows[0].result,
        credits: old.rows[0].credits,
        replayed: true,
      };
    }
    const bound = {
      connect: async () => ({
        query: (sql: string, params?: any[]) =>
          ["BEGIN", "COMMIT", "ROLLBACK"].includes(sql)
            ? Promise.resolve({ rows: [], rowCount: 0 })
            : c.query(sql, params),
        release: () => {},
      }),
    } as unknown as typeof pool;
    const reservations: string[] = [];
    for (let i = 0; i < input.credits; i++) {
      const access = await claimBackendAttempt(userId, bound);
      if (!access.allowed)
        throw new SummaryError(
          402,
          "Not enough credits. This summary needs " +
            input.credits +
            " credits; nothing was charged.",
        );
      if (access.reservation) reservations.push(access.reservation);
    }
    const result = await generate(
      ANALYSIS_SYSTEM,
      summaryPrompt(input.text, input.mode === "full"),
    );
    if (!result?.trim()) throw Error("Empty summary");
    for (const id of reservations)
      await finishBackendAttempt(id, userId, true, bound);
    await c.query(
      "INSERT INTO summary_results(user_id,request_id,input_hash,result,credits) VALUES($1,$2,$3,$4,$5)",
      [userId, input.requestId, hash, result, input.credits],
    );
    await c.query("COMMIT");
    return { result, credits: input.credits, replayed: false };
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
