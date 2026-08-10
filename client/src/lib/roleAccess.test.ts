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
import {
  navigationConfig,
  filterNavigationByAccess,
  type NavGroup,
  type UserRole,
  type SubscriptionPlan,
} from "@/config/navigation";

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

/**
 * Item-level over-exposure — items inside a technician-allowed group that lack
 * a `roles` restriction leaked into the Technician (and Advisor/Accountant)
 * sidebar because pass 1 (filterNavigationByAccess) let them through and pass 2
 * (filterNavByRole) kept the parent group. Restricting each leaking item to the
 * roles that actually need it removes it in pass 1. These assertions run the
 * REAL navigationConfig through both passes exactly as Layout.tsx does.
 */
describe("item-level role gating — real navigationConfig through both passes", () => {
  const hrefsFor = (role: UserRole, plan: SubscriptionPlan = "STARTER"): string[] => {
    const pass1 = filterNavigationByAccess(navigationConfig, role, plan);
    const pass2 = filterNavByRole(pass1, role);
    return pass2.flatMap((g) => (g.items ?? []).map((i) => i.href));
  };

  // Items that must NOT appear for a Technician (owner/advisor/admin functions).
  const HIDDEN_FROM_TECH = [
    "/provider-bookings", // Marketplace Bookings
    "/my-offerings", // My Offerings
    "/estimates", // Estimates
    "/notification-center", // Notification Center
    "/document-management", // Document Management
    "/data-import-export", // Data Import/Export
    "/integrations", // Integrations
    "/digital-signage", // Digital Signage
  ];

  it("Technician sidebar excludes the leaked items", () => {
    const hrefs = hrefsFor("TECHNICIAN");
    for (const href of HIDDEN_FROM_TECH) {
      expect(hrefs, `Technician should NOT see ${href}`).not.toContain(href);
    }
  });

  it("Technician still keeps their core workflow items", () => {
    const hrefs = hrefsFor("TECHNICIAN");
    for (const href of ["/", "/job-cards", "/appointments", "/inventory-management", "/settings", "/profile"]) {
      expect(hrefs, `Technician should see ${href}`).toContain(href);
    }
  });

  it("Advisor keeps Estimates + Marketplace Bookings but loses admin-only tools", () => {
    const hrefs = hrefsFor("ADVISOR");
    expect(hrefs).toContain("/estimates");
    expect(hrefs).toContain("/provider-bookings");
    expect(hrefs).not.toContain("/my-offerings");
    expect(hrefs).not.toContain("/integrations");
    expect(hrefs).not.toContain("/data-import-export");
  });

  it("ADMIN still sees every previously-leaking item", () => {
    const hrefs = hrefsFor("ADMIN", "ENTERPRISE");
    for (const href of HIDDEN_FROM_TECH) {
      expect(hrefs, `ADMIN should see ${href}`).toContain(href);
    }
  });
});
