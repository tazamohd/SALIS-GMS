import { describe, it, expect } from "vitest";
import {
  formatHijriFirst,
  formatHijriFirstArabic,
  formatHijriOnly,
  getTodayHijri,
} from "./hijriDateFormatter";

// A fixed Gregorian date keeps the Gregorian half deterministic; the Hijri half
// is exercised for structure (the conversion itself is covered by shared/hijriUtils).
const date = new Date("2026-03-16T12:00:00Z");

describe("formatHijriFirst", () => {
  it("renders 'Hijri / Gregorian' with the Gregorian half present", () => {
    const out = formatHijriFirst(date);
    expect(out).toContain(" / ");
    expect(out).toMatch(/2026/); // Gregorian year
    const [hijriPart, gregPart] = out.split(" / ");
    expect(hijriPart).toMatch(/^\d+\s+\S+.*\s+\d+$/); // "<day> <month...> <year>"
    expect(gregPart).toMatch(/\w+\s+\d+,\s+\d+/); // "Mon <day>, <year>"
  });
});

describe("formatHijriFirstArabic", () => {
  it("includes the separator and the Gregorian half", () => {
    const out = formatHijriFirstArabic(date);
    expect(out).toContain(" / ");
    expect(out).toMatch(/2026/);
  });
});

describe("formatHijriOnly", () => {
  it("renders only the Hijri part (no separator)", () => {
    const out = formatHijriOnly(date);
    expect(out).not.toContain(" / ");
    expect(out).toMatch(/^\d+\s+.+\s+\d+$/);
  });
});

describe("getTodayHijri", () => {
  it("returns today's Hijri info with the expected fields", () => {
    const today = getTodayHijri();
    expect(typeof today.isRamadan).toBe("boolean");
    expect(typeof today.formatted).toBe("string");
    expect(today.formatted).toContain(" / ");
    expect(typeof today.year).toBe("number");
  });
});
