import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireRole, requireAdmin, requireManagerOrAbove } from "../requireRole";

function makeCtx(user: unknown) {
  const req = { user } as unknown as Request;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next, status, json };
}

describe("requireRole — deny-by-default (audit H-1)", () => {
  it("denies a roleless authenticated session with 403 (does NOT fall back to ADVISOR)", () => {
    const { req, res, next, status } = makeCtx({ id: "u1" }); // user present, no role
    requireRole(["MANAGER"])(req, res, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("denies a blank-string role with 403", () => {
    const { req, res, next, status } = makeCtx({ id: "u1", role: "" });
    requireRole(["MANAGER"])(req, res, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when no user is present", () => {
    const { req, res, next, status } = makeCtx(undefined);
    requireRole(["MANAGER"])(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows ADMIN regardless of the required-role list", () => {
    const { req, res, next, status } = makeCtx({ role: "admin" });
    requireRole(["MANAGER"])(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(status).not.toHaveBeenCalled();
  });

  it("allows a user whose role is in the allowed list (case-insensitive)", () => {
    const { req, res, next, status } = makeCtx({ role: "manager" });
    requireRole(["MANAGER"])(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(status).not.toHaveBeenCalled();
  });

  it("denies a user whose role is not in the allowed list with 403", () => {
    const { req, res, next, status } = makeCtx({ role: "technician" });
    requireRole(["MANAGER"])(req, res, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAdmin denies a roleless session", () => {
    const { req, res, next, status } = makeCtx({ id: "u1" });
    requireAdmin(req, res, next);
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireManagerOrAbove allows MANAGER and denies TECHNICIAN", () => {
    const ok = makeCtx({ role: "manager" });
    requireManagerOrAbove(ok.req, ok.res, ok.next);
    expect(ok.next).toHaveBeenCalledOnce();

    const denied = makeCtx({ role: "technician" });
    requireManagerOrAbove(denied.req, denied.res, denied.next);
    expect(denied.status).toHaveBeenCalledWith(403);
    expect(denied.next).not.toHaveBeenCalled();
  });
});
