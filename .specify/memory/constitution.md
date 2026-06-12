<!--
SYNC IMPACT REPORT
==================
Version: (none) → 1.0.0
Rationale: Initial ratification. Seeded from the SALIS-GMS codebase (package.json,
tsconfig, shared/ and server/ layout) rather than placeholders.

Principles defined:
  1. Type Safety & Shared Contracts
  2. Database Access via Drizzle Only
  3. Test Discipline
  4. Security, Auth & RBAC
  5. Saudi Compliance Is Non-Negotiable
  6. Internationalization Parity (en/ar)
  7. Architecture Boundaries
  8. Quality Gates Before Merge

Templates / dependent artifacts to keep in sync:
  - .claude/skills/speckit.plan/templates/plan-template.md  (Constitution Check section)
  - .claude/skills/speckit.specify/templates/spec-template.md
  - .claude/skills/speckit.tasks/templates/tasks-template.md
  - .claude/README.md (quick start references this file)

Follow-ups: none outstanding.
-->

# SALIS-GMS Constitution

**Project:** SALIS-GMS — Garage / workshop management system for the Saudi market
**Version:** 1.0.0  ·  **Ratified:** 2026-06-12  ·  **Last amended:** 2026-06-12

This document is the project's "source of law." When agent guidance, habit, or a
quick fix conflicts with a principle below, the principle wins. Amend it with
`/01-speckit.constitution` rather than working around it.

---

## Core Principles

### 1. Type Safety & Shared Contracts
- TypeScript runs in `strict` mode (`tsconfig.json`). `npm run check` (`tsc`) MUST pass.
- Do not introduce `any` or non-null `!` to silence the compiler; fix the type.
- Data shapes have a **single source of truth** in `shared/` — Drizzle tables in
  `shared/schema.ts`, validated with `zod` / `drizzle-zod`. Client and server both
  import from there; do not hand-redeclare shapes.
- Use the path aliases `@/*` (client) and `@shared/*` (shared). No deep relative
  `../../../` imports across the client/server/shared boundary.

### 2. Database Access via Drizzle Only
- All persistence goes through Drizzle ORM (Neon serverless Postgres). **No raw SQL
  string-building in route handlers.**
- Schema changes happen in `shared/schema.ts`, applied via `drizzle-kit`
  (`npm run db:push`) and the `migrations/` directory — never by hand-editing the DB.
- Keep data access in the storage/service layer (`server/storage.ts`,
  `server/services/`), not inline in controllers.

### 3. Test Discipline
- New logic ships with tests. Unit/integration via **Vitest**
  (`server/__tests__`, `server/routes/__tests__`, `shared/*.test.ts`); end-to-end via
  **Playwright** (`e2e/`).
- `npm test` (`vitest run`) MUST be green before a PR is mergeable.
- Bug fixes start with a failing test that reproduces the bug, then the fix.
- Compliance and money math (ZATCA, VAT, Hijri) MUST keep their existing unit tests
  passing and gain new ones for new cases.

### 4. Security, Auth & RBAC
- Authentication uses `bcrypt` password hashing and `express-session`
  (`connect-pg-simple`); 2FA via `speakeasy`/`qrcode`. Never weaken these.
- Protected routes MUST go through the RBAC middleware (`server/rbac-middleware.ts`)
  with roles from `server/rbac-config.ts`. Default to deny.
- Secrets come from environment variables (see `.env.example`) — never commit secrets
  and never log them. Respect `server/auditMiddleware.ts` for sensitive actions.

### 5. Saudi Compliance Is Non-Negotiable
- ZATCA e-invoicing, VAT, and Hijri/Gregorian handling MUST use the existing shared
  utilities (`shared/zatcaUtils.ts`, `shared/vatUtils.ts`, `shared/hijriUtils.ts`,
  `shared/saudi-compliance.ts`). Do not reinvent or inline these calculations.
- Changes touching invoicing, tax, or compliance require explicit test coverage.

### 6. Internationalization Parity (en/ar)
- All user-facing strings go through `i18next` / `react-i18next` keys — no hardcoded
  display text in components.
- English and Arabic keys MUST stay at parity; UI must remain RTL-safe for Arabic.

### 7. Architecture Boundaries
- Respect the `client/` · `server/` · `shared/` separation. Shared types/logic live in
  `shared/`; browser-only code never leaks into `server/` and vice versa.
- Client server-state goes through **TanStack Query**; routing via **wouter**.
- UI is built from the existing Radix/shadcn primitives + Tailwind — extend the
  component system, don't introduce a competing UI library.

### 8. Quality Gates Before Merge
- `npm run lint` (ESLint) and `npm run format` (Prettier) clean; `tsc` and `vitest`
  green.
- Prefer minimal, focused diffs. Don't refactor unrelated code in a feature PR.
- New env vars are documented in `.env.example`.

---

## Development Workflow

Features follow the Spec-Driven Development pipeline in `.claude/`:

```
/01-speckit.constitution   (this file — establish/amend the rules)
/02-speckit.specify        → spec.md on a NNN-short-name branch
/03-speckit.clarify        → resolve ambiguities
/04-speckit.plan → /05-speckit.tasks → /06-speckit.analyze
/07-speckit.implement
/11-speckit.validate       → confirm implementation matches spec
```

For static analysis, testing, and review, **prefer the native Claude Code commands**
— `/security-review`, `/code-review`, `/verify`, and the repo's own
`npm run lint` / `npm run check` / `npm test` — over the overlapping
`speckit.checker` / `speckit.tester` / `speckit.reviewer` stages.

---

## Governance

- This constitution supersedes ad-hoc preferences and undocumented conventions.
- Amendments are made through `/01-speckit.constitution`, which also re-syncs the
  dependent templates. Versioning is semantic:
  - **MAJOR** — remove/redefine a principle or make a backward-incompatible governance change.
  - **MINOR** — add a new principle or materially expand guidance.
  - **PATCH** — clarifications and wording that don't change meaning.
- When the agent repeatedly makes the same mistake, fix it **here** so it can't recur,
  not just in the code.
