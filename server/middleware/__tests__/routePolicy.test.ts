import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { enforceRoutePolicy, policyFor, ROUTE_POLICIES } from "../routePolicy";

function run(method: string, path: string, user: unknown) {
  const req = { method, path, user } as unknown as Request;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  enforceRoutePolicy(req, res, next);
  return { next, status, json };
}

const allowed = (r: ReturnType<typeof run>) =>
  (r.next as unknown as ReturnType<typeof vi.fn>).mock.calls.length === 1 &&
  (r.status as unknown as ReturnType<typeof vi.fn>).mock.calls.length === 0;

/** The boundary this suite exists to prove: hiding a menu entry is not access
 *  control. A technician who calls the API directly must be refused. */
describe("route policy — the roles that must never reach payroll", () => {
  const forbidden = ["TECHNICIAN", "ADVISOR", "ACCOUNTANT"] as const;

  for (const role of forbidden) {
    it(`denies ${role} on GET /hr/employees`, () => {
      const r = run("GET", "/hr/employees", { id: "u1", role });
      expect(r.status).toHaveBeenCalledWith(403);
      expect(r.next).not.toHaveBeenCalled();
    });
  }

  it("denies TECHNICIAN on the payroll run endpoint", () => {
    const r = run("POST", "/payroll/runs", { id: "u1", role: "TECHNICIAN" });
    expect(r.status).toHaveBeenCalledWith(403);
  });

  it("allows MANAGER on HR", () => {
    expect(allowed(run("GET", "/hr/employees", { id: "u1", role: "MANAGER" }))).toBe(true);
  });

  it("allows ACCOUNTANT on payroll but not on HR records", () => {
    expect(allowed(run("GET", "/payroll/runs", { id: "u1", role: "ACCOUNTANT" }))).toBe(true);
    expect(run("GET", "/hr/employees", { id: "u1", role: "ACCOUNTANT" }).status).toHaveBeenCalledWith(403);
  });
});

describe("route policy — admin-only control planes", () => {
  for (const role of ["MANAGER", "ACCOUNTANT", "ADVISOR", "TECHNICIAN"] as const) {
    it(`denies ${role} on /security`, () => {
      expect(run("GET", "/security/settings", { id: "u1", role }).status).toHaveBeenCalledWith(403);
    });
    it(`denies ${role} on /licenses`, () => {
      expect(run("GET", "/licenses", { id: "u1", role }).status).toHaveBeenCalledWith(403);
    });
  }

  it("allows ADMIN everywhere the table covers", () => {
    for (const policy of ROUTE_POLICIES) {
      const method = policy.methods?.[0] ?? "GET";
      expect(allowed(run(method, policy.prefix, { id: "u1", role: "ADMIN" }))).toBe(true);
    }
  });
});

describe("route policy — method scoping", () => {
  it("lets any staff role read integrations but not rewrite credentials", () => {
    expect(allowed(run("GET", "/integrations", { id: "u1", role: "TECHNICIAN" }))).toBe(true);
    expect(run("POST", "/integrations", { id: "u1", role: "TECHNICIAN" }).status).toHaveBeenCalledWith(403);
  });

  it("applies the same split to dynamic pricing", () => {
    expect(allowed(run("GET", "/dynamic-pricing/rules", { id: "u1", role: "ADVISOR" }))).toBe(true);
    expect(run("PATCH", "/dynamic-pricing/rules/1", { id: "u1", role: "ADVISOR" }).status).toHaveBeenCalledWith(403);
  });
});

describe("route policy — fails closed", () => {
  it("denies a session with no role at all (audit H-1)", () => {
    expect(run("GET", "/hr/employees", { id: "u1" }).status).toHaveBeenCalledWith(403);
  });

  it("denies a blank-string role", () => {
    expect(run("GET", "/hr/employees", { id: "u1", role: "" }).status).toHaveBeenCalledWith(403);
  });

  it("401s when the request is somehow unauthenticated", () => {
    expect(run("GET", "/hr/employees", undefined).status).toHaveBeenCalledWith(401);
  });

  it("is case-insensitive about the stored role", () => {
    expect(allowed(run("GET", "/hr/employees", { id: "u1", role: "manager" }))).toBe(true);
  });
});

describe("route policy — matching", () => {
  it("matches the prefix itself and its children", () => {
    expect(policyFor("GET", "/hr")).toBeDefined();
    expect(policyFor("GET", "/hr/employees/42/salary")).toBeDefined();
  });

  it("does not match a path that merely starts with the same letters", () => {
    expect(policyFor("GET", "/hrothers")).toBeUndefined();
  });

  it("leaves unlisted routes alone, so mounting cannot widen access", () => {
    expect(policyFor("GET", "/job-cards")).toBeUndefined();
    expect(allowed(run("GET", "/job-cards", { id: "u1", role: "TECHNICIAN" }))).toBe(true);
  });

  it("every policy documents why the boundary exists", () => {
    for (const p of ROUTE_POLICIES) expect(p.reason.length).toBeGreaterThan(10);
  });
});

// ── Second pass: the domains added after the first slice ────────────────────

