# CLAUDE.md — SALIS-GMS Repo Memory

> Persistent context for AI coding agents. Inspired by the `repo-bootstrap`
> pattern from [harness-craft](https://github.com/YuxiaoWang-520/harness-craft):
> durable repo facts live here so understanding survives context-window loss
> instead of hiding in chat history. Keep this file accurate; update it when
> structure, commands, or conventions change.

## What this is

**SALIS AUTO (SALIS-GMS)** — an enterprise automotive ERP / Garage Management
System. Full-stack TypeScript monorepo with a React client, an Express API
server, and a shared schema/utility layer. Strong focus on the Saudi Arabian
market (15% VAT, ZATCA e-invoicing + QR, Hijri calendar, Zakat, TRN validation,
Arabic RTL / i18n).

## Tech stack

- **Language:** TypeScript throughout (ESM, `"type": "module"`), Node 20.
- **Client:** React 18 + Vite, `wouter` (routing), `@tanstack/react-query`
  (server state), `shadcn/ui` on Radix UI, Tailwind CSS, i18next (ar/en, RTL).
- **Server:** Express 4 (TS, run via `tsx`), passport LocalStrategy +
  session auth, RBAC, WebSocket (`/ws/chat`).
- **Database:** PostgreSQL (Neon serverless driver) via Drizzle ORM;
  schema migrations with `drizzle-kit`.
- **Validation:** Zod schemas shared between client and server (`drizzle-zod`).
- **Tests:** Vitest (unit + integration), Playwright (e2e), Testing Library.
- **Integrations:** OpenAI, Stripe, PayPal, Twilio (SMS), Google APIs.

## Layout

```
client/          React app
  src/
    components/   shared UI + dialogs (shadcn/ui based)
    pages/        route-level screens (~60+ pages)
    hooks/ lib/ contexts/ config/ i18n/ styles/
server/          Express API (TypeScript, tsx)
  index.ts        entry point
  routes/         modular routes (loaded first, by priority)
  routes.ts       legacy routes (fallback)
  __tests__/      server unit tests
  services/ ai/ engine/ integrations/ middleware/ schemas/ utils/
  auth.ts rbac-*.ts storage.ts db.ts websocket.ts
shared/          code used by BOTH client and server
  schema.ts       Drizzle schema (320+ tables) — source of truth for DB
  *Utils.ts       zatca / vat / hijri / saudi-compliance helpers (+ tests)
  workflows.ts    workflow engine definitions
migrations/      Drizzle migrations
scripts/         db verify/seed, screenshot capture, i18n merge tooling
e2e/             Playwright specs (auth.spec.ts, workflow.spec.ts)
docs/            extensive numbered documentation tree (01-* … 17-*)
```

### Path aliases (`tsconfig.json`)
- `@/*`  → `client/src/*`
- `@shared/*` → `shared/*`

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (NODE_ENV=development, tsx server/index.ts) |
| Type-check | `npm run check` (`tsc`, noEmit) |
| Lint | `npm run lint` (eslint) |
| Format | `npm run format` (prettier) |
| Unit/all tests | `npm test` (`vitest run`) |
| Server tests | `npm run test:server` |
| Integration tests | `npm run test:integration` |
| Coverage | `npm run test:coverage` |
| Push schema to DB | `npm run db:push` (`drizzle-kit push`) |
| Seed data | `npm run db:seed` |
| Verify DB | `npm run db:verify` |
| Build | `npm run build` (vite build + esbuild server bundle) |

## Environment

- Copy `.env.example` → `.env`. Key vars: `DATABASE_URL`, `SESSION_SECRET`,
  integration keys (OpenAI/Stripe/PayPal/Twilio).
- **CI** (`.github/workflows/test.yml`): spins up Postgres 16, runs
  `drizzle-kit push --force`, then `npm test`. Tests need a reachable Postgres
  (`TEST_DATABASE_URL` / `DATABASE_URL`).
- `AUTH_BYPASS=true` is **development only** — never enable in production.
- `AI_INTEGRATIONS_OPENAI_API_KEY` is auto-mapped to `OPENAI_API_KEY`.

## Conventions

- `shared/schema.ts` is the **single source of truth** for the DB. Change schema
  there, derive Zod validators with `drizzle-zod`, then `npm run db:push`.
- New API routes go in `server/routes/*` (modular, priority-loaded); avoid
  growing the legacy `server/routes.ts`.
- Share validation: define Zod schemas once in `shared/` and import on both ends.
- UI is built from `shadcn/ui` archetype wrappers (StandardPageLayout,
  StandardTablePage, DashboardPage, FormPage, AnalyticsPage, MobileCardPage,
  TabsPageLayout) — reuse them rather than hand-rolling page chrome.
- Dark theme is enforced; design system is monochrome/grayscale. Avoid white
  backgrounds.
- All user-facing strings must be i18n-keyed (ar + en parity), RTL-aware.

## Verification (definition of done)

Treat a change as done only with evidence, not confidence:

1. `npm run check` passes (zero TS errors — the repo holds this bar).
2. Relevant `npm test` / `test:server` / `test:integration` are green.
3. `npm run lint` clean for touched files.
4. Schema changes: `npm run db:push` succeeds and tests still pass against it.
5. New behavior has a test; bug fixes have a regression test.

## Always-on guardrails

Lightweight rules live in [`.claude/rules/`](.claude/rules/) and apply to every
session: see `git-workflow.md`, `testing.md`, `security.md`, `code-style.md`.
