import { Router } from "express";
import { randomUUID } from "node:crypto";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireAccount } from "../middlewares/account";
import {
  vaultReady,
  sealWorkspace,
  openWorkspace,
  workspaceSnapshot,
} from "../lib/document-vault";
const router = Router();
const uuid = (v: unknown) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
router.use("/document-workspaces", requireAuth, requireAccount);
router.get("/document-workspaces", async (req, res) => {
  const result = await pool.query(
    `SELECT w.id,w.name,w.folder,w.current_version,w.review_state,w.updated_at,w.expires_at,CASE WHEN w.owner_id=$1 THEN 'owner' ELSE m.role END AS role FROM document_workspaces w LEFT JOIN document_workspace_members m ON m.workspace_id=w.id AND m.user_id=$1 WHERE (w.owner_id=$1 OR m.user_id=$1) AND w.expires_at>now() ORDER BY w.updated_at DESC LIMIT 100`,
    [req.dbUser!.id],
  );
  res.json({ configured: vaultReady(), workspaces: result.rows });
});
router.post("/document-workspaces", async (req, res) => {
  let snapshot, name, folder;
  try {
    snapshot = workspaceSnapshot(req.body?.snapshot);
    name = req.body.name;
    folder = req.body.folder || "";
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 120 ||
      typeof folder !== "string" ||
      folder.length > 120
    )
      throw Error(
        "Enter a workspace name and optional folder, up to 120 characters.",
      );
    if (req.body.consent !== true)
      throw Error("Confirm encrypted storage for 30 days.");
    if (!vaultReady())
      throw Error("Encrypted workspace storage is not configured.");
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
      req.dbUser!.id,
    ]);
    const count = await client.query(
      "SELECT count(*)::int AS n FROM document_workspaces WHERE owner_id=$1",
      [req.dbUser!.id],
    );
    if (count.rows[0].n >= 50) {
      await client.query("ROLLBACK");
      res.status(409).json({
        message:
          "Maximum 50 saved workspaces. Delete one before saving another.",
      });
      return;
    }
    const id = randomUUID();
    await client.query(
      "INSERT INTO document_workspaces(id,owner_id,name,folder,current_version) VALUES($1,$2,$3,$4,1)",
      [id, req.dbUser!.id, name.trim(), folder],
    );
    await client.query(
      "INSERT INTO document_workspace_versions(workspace_id,version,ciphertext,author_id) VALUES($1,1,$2,$3)",
      [id, sealWorkspace(snapshot, id + ":1"), req.dbUser!.id],
    );
    await client.query(
      "INSERT INTO document_workspace_events(workspace_id,actor_id,event) VALUES($1,$2,'created')",
      [id, req.dbUser!.id],
    );
    await client.query("COMMIT");
    res.status(201).json({ id, version: 1 });
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
});
router.post("/document-workspaces/search", async (req, res) => {
  const term = req.body?.term;
  if (typeof term !== "string" || term.trim().length < 2 || term.length > 200) {
    res.status(400).json({ message: "Search using 2–200 characters." });
    return;
  }
  const rows = await pool.query(
    `SELECT w.id,w.name,w.folder,w.current_version,w.review_state,w.expires_at,v.ciphertext,CASE WHEN w.owner_id=$1 THEN 'owner' ELSE m.role END AS role FROM document_workspaces w JOIN document_workspace_versions v ON v.workspace_id=w.id AND v.version=w.current_version LEFT JOIN document_workspace_members m ON m.workspace_id=w.id AND m.user_id=$1 WHERE (w.owner_id=$1 OR m.user_id=$1) AND w.expires_at>now() ORDER BY w.updated_at DESC LIMIT 100`,
    [req.dbUser!.id],
  );
  const matches = [];
  for (const row of rows.rows) {
    const { ciphertext, ...workspace } = row;
    const snapshot = openWorkspace(
      ciphertext,
      row.id + ":" + row.current_version,
    );
    for (const d of snapshot.documents)
      for (const p of d.pages) {
        const position = p.text
          .toLowerCase()
          .indexOf(term.trim().toLowerCase());
        if (position >= 0 && matches.length < 100)
          matches.push({
            workspace,
            document: d.name,
            page: p.label,
            sourceId: p.id,
            excerpt: p.text.slice(
              Math.max(0, position - 60),
              position + term.length + 100,
            ),
          });
      }
  }
  res.json({
    matches,
    scope:
      "Latest saved versions of up to 100 accessible workspaces; maximum 100 matching pages.",
  });
});
router.use("/document-workspaces/:id", async (req, res, next) => {
  if (!uuid(req.params.id)) {
    res.status(400).json({ message: "Invalid workspace ID." });
    return;
  }
  const r = await pool.query(
    `SELECT w.*,CASE WHEN w.owner_id=$2 THEN 'owner' ELSE m.role END AS access_role FROM document_workspaces w LEFT JOIN document_workspace_members m ON m.workspace_id=w.id AND m.user_id=$2 WHERE w.id=$1 AND (w.owner_id=$2 OR m.user_id=$2) AND w.expires_at>now()`,
    [req.params.id, req.dbUser!.id],
  );
  if (!r.rows.length) {
    res.status(404).json({ message: "Workspace unavailable or expired." });
    return;
  }
  res.locals.workspace = r.rows[0];
  next();
});
router.get("/document-workspaces/:id/versions", async (req, res) => {
  const r = await pool.query(
    "SELECT version,created_at FROM document_workspace_versions WHERE workspace_id=$1 ORDER BY version DESC",
    [req.params.id],
  );
  res.json(r.rows);
});
router.get("/document-workspaces/:id", async (req, res) => {
  const w = res.locals.workspace;
  const version = Number(req.query.version || w.current_version);
  if (!Number.isInteger(version) || version < 1) {
    res.status(400).json({ message: "Invalid version." });
    return;
  }
  const r = await pool.query(
    "SELECT ciphertext FROM document_workspace_versions WHERE workspace_id=$1 AND version=$2",
    [w.id, version],
  );
  if (!r.rows.length) {
    res.status(404).json({ message: "Version unavailable." });
    return;
  }
  await pool.query(
    "INSERT INTO document_workspace_events(workspace_id,actor_id,event) SELECT $1,$2,'read_version' WHERE NOT EXISTS(SELECT 1 FROM document_workspace_events WHERE workspace_id=$1 AND actor_id=$2 AND event='read_version' AND created_at>now()-interval '1 minute')",
    [w.id, req.dbUser!.id],
  );
  res.json({
    id: w.id,
    name: w.name,
    folder: w.folder,
    version,
    role: w.access_role,
    snapshot: openWorkspace(r.rows[0].ciphertext, w.id + ":" + version),
  });
});
router.put("/document-workspaces/:id", async (req, res) => {
  const w = res.locals.workspace;
  if (!["owner", "editor"].includes(w.access_role)) {
    res.status(403).json({ message: "Editor access required." });
    return;
  }
  let snapshot;
  try {
    snapshot = workspaceSnapshot(req.body?.snapshot);
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query(
      "SELECT current_version FROM document_workspaces WHERE id=$1 FOR UPDATE",
      [w.id],
    );
    if (current.rows[0]?.current_version !== req.body.expectedVersion) {
      await client.query("ROLLBACK");
      res.status(409).json({
        message: "Another edit was saved. Reload before saving your changes.",
      });
      return;
    }
    const permitted = await client.query(
      "SELECT 1 FROM document_workspaces w WHERE w.id=$1 AND w.expires_at>now() AND (w.owner_id=$2 OR EXISTS(SELECT 1 FROM document_workspace_members m WHERE m.workspace_id=w.id AND m.user_id=$2 AND m.role='editor'))",
      [w.id, req.dbUser!.id],
    );
    if (!permitted.rowCount) {
      await client.query("ROLLBACK");
      res
        .status(403)
        .json({ message: "Editing access changed. Reload this workspace." });
      return;
    }
    const version = current.rows[0].current_version + 1;
    if (version > 30) {
      await client.query("ROLLBACK");
      res.status(409).json({
        message: "Maximum 30 versions. Save a new workspace to continue.",
      });
      return;
    }
    await client.query(
      "INSERT INTO document_workspace_versions(workspace_id,version,ciphertext,author_id) VALUES($1,$2,$3,$4)",
      [
        w.id,
        version,
        sealWorkspace(snapshot, w.id + ":" + version),
        req.dbUser!.id,
      ],
    );
    await client.query(
      "UPDATE document_workspaces SET current_version=$2,review_state='draft',updated_at=now() WHERE id=$1",
      [w.id, version],
    );
    await client.query(
      "INSERT INTO document_workspace_events(workspace_id,actor_id,event) VALUES($1,$2,'version_saved')",
      [w.id, req.dbUser!.id],
    );
    await client.query("COMMIT");
    res.json({ version });
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
});
router.get("/document-workspaces/:id/members",async(req,res)=>{
 if(res.locals.workspace.access_role!=="owner"){res.status(403).json({message:"Only the owner can inspect sharing."});return;}
 const r=await pool.query("SELECT u.firebase_uid AS uid,COALESCE(u.email,u.firebase_uid) AS label,m.role FROM document_workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=$1 ORDER BY m.user_id LIMIT 100",[req.params.id]);res.json(r.rows);
});
router.post("/document-workspaces/:id/members", async (req, res) => {
  const w = res.locals.workspace;
  if (w.access_role !== "owner") {
    res.status(403).json({ message: "Only the owner can change sharing." });
    return;
  }
  const { firebaseUid, role } = req.body || {};
  if (
    typeof firebaseUid !== "string" ||
    !firebaseUid.trim() || firebaseUid.length > 254 ||
    !["viewer", "editor", "reviewer", "remove"].includes(role)
  ) {
    res
      .status(400)
      .json({ message: "Enter a registered account email or ID and a valid role." });
    return;
  }
  const target = await pool.query(
    "SELECT id FROM users WHERE (firebase_uid=$1 OR lower(email)=lower($1)) AND (disabled=false OR $2='remove')",
    [firebaseUid.trim(),role],
  );
  if (target.rows.length !== 1 || target.rows[0].id === w.owner_id) {
    res.status(400).json({ message: "Cannot assign this account." });
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const owner = await client.query(
      "SELECT id FROM document_workspaces WHERE id=$1 AND owner_id=$2 AND expires_at>now() FOR UPDATE",
      [w.id, req.dbUser!.id],
    );
    if (!owner.rowCount) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "Workspace unavailable or expired." });
      return;
    }
    // The workspace lock serializes invitations so concurrent requests cannot
    // exceed the list limit and leave members invisible to the owner.
    if (role !== "remove") {
      const capacity = await client.query(
        "SELECT count(*)::int AS total, count(*) FILTER (WHERE user_id=$2)::int AS existing FROM document_workspace_members WHERE workspace_id=$1",
        [w.id, target.rows[0].id],
      );
      if (capacity.rows[0].total >= 100 && !capacity.rows[0].existing) {
        await client.query("ROLLBACK");
        res.status(409).json({ message: "This workspace has 100 members. Remove a member before adding another." });
        return;
      }
    }
    if (role === "remove")
      await client.query(
        "DELETE FROM document_workspace_members WHERE workspace_id=$1 AND user_id=$2",
        [w.id, target.rows[0].id],
      );
    else
      await client.query(
        "INSERT INTO document_workspace_members(workspace_id,user_id,role) VALUES($1,$2,$3) ON CONFLICT(workspace_id,user_id) DO UPDATE SET role=excluded.role",
        [w.id, target.rows[0].id, role],
      );
    await client.query(
      "INSERT INTO document_workspace_events(workspace_id,actor_id,event) VALUES($1,$2,'sharing_changed')",
      [w.id, req.dbUser!.id],
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  res.json({ updated: true });
});
router.post("/document-workspaces/:id/review", async (req, res) => {
  const w = res.locals.workspace;
  const state = req.body?.state;
  if (!["in_review", "approved", "changes_requested"].includes(state)) {
    res.status(400).json({ message: "Invalid review state." });
    return;
  }
  if (
    state === "in_review"
      ? !["owner", "editor"].includes(w.access_role)
      : !["owner", "reviewer"].includes(w.access_role)
  ) {
    res
      .status(403)
      .json({ message: "This role cannot perform that review action." });
    return;
  }
  const r = await pool.query(
    "UPDATE document_workspaces SET review_state=$2,updated_at=now() WHERE id=$1 AND current_version=$3 AND expires_at>now() AND (owner_id=$4 OR EXISTS(SELECT 1 FROM document_workspace_members m WHERE m.workspace_id=document_workspaces.id AND m.user_id=$4 AND m.role=$5)) RETURNING id",
    [
      w.id,
      state,
      req.body.expectedVersion,
      req.dbUser!.id,
      state === "in_review" ? "editor" : "reviewer",
    ],
  );
  if (!r.rowCount) {
    res
      .status(409)
      .json({ message: "The document changed. Reload before reviewing." });
    return;
  }
  await pool.query(
    "INSERT INTO document_workspace_events(workspace_id,actor_id,event) VALUES($1,$2,$3)",
    [w.id, req.dbUser!.id, "review_" + state],
  );
  res.json({ state });
});
router.get("/document-workspaces/:id/events", async (req, res) => {
  const r = await pool.query(
    "SELECT event,created_at FROM document_workspace_events WHERE workspace_id=$1 ORDER BY id DESC LIMIT 100",
    [req.params.id],
  );
  res.json(r.rows);
});
router.delete("/document-workspaces/:id", async (req, res) => {
  if (res.locals.workspace.access_role !== "owner") {
    res
      .status(403)
      .json({ message: "Only the owner can delete this workspace." });
    return;
  }
  await pool.query(
    "DELETE FROM document_workspaces WHERE id=$1 AND owner_id=$2",
    [req.params.id, req.dbUser!.id],
  );
  res.json({ deleted: true });
});
export default router;
