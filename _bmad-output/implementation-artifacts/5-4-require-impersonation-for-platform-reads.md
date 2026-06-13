# Story 5.4: Require audited impersonation for platform cross-tenant reads

Status: backlog

## Origin
Code review 2026-06-13 (decision-needed #2, resolved → require impersonation, deferred here).

## Story

As a Compliance officer,
I want a platform principal to reach a tenant's data ONLY through an audited impersonation session,
so that every cross-tenant access by an admin is recorded and bounded — no silent `?garageId=` reads.

## Problem

`resolveScopedGarageId` (`server/tenancy/tenant-guard.ts`) currently returns the **client-supplied** `garageId` for a platform principal:
```
if (scope.isPlatformPrincipal) return passed ?? null;
```
So an un-impersonating platform principal can read any tenant by passing `?garageId=<victim>` — bypassing the audited `/api/admin/impersonate` flow and its audit trail.

## Acceptance Criteria

1. An un-impersonating platform principal resolves to **null** garage (deny-all reads), not the passed id.
2. To read a tenant, a platform principal must start an impersonation session (Story 5.2); the resolved garage then comes from `impersonation.targetGarageId` (already supported).
3. No code path lets a platform principal scope to a garage from a request param/body without an active impersonation marker.
4. Tests: platform principal with no impersonation → empty reads; with impersonation → scoped to target + audited.

## Notes
- One-line change in `resolveScopedGarageId` (drop the `passed` fallback for platform principals), plus tests. Depends on Story 5.3 (so only true super-admins are affected).

### References
- [Source: code-review-findings-2026-06-13.md (decision #2); architecture.md#AD-2, #AD-7; prd.md#FR-10, UJ-2]
