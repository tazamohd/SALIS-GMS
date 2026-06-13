import { describe, it, expect } from "vitest";
import { evaluateAuthBypass } from "../config";

describe("auth-bypass guard (FR-5 / Story 2.1)", () => {
  it("is FATAL when a bypass flag is set in production (refuse to boot)", () => {
    expect(evaluateAuthBypass({ NODE_ENV: "production", AUTH_BYPASS: "true" } as any).fatal).toBe(true);
    expect(evaluateAuthBypass({ NODE_ENV: "production", DISABLE_AUTH: "1" } as any).fatal).toBe(true);
    expect(evaluateAuthBypass({ NODE_ENV: "production", NO_AUTH: "yes" } as any).fatal).toBe(true);
  });

  it("only WARNS (not fatal) in non-production", () => {
    const r = evaluateAuthBypass({ NODE_ENV: "development", AUTH_BYPASS: "true" } as any);
    expect(r.fatal).toBe(false);
    expect(r.active).toContain("AUTH_BYPASS");
  });

  it("is clean when no bypass flag is set", () => {
    expect(evaluateAuthBypass({ NODE_ENV: "production" } as any)).toEqual({ active: [], fatal: false });
  });

  it("treats falsy string values as not-set", () => {
    expect(evaluateAuthBypass({ NODE_ENV: "production", AUTH_BYPASS: "false" } as any).active).toEqual([]);
    expect(evaluateAuthBypass({ NODE_ENV: "production", AUTH_BYPASS: "0" } as any).active).toEqual([]);
    expect(evaluateAuthBypass({ NODE_ENV: "production", AUTH_BYPASS: "" } as any).active).toEqual([]);
  });
});
