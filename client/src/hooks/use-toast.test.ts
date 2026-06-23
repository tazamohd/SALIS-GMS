import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { reducer } from "./use-toast";

// The reducer's DISMISS_TOAST schedules a delayed REMOVE via setTimeout;
// fake timers keep that from leaving a dangling handle during the test.
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const toast = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  open: true,
  title: `t-${id}`,
  ...extra,
});

describe("use-toast reducer", () => {
  it("ADD_TOAST prepends a toast", () => {
    const state = reducer({ toasts: [] }, { type: "ADD_TOAST", toast: toast("a") } as any);
    expect(state.toasts[0].id).toBe("a");
  });

  it("UPDATE_TOAST patches the matching toast", () => {
    const start = { toasts: [toast("a")] } as any;
    const next = reducer(start, { type: "UPDATE_TOAST", toast: { id: "a", title: "patched" } } as any);
    expect(next.toasts[0].title).toBe("patched");
  });

  it("DISMISS_TOAST marks the targeted toast closed", () => {
    const start = { toasts: [toast("a"), toast("b")] } as any;
    const next = reducer(start, { type: "DISMISS_TOAST", toastId: "a" } as any);
    expect(next.toasts.find((t: any) => t.id === "a").open).toBe(false);
    expect(next.toasts.find((t: any) => t.id === "b").open).toBe(true);
  });

  it("REMOVE_TOAST with no id clears all toasts", () => {
    const start = { toasts: [toast("a"), toast("b")] } as any;
    const next = reducer(start, { type: "REMOVE_TOAST", toastId: undefined } as any);
    expect(next.toasts).toEqual([]);
  });
});
