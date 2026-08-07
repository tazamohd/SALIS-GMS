/**
 * FE-H1 regression — the accountant sidebar over-filter.
 *
 * roleNavAccess titles must match config/navigation.ts group titles EXACTLY;
 * filterNavByRole keeps a group only on an exact title match. The abbreviated
 * 'System' never matched 'System & Settings' (every non-admin role lost
 * Settings), and ACCOUNTANT lacked 'Finance & Accounting' / 'Analytics &
 * Business Intelligence' — so the accountant sidebar rendered only Overview +
 * Finance. These assertions pin the corrected titles.
 */
import { describe, it, expect } from "vitest";
import { filterNavByRole } from "./roleAccess";
import type { NavGroup, UserRole } from "@/config/navigation";

// Minimal synthetic groups carrying the real navigation.ts titles.
const groups: NavGroup[] = [
  "Overview",
  "Operations",
  "Customers & Vehicles",
  "Inventory",
  "Team",
  "Finance",
  "Analytics & Business Intelligence",
  "Finance & Accounting",
  "System & Settings",
].map((title) => ({ title, items: [] }) as unknown as NavGroup);

const titles = (role: UserRole) => filterNavByRole(groups, role).map((g) => g.title);

describe("FE-H1 — filterNavByRole keeps the right groups per role", () => {
  it("ACCOUNTANT keeps its core accounting + analytics + settings groups", () => {
    const t = titles("ACCOUNTANT");
    expect(t).toEqual(
      expect.arrayContaining([
        "Overview",
        "Finance",
        "Finance & Accounting",
        "Analytics & Business Intelligence",
        "System & Settings",
      ]),
    );
    // and does NOT regress to the old two-group sidebar
    expect(t.length).toBeGreaterThan(2);
  });

  it("every non-admin role regains 'System & Settings' (the 'System' typo fix)", () => {
    for (const role of ["MANAGER", "ADVISOR", "TECHNICIAN", "ACCOUNTANT"] as UserRole[]) {
      expect(titles(role), `${role} should see System & Settings`).toContain("System & Settings");
    }
  });

  it("ADMIN / PLATFORM_ADMIN see all groups ('*')", () => {
    expect(filterNavByRole(groups, "ADMIN" as UserRole).length).toBe(groups.length);
    expect(filterNavByRole(groups, "PLATFORM_ADMIN" as UserRole).length).toBe(groups.length);
  });
});
