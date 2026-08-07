/**
 * Sprint 8 — production security-config hardening.
 *
 * assessSecurityConfig() flags weak/short SESSION_SECRET, AUTH_BYPASS, and
 * non-secure cookies. In production these are fatal (config.ts exits); in dev
 * they are advisory warnings. Pure function → tested directly.
 */
import { describe, it, expect } from "vitest";
import { assessSecurityConfig } from "../config";

const STRONG = "x".repeat(40);

describe("assessSecurityConfig — production hard-fails on weak config", () => {
  it("a short SESSION_SECRET is a fatal error in production", () => {
    const { errors } = assessSecurityConfig({ NODE_ENV: "production", SESSION_SECRET: "short" } as any);
    expect(errors.some((e) => /SESSION_SECRET is \d+ chars/.test(e))).toBe(true);
  });

  it("a well-known weak SESSION_SECRET is a fatal error in production", () => {
    const { errors } = assessSecurityConfig({ NODE_ENV: "production", SESSION_SECRET: "changeme" } as any);
    expect(errors.some((e) => /weak\/placeholder/.test(e))).toBe(true);
  });

  it("AUTH_BYPASS enabled in production is a fatal error", () => {
    const { errors } = assessSecurityConfig({ NODE_ENV: "production", SESSION_SECRET: STRONG, AUTH_BYPASS: "true" } as any);
    expect(errors.some((e) => /AUTH_BYPASS/.test(e))).toBe(true);
  });

  it("non-secure session cookie in production is a warning (not fatal)", () => {
    const { errors, warnings } = assessSecurityConfig({ NODE_ENV: "production", SESSION_SECRET: STRONG } as any);
    expect(warnings.some((w) => /SESSION_COOKIE_SECURE/.test(w))).toBe(true);
    expect(errors.length).toBe(0);
  });

  it("a strong secret + secure cookie in production yields no errors", () => {
    const { errors } = assessSecurityConfig({
      NODE_ENV: "production",
      SESSION_SECRET: STRONG,
      SESSION_COOKIE_SECURE: "true",
    } as any);
    expect(errors).toEqual([]);
  });
});

describe("assessSecurityConfig — development is lenient (warnings, not errors)", () => {
  it("a short secret in dev is a warning, never an error", () => {
    const { errors, warnings } = assessSecurityConfig({ NODE_ENV: "development", SESSION_SECRET: "short" } as any);
    expect(errors).toEqual([]);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("AUTH_BYPASS in dev is allowed (no error)", () => {
    const { errors } = assessSecurityConfig({ NODE_ENV: "development", SESSION_SECRET: STRONG, AUTH_BYPASS: "1" } as any);
    expect(errors).toEqual([]);
  });
});
