const base = import.meta.env.BASE_URL ?? "/";

export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${window.location.origin}/api/${clean}`.replace(/([^:]\/)\/+/g, "$1");
}

export interface ApiUser {
  id: number;
  firebaseUid: string;
  phoneNumber: string | null;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  role: string;
  plan: string;
}

export async function authedFetch<T>(
  idToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${idToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function syncUser(idToken: string): Promise<ApiUser> {
  const res = await fetch(apiUrl("auth/sync"), {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`sync failed: ${res.status}`);
  return res.json();
}

export { base };
