import { describe, it, expect, vi } from "vitest";
import { resolveScopedGarageId, garageScope, stampGarageId, branchScope } from "../tenant-guard";
import { runWithTenantScope, type TenantScope } from "../tenant-context";
import { users, jobCards } from "@shared/schema";

const tenant = (over: Partial<TenantScope> = {}): TenantScope => ({
  userId: "u1",
  garageId: "garage-a",
  branchIds: [],
  isBranchRestricted: false,
  isPlatformPrincipal: false,
  ...over,
});

describe("resolveScopedGarageId — deny-by-default precedence", () => {
  it("uses the Tenant Scope garageId over any passed value (no client-controlled tenancy)", () => {
    runWithTenantScope(tenant({ garageId: "garage-a" }), () => {
      expect(resolveScopedGarageId(undefined)).toBe("garage-a");
      // A caller-supplied id from another tenant must NOT win.
      expect(resolveScopedGarageId("garage-b")).toBe("garage-a");
    });
  });

  it("prefers an active impersonation target", () => {
    runWithTenantScope(
      tenant({ garageId: null, isPlatformPrincipal: true, impersonation: { actorUserId: "admin", targetGarageId: "garage-x" } }),
      () => {
        expect(resolveScopedGarageId(undefined)).toBe("garage-x");
        expect(resolveScopedGarageId("garage-b")).toBe("garage-x");
      },
    );
  });

  it("DENIES (null) for an authenticated tenant user with no garage and no impersonation", () => {
    runWithTenantScope(tenant({ garageId: null }), () => {
      expect(resolveScopedGarageId(undefined)).toBeNull();
      // Even a passed id is ignored — a normal user cannot reach another tenant.
      expect(resolveScopedGarageId("garage-b")).toBeNull();
    });
  });

  it("lets an un-impersonating platform principal target an explicit id", () => {
    runWithTenantScope(tenant({ garageId: null, isPlatformPrincipal: true }), () => {
      expect(resolveScopedGarageId("garage-c")).toBe("garage-c");
      expect(resolveScopedGarageId(undefined)).toBeNull();
    });
  });

  it("falls back to the passed id when NO Tenant Scope is established (background jobs)", () => {
    expect(resolveScopedGarageId("garage-d")).toBe("garage-d");
    expect(resolveScopedGarageId(undefined)).toBeNull();
  });
});

describe("garageScope — condition shape", () => {
  it("returns a real equality predicate when a garage resolves in scope", () => {
    runWithTenantScope(tenant({ garageId: "garage-a" }), () => {
      const cond = garageScope(users.garageId, undefined);
      expect(cond).toBeTruthy();
      expect(JSON.stringify(cond)).toContain("garage-a");
    });
  });

  it("DENIES (match-nothing) inside a scope that resolves no garage (anonymous / no-garage user)", () => {
    runWithTenantScope(tenant({ garageId: null }), () => {
      const cond = garageScope(users.garageId, "garage-b"); // passed ignored under tenant scope
      expect(cond).toBeTruthy();
      expect(JSON.stringify(cond)).not.toContain("garage-");
    });
  });

  it("does NOT restrict when there is no Tenant Scope at all (background jobs)", () => {
    const cond = garageScope(users.garageId, undefined);
    expect(cond).toBeTruthy();
    expect(JSON.stringify(cond)).not.toContain("garage-");
  });

  it("honors an explicit id in a background (no-scope) context", () => {
    const cond = garageScope(users.garageId, "garage-d");
    expect(JSON.stringify(cond)).toContain("garage-d");
  });
});

describe("branchScope — branch-level restriction (mechanism; not yet applied to resources)", () => {
  it("does not restrict for a garage-level user (sees all branches)", () => {
    runWithTenantScope(tenant({ isBranchRestricted: false, branchIds: ["b1"] }), () => {
      expect(JSON.stringify(branchScope(jobCards.branchId))).not.toContain("b1");
    });
  });

  it("restricts to bound branches for a branch-restricted user", () => {
    runWithTenantScope(tenant({ isBranchRestricted: true, branchIds: ["b1", "b2"] }), () => {
      const cond = JSON.stringify(branchScope(jobCards.branchId));
      expect(cond).toContain("b1");
      expect(cond).toContain("b2");
    });
  });

  it("denies a branch-restricted user with no bound branches", () => {
    runWithTenantScope(tenant({ isBranchRestricted: true, branchIds: [] }), () => {
      const cond = JSON.stringify(branchScope(jobCards.branchId));
      expect(cond).not.toContain("b1");
    });
  });

  it("does not restrict when there is no scope (background)", () => {
    expect(branchScope(jobCards.branchId)).toBeTruthy();
  });
});

describe("stampGarageId — server-stamped tenancy on create", () => {
  it("stamps the context garage when none is supplied", () => {
    runWithTenantScope(tenant({ garageId: "garage-a" }), () => {
      expect(stampGarageId({ name: "x" }).garageId).toBe("garage-a");
    });
  });

  it("OVERRIDES a client-supplied garageId with the scope and flags an isolation-leak attempt", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    runWithTenantScope(tenant({ garageId: "garage-a" }), () => {
      const stamped = stampGarageId({ name: "x", garageId: "garage-b" }, "invoices");
      expect(stamped.garageId).toBe("garage-a"); // no client-controlled tenancy
    });
    expect(warn).toHaveBeenCalledWith("[ISOLATION-LEAK]", expect.stringContaining("garage-b"));
    warn.mockRestore();
  });

  it("does not flag when the supplied garageId matches the scope", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    runWithTenantScope(tenant({ garageId: "garage-a" }), () => {
      stampGarageId({ name: "x", garageId: "garage-a" });
    });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("preserves the provided garageId when no scope is established (background jobs)", () => {
    expect(stampGarageId({ garageId: "garage-d" }).garageId).toBe("garage-d");
  });
});
