import { describe, it, expect } from 'vitest';
import { signLicenseKey, verifyLicenseKey, type LicensePayload } from '../license-key';

const SECRET = 'test-signing-secret-at-least-32-characters-long!!';

function payload(over: Partial<LicensePayload> = {}): LicensePayload {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    plan: 'PRO',
    type: 'subscription',
    limits: { maxUsers: 15, maxBranches: 3, maxGarages: null, maxVehicles: null, storageGb: 50, apiQuotaPerDay: null },
    issuedAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2027-01-01T00:00:00.000Z',
    offlineGraceDays: 7,
    ...over,
  };
}

describe('license-key signing', () => {
  it('round-trips a payload through sign → verify', () => {
    const key = signLicenseKey(payload(), SECRET);
    expect(key.startsWith('SALIS.')).toBe(true);
    const v = verifyLicenseKey(key, SECRET);
    expect(v.valid).toBe(true);
    expect(v.payload).toMatchObject({ id: payload().id, plan: 'PRO', offlineGraceDays: 7 });
  });

  it('is deterministic for the same payload + secret', () => {
    expect(signLicenseKey(payload(), SECRET)).toBe(signLicenseKey(payload(), SECRET));
  });

  it('rejects a key signed with a different secret', () => {
    const key = signLicenseKey(payload(), SECRET);
    expect(verifyLicenseKey(key, 'a-different-secret-value-also-long-enough').valid).toBe(false);
  });

  it('detects a tampered payload (signature mismatch)', () => {
    const key = signLicenseKey(payload(), SECRET);
    const [prefix, , sig] = key.split('.');
    const forgedBody = Buffer.from(JSON.stringify({ ...payload(), plan: 'ENTERPRISE' }), 'utf8').toString('base64url');
    const forged = `${prefix}.${forgedBody}.${sig}`;
    expect(verifyLicenseKey(forged, SECRET).valid).toBe(false);
  });

  it('rejects malformed keys and empty secrets', () => {
    expect(verifyLicenseKey('not-a-key', SECRET).valid).toBe(false);
    expect(verifyLicenseKey('SALIS.only-two', SECRET).valid).toBe(false);
    expect(verifyLicenseKey(signLicenseKey(payload(), SECRET), '').valid).toBe(false);
  });

  it('throws when signing without a secret', () => {
    expect(() => signLicenseKey(payload(), '')).toThrow();
  });
});
