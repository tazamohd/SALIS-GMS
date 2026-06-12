<!--
SYNC IMPACT REPORT
==================
Version change: (none / template) → 1.0.0
Bump rationale: Initial ratification of the project constitution (MAJOR baseline).

Principles defined:
  I.   Type Safety & Shared Contracts (NON-NEGOTIABLE)
  II.  Multi-Tenant Isolation & Security (NON-NEGOTIABLE)
  III. Spec-Driven, Test-Backed Changes
  IV.  Saudi Market Compliance by Default
  V.   Consistent Architecture & Design System

Added sections:
  - Core Principles (5)
  - Technology Standards & Constraints
  - Development Workflow & Quality Gates
  - Governance

Removed sections: none (initial version)

Templates / artifacts reviewed for alignment:
  ✅ .specify/templates/plan-template.md — generic "Constitution Check" gate; no hard-coded
     principles that conflict. Authors fill the gate from this file at plan time.
  ✅ .specify/templates/spec-template.md — spec stays implementation-agnostic; compliant.
  ✅ .specify/templates/tasks-template.md — task categories (tests, polish) accommodate the
     testing & compliance discipline below; no change required.
  ✅ CLAUDE.md — designated runtime guidance file; points the agent to the active plan.

Follow-up TODOs: none. RATIFICATION_DATE set to today (initial adoption).
-->

# SALIS AUTO (SALIS-GMS) Constitution

SALIS AUTO is a production, multi-tenant automotive ERP / garage management platform.
This constitution defines the non-negotiable engineering principles and quality gates that
govern every change to the codebase. It supersedes ad-hoc practice and prior convention.

## Core Principles

### I. Type Safety & Shared Contracts (NON-NEGOTIABLE)

TypeScript is used across `client/`, `server/`, and `shared/` in strict mode. `npm run check`
(`tsc`) MUST pass with zero errors before any change is merged. Data contracts are defined
**once** as Zod / drizzle-zod schemas in `shared/` and reused on both the client and the
server — a schema MUST NOT be redefined per layer. Using `any` (or equivalent casts) to bypass
the type system is prohibited; if a type is genuinely unknown, model it explicitly (`unknown`
plus narrowing) and justify it.

Rationale: A single typed contract shared end-to-end is the cheapest defense against the class
of bugs that dominate a 320+ table, 150+ page system. Zero-error `tsc` is the project's
existing, advertised quality bar ("zero TypeScript errors") and must remain enforced.

### II. Multi-Tenant Isolation & Security (NON-NEGOTIABLE)

Every tenant-scoped database query MUST enforce `garageId` tenant isolation in production code
paths. RBAC permissions MUST be checked **server-side** for every protected resource (the system
ships 24 roles across 156+ resources); client-side filtering is presentation only and never a
security boundary. `AUTH_BYPASS` is a development-only convenience and MUST NEVER be enabled in
production. Secrets and credentials are provided exclusively through environment variables and
MUST NEVER be committed to the repository.

Rationale: A multi-tenant franchise platform leaks across tenants the moment one query forgets
its scope. Centralizing authorization on the server and forbidding committed secrets keeps the
blast radius of any single mistake contained.

### III. Spec-Driven, Test-Backed Changes

