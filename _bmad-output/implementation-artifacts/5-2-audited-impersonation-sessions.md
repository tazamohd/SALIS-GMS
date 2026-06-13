# Story 5.2: Audited impersonation sessions

Status: review

## Story

As a Super Admin,
I want to support a tenant through an explicit, scoped, audited impersonation session,
so that support is possible without becoming an unaudited cross-tenant backdoor.

## Acceptance Criteria

1. **Given** a Platform Principal starts impersonation scoped to a garage, **Then** start/stop are Audit Events and, while active, every action carries the target garage scope and cannot exceed it.
2. Start and stop are recorded; status is queryable.

## Tasks / Subtasks

- [x] `server/routes/impersonation.ts`: `POST /api/admin/impersonate` (platform principal only; validates garage; sets `session.impersonation`; audits `IMPERSONATION_START`), `POST /api/admin/impersonate/stop` (audits `IMPERSONATION_STOP`), `GET /api/admin/impersonate/status`.
- [x] Resolver wiring (`tenant-scope.ts`): a platform principal's `session.impersonation.targetGarageId` becomes `scope.impersonation`; `resolveScopedGarageId` already prefers the impersonation target, so all tenant reads/writes scope to that garage.
- [x] Mounted in `routes/index.ts` after auth, before legacy routes.
- [x] Test `impersonation.test.ts`: garaged user → 403; platform principal start/status/stop → 200 with `IMPERSONATION_START`/`STOP` audit rows.

## Dev Notes

- **Cannot exceed the target tenant:** impersonation flows through the *same* `garageScope`/`resolveScopedGarageId` as everything else; the target garage simply becomes the resolved garage, so the existing isolation (Stories 1.2/1.3/1.5) bounds the impersonator to that tenant. [Source: server/tenancy/tenant-guard.ts, tenant-scope.ts]
- **Platform Principal = user with no garageId** `[ASSUMPTION]` — there is no explicit super-admin flag today; the endpoint forbids any garaged user from impersonating. Revisit if an explicit flag is added. [Source: server/routes/impersonation.ts]
- Auto-termination on session timeout is inherent: when the session expires, `session.impersonation` is gone and the next request resolves no impersonation. An explicit time-boxed auto-stop can be added later.
- Reuses the append-only `audit_log` pipeline (Story 5.1). [Source: server/services/audit-trail.ts]

### References
- [Source: architecture.md#AD-7; epics.md#Story 5.2; prd.md#FR-10, UJ-2]

## Dev Agent Record
### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)
### Completion Notes List
- Session-based impersonation + resolver wiring + start/stop audit; bounded by existing isolation.
- Platform-principal model assumed (no garageId); documented.
### File List
- A server/routes/impersonation.ts
- M server/routes/index.ts
- M server/tenancy/tenant-scope.ts
- A server/__tests__/impersonation.test.ts
### Change Log
- 2026-06-13: Story 5.2 — audited impersonation sessions.
