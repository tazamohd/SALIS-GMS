# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this is

**SALIS-GMS** ("SALIS AUTO") is a multi-tenant automotive ERP / garage management
system with Saudi-market compliance (VAT, ZATCA e-invoicing, Hijri calendar, Arabic
RTL). It is a single TypeScript monorepo with three source roots:

- `client/` — React 18 + Vite SPA (TanStack Query, wouter, shadcn/ui, Tailwind, i18next).
- `server/` — Express API (Passport sessions, Drizzle ORM, WebSocket, Postgres).
- `shared/` — code imported by both sides: Drizzle schema (`schema.ts`), Zod validators,
  and pure utils (`vatUtils.ts`, `zatcaUtils.ts`, `hijriUtils.ts`).

Path aliases (see `tsconfig.json`): `@/*` → `client/src/*`, `@shared/*` → `shared/*`.

## Commands

```bash
npm run dev        # tsx server/index.ts (serves API + Vite client) on PORT (default 5000)
npm run build      # vite build (client) + esbuild (server → dist/)
npm start          # run the production bundle
npm run check      # tsc — type-check (no emit)
npm run lint       # eslint .
npm run format     # prettier --write
npm test           # vitest run (whole suite)
npm run test:server       # server/__tests__ only
npm run test:integration  # server/routes/__tests__ only
npm run test:coverage     # vitest with coverage
npm run db:push    # drizzle-kit push (sync schema to DB)
npm run db:seed    # tsx server/seed.ts
```

## Environment

`server/config.ts` is the single source of truth. It loads `.env`, **hard-requires**
`DATABASE_URL` and `SESSION_SECRET` (process exits if missing), and treats everything
else as optional. Copy `.env.example` → `.env` to start.

Optional integrations are **off by default** and fall back to mock data / 503 when their
key is absent. At boot (non-test) `config.ts` prints which are disabled. They are:
Stripe, OpenAI (AI repair guide / insights / recommendations), Twilio SMS, GetResponse,
TecDoc parts, ZATCA e-invoicing. Statistical "AI" endpoints (predictions, forecasting,
analytics, productivity) aggregate from the DB and need **no** key.

## Tests

- Runner: **Vitest** (`vitest.config.ts`); E2E: **Playwright** (`e2e/`, `playwright.config.ts`).
- Server/integration tests need Postgres. Locally they use `embedded-postgres`; set
  `TEST_DATABASE_URL` to point at a real DB instead (required on Windows). **Tests
  DROP/CREATE the public schema — never point this at your dev DB.**
- CI (`.github/workflows/test.yml`) spins up Postgres 16, runs `drizzle-kit push --force`,
  then `npm test`.
- Tests live in `server/__tests__/`, `server/routes/__tests__/`, `shared/*.test.ts`, `e2e/`.

## Server architecture — the hybrid router (important)

`server/routes/index.ts` `registerRoutes()` is the real entry point. The API is **mid-
migration** from one giant monolith into per-domain modules:

- **Modular routes** (`server/routes/*.routes.ts`, plus many feature routers) are mounted
  **first** so they take priority.
- **Legacy monolith** `server/routes.ts` (~22k lines) is mounted **last** as a fallback
  and still serves the majority of endpoints.

Consequences to respect when editing:
- Some modular files are **intentionally NOT mounted** because they would shadow working
  DB-backed monolith handlers — see the comment blocks in `routes/index.ts` (e.g.
  `misc.routes.ts` TODO stubs, `estimates.ts`/`supplier-portal.ts` in-memory demo stores).
  Don't blindly mount them; make the modular file DB-backed (`storage.*`) first.
- `server/storage.ts` (~12k lines) is the data-access layer over Drizzle. `shared/schema.ts`
  (~11k lines) defines all tables; change schema there, then `npm run db:push`.
- Auth is Passport local + sessions (`server/auth.ts`); `setupAuth` runs once and the
  legacy router skips re-init via `markAuthInitialized()`.

## Multi-tenancy

Data is scoped by `garageId` (pulled from `req.user`). Note: in **dev**, some queries
return all records when `garageId` is absent — production paths must enforce the guard.
When adding queries, scope by tenant and validate request bodies with Zod (use
`insert*Schema` from `shared/schema.ts`; avoid raw `{ ...req.body }` spreads).

## Conventions

- TypeScript strict mode is on. Keep `npm run check` clean.
- Match existing module style: feature routers export a router; `*.routes.ts` use the
  `insert*Schema.omit(...)` validation pattern (see `jobcards.routes.ts`).
- Prettier: single quotes, semicolons, trailing commas, width 100 (`.prettierrc`).
- i18n: every user-facing string goes through i18next; keep `client/src/i18n/locales/en.json`
  and `ar.json` in parity (Arabic is RTL).

## Working agreements

- Branch for changes; do not commit to `main`. Run `npm run check`, `npm run lint`, and
  `npm test` before pushing.
- Before deleting/mounting a route module, read the `routes/index.ts` comments explaining
  why it's in its current state.
