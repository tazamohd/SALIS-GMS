<!-- Sync Impact Report
Version Change: (template) → 1.0.0
Modified Principles: N/A (initial ratification — replaced the unfilled spec-kit template and
  the example "Tweeter Constitution" sample appended from spec-kit-extensions docs)
Added Sections: Core Principles (I–VII), Technical Constraints, Development Workflow &
  Quality Gates, Governance
Removed Sections: Tweeter example content (character limits, Tweeter performance standards)
Templates Requiring Updates:
- .specify/templates/plan-template.md: ✅ Constitution Check gate is generic; derives gates
  from this file at plan time
- .specify/templates/spec-template.md: ✅ compatible, no mandatory-section changes
- .specify/templates/tasks-template.md: ✅ supports all workflow task categories
- CLAUDE.md: ✅ references this constitution and mirrors Principles II, III, IV, V, VI
Follow-up TODOs: None
-->

# SALIS AUTO Constitution

## Core Principles

### I. Specification-First Development
Every new feature MUST begin with a formal specification via `/speckit-specify` before any
implementation. Specifications define the "what" and "why"; plans (`/speckit-plan`) define
the "how"; tasks (`/speckit-tasks`) define the order. No feature code shall be written
without an approved spec articulating user scenarios, requirements, and success criteria.
Lifecycle work (bug fixes, modifications, refactors, hotfixes, deprecations) MUST use the
matching extension workflow rather than the feature path (see Principle VII).

### II. Multi-File Decomposition
Work MUST be decomposed into small, focused files instead of growing existing ones:

- The legacy monoliths `server/routes.ts` and `server/storage.ts` are frozen — additions
  to them are PROHIBITED. New or changed endpoints live in modular
  `server/routes/*.routes.ts` files registered in `server/routes/index.ts`.
- Non-trivial business logic belongs in `server/services/`; database schema changes belong
  in `shared/schema.ts` (the single source of truth for Drizzle + Zod types).
- New files SHOULD stay under ~300 lines; when a file outgrows a single responsibility it
  MUST be split.
- Frontend: one page component per route in `client/src/pages/`; reusable pieces are
  extracted to `client/src/components/`.

Rationale: the codebase is mid-migration from a 40K-line monolith; every change must move
toward modularity, never away from it.

### III. Test-Backed Changes
Every new or modified API endpoint MUST have integration tests (Vitest + Supertest against
PostgreSQL) in `server/routes/__tests__/` or `server/__tests__/`. Bug fixes MUST add a
failing regression test before the fix is applied. Refactors MUST keep existing tests
passing unchanged. The full relevant test target (`test:server`, `test:integration`, or
`npm test`) MUST pass before work is declared complete.

### IV. Validated and Authorized API Surface
Every endpoint MUST validate request bodies with Zod schemas from `@shared/schema` and
return sanitized validation errors — raw Zod output MUST NOT reach clients. Protected
routes MUST be guarded with the appropriate middleware (`isAuthenticated`, `requireRole()`,
`requirePlan()`, `validate()`). No endpoint ships without an explicit authorization
decision recorded in its route module.

### V. Internationalization and Compliance Integrity
All user-facing strings MUST go through i18next with keys present in BOTH
`client/src/i18n/en.json` and `ar.json`; Arabic RTL rendering MUST not be broken by new
UI. Financial logic MUST use the shared compliance utilities — VAT (15% KSA) via
`shared/vatUtils.ts`, ZATCA e-invoicing via `shared/zatcaUtils.ts`, Hijri dates via
`shared/hijriUtils.ts`. Hand-rolled tax, invoice-QR, or calendar math is PROHIBITED.

Rationale: Saudi market compliance is a product guarantee; a single inconsistent VAT
rounding or malformed ZATCA QR is a legal defect, not a cosmetic bug.

### VI. Post-Implementation Review
Before any work is declared done, the implementer MUST:

1. Run `npm run check` — zero TypeScript errors (strict mode is non-negotiable).
2. Run `npm run lint` and the relevant test target.
3. Re-read the full diff verifying: no additions to legacy monoliths, validation and RBAC
   on every new endpoint, i18n keys in both locales.
