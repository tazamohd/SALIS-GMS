import { describe, it, expect } from "vitest";
import {
  ANONYMOUS_SCOPE,
  getCurrentGarageId,
  getTenantScope,
  hasTenantScope,
  requireTenantScope,
  runWithTenantScope,
  type TenantScope,
} from "../tenant-context";

const GARAGE_A: TenantScope = {
  userId: "user-a",
  garageId: "garage-a",
  branchIds: ["branch-a1", "branch-a2"],
  isPlatformPrincipal: false,
};

const GARAGE_B: TenantScope = {
  userId: "user-b",
  garageId: "garage-b",
  branchIds: ["branch-b1"],
  isPlatformPrincipal: false,
};

describe("tenant-context", () => {
  it("returns undefined / throws when no scope is established", () => {
    expect(getTenantScope()).toBeUndefined();
    expect(hasTenantScope()).toBe(false);
    expect(getCurrentGarageId()).toBeNull();
    expect(() => requireTenantScope()).toThrow(/Tenant scope is not established/);
  });

  it("exposes the active scope inside runWithTenantScope", () => {
    runWithTenantScope(GARAGE_A, () => {
      expect(hasTenantScope()).toBe(true);
      expect(getTenantScope()).toEqual(GARAGE_A);
      expect(requireTenantScope().garageId).toBe("garage-a");
      expect(getCurrentGarageId()).toBe("garage-a");
    });
    // Scope does not leak out of the run.
    expect(getTenantScope()).toBeUndefined();
  });

  it("preserves scope across await boundaries (AsyncLocalStorage)", async () => {
    await runWithTenantScope(GARAGE_A, async () => {
      expect(getCurrentGarageId()).toBe("garage-a");
      await new Promise((resolve) => setTimeout(resolve, 5));
      // Context must survive the async hop.
      expect(getCurrentGarageId()).toBe("garage-a");
      await Promise.resolve();
      expect(requireTenantScope().userId).toBe("user-a");
    });
  });

  it("isolates nested scopes and restores the outer one", () => {
    runWithTenantScope(GARAGE_A, () => {
      expect(getCurrentGarageId()).toBe("garage-a");
      runWithTenantScope(GARAGE_B, () => {
        expect(getCurrentGarageId()).toBe("garage-b");
      });
      // Outer scope restored after the nested run.
      expect(getCurrentGarageId()).toBe("garage-a");
    });
  });

  it("keeps concurrent scopes independent", async () => {
    const seen: Array<string | null> = [];
    await Promise.all([
      runWithTenantScope(GARAGE_A, async () => {
        await new Promise((r) => setTimeout(r, 10));
        seen.push(getCurrentGarageId());
      }),
      runWithTenantScope(GARAGE_B, async () => {
        await new Promise((r) => setTimeout(r, 2));
        seen.push(getCurrentGarageId());
      }),
    ]);
    expect(seen.sort()).toEqual(["garage-a", "garage-b"]);
  });

  it("anonymous scope carries no garage and denies-by-default downstream", () => {
    runWithTenantScope(ANONYMOUS_SCOPE, () => {
      expect(getCurrentGarageId()).toBeNull();
      expect(requireTenantScope().isPlatformPrincipal).toBe(false);
      expect(requireTenantScope().branchIds).toEqual([]);
    });
  });
});
