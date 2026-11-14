CREATE TABLE summary_results (
 user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 request_id uuid NOT NULL,
 input_hash text NOT NULL,
 result text NOT NULL,
 credits integer NOT NULL CHECK (credits BETWEEN 1 AND 4),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,request_id)
);
CREATE INDEX summary_results_created ON summary_results(created_at);
