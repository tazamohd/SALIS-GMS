import { describe, it, expect } from "vitest";
import type { NavGroup, UserRole } from "@/config/navigation";
import { filterNavByRole, getRoleDisplayLabel, getRoleBadgeColor } from "./roleAccess";

// Minimal fixtures — filterNavByRole only reads `title`, so the icon is irrelevant.
const groups = [
  { title: "Overview" },
  { title: "Operations" },
  { title: "Finance" },
  { title: "System" },
  { title: "Team" },
] as unknown as NavGroup[];

describe("filterNavByRole", () => {
  it("returns all groups for wildcard roles (ADMIN, PLATFORM_ADMIN)", () => {
    expect(filterNavByRole(groups, "ADMIN")).toHaveLength(groups.length);
    expect(filterNavByRole(groups, "PLATFORM_ADMIN")).toHaveLength(groups.length);
  });

  it("restricts ACCOUNTANT to Overview/Finance/System", () => {
    const titles = filterNavByRole(groups, "ACCOUNTANT").map((g) => g.title);
    expect(titles).toEqual(["Overview", "Finance", "System"]);
  });

  it("restricts TECHNICIAN to its allowed groups (no Finance/Team)", () => {
    const titles = filterNavByRole(groups, "TECHNICIAN").map((g) => g.title);
    expect(titles).toContain("Overview");
    expect(titles).toContain("Operations");
    expect(titles).not.toContain("Finance");
    expect(titles).not.toContain("Team");
  });

  it("returns all groups for an unknown role (no allow-list entry)", () => {
    expect(filterNavByRole(groups, "GHOST" as UserRole)).toHaveLength(groups.length);
  });
});

describe("getRoleDisplayLabel", () => {
  it("maps known roles to friendly labels", () => {
    expect(getRoleDisplayLabel("ADMIN")).toBe("Administrator");
    expect(getRoleDisplayLabel("ADVISOR")).toBe("Service Advisor");
    expect(getRoleDisplayLabel("TECHNICIAN")).toBe("Technician");
  });

  it("falls back to the raw role for unknown values", () => {
    expect(getRoleDisplayLabel("GHOST" as UserRole)).toBe("GHOST");
  });
});

describe("getRoleBadgeColor", () => {
  it("returns a tailwind class string for known roles", () => {
    expect(getRoleBadgeColor("MANAGER")).toContain("bg-emerald-100");
    expect(getRoleBadgeColor("ADMIN")).toContain("bg-blue-100");
  });

  it("returns a gray fallback for unknown roles", () => {
    expect(getRoleBadgeColor("GHOST" as UserRole)).toContain("bg-gray-100");
  });
});
