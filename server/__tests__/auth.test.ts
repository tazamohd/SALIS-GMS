/**
 * Wave A — Authentication tests (SA-009)
 *
 * Tests SESSION_SECRET validation in `server/auth.ts`.
 * Does not require a running server or database.
 *
 * Acceptance criteria (SA-009):
 *  - In production, missing SESSION_SECRET throws a clear FATAL error
 *  - In production, SESSION_SECRET shorter than 32 chars throws a clear FATAL error
 *  - In development, missing SESSION_SECRET warns but does not throw
 *  - 32-character SESSION_SECRET is accepted
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../db', () => ({ db: {}, pool: {} }));
vi.mock('../storage', () => ({ storage: {} }));
vi.mock('connect-pg-simple', () => ({
  default: () => function PgStore() {
    return {};
  },
}));

describe('SESSION_SECRET validation (SA-009)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.SESSION_SECRET;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws FATAL when SESSION_SECRET is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;
    vi.resetModules();

    const { validateSessionSecret } = await import('../auth');
    expect(() => validateSessionSecret()).toThrow(/FATAL.*SESSION_SECRET/);
  });

  it('throws FATAL when SESSION_SECRET is shorter than 32 chars', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'short-secret';
    vi.resetModules();

    const { validateSessionSecret } = await import('../auth');
    expect(() => validateSessionSecret()).toThrow(/at least 32 characters/);
  });

  it('accepts SESSION_SECRET of exactly 32 characters', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SESSION_SECRET = 'a'.repeat(32);
    vi.resetModules();

    const { validateSessionSecret } = await import('../auth');
    expect(() => validateSessionSecret()).not.toThrow();
    expect(validateSessionSecret()).toBe('a'.repeat(32));
  });

  it('warns in development when SESSION_SECRET is missing but does not throw', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SESSION_SECRET;
    vi.resetModules();

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { validateSessionSecret } = await import('../auth');
    expect(() => validateSessionSecret()).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SESSION_SECRET'));

    consoleSpy.mockRestore();
  });
});