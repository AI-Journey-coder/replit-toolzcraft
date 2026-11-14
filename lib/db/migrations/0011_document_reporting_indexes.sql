CREATE INDEX usage_events_user_created ON usage_events(user_id,created_at);
--> statement-breakpoint
CREATE INDEX users_created_reporting ON users(created_at);
--> statement-breakpoint
CREATE INDEX document_workspace_events_access ON document_workspace_events(workspace_id,actor_id,event,created_at DESC);
--> statement-breakpoint
CREATE INDEX document_workspace_events_history ON document_workspace_events(workspace_id,id DESC);
