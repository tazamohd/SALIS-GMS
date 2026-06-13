import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

/**
 * Roles for which MFA is policy-required (FR-11). NOTE: the login flow challenges
 * for MFA whenever it is *enabled*; it does NOT yet hard-block these roles when MFA
 * is un-enrolled, because forcing enrollment mid-login would lock out existing
 * privileged users (and the test suite). Enforcing enrollment is a staged rollout
 * (enroll → grace period → require) tracked as a follow-up.
 */
const MFA_REQUIRED_ROLES = new Set(['ADMIN', 'OWNER', 'GARAGE_OWNER', 'SUPER_ADMIN', 'ACCOUNTANT']);
export function mfaRequiredForRole(role?: string | null): boolean {
  return !!role && MFA_REQUIRED_ROLES.has(role.toUpperCase());
}

const twoFaAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_2FA_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export function is2FALockedOut(userId: string): boolean {
  const entry = twoFaAttempts.get(userId);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  twoFaAttempts.delete(userId);
  return false;
}

export function record2FAFailure(userId: string): boolean {
  const entry = twoFaAttempts.get(userId) || { count: 0, lockedUntil: 0 };
  entry.count++;
  if (entry.count >= MAX_2FA_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    twoFaAttempts.set(userId, entry);
    return true;
  }
  twoFaAttempts.set(userId, entry);
  return false;
}

export function clear2FAAttempts(userId: string): void {
  twoFaAttempts.delete(userId);
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export async function generateTwoFactorSecret(userEmail: string): Promise<TwoFactorSetup> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `Garage Management (${userEmail})`,
    length: 32,
  });

  // Generate QR code data URL
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

  // Generate backup codes (10 codes)
  const backupCodes = Array.from({ length: 10 }, () =>
    generateBackupCode()
  );

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 steps before and after for clock skew
  });
}

export function verifyBackupCode(backupCodes: string[], providedCode: string): {
  valid: boolean;
  remainingCodes?: string[];
} {
  const normalizedProvided = providedCode.replace(/\s/g, '').toLowerCase();
  const codeIndex = backupCodes.findIndex(
    code => code.replace(/\s/g, '').toLowerCase() === normalizedProvided
  );

  if (codeIndex === -1) {
    return { valid: false };
  }

  // Remove used backup code
  const remainingCodes = [
    ...backupCodes.slice(0, codeIndex),
    ...backupCodes.slice(codeIndex + 1),
  ];

  return {
    valid: true,
    remainingCodes,
  };
}

function generateBackupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format as XXXX-XXXX for readability
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
