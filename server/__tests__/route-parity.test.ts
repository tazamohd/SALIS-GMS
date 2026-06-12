import { describe, it, expect } from "vitest";
import type { Express } from "express";
import { createTestApp } from "./setup";
import baseline from "./route-parity.baseline.json";

/**
 * Route parity guard.
 *
 * The server uses a Hybrid Router (server/routes/index.ts): ~45 modular domain
 * routers are mounted under /api FIRST, then the 22k-line legacy monolith
 * (server/routes.ts) is mounted LAST as a fallback. Express is first-match-wins,
 * so any path registered by BOTH a mounted module and the monolith means the
 * module silently shadows the monolith handler (or a monolith handler shadows a
 * later duplicate). That shadowing class has already produced real bugs
 * (PR #32 storage dupes, PR #38 26 dead duplicate routes, and the
 * estimates/supplier-portal/misc demo-store landmines documented in
 * routes/index.ts).
 *
 * This test enumerates every registered (METHOD, path) pair across the whole
 * hybrid tree and flags any that is registered more than once. Param names are
 * normalized (:id and :customerId collide at runtime, so they collide here too).
 */

type RouteKey = string; // "GET /api/customers/:param"

function mountPrefix(layer: any): string {
  if (layer.regexp && layer.regexp.fast_slash) return "";
  // Decode the path-to-regexp source back into a literal prefix, e.g.
  // "^\\/api\\/?(?=\\/|$)" -> "/api". Mounts in this app are all literal.
  return layer.regexp.source
    .replace("\\/?(?=\\/|$)", "")
    .replace(/^\^/, "")
    .replace(/\$$/, "")
    .replace(/\\\//g, "/");
}

function normalize(path: string): string {
  // :id, :customerId, :userId all match the same URL segment in Express.
  return path.replace(/:[^/]+/g, ":param").replace(/\/+$/, "") || "/";
}

function collectRoutes(app: Express): Map<RouteKey, number> {
  const counts = new Map<RouteKey, number>();
  const walk = (stack: any[], prefix: string) => {
    for (const layer of stack) {
      if (layer.route) {
        const fullPath = normalize(prefix + layer.route.path);
        for (const method of Object.keys(layer.route.methods)) {
          if (!layer.route.methods[method]) continue;
          if (method === "_all") continue;
          const key = `${method.toUpperCase()} ${fullPath}`;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      } else if (layer.name === "router" && layer.handle?.stack) {
        walk(layer.handle.stack, prefix + mountPrefix(layer));
      }
    }
  };
  // Express 4 keeps the router lazily; touching app.get builds it.
  walk((app as any)._router.stack, "");
  return counts;
}

describe("route parity (hybrid router)", () => {
  it("registers no NEW duplicate routes beyond the known-debt baseline", async () => {
    const { app } = await createTestApp();
    const counts = collectRoutes(app);
    const duplicates = new Set(
      [...counts.entries()].filter(([, n]) => n > 1).map(([key]) => key),
    );
    const known = new Set(baseline.duplicates);

    // Regressions: a path is now shadowed that wasn't in the baseline. These are
    // the bugs this guard exists to prevent — fail hard with the offenders.
    const newDuplicates = [...duplicates].filter((k) => !known.has(k)).sort();
    expect(
      newDuplicates,
      `New duplicate route registrations detected — a mounted module and the ` +
        `monolith (or two monolith handlers) now register the same path, so one ` +
        `silently shadows the other. Resolve the shadow; do NOT add it to the ` +
        `baseline. Offenders:\n  ${newDuplicates.join("\n  ")}`,
    ).toEqual([]);

    // Ratchet: baseline entries that are no longer duplicated should be removed
    // so the debt list only shrinks. Non-fatal, but surfaced loudly.
    const stale = [...known].filter((k) => !duplicates.has(k)).sort();
    if (stale.length > 0) {
      console.warn(
        `\n[route-parity] ${stale.length} baseline entries are no longer ` +
          `duplicated — trim them from route-parity.baseline.json:\n  ${stale.join("\n  ")}`,
      );
    }
  });
});
