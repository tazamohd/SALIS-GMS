# Story 6.1: Extend isolation harness to high-risk endpoints + CI gate

Status: review

## Story

As an Engineer,
I want the isolation harness to cover the high-risk surfaces the code review patched,
so that those fixes are locked in and regressions are caught by CI.

## Acceptance Criteria

1. The harness asserts cross-tenant isolation on the surfaces fixed in review (exports, customer sub-resources), not just core collections/detail.
2. Runs in CI (the suite is already a required check).

## What landed
Extended `server/__tests__/tenant-isolation.test.ts` with:
- **CSV export scoping** — `GET /api/export/csv/customers` for Garage A contains A's customer and NOT B's (the whole-DB-dump leak the review fixed).
- **Customer sub-resource scoping** — `GET /api/customers/:bCustomerId/vehicles` from A excludes B's vehicle; B still sees its own.

These join the existing assertions (lists, detail-404, scoped writes, global search). The suite runs against real Postgres in CI as a required gate.

## Honest scope
"High-risk endpoint set" here = the surfaces the review actually touched. A fully parameterized sweep over *all* ~760 mutation endpoints is impractical and overlaps with Story 3.2's per-endpoint work + the RLS backstop (1.6). The CI guard (6.2) + this harness + RLS are the layered net.

### References
- [Source: epics.md#Story 6.1; code-review-findings-2026-06-13.md]

## Dev Agent Record
### File List
- M server/__tests__/tenant-isolation.test.ts
### Change Log
- 2026-06-15: Story 6.1 — harness extended over export + customer sub-resources.
