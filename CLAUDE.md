<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

# SALIS AUTO — Garage Management System

Multi-tenant automotive ERP for garage/workshop management: customers, vehicles,
job cards, appointments, invoicing, inventory, RBAC (24 roles), analytics, and
Saudi Arabia compliance (ZATCA e-invoicing, 15% VAT, Hijri calendar, Arabic RTL).
Production-ready monolith being incrementally modularized.

## Tech stack

- **Frontend**: React 18 + Vite, TypeScript (strict), wouter routing, TanStack Query v5,
  shadcn/ui + Tailwind, React Hook Form + Zod, i18next (en/ar with RTL)
- **Backend**: Express (ESM TypeScript, run via tsx), Drizzle ORM on PostgreSQL 16,
  Passport.js session auth, WebSocket (ws), Zod validation
- **Tests**: Vitest + Supertest; Playwright in `e2e/`
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`

## Commands

```bash
npm run dev               # dev server on :5000 (tsx, hot reload)
npm run check             # tsc typecheck — must stay at zero errors
npm run lint              # ESLint
npm test                  # full Vitest suite (needs TEST_DATABASE_URL)
npm run test:server       # server/__tests__/ only
npm run test:integration  # server/routes/__tests__/ only
npm run db:push           # push shared/schema.ts to the database (drizzle-kit)
npm run db:seed           # seed test data
npm run build             # vite client + esbuild server → dist/
```

## Structure

- `client/src/pages/` — page components; `client/src/components/` — shared UI;
  `client/src/hooks/` — `useAuth`, `usePermissions`, `useCrudMutation`, etc.
- `server/routes/` — **modular route files** (`*.routes.ts`), registered in
  `server/routes/index.ts`; integration tests in `server/routes/__tests__/`
- `server/routes.ts` — **legacy 40K-line monolith fallback. Do not add to it.**
  New/changed endpoints go in a modular `server/routes/*.routes.ts` file.
- `server/storage.ts` — legacy data-access monolith (`@ts-nocheck`, mid-refactor);
  prefer focused Drizzle queries in services/route modules for new work
- `shared/schema.ts` — Drizzle schema + drizzle-zod insert/select schemas (source
  of truth for validation on both sides)
- `docs/` — extensive project docs; roadmap in `docs/01-project/development-roadmap.md`

## Conventions

- REST endpoints under `/api/*`, guarded by `isAuthenticated`, `requireRole()`,
  `requirePlan()`, and `validate()` middleware from `server/middleware/`
- Validate request bodies with Zod schemas from `@shared/schema`; return sanitized
  validation errors, never raw Zod output
- Frontend data flow: TanStack Query for reads, `useCrudMutation`/mutations with
  cache invalidation for writes; forms via React Hook Form + zodResolver
- Every user-facing string goes through i18next (`client/src/i18n/en.json` and
  `ar.json`) — never hardcode UI text
- Money/VAT math uses helpers in `shared/vatUtils.ts`; ZATCA logic in
  `shared/zatcaUtils.ts`; dates may need Hijri via `shared/hijriUtils.ts`

## Development rules

### Rule: multi-file decomposition

Decompose work into small, focused files instead of growing existing ones:

- New backend features = a modular route file + (if logic is non-trivial) a
  service in `server/services/` + schema additions in `shared/schema.ts` +
  tests in `server/routes/__tests__/`. Never extend `server/routes.ts` or
  `server/storage.ts`.
- Keep new files under ~300 lines; split by responsibility when they grow.
- Frontend: one page component per route in `client/src/pages/`; extract reusable
  pieces into `client/src/components/` rather than nesting large JSX blocks.

### Rule: post-implementation review

After implementing and before declaring work done:

1. `npm run check` — zero TypeScript errors (strict mode is non-negotiable)
2. `npm run lint` and the relevant test target (`test:server`, `test:integration`,
   or full `npm test`); new endpoints need integration tests
3. Re-read the full diff and verify: no additions to legacy monoliths, validation
   on every new endpoint, i18n keys for both `en` and `ar`, RBAC middleware on
   protected routes
4. Report results honestly — failing tests or skipped steps must be stated, not
   glossed over

## Spec-driven workflows

Spec-kit is installed (`.specify/`). Use `/speckit-specify` → `/speckit-plan` →
`/speckit-tasks` → `/speckit-implement` for new features, and the extension
workflows for lifecycle work: `/speckit.bugfix`, `/speckit.modify`,
`/speckit.refactor`, `/speckit.hotfix`, `/speckit.deprecate`. Project principles
live in `.specify/memory/constitution.md`.
