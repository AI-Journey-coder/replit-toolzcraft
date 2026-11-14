CREATE TABLE document_workflows (
 id uuid PRIMARY KEY,
 user_id integer NOT NULL REFERENCES users(id),
 workspace_id uuid NOT NULL REFERENCES document_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(length(name) BETWEEN 1 AND 120),
 specification text NOT NULL,
 enabled boolean NOT NULL DEFAULT true,
 next_run_at timestamptz NOT NULL,
 last_run_at timestamptz,
 last_status text,
 created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE document_jobs ADD COLUMN workflow_id uuid REFERENCES document_workflows(id) ON DELETE SET NULL;
--> statement-breakpoint
CREATE TABLE document_webhook_events (
 id uuid PRIMARY KEY,
 workflow_id uuid NOT NULL REFERENCES document_workflows(id) ON DELETE CASCADE,
 job_id uuid NOT NULL REFERENCES document_jobs(id) ON DELETE CASCADE,
 attempts integer NOT NULL DEFAULT 0,
 delivered_at timestamptz,
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(job_id)
);