New features follow the spec-kit flow: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks`
→ `/speckit-implement`. Behavior changes MUST be backed by Vitest coverage — unit tests for
logic and integration tests (under `server/routes/__tests__`) for route/contract changes.
Compliance-critical logic (ZATCA, VAT, Zakat, Hijri conversion) MUST have tests, mirroring the
existing `*.test.ts` suites in `shared/` (e.g. `zatcaUtils.test.ts`, `vatUtils.test.ts`,
`hijriUtils.test.ts`, `saudi-compliance.test.ts`).

Rationale: Specs make intent reviewable before code exists; tests make behavior durable after.
Compliance math is the one place a silent regression becomes a legal/financial liability, so it
is never shipped untested.

### IV. Saudi Market Compliance by Default

Any feature that touches invoicing, finance, or customer-facing UI MUST treat the following as
first-class requirements, not afterthoughts: ZATCA e-invoicing (QR codes), 15% VAT, Zakat at
2.5%, 15-digit TRN validation, Hijri calendar support, and Arabic RTL via `react-i18next` (with
English fallback text using the `t('namespace.key', 'English fallback')` pattern). New
user-facing strings MUST be added through i18n, not hard-coded.

Rationale: Saudi compliance and Arabic localization are core market requirements (100% Arabic
coverage is an advertised guarantee). Bolting them on after the fact reliably breaks layout,
formatting, and regulatory correctness.

### V. Consistent Architecture & Design System

Changes MUST respect the established layering (`client/` ↔ `server/` ↔ `shared/`) and the hybrid
route loader (modular routes in `server/routes/` take priority; legacy `server/routes.ts` is the
fallback). UI MUST be built from the existing 7 archetype page wrappers (StandardPageLayout,
StandardTablePage, DashboardPage, FormPage, AnalyticsPage, MobileCardPage, TabsPageLayout) and
shadcn/ui (Radix) components, and MUST honor the enforced grayscale design system with distinct
light/dark modes (avoid white backgrounds). Prefer extending an existing pattern over
introducing a new one; unjustified new abstractions are rejected (YAGNI).

Rationale: Consistency across 150+ pages is what makes the system navigable and maintainable.
Every novel pattern is a tax on every future contributor, so novelty must earn its place.

## Technology Standards & Constraints

The following stack is the project standard; deviations require an amendment (see Governance):

- **Language**: TypeScript (strict) across client, server, and shared.
- **Frontend**: React 18 + Vite, `wouter` routing, TanStack Query, shadcn/ui (Radix), Tailwind
  CSS, `react-i18next`.
- **Backend**: Express (TypeScript), hybrid route loader, passport.js LocalStrategy
  session auth, WebSocket at `/ws/chat`.
- **Database**: PostgreSQL with Drizzle ORM; schema in `shared/schema.ts`. All schema changes
  go through Drizzle migrations / `drizzle-kit push` (`npm run db:push`) — never hand-edited,
  out-of-band DDL.
- **Validation**: Zod / drizzle-zod schemas shared between client and server.
- **Testing**: Vitest (unit + integration) and Playwright (e2e).
- **Tooling**: ESLint + Prettier for lint/format.
- **Accessibility**: target WCAG 2.1 AA.
- **Delivery**: PWA support and mobile-responsive layouts MUST be maintained.

## Development Workflow & Quality Gates

Every pull request MUST pass the following gates before merge:

1. `npm run check` (`tsc`) — zero type errors (Principle I).
2. `npm run lint` (ESLint) — clean.
3. `npm test` (`vitest run`) — green, including integration tests for any route/contract change
   (Principle III).
4. Code review by at least one other contributor.

Reviewers verify compliance with every principle above. Any added complexity (new dependency,
new architectural pattern, new abstraction) MUST be justified in the PR against these principles;
unjustified complexity is grounds for rejection. Production deployments MUST confirm
`AUTH_BYPASS` is disabled and tenant `garageId` filtering is enforced (Principle II).

## Governance

This constitution supersedes all other practices and conventions. Amendments require:

1. A documented rationale (what changes and why).
2. A semantic version bump of this document (see policy below).
3. Synchronization of dependent templates and guidance
   (`.specify/templates/*`, `CLAUDE.md`) so they do not contradict the amended text.

Versioning policy (semantic):
- **MAJOR**: Backward-incompatible governance changes or removal/redefinition of a principle.
- **MINOR**: A new principle or section, or materially expanded guidance.
- **PATCH**: Clarifications, wording, and non-semantic refinements.

Compliance review: PR reviews are the primary enforcement point for this constitution. Runtime,
day-to-day development guidance for the coding agent lives in `CLAUDE.md` and the active plan;
where that guidance and this constitution conflict, this constitution wins.

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
