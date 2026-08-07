import { QueryClient, QueryCache, QueryFunction } from "@tanstack/react-query";
import { isUnauthorizedError } from "./authUtils";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// ── CSRF ────────────────────────────────────────────────────────────────────
// Mutating requests must carry the per-session token (enforced server-side in
// production). Fetch once, cache, and refresh+retry once on a CSRF 403 (the
// token rotates when a new session starts, e.g. after login/logout).
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
let csrfToken: string | null = null;

const nativeFetch: typeof fetch =
  typeof window !== "undefined" ? window.fetch.bind(window) : fetch;

async function getCsrfToken(force = false): Promise<string | null> {
  if (csrfToken && !force) return csrfToken;
  try {
    const res = await nativeFetch("/api/csrf-token", { credentials: "include" });
    if (!res.ok) return null;
    csrfToken = (await res.json()).csrfToken ?? null;
    return csrfToken;
  } catch {
    return null;
  }
}

// Global interceptor: many pages call fetch() directly rather than apiRequest,
// so inject X-CSRF-Token for every same-origin /api mutation in one place.
if (typeof window !== "undefined") {
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method ?? "GET").toUpperCase();
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
    if (MUTATING.has(method) && url.startsWith("/api")) {
      const token = await getCsrfToken();
      if (token) {
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has("X-CSRF-Token")) headers.set("X-CSRF-Token", token);
        init = { ...init, headers };
      }
    }
    return nativeFetch(input as any, init);
  }) as typeof fetch;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const needsToken = MUTATING.has(method.toUpperCase());

  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {};
    if (data) headers["Content-Type"] = "application/json";
    if (token && needsToken) headers["X-CSRF-Token"] = token;
    return fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  };

  let res = await doFetch(needsToken ? await getCsrfToken() : null);

  // Session rotated (login/logout) → stale token. Refresh once and retry.
  if (res.status === 403 && needsToken) {
    const body = await res.clone().text();
    if (body.includes("CSRF")) {
      res = await doFetch(await getCsrfToken(true));
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  // Global session-expiry recovery: when any query 401s mid-session the cookie
  // is no longer valid. Clear the cached user so `isAuthenticated` flips false
  // and the router renders /login — an in-app transition (no full reload), and
  // loop-safe: setting null when already null is a no-op, and the /api/user
  // 401 that fires on a genuinely-logged-out load simply keeps it null.
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof Error && isUnauthorizedError(error)) {
        queryClient.setQueryData(["/api/user"], null);
      }
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // SA-019: Replace Infinity with sensible per-resource defaults.
      // 30 seconds for active data (jobs, customers, vehicles, invoices).
      // Components can override per-query via staleTime option.
      staleTime: 30 * 1000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
