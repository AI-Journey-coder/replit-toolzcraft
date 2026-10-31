CREATE TABLE document_jobs (
 id uuid PRIMARY KEY,
 user_id integer NOT NULL REFERENCES users(id),
 fingerprint text NOT NULL,
 action text NOT NULL,
 credits integer NOT NULL CHECK(credits BETWEEN 1 AND 4),
 payload text NOT NULL,
 result text,
 state text NOT NULL DEFAULT 'queued' CHECK(state IN ('queued','running','cancel_requested','cancelled','completed','failed')),
 attempts integer NOT NULL DEFAULT 0,
 error_code text,
 input_tokens integer NOT NULL DEFAULT 0,
 output_tokens integer NOT NULL DEFAULT 0,
 model text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours'
);
--> statement-breakpoint
CREATE INDEX document_jobs_owner ON document_jobs(user_id,created_at DESC);
--> statement-breakpoint
CREATE INDEX document_jobs_queue ON document_jobs(state,created_at);
