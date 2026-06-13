// Global CSRF token wiring.
//
// The server enforces a CSRF token (header `x-csrf-token`) on authenticated,
// state-changing requests. Rather than thread the token through every call
// site, we install a single `fetch` interceptor that fetches the per-session
// token once and attaches it to all same-origin mutating requests. This covers
// both the central `apiRequest` helper and any direct `fetch` calls.

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let cachedToken: string | null = null;
let inFlight: Promise<string | null> | null = null;

async function fetchToken(originalFetch: typeof window.fetch): Promise<string | null> {
  try {
    const res = await originalFetch("/api/csrf-token", { credentials: "include" });
    if (!res.ok) return null;
    const body = await res.json();
    cachedToken = body?.csrfToken ?? null;
    return cachedToken;
  } catch {
    return null;
  }
}

function isSameOrigin(url: string): boolean {
  // Relative URLs are same-origin; absolute URLs must match window.location.
  if (url.startsWith("/")) return true;
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function installCsrfFetch(): void {
  if (typeof window === "undefined" || (window as any).__csrfFetchInstalled) return;
  const originalFetch = window.fetch.bind(window);
  (window as any).__csrfFetchInstalled = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (!MUTATING.has(method) || !isSameOrigin(url)) {
      return originalFetch(input as any, init);
    }

    if (!cachedToken) {
      inFlight = inFlight ?? fetchToken(originalFetch);
      await inFlight;
      inFlight = null;
    }

    if (cachedToken) {
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      headers.set("x-csrf-token", cachedToken);
      // When input is a Request, header overrides go through init.
      init = { ...init, headers };
    }

    let res = await originalFetch(input as any, init);

    // Token rotated or missing (e.g., session changed): refresh once and retry.
    if (res.status === 403 && cachedToken !== null) {
      cachedToken = null;
      const fresh = await fetchToken(originalFetch);
      if (fresh) {
        const headers = new Headers(init?.headers as HeadersInit | undefined);
        headers.set("x-csrf-token", fresh);
        res = await originalFetch(input as any, { ...init, headers });
      }
    }

    return res;
  };
}
