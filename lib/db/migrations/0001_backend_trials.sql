CREATE TABLE backend_trials (
 user_id integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 3)
);
CREATE TABLE subscription_access (
 user_id integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 paid_until timestamptz NOT NULL,
 revoked boolean NOT NULL DEFAULT false
);
