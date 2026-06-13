# Story 5.1: Privileged-action audit events

Status: review

## Story

As a Compliance officer,
I want privileged actions recorded in an immutable log,
so that I can demonstrate who did what, to which tenant, and when.

## Acceptance Criteria

1. A detected cross-tenant attempt produces an Audit Event with actor, action, target, Tenant Scope, timestamp.
2. Audit rows are append-only (the `audit_log` pipeline inserts only).

## Tasks / Subtasks

- [x] `server/tenancy/audit-sink.ts`: `writeIsolationLeakAudit(detail, scope)` (awaitable, via existing `logAudit`) + `persistIsolationLeak` (fire-and-forget).
- [x] Wire `recordIsolationLeakAttempt` (data-layer hook from Story 1.3) to durably persist create/update/delete leak attempts — fire-and-forget so it never blocks the operation.
- [x] `server/__tests__/isolation-audit.test.ts`: a leak write under a Tenant Scope lands an `ISOLATION_LEAK_ATTEMPT` row attributed to the user + garage, severity high.

## Dev Notes

- Reuses the existing `audit_log` pipeline (`server/services/audit-trail.ts` `logAudit`, auto-creates table; INSERT-only = append-only). [Source: server/services/audit-trail.ts]
- The data layer stays decoupled via a dynamic import of the sink; auditing failures are swallowed so they can never break the request being audited. [Source: server/tenancy/tenant-guard.ts]
- This completes the hook stubbed in Story 1.3. Broader privileged-action coverage (role changes, exports) can register through the same sink. Tamper-evidence (hash-chain) remains deferred per the PRD. [Source: prd.md#FR-9]

### References
- [Source: architecture.md#AD-7; epics.md#Story 5.1]

## Dev Agent Record
### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)
### Completion Notes List
- Isolation-leak attempts now durable + tested; reuses existing append-only audit_log.
### File List
- A server/tenancy/audit-sink.ts
- M server/tenancy/tenant-guard.ts
- A server/__tests__/isolation-audit.test.ts
### Change Log
- 2026-06-13: Story 5.1 — durable isolation-leak audit via existing pipeline.
