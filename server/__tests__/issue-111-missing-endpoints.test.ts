/**
 * Issue #111 — client pages fetched backend endpoints that returned 404.
 *
 * Source-contract tests for the fix:
 *  - GET /api/accounting/connections and /api/accounting/sync-history now exist,
 *    are auth-gated and garage-scoped, and the connections read never selects
 *    the OAuth tokens (accessToken/refreshToken must not leak to the client).
 *  - GET /api/technician-profiles/:userId no longer hard-404s when a technician
 *    has no profile row yet (it returns null so list views render an empty
 *    state), while keeping its garage-ownership check.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Issue #111 — missing/404 endpoints', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');

  function block(marker: string): string {
    const start = source.indexOf(marker);
    expect(start, `Marker ${marker} not found`).toBeGreaterThan(-1);
    const next = source.indexOf('app.', start + marker.length);
    return source.slice(start, next > start ? next : source.length);
  }

  it('adds GET /api/accounting/connections, auth-gated and garage-scoped', () => {
    const b = block("app.get('/api/accounting/connections'");
    expect(b).toMatch(/isAuthenticated/);
    expect(b).toMatch(/accountingConnections\.garageId/);
  });

  it('never returns the OAuth tokens from the connections read', () => {
    const b = block("app.get('/api/accounting/connections'");
    expect(b).not.toMatch(/accessToken/);
    expect(b).not.toMatch(/refreshToken/);
  });

  it('adds GET /api/accounting/sync-history, auth-gated and garage-scoped', () => {
    const b = block("app.get('/api/accounting/sync-history'");
    expect(b).toMatch(/isAuthenticated/);
    expect(b).toMatch(/accountingSync\.garageId/);
  });

  it('technician-profiles/:userId returns null (not 404) for a missing profile, keeping the ownership check', () => {
    const b = block("app.get('/api/technician-profiles/:userId'");
    // ownership check preserved (403 for a cross-garage requester)
    expect(b).toMatch(/status\(403\)/);
    expect(b).toMatch(/Access denied/);
    // the missing-profile-row path now returns null instead of a hard 404
    expect(b).toMatch(/res\.json\(profile\s*\?\?\s*null\)/);
    // the only remaining 404 is the target-user-existence check inside the
    // ownership guard, not the profile read itself.
    const afterProfileRead = b.slice(b.indexOf('getTechnicianProfile(userId)'));
    expect(afterProfileRead).not.toMatch(/status\(404\)/);
  });
});
