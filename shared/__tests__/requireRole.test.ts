import { describe, it, expect, vi } from "vitest";
import { requireRole, requireAdmin, requireManagerOrAbove } from "../../server/middleware/requireRole";
import type { Request, Response, NextFunction } from "express";

function mockReq(user?: { role?: string }): Request {
  return { user } as any;
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe("requireRole", () => {
  it("returns 401 when no user is attached", () => {
    const req = mockReq(undefined);
    const res = mockRes();
    const next = vi.fn();

    requireRole(["ADMIN"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("ADMIN always passes regardless of allowed roles", () => {
    const req = mockReq({ role: "ADMIN" });
    const res = mockRes();
    const next = vi.fn();

    requireRole(["TECHNICIAN"])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("ADMIN works case-insensitively", () => {
    const req = mockReq({ role: "admin" });
    const res = mockRes();
    const next = vi.fn();

    requireRole(["TECHNICIAN"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("allows a matching role", () => {
    const req = mockReq({ role: "MANAGER" });
    const res = mockRes();
    const next = vi.fn();

    requireRole(["ADMIN", "MANAGER"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("rejects a non-matching role with 403", () => {
    const req = mockReq({ role: "TECHNICIAN" });
    const res = mockRes();
    const next = vi.fn();

    requireRole(["MANAGER", "ACCOUNTANT"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("defaults to ADVISOR when role is missing", () => {
    const req = mockReq({ role: undefined });
    const res = mockRes();
    const next = vi.fn();

    requireRole(["ADVISOR"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("defaults to ADVISOR when role is empty string", () => {
    const req = mockReq({ role: "" });
    const res = mockRes();
    const next = vi.fn();

    requireRole(["ADVISOR"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  it("passes for ADMIN", () => {
    const req = mockReq({ role: "ADMIN" });
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("rejects non-ADMIN", () => {
    const req = mockReq({ role: "MANAGER" });
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("requireManagerOrAbove", () => {
  it("passes for MANAGER", () => {
    const req = mockReq({ role: "MANAGER" });
    const res = mockRes();
    const next = vi.fn();

    requireManagerOrAbove(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("passes for ADMIN", () => {
    const req = mockReq({ role: "ADMIN" });
    const res = mockRes();
    const next = vi.fn();

    requireManagerOrAbove(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("rejects TECHNICIAN", () => {
    const req = mockReq({ role: "TECHNICIAN" });
    const res = mockRes();
    const next = vi.fn();

    requireManagerOrAbove(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
