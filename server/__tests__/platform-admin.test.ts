/**
 * Wave A — Platform admin route security tests (SA-005)
 *
 * These tests are read-only documentation/contract tests. They verify that
 * the route definitions in `server/routes.ts` use `requireAdmin` middleware
 * instead of `isAuthenticated` for all `/api/platform-admin/*` endpoints.
 *
 * Acceptance criteria (SA-005):
 *  - Every platform-admin endpoint declares `requireAdmin` as middleware
 *  - No platform-admin endpoint uses only `isAuthenticated`
 *
 * Note: full integration tests would require a running server, DB, and
 * authenticated sessions. These are contract tests that verify the source
 * code wiring. They run fast and catch regressions in the middleware choice.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Platform admin route security (SA-005)', () => {
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const source = fs.readFileSync(routesPath, 'utf-8');

  const platformAdminRoutes = [
    "/api/platform-admin/stats",
    "/api/platform-admin/garages",
    "/api/platform-admin/garages/:id/status",
    "/api/platform-admin/suppliers",
    "/api/platform-admin/stores",
    "/api/platform-admin/support-tickets",
    "/api/platform-admin/support-tickets/:id",
    "/api/platform-admin/system-health",
  ];

  for (const routePath of platformAdminRoutes) {
    it(`${routePath} uses requireAdmin middleware`, () => {
      const escaped = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const routeRegex = new RegExp(
        `app\\.(get|post|patch|put|delete)\\(['"]${escaped}['"]\\s*,\\s*([^,]+)`
      );
      const match = source.match(routeRegex);
      expect(match, `Route ${routePath} not found`).not.toBeNull();
      const middleware = match![2].trim();
      expect(
        middleware,
        `${routePath} must use requireAdmin, found: ${middleware}`
      ).toBe('requireAdmin');
    });
  }
});