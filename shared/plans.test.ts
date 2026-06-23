import { describe, it, expect } from "vitest";
import { meetsMinPlan, PLAN_HIERARCHY, ALL_PLAN_IDS } from "./plans";

describe("meetsMinPlan", () => {
  it("returns true when no plan is required", () => {
    expect(meetsMinPlan("STARTER", null)).toBe(true);
    expect(meetsMinPlan(undefined, undefined)).toBe(true);
  });

  it("returns false when a plan is required but the user has none", () => {
    expect(meetsMinPlan(null, "PRO")).toBe(false);
    expect(meetsMinPlan(undefined, "STARTER")).toBe(false);
  });

  it("compares tiers using the hierarchy", () => {
    expect(meetsMinPlan("STARTER", "STARTER")).toBe(true);
    expect(meetsMinPlan("STARTER", "PRO")).toBe(false);
    expect(meetsMinPlan("PRO", "STARTER")).toBe(true);
    expect(meetsMinPlan("ENTERPRISE", "PRO")).toBe(true);
    expect(meetsMinPlan("PRO", "ENTERPRISE")).toBe(false);
  });
});

describe("PLAN_HIERARCHY", () => {
  it("orders STARTER < PRO < ENTERPRISE", () => {
    expect(PLAN_HIERARCHY.STARTER).toBeLessThan(PLAN_HIERARCHY.PRO);
    expect(PLAN_HIERARCHY.PRO).toBeLessThan(PLAN_HIERARCHY.ENTERPRISE);
  });

  it("has a hierarchy entry for every plan id", () => {
    for (const id of ALL_PLAN_IDS) {
      expect(typeof PLAN_HIERARCHY[id]).toBe("number");
    }
  });
});
