CREATE TABLE support_requests (
  id uuid PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK(category IN ('problem','feedback','billing')),
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved')),
  ciphertext text NOT NULL,
  response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now()+interval '30 days'
);
CREATE INDEX support_requests_owner ON support_requests(user_id,created_at DESC);
CREATE INDEX support_requests_queue ON support_requests(status,created_at DESC);
