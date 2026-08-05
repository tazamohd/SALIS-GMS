/**
 * SQL-identifier hardening (drizzle-orm 0.45 upgrade follow-up).
 *
 * The drizzle CVE that motivated the 0.39 -> 0.45 bump was SQL injection via
 * improperly escaped SQL *identifiers*. The library is patched, but these are
 * the two places in our own code where a dynamic value reaches a SQL-identifier
 * position, so they are pinned here as defense-in-depth: a regression that let
 * request input through either path would fail this suite.
 *
 *  - requireResourceOwnership: table/column/fk names come only from
 *    developer-authored configs and are validated against ^[a-z_][a-z0-9_]*$
 *    before sql.raw(). A malformed name throws at wire-up (fail fast).
 *  - parseSort: the request-supplied ?sortBy is whitelisted against the
 *    caller's allowed fields; anything else falls back to the default.
 */
import { describe, it, expect } from "vitest";
import type { Request } from "express";
import { requireResourceOwnership } from "../middleware/resourceOwnership";
import { parseSort } from "../routes/pagination";

describe("requireResourceOwnership — identifier validation", () => {
  it("constructs for valid snake_case identifiers", () => {
    expect(typeof requireResourceOwnership({ table: "refunds" })).toBe("function");
    expect(
      typeof requireResourceOwnership({
        table: "fleet_vehicles",
        parent: { table: "fleet_groups", fk: "fleet_group_id" },
      }),
    ).toBe("function");
    expect(
      typeof requireResourceOwnership({
        table: "inventory_transfers",
        tenantColumns: ["from_garage_id", "to_garage_id"],
      }),
    ).toBe("function");
  });

  it("throws at wire-up on an injection-shaped table name", () => {
    expect(() => requireResourceOwnership({ table: "users; DROP TABLE users --" })).toThrow(/unsafe identifier/);
    expect(() => requireResourceOwnership({ table: 'users" ' })).toThrow(/unsafe identifier/);
    expect(() => requireResourceOwnership({ table: "Users" })).toThrow(/unsafe identifier/); // uppercase rejected
  });

  it("throws on a malformed tenant column, parent table, or fk", () => {
    expect(() => requireResourceOwnership({ table: "refunds", tenantColumn: "garage_id = 1 OR 1=1" })).toThrow(/unsafe identifier/);
    expect(() =>
      requireResourceOwnership({ table: "t", parent: { table: "p); DROP", fk: "x" } }),
    ).toThrow(/unsafe identifier/);
    expect(() =>
      requireResourceOwnership({ table: "t", parent: { table: "p", fk: "fk)--" } }),
    ).toThrow(/unsafe identifier/);
    expect(() =>
      requireResourceOwnership({ table: "inventory_transfers", tenantColumns: ["from_garage_id", "to; DROP"] }),
    ).toThrow(/unsafe identifier/);
  });
});

describe("parseSort — request sort field is whitelisted", () => {
  const allowed = ["created_at", "amount", "status"] as const;
  const mkReq = (q: Record<string, unknown>) => ({ query: q } as unknown as Request);

  it("passes through an allowed field + direction", () => {
    expect(parseSort(mkReq({ sortBy: "amount", sortDir: "asc" }), allowed, "created_at")).toEqual({
      field: "amount",
      direction: "asc",
    });
  });

  it("falls back to the default field for an injection-shaped sortBy", () => {
    const r = parseSort(mkReq({ sortBy: "amount; DROP TABLE invoices --", sortDir: "desc" }), allowed, "created_at");
    expect(r.field).toBe("created_at"); // never the raw request value
    expect(allowed.includes(r.field as any) || r.field === "created_at").toBe(true);
  });

  it("falls back to the default direction for a bogus sortDir", () => {
    const r = parseSort(mkReq({ sortBy: "status", sortDir: "; DELETE FROM users" }), allowed, "created_at", "desc");
    expect(r.direction).toBe("desc");
    expect(["asc", "desc"]).toContain(r.direction);
  });
});
