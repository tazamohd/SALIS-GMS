---
name: planning-features
description: Pre-development planning for SALIS-GMS — produce a short written spec (problem, scope, then technical design and an ordered task list) before writing code. Use before any feature or change that touches multiple files, adds an API route or DB table, or introduces a new module. Two tracks — Small (lightweight) and Large (full PRD/TRD). Plans only, no edits. Skip for one-line fixes and obvious bugfixes with a known cause.
---

# Planning Features (SALIS-GMS)

Adapted from Ring's pre-dev planning (pm-team). Think before coding. The output
is a written artifact the dev cycle consumes — not architecture astronomy.

## Pick a track

| | **Small Track** | **Large Track** |
|--|------------------|-----------------|
| When | < ~2 days, reuses existing patterns, no new DB table/dependency | Multi-day, new tables/modules/integrations, cross-cutting |
| Gates | Research → PRD → Plan | Research → PRD → TRD → Plan |

If unsure, start Small; escalate to Large when you discover a new table,
external integration, or multi-service change.

## Gate 0 — Research (both tracks)

Ground the work in the actual codebase first. Cheap and prevents reinvention.
- Where does similar logic already live? (`server/routes/`, `server/services/`,
  `shared/`). Cite `file:line`.
- Which `shared/` schemas/utils apply? (Drizzle tables in `shared/schema.ts`,
  Zod schemas, compliance utils).
- What RBAC roles/permissions are relevant (`server/rbac-config.ts`,
  `rbac-middleware.ts`)?
- Existing tests that cover the area (so you extend, not duplicate).

## Gate 1 — PRD (WHAT & WHY, technology-free)

Keep it to a screen. Capture:
- **Problem** — what's broken/missing and for whom (garage owner, technician,
  fleet manager, cashier, ...).
- **In scope** / **Out of scope** — explicit bullets.
- **Functional requirements** — numbered.
- **Acceptance criteria** — testable statements ("Given/When/Then" or
  "GET /api/x returns ...").

No frameworks, schemas, or endpoints here yet.

## Gate 2 — TRD (HOW) — Large Track, or whenever there's a schema/API change

- **Data model**: new/changed Drizzle tables in `shared/schema.ts`, columns,
  indexes, relations, migration plan (`migrations/` via drizzle-kit).
- **API surface**: routes, methods, request/response Zod schemas, status codes,
  required RBAC role per route.
- **Services**: where business logic lives (`server/services/`), reused utils.
- **Client**: pages/components, TanStack Query keys, i18n/RTL impact.
- **Compliance**: VAT/ZATCA/Hijri/TRN touchpoints → reuse `shared/` utils.
- **Risks & edge cases**.

## Gate 3 — Plan (ordered task list)

Decompose into small, independently testable tasks the dev cycle runs one by one:

```
## Plan: <feature>
1. shared: add Zod schema + Drizzle table for X  (test in shared/)
2. server: POST /api/x route + service, RBAC requireRole('manager')  (test server/__tests__/x.test.ts)
3. server: GET/list with garageId scoping  (test)
4. client: X form page wired to TanStack Query mutation
5. client: list view + i18n strings (en/ar)
```
Each task should be: one concern, has a clear test, ships behind the gates in
`running-dev-cycle`.

## Output

Write the artifact to `docs/01-project/plans/<feature>.md` (or inline in the PR
description for Small Track). Then hand off to `running-dev-cycle`.

## This skill does not write code. Plan only.
