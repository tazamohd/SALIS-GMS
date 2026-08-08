/**
 * Wave A — Platform admin route security tests (SA-005)
 *
 * Read-only contract tests. They verify that every `/api/platform-admin/*`
 * endpoint declares `requirePlatformAdmin` as its first middleware.
 * requireAdmin is NOT sufficient: it short-circuits for any garage-level ADMIN,
 * so it would let every garage owner control the cross-tenant platform control
 * plane.
 *
 * Phase E extracted these routes out of the monolith into
 * `server/modules/administration`; this contract now targets the module's
 * router (paths are mount-relative, i.e. without the `/api` prefix). The
 * security guarantee is unchanged: `requirePlatformAdmin` first on every route.
 *
 * Acceptance criteria (SA-005):
 *  - Every platform-admin endpoint declares `requirePlatformAdmin` as middleware
 *  - No platform-admin endpoint uses only `isAuthenticated` or `requireAdmin`
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Platform admin route security (SA-005)', () => {
  const modulePath = path.resolve(process.cwd(), 'server/modules/administration/index.ts');
  const source = fs.readFileSync(modulePath, 'utf-8');
  const legacyRoutesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const legacySource = fs.readFileSync(legacyRoutesPath, 'utf-8');

  // Mount-relative paths (router is mounted at /api).
  const platformAdminRoutes = [
    '/platform-admin/stats',
    '/platform-admin/garages',
    '/platform-admin/garages/:id/status',
    '/platform-admin/suppliers',
    '/platform-admin/support-tickets',
    '/platform-admin/support-tickets/:id',
    '/platform-admin/system-health',
    '/platform-admin/garage-applications',
    '/platform-admin/garage-applications/:id/approve',
    '/platform-admin/garage-applications/:id/reject',
    '/platform-admin/subscription-requests',
    '/platform-admin/subscription-requests/:id/approve',
    '/platform-admin/subscription-requests/:id/reject',
  ];

  for (const routePath of platformAdminRoutes) {
    it(`${routePath} uses requirePlatformAdmin as its first middleware`, () => {
      const escaped = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const routeRegex = new RegExp(
        `router\\.(get|post|patch|put|delete)\\(\\s*['"]${escaped}['"]\\s*,\\s*([^,\\n]+)`,
      );
      const match = source.match(routeRegex);
      expect(match, `Route ${routePath} not found in the administration module`).not.toBeNull();
      const middleware = match![2].trim();
      expect(
        middleware,
        `${routePath} must use requirePlatformAdmin, found: ${middleware}`,
      ).toBe('requirePlatformAdmin');
    });
  }

  it('no /api/platform-admin/* handlers remain in the legacy monolith', () => {
    expect(legacySource).not.toMatch(/app\.(get|post|patch|put|delete)\(['"]\/api\/platform-admin\//);
  });
});
