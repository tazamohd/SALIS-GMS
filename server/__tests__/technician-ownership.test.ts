/**
 * Wave A — Technician ownership tests (SA-006)
 *
 * Contract tests verifying that the technician profile endpoints implement
 * cross-tenant ownership checks via garageId comparison.
 *
 * Acceptance criteria (SA-006):
 *  - GET /api/technician-profiles/:userId has ownership check
 *  - PATCH /api/technician-profiles/:userId has ownership check
 *  - Owner can always access their own profile
 *  - ADMIN can always access any profile
 *  - Non-owner, non-admin in same garage can access
 *  - Cross-garage access returns 403
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Technician ownership protection (SA-006)', () => {
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const source = fs.readFileSync(routesPath, 'utf-8');

  function getFullBlockFromMarker(marker: string): string {
    const start = source.indexOf(marker);
    expect(start, `Marker ${marker} not found`).toBeGreaterThan(-1);
    const nextRouteStart = source.indexOf('app.', start + marker.length);
    const end = nextRouteStart > start ? nextRouteStart : source.length;
    return source.slice(start, end);
  }

  const getBlock = getFullBlockFromMarker("app.get('/api/technician-profiles/:userId'");
  const patchBlock = getFullBlockFromMarker("app.patch('/api/technician-profiles/:userId'");

  it('GET /api/technician-profiles/:userId checks garage ownership', () => {
    expect(getBlock).toMatch(/currentUserId\s*!==\s*userId/);
    expect(getBlock).toMatch(/currentUserRole\s*!==?\s*['"]ADMIN['"]/);
    expect(getBlock).toMatch(/requesterGarageId/);
    expect(getBlock).toMatch(/targetGarageId/);
    expect(getBlock).toMatch(/status\(403\)/);
    expect(getBlock).toMatch(/Access denied/);
  });

  it('PATCH /api/technician-profiles/:userId checks garage ownership', () => {
    expect(patchBlock).toMatch(/currentUserId\s*!==\s*userId/);
    expect(patchBlock).toMatch(/currentUserRole\s*!==?\s*['"]ADMIN['"]/);
    expect(patchBlock).toMatch(/requesterGarageId/);
    expect(patchBlock).toMatch(/targetGarageId/);
    expect(patchBlock).toMatch(/status\(403\)/);
  });

  it('ownership check allows ADMIN role to bypass', () => {
    expect(getBlock).toMatch(/currentUserRole\s*!==?\s*['"]ADMIN['"]/);
    expect(patchBlock).toMatch(/currentUserRole\s*!==?\s*['"]ADMIN['"]/);
  });

  it('ownership check allows owner to access their own profile', () => {
    expect(getBlock).toMatch(/currentUserId\s*!==\s*userId/);
    expect(patchBlock).toMatch(/currentUserId\s*!==\s*userId/);
  });
});