4. Report results honestly — failing tests or skipped steps MUST be stated, never glossed
   over.

### VII. Workflow Selection
Development activities MUST use the workflow matching the nature of the work:

- **Feature Development** (`/speckit-specify`): new functionality — full spec, plan, tasks
- **Bug Fixes** (`/speckit.bugfix`): defect remediation — regression test BEFORE fix
- **Modifications** (`/speckit.modify`): changes to existing features — impact analysis and
  backward-compatibility assessment
- **Refactoring** (`/speckit.refactor`): code quality — baseline metrics, behavior
  preservation, incremental validation
- **Hotfixes** (`/speckit.hotfix`): production emergencies — expedited process, rollback
  plan, mandatory post-mortem within 48 hours
- **Deprecation** (`/speckit.deprecate`): feature sunset — phased rollout
  (warnings → disabled → removed), migration guide, stakeholder approval

The wrong workflow SHALL NOT be used: features must not bypass specification, bugs must
not skip regression tests, refactorings must not alter behavior.

## Technical Constraints

- **Stack**: React 18 + Vite + TypeScript (strict) frontend; Express (ESM TypeScript)
  backend; Drizzle ORM on PostgreSQL 16; TanStack Query v5; shadcn/ui + Tailwind;
  Vitest/Supertest and Playwright for tests. New dependencies require justification in the
  feature plan.
- **Type safety**: `npm run check` MUST report zero errors on every commit. New files MUST
  NOT use `@ts-nocheck` or `any` escapes without a written justification in the plan.
- **Database**: schema changes only through `shared/schema.ts` + drizzle-kit; no raw SQL
  outside migrations.
- **Multi-tenancy**: every new query touching tenant-scoped tables MUST filter by
  garage/branch scope; cross-tenant data leakage is a release blocker.

## Development Workflow & Quality Gates

### Core flow
1. `/speckit-specify <description>` → spec.md
2. `/speckit-clarify` (optional) to resolve ambiguities
3. `/speckit-plan` → design artifacts (gated by Constitution Check)
4. `/speckit-tasks` → dependency-ordered tasks.md
5. `/speckit-implement` → execution following task order

### Workflow-specific gates
- **Feature**: spec complete before plan; plan passes Constitution Check before tasks;
  tests written with implementation; review verifies constitution compliance.
- **Bugfix**: reproduction documented with exact steps; regression test written and failing
  before fix; root cause identified; prevention strategy defined.
- **Modification**: impact analysis identifies all affected files/contracts; original
  feature linked; backward compatibility assessed; migration path documented for breaking
  changes.
- **Refactor**: baseline metrics captured first; tests pass after EVERY incremental change;
  behavior preservation guaranteed (tests unchanged); measurable improvement shown.
- **Hotfix**: severity assessed (P0/P1/P2); rollback plan prepared before deploy; fix
  verified in production before tests are backfilled (the only sanctioned TDD exception);
  post-mortem within 48 hours.
- **Deprecation**: dependency scan run; migration guide written before Phase 1; all three
  phases complete in sequence; stakeholder approval obtained before starting.

### Documentation
- Public API changes MUST update the relevant docs under `docs/`.
- README MUST be updated for user-facing changes.
- CLAUDE.md MUST reflect architectural decisions and stay consistent with this
  constitution.

## Governance

This constitution supersedes ad-hoc practice. Amendments require a written proposal with
rationale, an impact analysis on existing features and workflows, a migration plan for
affected components, and a semantic version increment:

- **MAJOR**: backward-incompatible removals or redefinitions of principles
- **MINOR**: new principles/sections or materially expanded guidance
- **PATCH**: clarifications, wording, non-semantic refinements

Compliance verification: pull requests MUST satisfy the quality gates of their workflow
type; plan-stage Constitution Checks derive their gates from this document; reviews MUST
validate Principles II–V explicitly on every diff.

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12

### Amendment History
- **v1.0.0** (2026-06-12): Initial constitution ratified with seven core principles
  (specification-first, multi-file decomposition, test-backed changes, validated/authorized
  API surface, i18n & compliance integrity, post-implementation review, workflow selection),
  technical constraints, workflow quality gates, and governance policy.
