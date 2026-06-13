# Story 2.1: Block AUTH_BYPASS in production

Status: review

## Story

As a Security officer,
I want the application to refuse to run with authentication disabled in production,
so that there is no path to an unauthenticated production system.

## Acceptance Criteria

1. **Given** `NODE_ENV=production`, **When** the process starts with any truthy auth-disabling flag, **Then** the startup safety check fails the boot (fail-closed).
2. **And** in non-production the app boots but warns loudly on every start.
3. **And** a request without a valid session to any `/api/*` route outside the public allowlist returns 401 (existing `requireAuthByDefault` / `isAuthenticated`).

## Tasks / Subtasks

- [x] `server/config.ts`: `evaluateAuthBypass(env)` (pure, testable) over `AUTH_DISABLING_FLAGS = {AUTH_BYPASS, DISABLE_AUTH, SKIP_AUTH, NO_AUTH}`; boot block `process.exit(1)` when fatal (bypass + production), else `console.warn`. `isAuthBypassActive()` exported.
- [x] `server/__tests__/auth-bypass-guard.test.ts`: fatal in prod; warn-only in dev; clean when unset; falsy values ignored.

## Dev Notes

- **Preventive by design:** no `AUTH_BYPASS` flag is read anywhere in the codebase today (verified). This guard makes it *impossible* for a future reintroduction to be exploitable in production, satisfying FR-5 ("must make it impossible to disable authentication in production"). [Source: prd.md#FR-5]
- The decision is a pure function so it is unit-tested without the `process.exit` side effect; `config.ts` runs the side effect at import. NODE_ENV=test ⇒ never fatal, so CI/tests are unaffected. [Source: server/config.ts]
- Existing request-time enforcement (`requireAuthByDefault` deny-by-default for `/api`, `isAuthenticated`) already returns 401 for unauthenticated access (AC #3). [Source: server/middleware/defaultAuth.ts, server/auth.ts]

### References
- [Source: architecture.md#AD-5; epics.md#Story 2.1; prd.md#FR-5]

## Dev Agent Record

### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)

### Completion Notes List
- Startup guard added (fail-closed in prod, warn in dev); pure decision unit-tested (5/5 smoke) and covered in CI.

### File List
- M server/config.ts
- A server/__tests__/auth-bypass-guard.test.ts

### Change Log
- 2026-06-13: Story 2.1 — production auth-bypass guard.
