# Story 2.2: Session and cookie hardening

Status: review

## Story

As a Garage Owner,
I want my session to resist fixation and hijacking,
so that my authenticated access cannot be stolen or replayed.

## Acceptance Criteria

1. **Given** a successful login, **Then** the session id is rotated (fixation defense) and the cookie is httpOnly, secure-in-production, sameSite-set.
2. **And** the `sessions` table store is preserved and TTL enforced; WebSocket re-validates the session.
3. **And** passwords remain bcrypt-hashed at a documented work factor.

## Tasks / Subtasks

- [x] `server/auth.ts`: `regenerateAndLogin(req, user, done)` — `req.session.regenerate()` then `req.login()`, so a pre-auth session id cannot be reused post-login.
- [x] `server/routes/auth.ts`: active `/api/login` switched to a custom passport callback that calls `regenerateAndLogin` (preserves 200 + user / 401 on bad creds).

## Dev Notes

- **Fixation was the real gap.** Cookie flags were already hardened in `getSession()` (httpOnly; `secure` in production; `sameSite: 'lax'`; `maxAge` = 7d) and the PostgreSQL `sessions` store is preserved (`createTableIfMissing: false`, never dropped) with a TTL — so AC #1 (cookies) and AC #2 (store/TTL) were already met; this story adds the missing session-id rotation. [Source: server/auth.ts#getSession]
- The **active** login route is the modular `/api/login` (mounted before the legacy one); that is the path hardened. The legacy `/api/login` is shadowed. [Source: server/routes/index.ts, server/routes.ts]
- WebSocket already re-validates the session on connect (`handleAuth` checks `sessions.expire > NOW()`), satisfying AC #2 for `/ws/chat`. [Source: server/websocket.ts]
- **bcrypt work factor:** retained at `SALT_ROUNDS = 10` (documented here). Acceptable; can be raised to 12 in a follow-up (re-hashes lazily on next login). [Source: server/auth.ts]
- Validated by CI `auth.test.ts` (login returns user + set-cookie; wrong password → 401), which exercises the rotated-session login path.

### References
- [Source: architecture.md#AD-5; epics.md#Story 2.2; prd.md#FR-6]

## Dev Agent Record

### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)

### Completion Notes List
- Session-id rotation on login added via shared helper; cookie/store/TTL/WS already hardened.
- bcrypt rounds documented (10).

### File List
- M server/auth.ts
- M server/routes/auth.ts

### Change Log
- 2026-06-13: Story 2.2 — session fixation defense (id rotation on login).
