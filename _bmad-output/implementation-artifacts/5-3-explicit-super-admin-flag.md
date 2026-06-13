# Story 5.3: Explicit super-admin flag (replace null-garageId heuristic)

Status: backlog

## Origin
Code review 2026-06-13 (decision-needed #1, resolved → adopt explicit flag, deferred here).

## Story

As a Security officer,
I want platform-principal (super-admin) status to be an explicit account property,
so that a half-provisioned or detached account (null `garageId`) can never silently become a super-admin able to impersonate any tenant.

## Problem

Today `isPlatformPrincipal = !garageId` (`server/tenancy/tenant-scope.ts`) and the impersonation guard is `if (req.user.garageId) → 403` (`server/routes/impersonation.ts`). Any user whose `garageId` is NULL — deleted-garage FK null-out, detached staff, mid-provisioning — is treated as a platform principal everywhere and can impersonate any garage and (until Story 5.4) read any tenant via `?garageId=`.

## Acceptance Criteria

1. Add `users.is_super_admin boolean default false` (migration).
2. `isPlatformPrincipal` is derived from `is_super_admin === true`, NOT from a null `garageId`.
3. The impersonation guard requires `is_super_admin`, not "no garageId".
4. A user with a null `garageId` and `is_super_admin = false` resolves to a deny-all scope (no data), not a platform principal.
5. Migration backfills existing intended super-admins (manual list / none) — default false.
6. Tests: null-garageId non-super-admin cannot impersonate and reads nothing; an `is_super_admin` user can.

## Notes
- Touches `shared/schema.ts`, `tenant-scope.ts`, `impersonation.ts`, the `deserializeUser` enrichment (carry the flag onto `req.user`), and seeds.
- Pair with Story 5.4 (require impersonation for platform reads).

### References
- [Source: code-review-findings-2026-06-13.md (decision #1); architecture.md#AD-1; prd.md#Glossary "Platform Principal"]
