CREATE TABLE admin_audit_events (
 id bigserial PRIMARY KEY,
 actor_id integer NOT NULL,
 method text NOT NULL,
 resource text NOT NULL,
 status_code integer,
 created_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz
);
CREATE INDEX admin_audit_created ON admin_audit_events(created_at DESC);
