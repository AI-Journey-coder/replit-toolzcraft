CREATE TABLE IF NOT EXISTS support_request_submissions (
  id bigserial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS support_submission_user_time ON support_request_submissions(user_id,created_at);
INSERT INTO support_request_submissions(user_id,created_at)
SELECT user_id,created_at FROM support_requests WHERE created_at>now()-interval '1 day';
