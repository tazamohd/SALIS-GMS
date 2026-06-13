# Story 4.1: MFA enrollment with recovery codes

Status: review (backend pre-existing and functional; frontend separate)

## Story

As a Garage Owner,
I want to enroll a TOTP authenticator and receive recovery codes,
so that I can add a second factor and still regain access if I lose my device.

## Acceptance Criteria

1. Enroll → QR/secret shown; a verifying TOTP activates; single-use recovery (backup) codes issued.
2. A recovery code at login consumes it and lets the user authenticate.

## Finding: enrollment already exists

The `speakeasy` backend is complete and wired:
- `server/twoFactorAuth.ts`: `generateTwoFactorSecret` (QR + base32 secret + backup codes), `verifyTwoFactorToken`, `verifyBackupCode` (single-use; returns remaining), lockout (`is2FALockedOut`/`record2FAFailure`).
- `two_factor_auth` table (secret, isEnabled, backupCodes jsonb; unique user_id).
- Routes: `POST /api/security/2fa/setup` (QR+secret+codes), `/enable` (verify TOTP → enable), `/verify` (TOTP or backup code + lockout), `GET /status`, `DELETE /2fa`.

So AC #1 and the recovery-code consumption mechanism (AC #2) are met server-side. Story 4.2 connects backup-code consumption to the *login* path.

## Tasks / Subtasks
- [x] Verify enrollment + recovery-code backend present and functional (no change needed).
- [ ] Frontend enrollment screens — out of scope for this backend story (architecture noted UX is partial).

## Dev Notes
- Backup codes are single-use: `verifyBackupCode` returns `remainingCodes`, persisted on use. Story 4.2's `/login/mfa` consumes them during login. [Source: server/twoFactorAuth.ts, server/routes/auth.ts]

### References
- [Source: epics.md#Story 4.1; server/twoFactorAuth.ts; server/routes.ts /api/security/2fa/*]

## Dev Agent Record
### Completion Notes List
- No backend change required; documented existing capability. Frontend enrollment UX deferred.
### File List
- (none — verification only)
