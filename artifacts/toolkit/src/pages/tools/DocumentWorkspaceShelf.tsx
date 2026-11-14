import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
type Row = {
  id: string;
  name: string;
  folder: string;
  current_version: number;
  role: string;
  review_state: string;
  expires_at: string;
};
export function DocumentWorkspaceShelf({
  snapshot,
  restore,
  compare,
  disabled,
}: {
  snapshot: () => unknown;
  restore: (data: any) => void;
  compare: (data: any, version: number) => void;
  disabled: boolean;
}) {
  const { firebaseUser } = useAuth();
  const [rows, setRows] = useState<Row[]>([]),
    [active, setActive] = useState<Row | null>(null),
    [versions, setVersions] = useState<
      { version: number; created_at: string }[]
    >([]),
    [name, setName] = useState(""),
    [folder, setFolder] = useState(""),
    [search, setSearch] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [member, setMember] = useState(""),
    [role, setRole] = useState("viewer"),
    [events, setEvents] = useState<{ event: string; created_at: string }[]>([]);
  const [members,setMembers]=useState<{uid:string;label:string;role:string}[]>([]);
  useEffect(()=>{setMembers([]);setMember("");},[active?.id]);
  const account = useRef(firebaseUser?.uid);
  account.current = firebaseUser?.uid;
  const [matches, setMatches] = useState<
    { workspace: Row; document: string; page: string; excerpt: string }[]
  >([]);
  useEffect(() => {
    setRows([]);setMembers([]);setName("");setFolder("");setSearch("");setMember("");setRole("viewer");
    setActive(null);
    setVersions([]);
    setEvents([]);
    setMatches([]);
    setMessage("");
    setConsent(false);
  }, [firebaseUser?.uid]);
  async function request(path = "", method = "GET", body?: unknown) {
    if (!firebaseUser) throw Error("Sign in to save a workspace.");
    const uid = firebaseUser.uid;
    const r = await fetch(apiUrl("/document-workspaces" + path), {
      method,
      headers: {
        Authorization: "Bearer " + (await firebaseUser.getIdToken()),
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await r.json();
    if (account.current !== uid)
      throw Error("Account changed; reload saved workspaces.");
    if (!r.ok) throw Error(data.message || "Workspace request failed.");
    return data;
  }
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await work();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    const data = await request();
    setRows(data.workspaces);
    if (!data.configured)
      setMessage(
        "Encrypted storage must be configured by the administrator before saving.",
      );
  }
  const blocked = busy || disabled;
  if (!firebaseUser)
    return (
      <p className="text-sm">
        Sign in to save encrypted workspaces and collaborate. Anonymous
        documents stay in this tab.
      </p>
    );
  return (
    <section
      aria-label="Saved workspaces"
      className="space-y-3 rounded-xl border p-4"
    >
      <details>
        <summary className="cursor-pointer font-semibold">
          Saved workspaces, versions & team review
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-sm">
            Save selected reviewed text, questions and analysis settings for 30
            days. Original files and PDF passwords are excluded. Names and
            folder labels appear in the workspace list; keep them non-sensitive.
            Saved text is encrypted on the server. Delete a workspace to remove
            every version and sharing grant.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label>
              Workspace name
              <input
                className="block w-full rounded border bg-background p-2"
                value={name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Folder / group
              <input
                className="block w-full rounded border bg-background p-2"
                value={folder}
                maxLength={120}
                onChange={(e) => setFolder(e.target.value)}
              />
            </label>
          </div>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I agree to save the selected text and conversation for up to 30
            days.
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={blocked || !consent || !name.trim()}
              onClick={() =>
                void run(async () => {
                  const result = await request("", "POST", {
                    name,
                    folder,
                    consent,
                    snapshot: snapshot(),
                  });
                  await refresh();
                  setMessage(
                    "Workspace saved. Use Open to select it for version updates.",
                  );
                  setActive(null);
                })
              }
            >
              Save new workspace
            </Button>
            <Button
              variant="outline"
              disabled={blocked}
              onClick={() => void run(refresh)}
            >
              Refresh saved workspaces
            </Button>
          </div>
          <label className="block">
            Search names and groups
            <input
              className="block w-full rounded border bg-background p-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Button
            variant="outline"
            disabled={blocked || search.trim().length < 2}
            onClick={() =>
              void run(async () => {
                const data = await request("/search", "POST", { term: search });
                setMatches(data.matches);
                setMessage(data.scope);
              })
            }
          >
            Search saved document contents
          </Button>
          {matches.map((hit, i) => (
            <div key={i} className="rounded border p-3 text-sm">
              <p className="font-semibold">
                {hit.workspace.name} · {hit.document} · {hit.page}
              </p>
              <p className="whitespace-pre-wrap break-words">{hit.excerpt}</p>
              <Button
                variant="outline"
                disabled={blocked}
                onClick={() =>
                  void run(async () => {
                    const data = await request("/" + hit.workspace.id);
                    restore(data.snapshot);
                    setActive(hit.workspace);
                    setVersions(
                      await request("/" + hit.workspace.id + "/versions"),
                    );
                    setEvents(
                      await request("/" + hit.workspace.id + "/events"),
                    );
                  })
                }
              >
                Open matching workspace
              </Button>
            </div>
          ))}
          <div className="max-h-72 space-y-2 overflow-auto">
            {rows
              .filter((r) =>
                (r.name + " " + r.folder)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((row) => (
                <div key={row.id} className="rounded border p-3 text-sm">
                  <p className="font-semibold">
                    {row.name} · {row.folder || "Ungrouped"}
                  </p>
                  <p>
                    Version {row.current_version} · {row.role} ·{" "}
                    {row.review_state.replaceAll("_", " ")} · expires{" "}
                    {new Date(row.expires_at).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    disabled={blocked}
                    onClick={() =>
                      void run(async () => {
                        const data = await request("/" + row.id);
                        restore(data.snapshot);
                        setActive(row);
                        setName(row.name);
                        setFolder(row.folder);
                        setVersions(await request("/" + row.id + "/versions"));
                        setEvents(await request("/" + row.id + "/events"));
                        setMessage(
                          "Saved reviewed text loaded. Re-upload original files if you need visual previews.",
                        );
                      })
                    }
                  >
                    Open {row.name}
                  </Button>
                </div>
              ))}
          </div>
          {active && (
            <div className="space-y-3 rounded border p-3">
              <h3 className="font-semibold">Selected: {active.name}</h3>
              <div className="flex flex-wrap gap-2">
                {["owner", "editor"].includes(active.role) && (
                  <Button
                    disabled={blocked || !consent}
                    onClick={() =>
                      void run(async () => {
                        const data = await request("/" + active.id, "PUT", {
                          expectedVersion: active.current_version,
                          snapshot: snapshot(),
                        });
                        setActive({
                          ...active,
                          current_version: data.version,
                          review_state: "draft",
                        });
                        setVersions(
                          await request("/" + active.id + "/versions"),
                        );
                        await refresh();
                        setMessage(
                          "New version saved; review status reset to draft.",
                        );
                      })
                    }
                  >
                    Save next version
                  </Button>
                )}
                {versions.map((v) => (
                  <Button
                    key={v.version}
                    variant="outline"
                    disabled={blocked}
                    onClick={() =>
                      void run(async () => {
                        const data = await request(
                          "/" + active.id + "?version=" + v.version,
                        );
                        restore(data.snapshot);
                        setMessage(
                          "Viewing version " +
                            v.version +
                            ". Saving creates a new version; history is preserved.",
                        );
                      })
                    }
                  >
                    Load v{v.version}
                  </Button>
                ))}
                {versions.map((v) => (
                  <Button
                    key={"compare" + v.version}
                    variant="outline"
                    disabled={blocked}
                    onClick={() =>
                      void run(async () => {
                        const data = await request(
                          "/" + active.id + "?version=" + v.version,
                        );
                        compare(data.snapshot, v.version);
                        setMessage(
                          "Saved version added. Order the documents from earliest to latest before comparing.",
                        );
                      })
                    }
                  >
                    Add v{v.version} for comparison
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(["in_review", "approved", "changes_requested"] as const)
                  .filter((state) =>
                    state === "in_review"
                      ? ["owner", "editor"].includes(active.role)
                      : ["owner", "reviewer"].includes(active.role),
                  )
                  .map((state) => (
                    <Button
                      key={state}
                      variant="outline"
                      disabled={blocked}
                      onClick={() =>
                        void run(async () => {
                          await request("/" + active.id + "/review", "POST", {
                            state,
                            expectedVersion: active.current_version,
                          });
                          await refresh();
                          setEvents(await request("/" + active.id + "/events"));
                          setMessage(
                            "Review state: " + state.replaceAll("_", " "),
                          );
                        })
                      }
                    >
                      {state === "in_review"
                        ? "Submit for review"
                        : state === "approved"
                          ? "Approve version"
                          : "Request changes"}
                    </Button>
                  ))}
              </div>
              {active.role === "owner" && (
                <>
                  <Button variant="outline" disabled={blocked} onClick={()=>void run(async()=>setMembers(await request("/"+active.id+"/members")))}>Show current sharing</Button>
                  {members.map(m=><div key={m.uid} className="flex flex-wrap items-center justify-between gap-2 rounded border p-2 text-sm"><span>{m.label} · {m.role}</span><Button variant="ghost" disabled={blocked} onClick={()=>void run(async()=>{await request("/"+active.id+"/members","POST",{firebaseUid:m.uid,role:"remove"});setMembers(await request("/"+active.id+"/members"));setMessage("Access removed.");})}>Remove access for {m.label}</Button></div>)}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label>
                      Team member email or account ID
                      <input
                        className="block w-full rounded border bg-background p-2"
                        value={member}
                        maxLength={128}
                        onChange={(e) => setMember(e.target.value)}
                      />
                    </label>
                    <label>
                      Access role
                      <select
                        className="block w-full rounded border bg-background p-2"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        {["viewer", "editor", "reviewer", "remove"].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    disabled={blocked || !member}
                    onClick={() =>
                      void run(async () => {
                        await request("/" + active.id + "/members", "POST", {
                          firebaseUid: member,
                          role,
                        });
                        setMember("");
                        setMembers(await request("/"+active.id+"/members"));
                        setMessage("Sharing updated.");
                      })
                    }
                  >
                    Apply team access
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={blocked}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Permanently delete all saved versions and team access for this workspace?",
                        )
                      )
                        void run(async () => {
                          await request("/" + active.id, "DELETE");
                          setActive(null);
                          setVersions([]);
                          setEvents([]);
                          await refresh();
                          setMessage(
                            "Saved workspace deleted. The currently open local text is unchanged; use Clear to remove it.",
                          );
                        });
                    }}
                  >
                    Delete saved workspace
                  </Button>
                </>
              )}
              <details>
                <summary className="cursor-pointer">Activity log</summary>
                {events.map((e, i) => (
                  <p key={i} className="text-xs">
                    {new Date(e.created_at).toLocaleString()} ·{" "}
                    {e.event.replaceAll("_", " ")}
                  </p>
                ))}
              </details>
            </div>
          )}
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
        </div>
      </details>
    </section>
  );
}
