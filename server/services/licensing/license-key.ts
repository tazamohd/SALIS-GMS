/**
 * License-key signing (Phase D.1 — internal license management).
 *
 * A license key is a signed, self-describing, OFFLINE-verifiable token:
 *
 *     SALIS.<base64url(payloadJSON)>.<base64url(HMAC-SHA256)>
 *
 * The HMAC lets an on-prem/reseller instance verify authenticity and read the
 * embedded entitlements without calling home; the server still records the key
 * in the `licenses` table for online status (revocation, renewal, grace). This
 * module is PURE — the signing secret is passed in, so it is fully
 * deterministic and unit-testable; no env, no clock, no DB here.
 */

import { createHmac, timingSafeEqual } from 'crypto';

const PREFIX = 'SALIS';

export interface LicensePayload {
  /** DB license id (uuid) — the online record this key points at. */
  id: string;
  plan: string; // STARTER | PRO | ENTERPRISE
  type: string; // subscription | perpetual | trial
  /** Effective entitlement limits baked into the key at issue time. */
  limits: {
    maxUsers: number | null;
    maxBranches: number | null;
    maxGarages: number | null;
    maxVehicles: number | null;
    storageGb: number | null;
    apiQuotaPerDay: number | null;
  };
  /** ISO-8601 issue time. */
  issuedAt: string;
  /** ISO-8601 expiry, or null for a perpetual license. */
  expiresAt: string | null;
  /** Days the key stays valid past `expiresAt` / last online check. */
  offlineGraceDays: number;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function canonical(payload: LicensePayload): string {
  // Stable key ordering so the signature is reproducible.
  return JSON.stringify({
    id: payload.id,
    plan: payload.plan,
    type: payload.type,
    limits: {
      maxUsers: payload.limits.maxUsers ?? null,
      maxBranches: payload.limits.maxBranches ?? null,
      maxGarages: payload.limits.maxGarages ?? null,
      maxVehicles: payload.limits.maxVehicles ?? null,
      storageGb: payload.limits.storageGb ?? null,
      apiQuotaPerDay: payload.limits.apiQuotaPerDay ?? null,
    },
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt ?? null,
    offlineGraceDays: payload.offlineGraceDays,
  });
}

function hmac(body: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(body).digest();
}

/** Produce a signed license key for `payload`. */
export function signLicenseKey(payload: LicensePayload, secret: string): string {
  if (!secret) throw new Error('license signing secret is required');
  const body = b64url(Buffer.from(canonical(payload), 'utf8'));
  const sig = b64url(hmac(body, secret));
  return `${PREFIX}.${body}.${sig}`;
}

export interface VerifyResult {
  valid: boolean;
  reason?: string;
  payload?: LicensePayload;
}

/**
 * Verify a key's structure + signature (NOT its expiry — expiry/grace is a
 * time-dependent policy the caller evaluates against its own clock). Uses a
 * constant-time comparison so a bad key leaks no timing signal.
 */
export function verifyLicenseKey(key: string, secret: string): VerifyResult {
  if (!secret) return { valid: false, reason: 'no signing secret' };
  if (typeof key !== 'string') return { valid: false, reason: 'malformed key' };
  const parts = key.split('.');
  if (parts.length !== 3 || parts[0] !== PREFIX) return { valid: false, reason: 'malformed key' };
  const [, body, sig] = parts;

  const expected = hmac(body, secret);
  let given: Buffer;
  try {
    given = Buffer.from(sig, 'base64url');
  } catch {
    return { valid: false, reason: 'bad signature encoding' };
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { valid: false, reason: 'signature mismatch' };
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as LicensePayload;
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'unparseable payload' };
  }
}
