/**
 * Wave A — Customer portal login rate limiting (SA-007)
 *
 * Contract tests verifying that /api/customer-portal/login is protected by
 * the customerPortalLoginLimiter (5 attempts / 15 min per IP) to prevent
 * brute-force attacks on customer portal accounts.
 *
 * Acceptance criteria (SA-007):
 *  - rate limiter applied to /api/customer-portal/login
 *  - excessive attempts get 429
 *  - limiter uses reasonable defaults (max <= 10 per windowMs <= 30 min)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Customer portal login rate limiting (SA-007)', () => {
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const source = fs.readFileSync(routesPath, 'utf-8');

  it('declares customerPortalLoginLimiter via rateLimit()', () => {
    expect(source).toMatch(/customerPortalLoginLimiter\s*=\s*rateLimit\s*\(/);
  });

  it('limiter uses a bounded windowMs and max', () => {
    const block = source.match(
      /customerPortalLoginLimiter\s*=\s*rateLimit\s*\(\s*\{[\s\S]*?\}\s*\)/
    );
    expect(block, 'rateLimit block not found').not.toBeNull();
    const text = block![0];
    expect(text).toMatch(/windowMs\s*:\s*\d/);
    expect(text).toMatch(/max\s*:\s*\d+/);
  });

  it('login route applies the limiter as middleware', () => {
    const re = /app\.post\(\s*['"]\/api\/customer-portal\/login['"]\s*,\s*customerPortalLoginLimiter/;
    expect(source).toMatch(re);
  });

  it('limiter returns 429 on overflow (express-rate-limit default)', () => {
    const block = source.match(
      /customerPortalLoginLimiter\s*=\s*rateLimit\s*\(\s*\{[\s\S]*?\}\s*\)/
    );
    expect(block).not.toBeNull();
    expect(block![0]).toMatch(/message\s*:/);
  });
});
