CREATE TABLE document_workspaces (
 id uuid PRIMARY KEY,
 owner_id integer NOT NULL REFERENCES users(id),
 name text NOT NULL CHECK(length(name) BETWEEN 1 AND 120),
 folder text NOT NULL DEFAULT '' CHECK(length(folder)<=120),
 current_version integer NOT NULL DEFAULT 0,
 review_state text NOT NULL DEFAULT 'draft' CHECK(review_state IN ('draft','in_review','approved','changes_requested')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '30 days'
);
--> statement-breakpoint
CREATE TABLE document_workspace_members (
 workspace_id uuid NOT NULL REFERENCES document_workspaces(id) ON DELETE CASCADE,
 user_id integer NOT NULL REFERENCES users(id),
 role text NOT NULL CHECK(role IN ('viewer','editor','reviewer')),
 PRIMARY KEY(workspace_id,user_id)
);
--> statement-breakpoint
CREATE TABLE document_workspace_versions (
 workspace_id uuid NOT NULL REFERENCES document_workspaces(id) ON DELETE CASCADE,
 version integer NOT NULL,
 ciphertext text NOT NULL,
 author_id integer NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(workspace_id,version)
);
--> statement-breakpoint
CREATE TABLE document_workspace_events (
 id bigserial PRIMARY KEY,
 workspace_id uuid REFERENCES document_workspaces(id) ON DELETE CASCADE,
 actor_id integer NOT NULL REFERENCES users(id),
 event text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX document_workspaces_expiry ON document_workspaces(expires_at);
--> statement-breakpoint
CREATE INDEX document_workspace_members_user ON document_workspace_members(user_id);
