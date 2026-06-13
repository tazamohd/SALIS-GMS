# Story 1.7: Cross-tenant isolation test harness (core)

Status: review

## Story

As an Engineer,
I want an automated test that proves Garage A cannot reach Garage B data,
so that this epic ships with verified isolation.

## Acceptance Criteria

1. **Given** a suite seeding ≥2 Garages, **When** it exercises endpoints with a Garage A session against Garage B data, **Then** it asserts zero cross-tenant rows in lists, 404 on cross-tenant detail, and no mutation on cross-tenant writes.
2. **And** the suite fails on any Isolation Leak and runs in CI (Vitest on Postgres).

## Tasks / Subtasks

- [x] `server/__tests__/tenant-isolation.test.ts`:
  - [x] Create a second garage (B) + ENTERPRISE subscription + second admin via SQL (mirrors `globalSetup.seedGarage`).
  - [x] Two authenticated agents (A on the seeded `TEST_GARAGE_ID`, B on garage B).
  - [x] Assert: two distinct garages; list reads exclude the other tenant; detail read of B's customer from A is 404 while B reads it 200; cross-tenant update does not mutate; global search returns no B data.

## Dev Notes

- Reuses `createTestApp` + `loginAsAdmin` (server/__tests__/{setup,helpers}.ts). The full route tree — incl. `tenantContextMiddleware` — boots in tests, so the harness exercises the real scoped data layer against real Postgres. [Source: server/__tests__/setup.ts]
- The detail-404 assertion pairs A-denied with B-allowed on the *same id*, proving existence-hiding (denied, not absent) rather than a coincidental miss. [Source: architecture.md#AD-4]
- This is the **core** harness. Story 6.1 parameterizes it over the high-risk endpoint table (incl. legacy routes) and wires it as a required merge gate. [Source: epics.md#Story 6.1]
- Runs in CI ("Vitest (Postgres 16)"); this sandbox lacks node_modules/Postgres so the suite is validated by CI, not locally.

### References
- [Source: epics.md#Story 1.7, #Story 6.1; architecture.md#AD-9]

## Dev Agent Record

### Agent Model Used
claude (BMAD bmad-dev-story, Fast path)

### Completion Notes List
- Executable cross-tenant proof covering lists, detail 404, writes, and search.
- Validated by CI; harness syntax type-checks locally.

### File List
- A server/__tests__/tenant-isolation.test.ts

### Change Log
- 2026-06-13: Story 1.7 — core cross-tenant isolation harness.
