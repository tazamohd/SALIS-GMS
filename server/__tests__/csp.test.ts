/**
 * Phase D — production Content-Security-Policy.
 *
 * Locks down the directive set that the live browser walkthrough validated
 * (0 violations across 20 authenticated routes). Pure builder → tested directly.
 */
import { describe, it, expect } from "vitest";
import { buildContentSecurityPolicy } from "../csp";

describe("buildContentSecurityPolicy", () => {
  it("production locks script-src to 'self' (no unsafe-inline / unsafe-eval)", () => {
    const { directives } = buildContentSecurityPolicy({ NODE_ENV: "production" } as any);
    expect(directives.scriptSrc).toEqual(["'self'"]);
  });

  it("development relaxes script-src for Vite HMR (unsafe-inline + unsafe-eval)", () => {
    const { directives } = buildContentSecurityPolicy({ NODE_ENV: "development" } as any);
    expect(directives.scriptSrc).toContain("'unsafe-eval'");
    expect(directives.scriptSrc).toContain("'unsafe-inline'");
  });

  it("sets the hardening directives (clickjacking / object / base-uri / form-action)", () => {
    const { directives } = buildContentSecurityPolicy({ NODE_ENV: "production" } as any);
    expect(directives.frameAncestors).toEqual(["'none'"]);
    expect(directives.objectSrc).toEqual(["'none'"]);
    expect(directives.baseUri).toEqual(["'self'"]);
    expect(directives.formAction).toEqual(["'self'"]);
    expect(directives.defaultSrc).toEqual(["'self'"]);
  });

  it("allows the SPA's real asset origins (inline styles, Google Fonts, same-origin WS)", () => {
    const { directives } = buildContentSecurityPolicy({ NODE_ENV: "production" } as any);
    expect(directives.styleSrc).toContain("'unsafe-inline'");
    expect(directives.styleSrc).toContain("https://fonts.googleapis.com");
    expect(directives.fontSrc).toContain("https://fonts.gstatic.com");
    expect(directives.connectSrc).toEqual(expect.arrayContaining(["'self'", "ws:", "wss:"]));
    expect(directives.imgSrc).toEqual(expect.arrayContaining(["'self'", "data:", "blob:"]));
  });

  it("CSP_EXTRA_* env vars extend frame/connect/img (for payment gateways)", () => {
    const { directives } = buildContentSecurityPolicy({
      NODE_ENV: "production",
      CSP_EXTRA_FRAME: "https://checkout.stripe.com",
      CSP_EXTRA_CONNECT: "https://api.stripe.com, https://api.moyasar.com",
      CSP_EXTRA_IMG: "https://cdn.example.com",
    } as any);
    expect(directives.frameSrc).toContain("https://checkout.stripe.com");
    expect(directives.connectSrc).toEqual(
      expect.arrayContaining(["https://api.stripe.com", "https://api.moyasar.com"]),
    );
    expect(directives.imgSrc).toContain("https://cdn.example.com");
  });

  it("enforces by default; CSP_REPORT_ONLY=true switches to observe mode", () => {
    expect(buildContentSecurityPolicy({ NODE_ENV: "production" } as any).reportOnly).toBe(false);
    expect(
      buildContentSecurityPolicy({ NODE_ENV: "production", CSP_REPORT_ONLY: "true" } as any).reportOnly,
    ).toBe(true);
  });
});
