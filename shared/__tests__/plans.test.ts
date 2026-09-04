import { describe, it, expect } from "vitest";
import {
  meetsMinPlan,
  PLAN_HIERARCHY,
  PLANS,
  ALL_PLAN_IDS,
  PLAN_FEATURE_CATEGORIES,
  CATEGORY_MIN_PLAN,
  type PlanId,
} from "../plans";

describe("PLAN_HIERARCHY", () => {
  it("orders STARTER < PRO < ENTERPRISE", () => {
    expect(PLAN_HIERARCHY.STARTER).toBeLessThan(PLAN_HIERARCHY.PRO);
    expect(PLAN_HIERARCHY.PRO).toBeLessThan(PLAN_HIERARCHY.ENTERPRISE);
  });

  it("covers every plan id", () => {
    for (const id of ALL_PLAN_IDS) {
      expect(PLAN_HIERARCHY).toHaveProperty(id);
    }
  });
});

describe("meetsMinPlan", () => {
  it("returns true when no required plan", () => {
    expect(meetsMinPlan("STARTER", null)).toBe(true);
    expect(meetsMinPlan("STARTER", undefined)).toBe(true);
    expect(meetsMinPlan(null, null)).toBe(true);
  });

  it("returns false when user has no plan but required is set", () => {
    expect(meetsMinPlan(null, "STARTER")).toBe(false);
    expect(meetsMinPlan(undefined, "PRO")).toBe(false);
  });

  it("STARTER meets STARTER", () => {
    expect(meetsMinPlan("STARTER", "STARTER")).toBe(true);
  });

  it("STARTER does not meet PRO or ENTERPRISE", () => {
    expect(meetsMinPlan("STARTER", "PRO")).toBe(false);
    expect(meetsMinPlan("STARTER", "ENTERPRISE")).toBe(false);
  });

  it("PRO meets STARTER and PRO but not ENTERPRISE", () => {
    expect(meetsMinPlan("PRO", "STARTER")).toBe(true);
    expect(meetsMinPlan("PRO", "PRO")).toBe(true);
    expect(meetsMinPlan("PRO", "ENTERPRISE")).toBe(false);
  });

  it("ENTERPRISE meets every tier", () => {
    for (const required of ALL_PLAN_IDS) {
      expect(meetsMinPlan("ENTERPRISE", required)).toBe(true);
    }
  });
});

describe("PLANS definitions", () => {
  it("every ALL_PLAN_IDS entry has a definition", () => {
    for (const id of ALL_PLAN_IDS) {
      expect(PLANS[id]).toBeDefined();
      expect(PLANS[id].id).toBe(id);
    }
  });

  it("STARTER is free", () => {
    expect(PLANS.STARTER.priceMonthly).toBe(0);
  });

  it("PRO costs more than STARTER, ENTERPRISE more than PRO", () => {
    expect(PLANS.PRO.priceMonthly).toBeGreaterThan(PLANS.STARTER.priceMonthly);
    expect(PLANS.ENTERPRISE.priceMonthly).toBeGreaterThan(PLANS.PRO.priceMonthly);
  });

  it("each plan has non-empty highlights", () => {
    for (const id of ALL_PLAN_IDS) {
      expect(PLANS[id].highlights.length).toBeGreaterThan(0);
    }
  });
});

describe("PLAN_FEATURE_CATEGORIES", () => {
  it("higher tiers are supersets of lower tiers", () => {
    const starter = new Set(PLAN_FEATURE_CATEGORIES.STARTER);
    const pro = new Set(PLAN_FEATURE_CATEGORIES.PRO);
    const enterprise = new Set(PLAN_FEATURE_CATEGORIES.ENTERPRISE);

    for (const cat of starter) {
      expect(pro.has(cat)).toBe(true);
      expect(enterprise.has(cat)).toBe(true);
    }
    for (const cat of pro) {
      expect(enterprise.has(cat)).toBe(true);
    }
  });
});

describe("CATEGORY_MIN_PLAN", () => {
  it("every category maps to a valid plan", () => {
    for (const [, plan] of Object.entries(CATEGORY_MIN_PLAN)) {
      expect(ALL_PLAN_IDS).toContain(plan);
    }
  });

  it("category is available at its minimum plan tier", () => {
    for (const [category, minPlan] of Object.entries(CATEGORY_MIN_PLAN)) {
      const cats = PLAN_FEATURE_CATEGORIES[minPlan as PlanId];
      expect(cats).toContain(category);
    }
  });
});
