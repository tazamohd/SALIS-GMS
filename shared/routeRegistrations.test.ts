import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Static guard against duplicate route registrations in the monolith.
 *
 * Express runs the FIRST handler registered for a given method+path; any later
 * registration of the same method+path is dead code (a real bug — e.g. mock
 * handlers shadowing the DB-backed phase5Service ones, fixed in Sprints 20–22).
 * This parses server/routes.ts (ignoring block and line comments) and fails if a
 * NEW duplicate appears beyond the documented baseline below.
 *
 * Drive the baseline toward zero by consolidating handlers and removing entries
 * here — never add to it.
 */
const BASELINE = new Set<string>([
  "GET /api/contracts/enhanced",
  "GET /api/hr/performance-reviews",
  "GET /api/loyalty-accounts",
  "GET /api/loyalty-accounts/:id",
  "GET /api/notification-preferences",
  "GET /api/payroll/periods",
  "PATCH /api/hr/performance-reviews/:id",
  "PATCH /api/loyalty-accounts/:id",
  "POST /api/barcode/scan",
  "POST /api/hr/performance-reviews",
  "POST /api/loyalty-accounts",
  "POST /api/marketplace/orders",
  "POST /api/video-estimates",
]);

/** Remove block comments while preserving line numbers. */
function stripBlockComments(src: string): string {
  let out = "";
  let i = 0;
  while (i < src.length) {
    if (src[i] === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end;
      out += "\n".repeat((src.slice(i, stop).match(/\n/g) || []).length);
      i = stop + 2;
    } else {
      out += src[i];
      i += 1;
    }
  }
  return out;
}

function findDuplicateRoutes(): Map<string, number[]> {
  const src = stripBlockComments(readFileSync(resolve(process.cwd(), "server/routes.ts"), "utf8"));
  const re = /app\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/;
  const seen = new Map<string, number[]>();
  src.split("\n").forEach((line, idx) => {
    const code = line.split("//")[0]; // ignore line comments
    const m = code.match(re);
    if (!m) return;
    const key = `${m[1].toUpperCase()} ${m[2]}`;
    const arr = seen.get(key) ?? [];
    arr.push(idx + 1);
    seen.set(key, arr);
  });
  return new Map([...seen].filter(([, lines]) => lines.length > 1));
}

describe("monolith route registrations", () => {
  it("introduces no NEW duplicate method+path beyond the documented baseline", () => {
    const dups = findDuplicateRoutes();
    const offenders = [...dups.keys()]
      .filter((k) => !BASELINE.has(k))
      .map((k) => `${k} (lines ${dups.get(k)!.join(", ")})`);
    expect(offenders, `New duplicate routes (first wins, rest are dead):\n${offenders.join("\n")}`).toEqual([]);
  });

  it("does not regress the duplicate baseline count", () => {
    // Ratchet: fixing duplicates lowers this; it must never grow.
    expect(findDuplicateRoutes().size).toBeLessThanOrEqual(BASELINE.size);
  });
});
