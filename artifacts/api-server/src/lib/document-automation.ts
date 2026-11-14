import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import {
  runRules,
  validateRules,
  ACTIONS,
} from "@workspace/document-intelligence";
import { openWorkspace, sealWorkspace } from "./document-vault";
import { intelligenceInput } from "./intelligence-input";
import { approvedWebhook, deliverDocumentEvent } from "./document-webhook";
export function workflowSpec(body: any) {
  if (
    !body ||
    !ACTIONS.includes(body.action) ||
    typeof body.question !== "string" ||
    body.question.length > 2000 ||
    !Number.isInteger(body.maxCredits) ||
    body.maxCredits < 1 ||
    body.maxCredits > 4 ||
    !["once", "daily"].includes(body.repeat)
  )
    throw Error("Invalid workflow settings.");
  if (
    ["questions", "checklist", "translate"].includes(body.action) &&
    !body.question.trim()
  )
    throw Error("Enter the scheduled question, checklist or target language.");
  const rules = validateRules(body.rules || []);
  const webhook = body.webhook || "";
  if (typeof webhook !== "string" || webhook.length > 2000)
    throw Error("Invalid webhook URL.");
  if (webhook) approvedWebhook(webhook);
  return {
    action: body.action,
    question: body.question,
    maxCredits: body.maxCredits,
    repeat: body.repeat,
    rules,
    webhook,
  };
}
export async function scheduleDocumentWorkflows() {
  const client = await pool.connect();
  let queued = 0;
  try {
    await client.query("BEGIN");
    const workflows = await client.query(
      "SELECT f.*,w.review_state,w.current_version,w.expires_at,v.ciphertext FROM document_workflows f JOIN document_workspaces w ON w.id=f.workspace_id JOIN document_workspace_versions v ON v.workspace_id=w.id AND v.version=w.current_version WHERE f.enabled AND f.next_run_at<=now() ORDER BY f.next_run_at FOR UPDATE OF f SKIP LOCKED LIMIT 20",
    );
    for (const f of workflows.rows) {
      let status = "queued";
      let spec;
      try {
        spec = workflowSpec(openWorkspace(f.specification, "workflow:" + f.id));
      } catch {
        await client.query(
          "UPDATE document_workflows SET enabled=false,last_status='configuration_requires_review' WHERE id=$1",
          [f.id],
        );
        continue;
      }
      if (new Date(f.expires_at) <= new Date()) {
        await client.query(
          "UPDATE document_workflows SET enabled=false,last_status='workspace_expired' WHERE id=$1",
          [f.id],
        );
        continue;
      }
      if (f.review_state !== "approved") status = "awaiting_approval";
      let input;
      try {
        const snapshot = openWorkspace(
          f.ciphertext,
          f.workspace_id + ":" + f.current_version,
        );
        input = intelligenceInput({
          ...snapshot,
          action: spec.action,
          question: spec.question,
          history: [],
        });
      } catch {
        await client.query(
          "UPDATE document_workflows SET enabled=false,last_status='configuration_requires_review' WHERE id=$1",
          [f.id],
        );
        continue;
      }
      if (input.credits > spec.maxCredits) status = "credit_limit_exceeded";
      if (
        spec.rules.length &&
        runRules(input.documents, spec.rules).checks.some(
          (c) => c.status !== "pass",
        )
      )
        status = "condition_requires_review";
      if (status === "queued") {
        const limit = await client.query(
          "SELECT count(*)::int n FROM document_jobs WHERE user_id=$1 AND created_at>now()-interval '1 hour'",
          [f.user_id],
        );
        if (limit.rows[0].n >= 30) status = "hourly_limit";
        else {
          const id = randomUUID();
          await client.query(
            "INSERT INTO document_jobs(id,user_id,fingerprint,action,credits,payload,workflow_id) VALUES($1,$2,$3,$4,$5,$6,$7)",
            [
              id,
              f.user_id,
              input.fingerprint,
              input.action,
              input.credits,
              sealWorkspace(input, "job:" + id),
              f.id,
            ],
          );
          queued++;
        }
      }
      if (status === "condition_requires_review")
        await client.query(
          "UPDATE document_workspaces SET review_state='in_review' WHERE id=$1",
          [f.workspace_id],
        );
      await client.query(
        "UPDATE document_workflows SET last_run_at=now(),last_status=$2,next_run_at=now()+interval '1 day',enabled=$3 WHERE id=$1",
        [f.id, status, spec.repeat === "daily"],
      );
    }
    await client.query("COMMIT");
    return queued;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
export async function dispatchDocumentWebhooks() {
  await pool.query(
    "INSERT INTO document_webhook_events(id,workflow_id,job_id) SELECT gen_random_uuid(),workflow_id,id FROM document_jobs WHERE workflow_id IS NOT NULL AND state IN ('completed','failed','cancelled') ON CONFLICT(job_id) DO NOTHING",
  );
  const events = await pool.query(
    "SELECT e.*,f.specification,j.state,j.action FROM document_webhook_events e JOIN document_workflows f ON f.id=e.workflow_id JOIN document_jobs j ON j.id=e.job_id WHERE e.delivered_at IS NULL AND e.attempts<3 AND e.next_attempt_at<=now() ORDER BY e.next_attempt_at LIMIT 20",
  );
  for (const event of events.rows) {
    let spec;
    try {
      spec = workflowSpec(
        openWorkspace(event.specification, "workflow:" + event.workflow_id),
      );
    } catch {
      await pool.query(
        "UPDATE document_webhook_events SET attempts=3 WHERE id=$1",
        [event.id],
      );
      continue;
    }
    if (!spec.webhook) {
      await pool.query(
        "UPDATE document_webhook_events SET delivered_at=now() WHERE id=$1",
        [event.id],
      );
      continue;
    }
    try {
      await deliverDocumentEvent(spec.webhook, event.workflow_id, {
        id: event.id,
        type: "document.job." + event.state,
        jobId: event.job_id,
        action: event.action,
      });
      await pool.query(
        "UPDATE document_webhook_events SET delivered_at=now(),attempts=attempts+1 WHERE id=$1",
        [event.id],
      );
    } catch {
      await pool.query(
        "UPDATE document_webhook_events SET attempts=attempts+1,next_attempt_at=now()+interval '15 minutes' WHERE id=$1",
        [event.id],
      );
    }
  }
}
