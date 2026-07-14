import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { authedFetch } from "@/lib/api";
import { TOOLS } from "@/lib/tools-registry";
import { ShieldCheck, Trash2, Plus, KeyRound, Copy } from "lucide-react";

interface AdminUser {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  displayName: string | null;
  role: string;
  plan: string;
  disabled: boolean;
  createdAt: string;
  lastLoginAt: string;
}
interface ToolSetting {
  toolSlug: string;
  enabled: boolean;
  premium: boolean;
}
interface Pkg {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  periodDays: number;
  active: boolean;
}
interface Stats {
  totalUsers: number;
  totalEvents: number;
  eventsLast7Days: number;
  topTools: { toolSlug: string; count: number }[];
}
interface ApiKeyInfo {
  id: number;
  name: string;
  keyPrefix: string;
  active: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

function useToken() {
  const { firebaseUser } = useAuth();
  return useCallback(async () => {
    if (!firebaseUser) throw new Error("Not signed in");
    return firebaseUser.getIdToken();
  }, [firebaseUser]);
}

export function Admin() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-muted-foreground font-mono text-sm">Loading…</p>;
  if (!user || user.role !== "admin") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin access required</CardTitle>
          <CardDescription>You must be signed in as an administrator to view this page.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin</h1>
      </div>
      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="tools" data-testid="tab-tools">Tools</TabsTrigger>
          <TabsTrigger value="packages" data-testid="tab-packages">Packages</TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">Usage</TabsTrigger>
          <TabsTrigger value="apikeys" data-testid="tab-apikeys">API Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="tools"><ToolsTab /></TabsContent>
        <TabsContent value="packages"><PackagesTab /></TabsContent>
        <TabsContent value="stats"><StatsTab /></TabsContent>
        <TabsContent value="apikeys"><ApiKeysTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const getToken = useToken();
  const { toast } = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);

  const load = useCallback(async () => {
    setUsers(await authedFetch<AdminUser[]>(await getToken(), "admin/users"));
  }, [getToken]);

  useEffect(() => {
    load().catch((e) => toast({ title: "Failed to load users", description: String(e.message ?? e), variant: "destructive" }));
  }, [load, toast]);

  const update = async (id: number, patch: Partial<Pick<AdminUser, "role" | "plan" | "disabled">>) => {
    try {
      const updated = await authedFetch<AdminUser>(await getToken(), `admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Users ({users.length})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                <TableCell className="font-mono text-xs">
                  {u.displayName || u.email || u.phoneNumber || `#${u.id}`}
                  {me?.id === u.id && <Badge variant="secondary" className="ml-2">you</Badge>}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={me?.id === u.id}
                    onClick={() => update(u.id, { role: u.role === "admin" ? "user" : "admin" })}
                    data-testid={`button-role-${u.id}`}
                  >
                    {u.role}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => update(u.id, { plan: u.plan === "free" ? "premium" : "free" })}
                    data-testid={`button-plan-${u.id}`}
                  >
                    {u.plan}
                  </Button>
                </TableCell>
                <TableCell className="font-mono text-xs">{new Date(u.lastLoginAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Switch
                    checked={!u.disabled}
                    disabled={me?.id === u.id}
                    onCheckedChange={(v) => update(u.id, { disabled: !v })}
                    data-testid={`switch-enabled-${u.id}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && <p className="text-sm text-muted-foreground py-4">No users yet.</p>}
      </CardContent>
    </Card>
  );
}

function ToolsTab() {
  const getToken = useToken();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, ToolSetting>>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      const rows = await authedFetch<ToolSetting[]>(await getToken(), "admin/tools");
      setSettings(Object.fromEntries(rows.map((r) => [r.toolSlug, r])));
    })().catch((e) => toast({ title: "Failed to load tool settings", description: String(e.message ?? e), variant: "destructive" }));
  }, [getToken, toast]);

  const setTool = async (slug: string, patch: Partial<Pick<ToolSetting, "enabled" | "premium">>) => {
    const current = settings[slug] ?? { toolSlug: slug, enabled: true, premium: false };
    const next = { ...current, ...patch };
    setSettings((prev) => ({ ...prev, [slug]: next }));
    try {
      await authedFetch(await getToken(), `admin/tools/${slug}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: next.enabled, premium: next.premium }),
      });
    } catch (e) {
      setSettings((prev) => ({ ...prev, [slug]: current }));
      toast({ title: "Update failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const visible = useMemo(
    () =>
      TOOLS.filter(
        (t) =>
          !filter.trim() ||
          t.name.toLowerCase().includes(filter.toLowerCase()) ||
          t.slug.includes(filter.toLowerCase()),
      ),
    [filter],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tools ({TOOLS.length})</CardTitle>
        <CardDescription>Disable tools site-wide or mark them premium-only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Filter tools…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
          data-testid="input-tool-filter"
        />
        <div className="max-h-[32rem] overflow-y-auto border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Premium</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((t) => {
                const s = settings[t.slug] ?? { toolSlug: t.slug, enabled: true, premium: false };
                return (
                  <TableRow key={t.slug}>
                    <TableCell className="font-mono text-xs">{t.name}</TableCell>
                    <TableCell>
                      <Switch checked={s.enabled} onCheckedChange={(v) => setTool(t.slug, { enabled: v })} data-testid={`switch-tool-enabled-${t.slug}`} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={s.premium} onCheckedChange={(v) => setTool(t.slug, { premium: v })} data-testid={`switch-tool-premium-${t.slug}`} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

const emptyPkg = { name: "", description: "", priceCents: 0, currency: "USD", periodDays: 30, active: true };

function PackagesTab() {
  const getToken = useToken();
  const { toast } = useToast();
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [draft, setDraft] = useState({ ...emptyPkg });

  const load = useCallback(async () => {
    setPkgs(await authedFetch<Pkg[]>(await getToken(), "admin/packages"));
  }, [getToken]);

  useEffect(() => {
    load().catch((e) => toast({ title: "Failed to load packages", description: String(e.message ?? e), variant: "destructive" }));
  }, [load, toast]);

  const create = async () => {
    try {
      await authedFetch(await getToken(), "admin/packages", {
        method: "POST",
        body: JSON.stringify({ ...draft, description: draft.description || null }),
      });
      setDraft({ ...emptyPkg });
      await load();
    } catch (e) {
      toast({ title: "Create failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const update = async (p: Pkg, patch: Partial<Pkg>) => {
    try {
      const body = { name: p.name, description: p.description, priceCents: p.priceCents, currency: p.currency, periodDays: p.periodDays, active: p.active, ...patch };
      const updated = await authedFetch<Pkg>(await getToken(), `admin/packages/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setPkgs((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    try {
      await authedFetch(await getToken(), `admin/packages/${id}`, { method: "DELETE" });
      setPkgs((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      toast({ title: "Delete failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>New package</CardTitle>
          <CardDescription>Set the fee and billing period for a premium package.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} data-testid="input-pkg-name" />
          </div>
          <div className="space-y-1">
            <Label>Price (cents)</Label>
            <Input type="number" min={0} value={draft.priceCents} onChange={(e) => setDraft({ ...draft, priceCents: Math.max(0, Number(e.target.value) || 0) })} data-testid="input-pkg-price" />
          </div>
          <div className="space-y-1">
            <Label>Currency</Label>
            <Input value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value.toUpperCase() })} data-testid="input-pkg-currency" />
          </div>
          <div className="space-y-1">
            <Label>Period (days)</Label>
            <Input type="number" min={1} value={draft.periodDays} onChange={(e) => setDraft({ ...draft, periodDays: Math.max(1, Number(e.target.value) || 30) })} data-testid="input-pkg-period" />
          </div>
          <div className="flex items-end">
            <Button onClick={create} disabled={!draft.name.trim()} data-testid="button-create-pkg">
              <Plus className="h-4 w-4 mr-1" /> Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Packages ({pkgs.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pkgs.map((p) => (
                <TableRow key={p.id} data-testid={`row-pkg-${p.id}`}>
                  <TableCell className="font-mono text-xs">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs">{(p.priceCents / 100).toFixed(2)} {p.currency}</TableCell>
                  <TableCell className="font-mono text-xs">{p.periodDays} days</TableCell>
                  <TableCell>
                    <Switch checked={p.active} onCheckedChange={(v) => update(p, { active: v })} data-testid={`switch-pkg-active-${p.id}`} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)} data-testid={`button-delete-pkg-${p.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pkgs.length === 0 && <p className="text-sm text-muted-foreground py-4">No packages yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsTab() {
  const getToken = useToken();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => setStats(await authedFetch<Stats>(await getToken(), "admin/stats")))().catch((e) =>
      toast({ title: "Failed to load stats", description: String(e.message ?? e), variant: "destructive" }),
    );
  }, [getToken, toast]);

  if (!stats) return <p className="text-sm text-muted-foreground font-mono">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total users", value: stats.totalUsers, id: "stat-users" },
          { label: "Total tool uses", value: stats.totalEvents, id: "stat-events" },
          { label: "Uses (last 7 days)", value: stats.eventsLast7Days, id: "stat-recent" },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardDescription>{s.label}</CardDescription></CardHeader>
            <CardContent><p className="text-3xl font-bold font-mono" data-testid={s.id}>{s.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Top tools</CardTitle></CardHeader>
        <CardContent>
          {stats.topTools.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Tool</TableHead><TableHead>Uses</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {stats.topTools.map((t) => (
                  <TableRow key={t.toolSlug}>
                    <TableCell className="font-mono text-xs">{t.toolSlug}</TableCell>
                    <TableCell className="font-mono text-xs">{t.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApiKeysTab() {
  const getToken = useToken();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setKeys(await authedFetch<ApiKeyInfo[]>(await getToken(), "admin/api-keys"));
  }, [getToken]);

  useEffect(() => {
    load().catch((e) => toast({ title: "Failed to load API keys", description: String(e.message ?? e), variant: "destructive" }));
  }, [load, toast]);

  const create = async () => {
    try {
      const created = await authedFetch<{ key: string }>(await getToken(), "admin/api-keys", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setNewKey(created.key);
      setName("");
      await load();
    } catch (e) {
      toast({ title: "Create failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const toggle = async (k: ApiKeyInfo) => {
    try {
      const updated = await authedFetch<ApiKeyInfo>(await getToken(), `admin/api-keys/${k.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !k.active }),
      });
      setKeys((prev) => prev.map((x) => (x.id === k.id ? updated : x)));
    } catch (e) {
      toast({ title: "Update failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  const remove = async (id: number) => {
    try {
      await authedFetch(await getToken(), `admin/api-keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      toast({ title: "Delete failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> New API key</CardTitle>
          <CardDescription>The full key is shown only once after creation — copy it immediately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 max-w-md">
            <Input placeholder="Key name (e.g. OCR service)" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-key-name" />
            <Button onClick={create} disabled={!name.trim()} data-testid="button-create-key">
              <Plus className="h-4 w-4 mr-1" /> Create
            </Button>
          </div>
          {newKey && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <code className="font-mono text-xs break-all flex-1" data-testid="text-new-key">{newKey}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { navigator.clipboard.writeText(newKey); toast({ title: "Copied" }); }}
                data-testid="button-copy-key"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>API keys ({keys.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id} data-testid={`row-key-${k.id}`}>
                  <TableCell className="font-mono text-xs">{k.name}</TableCell>
                  <TableCell className="font-mono text-xs">{k.keyPrefix}…</TableCell>
                  <TableCell className="font-mono text-xs">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "never"}</TableCell>
                  <TableCell>
                    <Switch checked={k.active} onCheckedChange={() => toggle(k)} data-testid={`switch-key-active-${k.id}`} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove(k.id)} data-testid={`button-delete-key-${k.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {keys.length === 0 && <p className="text-sm text-muted-foreground py-4">No API keys yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
