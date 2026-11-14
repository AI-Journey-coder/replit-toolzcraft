import { modelPolicy } from "./ai-configuration";
export async function documentOperations(database: { query: Function }) {
  const [states, models, recent, workspaces, transfers, providerCalls] = await Promise.all([
    database.query(
      "SELECT state,count(*)::int count FROM document_jobs WHERE created_at>now()-interval '30 days' GROUP BY state",
    ),
    database.query(
      "SELECT j.model,sum(j.input_tokens)::bigint input_tokens,sum(j.output_tokens)::bigint output_tokens,count(*)::int jobs,sum((j.input_tokens::numeric*c.input_usd_per_million+j.output_tokens::numeric*c.output_usd_per_million)/1000000)::text estimated_usd FROM document_jobs j LEFT JOIN ai_runtime_configuration c ON c.model=j.model AND c.provider=$1 WHERE j.created_at>now()-interval '30 days' GROUP BY j.model",
      [modelPolicy().provider],
    ),
    database.query(
      "SELECT j.id,j.action,j.state,j.attempts,j.error_code,j.credits,j.created_at,j.updated_at,((j.input_tokens::numeric*c.input_usd_per_million+j.output_tokens::numeric*c.output_usd_per_million)/1000000)::text estimated_usd FROM document_jobs j LEFT JOIN ai_runtime_configuration c ON c.model=j.model AND c.provider=$1 ORDER BY j.created_at DESC LIMIT 50",
      [modelPolicy().provider],
    ),
    database.query(
      "SELECT count(*)::int total,count(*) FILTER(WHERE review_state='in_review')::int awaiting_review,count(*) FILTER(WHERE expires_at<=now())::int expired_pending_cleanup FROM document_workspaces",
    ),
    database.query("SELECT operation,outcome,sum(requests)::text requests,sum(bytes)::text bytes,sum(duration_ms)::text duration_ms FROM document_transfer_daily WHERE day>current_date-30 GROUP BY operation,outcome ORDER BY operation,outcome"),
    database.query("SELECT a.provider,a.model,a.kind,a.outcome,sum(a.calls)::text calls,sum(a.input_tokens)::text input_tokens,sum(a.output_tokens)::text output_tokens,sum(a.unknown_usage)::text unknown_usage,CASE WHEN sum(a.unknown_usage)=0 THEN sum((a.input_tokens::numeric*c.input_usd_per_million+a.output_tokens::numeric*c.output_usd_per_million)/1000000)::text END estimated_usd FROM ai_call_daily a LEFT JOIN ai_runtime_configuration c ON c.provider=a.provider AND c.model=a.model WHERE a.day>current_date-30 GROUP BY a.provider,a.model,a.kind,a.outcome"),
  ]);
  return {
    states: states.rows,
    transfers: transfers.rows,
    providerCalls: providerCalls.rows,
    models: models.rows,
    jobs: recent.rows,
    workspaces: workspaces.rows[0],
    workerEnabled: process.env.ENABLE_DOCUMENT_JOBS === "true",
    retention:
      "Source/result text: 24-hour recovery window; job metadata: 30 days. Hourly maintenance job must be scheduled.",
    costNote:
      "Queued-job usage includes observed correction attempts. USD estimates apply the administrator's CURRENT input/output rates to matching single-model jobs; they are not invoices or historical prices. Missing rates and mixed-model jobs show unavailable. Cache discounts, separate thinking charges and unreported usage are not inferred.",
  };
}
