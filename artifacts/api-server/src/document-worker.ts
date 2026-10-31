import { configureModelSelection,configureUsageObserver } from "./lib/ai";
import { recordProviderUsage } from './lib/ai-metrics';
import { runtimeModel } from "./lib/ai-configuration";
import { pool } from "@workspace/db";
import { processDocumentJob } from "./lib/document-job-runner";
import {
  scheduleDocumentWorkflows,
  dispatchDocumentWebhooks,
} from "./lib/document-automation";
configureModelSelection(() => runtimeModel(pool));
configureUsageObserver(usage=>recordProviderUsage(pool,usage).catch(()=>{console.error('Provider usage metrics could not be recorded');}));
async function main() {
  if (process.env.ENABLE_DOCUMENT_JOBS !== "true")
    throw Error("Document worker disabled.");
  const lock = await pool.connect();
  let count = 0;
  try {
    const r = await lock.query("SELECT pg_try_advisory_lock(204,1) AS locked");
    if (!r.rows[0].locked) return;
    // A killed worker loses its database transaction. Retry uses the same receipt ID.
    await pool.query(
      "UPDATE document_jobs j SET state=CASE WHEN EXISTS(SELECT 1 FROM summary_results r WHERE r.request_id=j.id AND r.user_id=j.user_id AND r.result<>'') THEN 'queued' WHEN state='cancel_requested' THEN 'cancelled' WHEN attempts>=3 THEN 'failed' ELSE 'queued' END,attempts=CASE WHEN EXISTS(SELECT 1 FROM summary_results r WHERE r.request_id=j.id AND r.user_id=j.user_id AND r.result<>'') THEN LEAST(attempts,2) ELSE attempts END,updated_at=now() WHERE state IN ('running','cancel_requested') AND updated_at<now()-interval '5 minutes'",
    );
    await scheduleDocumentWorkflows();
    const started = Date.now();
    while (
      count < 20 &&
      Date.now() - started < 9 * 60 * 1000 &&
      (await processDocumentJob())
    )
      count++;
    await dispatchDocumentWebhooks();
    console.log(JSON.stringify({ processedJobs: count }));
  } finally {
    await lock.query("SELECT pg_advisory_unlock(204,1)");
    lock.release();
    await pool.end();
  }
}
main().catch(() => {
  console.error(
    "Document worker failed. Check database, key and AI configuration.",
  );
  process.exitCode = 1;
});
