import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

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
