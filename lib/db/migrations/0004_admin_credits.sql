CREATE TABLE user_credit_overrides (user_id integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, remaining integer NOT NULL CHECK (remaining BETWEEN 0 AND 1000000));
ALTER TABLE ai_credit_reservations ADD COLUMN admin_override boolean NOT NULL DEFAULT false;
CREATE TABLE admin_credit_changes (id bigserial PRIMARY KEY, actor_id integer NOT NULL, user_id integer NOT NULL, previous_remaining integer, new_remaining integer, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
