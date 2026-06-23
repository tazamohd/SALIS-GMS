import { describe, it, expect } from "vitest";
import {
  convertCurrency,
  formatCurrency,
  getCurrencySymbol,
  getCurrencyName,
  getAvailableCurrencies,
  DEFAULT_CURRENCY,
} from "./currency";

describe("convertCurrency", () => {
  it("is identity for the same currency", () => {
    expect(convertCurrency(50, "SAR", "SAR")).toBeCloseTo(50, 5);
  });

  it("converts via the SAR base rate", () => {
    // 1 SAR ≈ 0.27 USD
    expect(convertCurrency(100, "SAR", "USD")).toBeCloseTo(27, 5);
    // round-trip back to SAR
    expect(convertCurrency(27, "USD", "SAR")).toBeCloseTo(100, 0);
  });

  it("treats unknown currencies as rate 1 (SAR-equivalent)", () => {
    expect(convertCurrency(10, "XXX", "SAR")).toBeCloseTo(10, 5);
  });
});

describe("currency lookups", () => {
  it("returns symbols and names", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencyName("USD", "en")).toBe("US Dollar");
    expect(getCurrencyName("SAR", "ar")).toBe("ريال سعودي");
  });

  it("exposes SAR as the default and within the catalog", () => {
    expect(DEFAULT_CURRENCY).toBe("SAR");
    expect(getAvailableCurrencies().some((c) => c.code === "SAR")).toBe(true);
  });
});

describe("formatCurrency", () => {
  it("formats USD with grouping", () => {
    const out = formatCurrency(1000, "USD");
    expect(typeof out).toBe("string");
    expect(out).toContain("1,000");
  });

  it("falls back to SAR for an unknown currency code", () => {
    const out = formatCurrency(5, "NOPE");
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});
