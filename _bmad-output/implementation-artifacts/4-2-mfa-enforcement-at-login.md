# Story 4.2: MFA enforcement at login

Status: review

## Story

As a Security officer,
I want users to be challenged for TOTP at login when MFA is enabled,
so that a stolen password alone cannot grant access.

## Acceptance Criteria

1. **Given** a user with MFA enabled, **When** they log in with a correct password, **Then** the session is NOT authorized until a valid TOTP (or recovery code) is provided.
2. **And** non-privileged roles may enroll optionally in v1.
3. **And** an admin-initiated MFA reset is audited. *(reset endpoint exists: `DELETE /api/security/2fa`; durable audit lands with Story 5.1)*

## Tasks / Subtasks

- [x] Two-step login in `server/routes/auth.ts`:
  - [x] `POST /api/login` — when `two_factor_auth.isEnabled`, rotate the session id and stash `pendingMfaUserId` **without** `req.login`; respond `{ mfaRequired: true }`.
  - [x] `POST /api/login/mfa` — verify TOTP or single-use backup code (reusing `twoFactorAuth.ts` + lockout); on success `regenerateAndLogin`; clears pending marker.
- [x] `mfaRequiredForRole()` policy helper (privileged roles) — documented, **not hard-enforced** (see below).
- [x] Test `server/__tests__/mfa-login.test.ts` — password alone does not authenticate when 2FA enabled; `/login/mfa` rejects wrong token and no-pending.

## Dev Notes

- **Why "required for privileged roles" is not hard-blocked yet:** forcing enrollment mid-login would lock out existing privileged users who haven't enrolled (and every `loginAsAdmin` test). The safe mechanism shipped here is *challenge-when-enabled*; hard-requiring enrollment for privileged roles is a staged rollout (enroll → grace → require) — `mfaRequiredForRole` is provided for that next step. [Source: server/twoFactorAuth.ts]
- **No regression risk to existing tests:** they never enable 2FA, so `tfa?.isEnabled` is false and login behaves exactly as before. The new test enables 2FA via a direct DB insert (no TOTP timing) to prove the gate. [Source: server/__tests__/mfa-login.test.ts]
- Completing MFA login goes through the same `regenerateAndLogin` (fixation defense) as normal login. [Source: server/auth.ts]

### References
- [Source: architecture.md#AD-8; epics.md#Story 4.2; prd.md#FR-11]

## Dev Agent Record
### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)
### Completion Notes List
- Two-step MFA login (challenge when enabled) + recovery-code path; non-flaky test.
- Privileged-role hard-enforcement deferred to a staged rollout (helper provided).
### File List
- M server/routes/auth.ts
- M server/twoFactorAuth.ts
- A server/__tests__/mfa-login.test.ts
### Change Log
- 2026-06-13: Story 4.2 — MFA challenge at login (two-step) + recovery codes.
