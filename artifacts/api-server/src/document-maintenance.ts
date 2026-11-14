import { pool } from "@workspace/db";
// Run as a Cloud Run Job on an hourly schedule. No HTTP route or document data is logged.
async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const worker = await client.query(
      "SELECT pg_try_advisory_xact_lock(204,1) AS idle",
    );
    if (worker.rows[0].idle)
      await client.query(
        "UPDATE document_jobs SET state=CASE WHEN state='cancel_requested' THEN 'cancelled' ELSE 'failed' END,error_code='expired',updated_at=now() WHERE expires_at<=now() AND state IN ('running','cancel_requested') AND updated_at<now()-interval '1 hour'",
      );
    const receipts = await client.query(
      "UPDATE summary_results SET result='' WHERE created_at<now()-interval '24 hours' AND result<>''",
    );
    const workspaces = await client.query(
      "DELETE FROM document_workspaces WHERE expires_at<=now()",
    );
    await client.query(
      "UPDATE document_jobs SET payload='',result=NULL WHERE expires_at<=now() AND state NOT IN ('running','cancel_requested') AND (payload<>'' OR result IS NOT NULL)",
    );
    await client.query(
      "DELETE FROM document_jobs WHERE created_at<now()-interval '30 days' AND state NOT IN ('running','cancel_requested')",
    );
    await client.query("DELETE FROM support_requests WHERE expires_at<=now()");
    await client.query("DELETE FROM support_request_submissions WHERE created_at<=now()-interval '1 day'");
    await client.query("DELETE FROM document_transfer_daily WHERE day<current_date-90");
    await client.query("DELETE FROM ai_call_daily WHERE day<current_date-90");
    await client.query("COMMIT");
    console.log(
      JSON.stringify({
        expiredReceiptTexts: receipts.rowCount,
        expiredWorkspaces: workspaces.rowCount,
      }),
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(() => {
  console.error(
    "Document retention cleanup failed. Inspect database availability and migration status.",
  );
  process.exitCode = 1;
});
