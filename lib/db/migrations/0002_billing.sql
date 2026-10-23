CREATE TABLE billing_subscriptions (
 id text PRIMARY KEY,
 user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 provider_id text UNIQUE,
 plan_id text NOT NULL,
 mode text NOT NULL CHECK(mode IN ('test','live')),
 status text NOT NULL DEFAULT 'creating',
 cancel_requested boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX billing_one_open_subscription ON billing_subscriptions(user_id,mode)
 WHERE status NOT IN ('cancelled','completed','expired');
CREATE TABLE billing_periods (
 payment_id text PRIMARY KEY,
 subscription_id text NOT NULL REFERENCES billing_subscriptions(id),
 user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 period_start timestamptz NOT NULL,
 period_end timestamptz NOT NULL CHECK(period_end>period_start),
 used integer NOT NULL DEFAULT 0 CHECK(used BETWEEN 0 AND 100),
 revoked boolean NOT NULL DEFAULT false,
 UNIQUE(subscription_id,period_start)
);
CREATE INDEX billing_period_user ON billing_periods(user_id,period_end);
CREATE TABLE ai_credit_reservations (
 id text PRIMARY KEY,
 user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 payment_id text REFERENCES billing_periods(payment_id),
 state text NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','completed','released')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE billing_revocations (
 payment_id text PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now()
);
