import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { enforceTenantOnBody } from "../garageScope";

function run(method: string, user: unknown, body: any) {
  const req = { method, user, body } as unknown as Request;
  const res = {} as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  enforceTenantOnBody(req, res, next);
  return { body: (req as any).body, next };
}

const STAFF = { id: "u1", role: "MANAGER", garageId: "garage-A" };

describe("enforceTenantOnBody — mass-assignment floor (audit blocker B12)", () => {
  it("POST: pins a forged body garageId to the session garage", () => {
    const { body, next } = run("POST", STAFF, { name: "x", garageId: "garage-VICTIM" });
    expect(body.garageId).toBe("garage-A");
    expect(next).toHaveBeenCalledOnce();
  });

  it("POST: sets garageId even when the body omits it", () => {
    const { body } = run("POST", STAFF, { name: "x" });
    expect(body.garageId).toBe("garage-A");
  });

  it("POST: pins snake_case garage_id when present", () => {
    const { body } = run("POST", STAFF, { name: "x", garage_id: "garage-VICTIM" });
    expect(body.garage_id).toBe("garage-A");
  });

  it("PATCH: strips body garageId so a row's tenant cannot be reassigned", () => {
    const { body } = run("PATCH", STAFF, { name: "x", garageId: "garage-VICTIM", garage_id: "garage-VICTIM" });
    expect("garageId" in body).toBe(false);
    expect("garage_id" in body).toBe(false);
    expect(body.name).toBe("x");
  });

  it("PUT: also strips body garageId", () => {
    const { body } = run("PUT", STAFF, { garageId: "garage-VICTIM" });
    expect("garageId" in body).toBe(false);
  });

  it("does NOT touch bodies for cross-garage roles (PLATFORM_ADMIN)", () => {
    const { body } = run("POST", { role: "PLATFORM_ADMIN", garageId: "garage-A" }, { garageId: "garage-B" });
    expect(body.garageId).toBe("garage-B");
  });

  it("does NOT touch customer bodies", () => {
    const { body } = run("POST", { userType: "customer", garageId: "garage-A" }, { garageId: "garage-B" });
    expect(body.garageId).toBe("garage-B");
  });

  it("does NOT touch a session with no garageId (nothing to pin to)", () => {
    const { body } = run("POST", { role: "MANAGER" }, { garageId: "garage-B" });
    expect(body.garageId).toBe("garage-B");
  });

  it("ignores GET and non-object bodies", () => {
    const get = run("GET", STAFF, { garageId: "garage-B" });
    expect(get.body.garageId).toBe("garage-B");
    const arr = run("POST", STAFF, [{ garageId: "garage-B" }]);
    expect(Array.isArray(arr.body)).toBe(true);
    expect(arr.body[0].garageId).toBe("garage-B");
  });
});
