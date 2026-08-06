/**
 * asyncHandler — BE-H1 regression. An async route handler that rejects must
 * forward the error to Express's error middleware (next(err)) rather than
 * leaving the request hanging. Pins the wrapper's contract.
 */
import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../asyncHandler";

describe("asyncHandler", () => {
  it("forwards a rejected async handler to next()", async () => {
    const boom = new Error("boom");
    const handler = asyncHandler(async () => {
      throw boom;
    });
    const nextErr = await new Promise((resolve) => {
      handler({} as any, {} as any, (e?: any) => resolve(e));
    });
    expect(nextErr).toBe(boom);
  });

  it("does not call next() when the handler resolves", async () => {
    const next = vi.fn();
    const res: any = { json: vi.fn() };
    const handler = asyncHandler(async (_req, r: any) => {
      r.json({ ok: true });
    });
    handler({} as any, res, next);
    await new Promise((r) => setImmediate(r));
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("forwards a synchronous throw to next() too", async () => {
    const boom = new Error("sync-boom");
    const handler = asyncHandler(() => {
      throw boom;
    });
    const nextErr = await new Promise((resolve) => {
      handler({} as any, {} as any, (e?: any) => resolve(e));
    });
    expect(nextErr).toBe(boom);
  });
});
