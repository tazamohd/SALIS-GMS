/**
 * H-3 regression — CSRF enforcement is fail-safe ON.
 *
 * The previous default enforced only when NODE_ENV === "production", so any
 * other deployment (staging, a "prod" typo, unset NODE_ENV) silently ran with
 * CSRF off. csrfEnforcementEnabled() now defaults ON everywhere except the test
 * runner, with an explicit CSRF_ENFORCE override.
 */
import { describe, it, expect, afterEach } from "vitest";
import { csrfEnforcementEnabled } from "../csrf";

const origEnv = process.env.NODE_ENV;
const origEnforce = process.env.CSRF_ENFORCE;

afterEach(() => {
  process.env.NODE_ENV = origEnv;
  if (origEnforce === undefined) delete process.env.CSRF_ENFORCE;
  else process.env.CSRF_ENFORCE = origEnforce;
});

function set(nodeEnv?: string, enforce?: string) {
  if (nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = nodeEnv;
  if (enforce === undefined) delete process.env.CSRF_ENFORCE;
  else process.env.CSRF_ENFORCE = enforce;
}

describe("H-3 csrfEnforcementEnabled (fail-safe ON)", () => {
  it("enforces in production", () => {
    set("production"); expect(csrfEnforcementEnabled()).toBe(true);
  });
  it("enforces in a non-production deployment (the fix: was OFF before)", () => {
    set("staging"); expect(csrfEnforcementEnabled()).toBe(true);
  });
  it("enforces when NODE_ENV is unset", () => {
    set(undefined); expect(csrfEnforcementEnabled()).toBe(true);
  });
  it("does NOT enforce under the test runner", () => {
    set("test"); expect(csrfEnforcementEnabled()).toBe(false);
  });
  it("explicit CSRF_ENFORCE=false wins everywhere", () => {
    set("production", "false"); expect(csrfEnforcementEnabled()).toBe(false);
  });
  it("explicit CSRF_ENFORCE=true wins under the test runner", () => {
    set("test", "true"); expect(csrfEnforcementEnabled()).toBe(true);
  });
});
