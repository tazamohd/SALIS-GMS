import { describe, it, expect, vi, afterEach } from "vitest";
import { apiRequest, getQueryFn } from "./queryClient";

function mockResponse(opts: { ok?: boolean; status?: number; statusText?: string; text?: string; json?: unknown }) {
  return {
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    statusText: opts.statusText ?? "OK",
    text: async () => opts.text ?? "",
    json: async () => opts.json ?? {},
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("issues a credentialed GET with no body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({}));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("GET", "/api/thing");

    expect(fetchMock).toHaveBeenCalledWith("/api/thing", {
      method: "GET",
      headers: {},
      body: undefined,
      credentials: "include",
    });
  });

  it("sends JSON body and content-type for writes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({}));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("POST", "/api/thing", { a: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/thing",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 1 }),
        credentials: "include",
      }),
    );
  });

  it("throws '<status>: <text>' on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse({ ok: false, status: 404, text: "Not found" })));
    await expect(apiRequest("GET", "/api/missing")).rejects.toThrow("404: Not found");
  });
});

describe("getQueryFn", () => {
  const ctx = { queryKey: ["/api/data"] } as any;

  it("returns null on 401 when configured to returnNull", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse({ ok: false, status: 401 })));
    const fn = getQueryFn<unknown>({ on401: "returnNull" });
    await expect(fn(ctx)).resolves.toBeNull();
  });

  it("throws on 401 when configured to throw", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse({ ok: false, status: 401, text: "Unauthorized" })));
    const fn = getQueryFn<unknown>({ on401: "throw" });
    await expect(fn(ctx)).rejects.toThrow("401: Unauthorized");
  });

  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse({ json: { hello: "world" } })));
    const fn = getQueryFn<{ hello: string }>({ on401: "throw" });
    await expect(fn(ctx)).resolves.toEqual({ hello: "world" });
  });
});
