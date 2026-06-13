# Story 6.2: CI guard against unscoped tenant queries

Status: review

## Story

As an Engineer,
I want CI to fail when a tenant-isolation anti-pattern is reintroduced,
so that the leaks we just fixed cannot silently come back.

## Acceptance Criteria

1. A test fails the build if server source contains a hardcoded-tenant fallback (`garageId || '<literal>'`).
2. Zero current offenders (the guard is green on this branch).

## What landed

- `server/__tests__/tenant-scope-guard.test.ts` — walks `server/**.ts` (excluding tests) and fails on the `garageId || '<literal>'` / `.garageId || '<literal>'` patterns.
- **The guard immediately found 19 more live instances** of the same hardcoded-tenant fallback the review caught in reports/dashboard — across `routes.ts` (7), `hr-payroll` (4), `audit` (3), `predictive-maintenance` (2), `parts-recommendations` (2), `notifications` (1). All fixed (deny-with-403 when no garage context) so the guard is green.

## Honest scope

This guard covers the **concrete, zero-false-positive** anti-patterns that have actually bitten us. A full AST guard that asserts *every* tenant-table query routes through `garageScope`/`stampGarageId` (AD-2/FR-4) is a larger follow-up — tracked, because the long tail of unscoped by-id getters (estimates/PO/HR) still exists and is meant to be closed by RLS (Story 1.6) + that AST guard.

### References
- [Source: epics.md#Story 6.2; architecture.md#AD-2; code-review-findings-2026-06-13.md]

## Dev Agent Record
### File List
- A server/__tests__/tenant-scope-guard.test.ts
- M server/routes.ts, server/routes/{hr-payroll,audit,predictive-maintenance,parts-recommendations,notifications}.ts (19 fallback leaks fixed)
### Change Log
- 2026-06-13: Story 6.2 — CI guard + fixed 19 hardcoded-tenant fallbacks it surfaced.
