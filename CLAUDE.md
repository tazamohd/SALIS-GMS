# CLAUDE.md — SALIS-GMS

Orientation for AI agents (and humans) working in this repo. Read this first.

SALIS AUTO is an automotive ERP / garage management system. This file captures
the stack, layout, commands, and the **engineering workflow** every change must
follow. The workflow is enforced through the skills in `.claude/skills/` and
documented for humans in [`ENGINEERING.md`](./ENGINEERING.md).

> These conventions are adapted from the [Ring](https://github.com/LerianStudio/ring)
> agent-skills library, re-tuned from Ring's Go/Lerian stack to this repo's
> TypeScript / Express / React / Drizzle stack. See [`.claude/README.md`](./.claude/README.md)
> for the mapping.

---

## Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript (ESM, `"strict": true`, target ES2022) |
| Server | Express 4, `server/` |
| Client | React 18 + Vite, Wouter (routing), TanStack Query, Radix UI, Tailwind, `client/` |
| Shared | Zod schemas, domain utils, Drizzle table defs, `shared/` |
| ORM / DB | Drizzle ORM + Drizzle Kit, PostgreSQL (Neon serverless driver) |
| Validation | Zod (`drizzle-zod` for table→schema) |
| Tests | Vitest (forks pool, single fork), Supertest for HTTP, jsdom for client |
| Auth | Passport (local) + express-session, RBAC middleware, optional 2FA |

This is a **single-package monorepo** (one `package.json`, path aliases `@/*` →
`client/src/*`, `@shared/*` → `shared/*`).

## Layout

```
client/   React app (src/, components, pages, hooks, i18n)
server/   Express API — routes/, services/, middleware/, engine/, integrations/
shared/   Cross-cutting: schema.ts (Drizzle), zod schemas, domain utils (vat, zatca, hijri)
migrations/  Drizzle SQL migrations
e2e/      Playwright specs
docs/     Product & technical documentation
```

## Commands (use these exact scripts)

| Task | Command |
|------|---------|
| Run all tests | `npm test` (vitest run; server tests need Postgres) |
| Watch tests | `npm run test:watch` |
| Server tests only | `npm run test:server` |
| Route integration tests | `npm run test:integration` |
| Coverage | `npm run test:coverage` |
| **Typecheck** | `npm run check` (tsc, **must stay clean**) |
| Format | `npm run format` (prettier) |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Push DB schema | `npm run db:push` |
| Seed DB | `npm run db:seed` |

> `npm run lint` is declared but **eslint is not yet installed/configured** — do
> not rely on it. Typecheck (`npm run check`) is the standing static gate.

## Database for tests

Server/route tests boot the full route tree and hit a real Postgres. Set
`TEST_DATABASE_URL` (or `DATABASE_URL`) to a Postgres 16 instance, then
`npx drizzle-kit push --force` before running. CI does this automatically
(`.github/workflows/test.yml`). `shared/` tests need no DB.

---

## The non-negotiable workflow

Every code change follows this loop. Each step maps to a skill in `.claude/skills/`.

1. **Plan before non-trivial work** → `planning-features`
   Anything touching multiple files, adding a route/table, or a new feature gets
   a short written plan (PRD → TRD → task list) first. Skip only for one-line fixes.

2. **Test-Driven Development** → `test-driven-development`
   RED → GREEN → REFACTOR. Write the failing test first, watch it fail, write the
   minimum to pass, then refactor. New production code without a prior failing
   test should be deleted and rewritten test-first.

3. **Run the gated dev cycle** → `running-dev-cycle`
   Implement task-by-task. Each task is done only when: test passes, full suite
   green, `npm run check` clean, no `any` leaks, RBAC enforced on new routes.

4. **Review before merge** → `reviewing-code`
   Dispatch the parallel reviewers (correctness, security, tests) over the diff.
   Resolve every blocking finding.

5. **Commit atomically** → `committing-changes`
   Conventional Commits, one logical change per commit, no mixed concerns.

If you catch yourself skipping straight to implementation, stop and start at the
right step. "It's a small change" is the most common way bugs ship here.

## House rules

- **No `any`** as an escape hatch. Type it or use `unknown` + a Zod parse.
- **Validate all input at the boundary** with Zod before it reaches a service.
- **Every new API route is RBAC-protected.** This is an ERP with payments and PII
  (Saudi PDPL / ZATCA scope) — unauthenticated/unauthorized routes are a security bug.
- **Drizzle for all DB access.** No raw SQL string interpolation with user input.
- **Keep `shared/` framework-free.** It's imported by both client and server.
- **Saudi compliance is correctness, not a feature toggle.** VAT (15%), ZATCA
  e-invoice QR, Hijri dates, TRN validation have dedicated tested utils in
  `shared/` — reuse them, never re-derive.
- Prettier settings: single quotes, semicolons, trailing commas, width 100.