describe("route policy — financial reporting and analytics", () => {
  it("keeps the general ledger to finance roles", () => {
    expect(allowed(run("GET", "/financial/general-ledger", { id: "u1", role: "ACCOUNTANT" }))).toBe(true);
    expect(allowed(run("GET", "/financial/balance-sheet", { id: "u1", role: "MANAGER" }))).toBe(true);
    for (const role of ["TECHNICIAN", "ADVISOR"] as const) {
      expect(run("GET", "/financial/income-statement", { id: "u1", role }).status).toHaveBeenCalledWith(403);
    }
  });

  it("keeps customer lifetime value and BI reporting to finance roles", () => {
    expect(allowed(run("GET", "/analytics/customer-ltv", { id: "u1", role: "MANAGER" }))).toBe(true);
    expect(run("GET", "/analytics/bi-report", { id: "u1", role: "TECHNICIAN" }).status).toHaveBeenCalledWith(403);
  });
});

describe("route policy — platform administration", () => {
  for (const role of ["MANAGER", "ACCOUNTANT", "ADVISOR", "TECHNICIAN"] as const) {
    it(`denies ${role} on the cross-tenant garage list`, () => {
      expect(run("GET", "/platform-admin/garages", { id: "u1", role }).status).toHaveBeenCalledWith(403);
    });
  }

  it("lets ADMIN through", () => {
    expect(allowed(run("GET", "/platform-admin/support-tickets", { id: "u1", role: "ADMIN" }))).toBe(true);
  });
});

describe("route policy — the audit log is evidence", () => {
  it("lets managers and accountants read it", () => {
    expect(allowed(run("GET", "/audit/log", { id: "u1", role: "MANAGER" }))).toBe(true);
    expect(allowed(run("GET", "/audit/stats", { id: "u1", role: "ACCOUNTANT" }))).toBe(true);
  });

  it("denies technicians and advisors reading it", () => {
    expect(run("GET", "/audit/log", { id: "u1", role: "TECHNICIAN" }).status).toHaveBeenCalledWith(403);
  });

  /** The read rule and the write rule share a prefix, and `policyFor` takes the
   *  first match. If the write rule ever moves below the read rule a manager
   *  silently gains the ability to write audit entries — so the ordering is
   *  asserted, not just commented. */
  it("denies even a MANAGER writing to it, because the narrow rule sorts first", () => {
    expect(run("POST", "/audit/seed", { id: "u1", role: "MANAGER" }).status).toHaveBeenCalledWith(403);
    expect(run("DELETE", "/audit/log/1", { id: "u1", role: "ACCOUNTANT" }).status).toHaveBeenCalledWith(403);
    expect(policyFor("POST", "/audit/seed")?.roles).toEqual([]);
  });
});

describe("route policy — read/write splits on operational domains", () => {
  const splits = [
    { write: "POST", path: "/training/certifications", read: "/training/modules" },
    { write: "DELETE", path: "/call-center/queues/1", read: "/call-center/performance" },
    { write: "PATCH", path: "/fleet/contracts/1", read: "/fleet/vehicles" },
    { write: "POST", path: "/marketing-campaigns", read: "/marketing-campaigns" },
    { write: "POST", path: "/loyalty-programs", read: "/loyalty-programs" },
  ] as const;

  for (const { write, path, read } of splits) {
    it(`lets an ADVISOR read ${read} but not ${write} ${path}`, () => {
      expect(allowed(run("GET", read, { id: "u1", role: "ADVISOR" }))).toBe(true);
      expect(run(write, path, { id: "u1", role: "ADVISOR" }).status).toHaveBeenCalledWith(403);
    });
  }

  it("lets an accountant adjust a loyalty balance, since it is a credit", () => {
    expect(allowed(run("PATCH", "/loyalty-accounts/1", { id: "u1", role: "ACCOUNTANT" }))).toBe(true);
    expect(run("PATCH", "/loyalty-accounts/1", { id: "u1", role: "TECHNICIAN" }).status).toHaveBeenCalledWith(403);
  });
});

describe("route policy — the documented omissions are really omitted", () => {
  /** The header lists four prefixes deliberately left unguarded. If someone
   *  adds a rule for one without updating that note, the note becomes a lie —
   *  this catches that. */
  const unlisted = ["/reports/revenue", "/documents/expiring", "/ai/accuracy", "/mobile/dashboard"];

  for (const path of unlisted) {
    it(`leaves ${path} to the existing auth + staff middleware`, () => {
      expect(policyFor("GET", path)).toBeUndefined();
      expect(policyFor("POST", path)).toBeUndefined();
      expect(allowed(run("GET", path, { id: "u1", role: "TECHNICIAN" }))).toBe(true);
    });
  }
});

describe("route policy — the table stays coherent as it grows", () => {
  it("never shadows a rule with a broader one placed above it", () => {
    ROUTE_POLICIES.forEach((policy, index) => {
      const shadowedBy = ROUTE_POLICIES.slice(0, index).find(
        (earlier) =>
          (policy.prefix === earlier.prefix || policy.prefix.startsWith(earlier.prefix + "/")) &&
          !earlier.methods,
      );
      expect(
        shadowedBy,
        `${policy.prefix} is unreachable: "${shadowedBy?.prefix}" matches everything above it`,
      ).toBeUndefined();
    });
  });

  it("names only roles that exist", () => {
    const known = ["ADMIN", "MANAGER", "ADVISOR", "TECHNICIAN", "ACCOUNTANT"];
    for (const policy of ROUTE_POLICIES) {
      for (const role of policy.roles) expect(known).toContain(role);
    }
  });
});
