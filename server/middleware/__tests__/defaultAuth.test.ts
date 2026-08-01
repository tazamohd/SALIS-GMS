import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireAuthByDefault } from "../defaultAuth";

function makeCtx(path: string, authed: boolean) {
  const req = {
    path,
    isAuthenticated: () => authed,
  } as unknown as Request;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next, status, json };
}

describe("requireAuthByDefault — default-deny floor (audit blocker B1)", () => {
  it("allows non-/api paths through untouched", () => {
    const { req, res, next, status } = makeCtx("/assets/app.js", false);
    requireAuthByDefault(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(status).not.toHaveBeenCalled();
  });

  it("401s an anonymous request to a protected /api route", () => {
    const { req, res, next, status } = makeCtx("/api/customers", false);
    requireAuthByDefault(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows an authenticated request to a protected /api route", () => {
    const { req, res, next, status } = makeCtx("/api/customers", true);
    requireAuthByDefault(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(status).not.toHaveBeenCalled();
  });

  it("allows public auth/health/csrf routes anonymously", () => {
    for (const p of ["/api/login", "/api/register", "/api/csrf-token", "/api/health", "/api/plans"]) {
      const { req, res, next, status } = makeCtx(p, false);
      requireAuthByDefault(req, res, next);
      expect(next, `expected ${p} public`).toHaveBeenCalledOnce();
      expect(status).not.toHaveBeenCalled();
    }
  });

  it("allows demo and kiosk namespaces anonymously (they self-gate)", () => {
    for (const p of ["/api/demo/accounts", "/api/demo/login", "/api/kiosk/queue", "/api/public/track/abc"]) {
      const { req, res, next } = makeCtx(p, false);
      requireAuthByDefault(req, res, next);
      expect(next, `expected ${p} public`).toHaveBeenCalledOnce();
    }
  });

  it("keeps webhooks reachable anonymously (server-to-server callbacks)", () => {
    for (const p of ["/api/stripe/webhook", "/api/whatsapp/webhook", "/api/payments/webhook/moyasar"]) {
      const { req, res, next, status } = makeCtx(p, false);
      requireAuthByDefault(req, res, next);
      expect(next, `expected ${p} public`).toHaveBeenCalledOnce();
      expect(status).not.toHaveBeenCalled();
    }
  });

  it("does NOT treat a lookalike non-webhook path as public", () => {
    const { req, res, next, status } = makeCtx("/api/payments", false);
    requireAuthByDefault(req, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
