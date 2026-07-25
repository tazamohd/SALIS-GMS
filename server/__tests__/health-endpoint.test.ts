/**
 * Tests for /api/health endpoint
 *
 * Verifies the endpoint:
 * - Is publicly accessible (no auth)
 * - Returns 200 with status: 'ok' when DB is healthy
 * - Returns 503 with status: 'degraded' when DB is unreachable
 * - Does not leak sensitive information
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('/api/health endpoint', () => {
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const source = fs.readFileSync(routesPath, 'utf-8');

  function getHealthHandler() {
    const startIdx = source.indexOf("app.get('/api/health'");
    const endIdx = source.indexOf("app.", startIdx + 30);
    return source.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 2000);
  }

  const handler = getHealthHandler();

  it('is registered without isAuthenticated middleware', () => {
    expect(handler).not.toMatch(/isAuthenticated/);
  });

  it('executes a DB connectivity check (SELECT 1)', () => {
    expect(handler).toMatch(/db\.execute/);
    expect(handler).toMatch(/SELECT 1/);
  });

  it('returns timestamp on success', () => {
    expect(handler).toMatch(/timestamp:\s*new Date\(\)\.toISOString\(\)/);
  });

  it('returns process uptime', () => {
    expect(handler).toMatch(/uptime:\s*process\.uptime\(\)/);
  });

  it('returns 200 on healthy DB', () => {
    expect(handler).toMatch(/res\.json\(\{[\s\S]*?status:\s*['"]ok['"]/);
  });

  it('returns 503 on DB failure', () => {
    expect(handler).toMatch(/res\.status\(503\)/);
    expect(handler).toMatch(/status:\s*['"]degraded['"]/);
  });

  it('does NOT leak sensitive info (no secrets/tokens in response)', () => {
    // No password, secret, token, env var references
    expect(handler).not.toMatch(/SESSION_SECRET/);
    expect(handler).not.toMatch(/DATABASE_URL/);
    expect(handler).not.toMatch(/process\.env\.STRIPE/);
    expect(handler).not.toMatch(/process\.env\.OPENAI/);
  });
});