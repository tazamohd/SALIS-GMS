# CLAUDE.md

Guidance for Claude Code (and new engineers) working in this repo. Keep it short and current.

SALIS-GMS / SALIS AUTO — a multi-tenant garage / auto-workshop management platform for the Saudi market (ZATCA e-invoicing, 15% VAT, Hijri dates, Arabic + English). TypeScript monorepo: React SPA (`client/`), Express API (`server/`), shared code (`shared/`).

Full system overview: **`docs/ARCHITECTURE.md`** — read it before large changes.

## Commands

```bash
npm run dev      # API + Vite (one process) — server/index.ts
npm run check    # tsc, no emit
npm test         # vitest (server tests boot the FULL route tree)
npm run build    # vite build + esbuild server bundle -> dist/
npm run db:push  # drizzle-kit push (apply shared/schema.ts to the DB)
npm run db:seed  # tsx server/seed.ts
```

Tests need Postgres. On Windows (and in CI) embedded-postgres can't bind, so set
`TEST_DATABASE_URL` to a real Postgres and the suite uses it:
```bash
TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5432/salis_test npm test
```
`server/__tests__/globalSetup.ts` drops/recreates the `public` schema each run and
seeds an ENTERPRISE subscription so `requirePlan` routes don't 402.

## Things that will bite you

- **Hybrid router, registration order matters.** `server/routes/index.ts` mounts ~50
  modular routers (`server/routes/*.ts`) **first**, then the `server/routes.ts`
  monolith (~22k lines) **last**. Express runs the **first** matching handler, so
  modular wins over monolith, and within the monolith the **earlier line wins**.
  Adding an endpoint that already exists elsewhere silently does nothing. Prefer
  adding new endpoints as modular routers. (Duplicate-route debt is tracked in #35.)
- **All DB access goes through `server/storage.ts`** — the `storage` singleton
  (`DatabaseStorage implements IStorage`). Don't query Drizzle directly from routes.
  Watch for duplicate method names colliding across features (the #32 class of bug).
- **Multi-tenancy:** scope data by `garageId` from `req.user`, never from the request body.
- **`shared/` must be browser-safe** — it's imported by the client. Guard `process.env`
  behind `typeof process !== "undefined"` (see `shared/plans.ts`). `shared/schema.ts`
  (406 tables) is the single source of truth for DB + types.
- **Integrations are env-gated and constructed at import.** Stripe/PayPal/OpenAI/Twilio/
  etc. must not throw when their env var is unset (tests boot the full route tree).
  Guard with placeholder keys; `server/paypal.ts` is a vendor-locked snippet — do not edit it.
- **Auth:** passport local + express-session in Postgres. `SESSION_SECRET` is required
  (unset = every login 500s). RBAC in `rbac-*.ts`; plan gating in `middleware/requirePlan.ts`.

## Conventions

- Work on a branch; open PRs as **draft**. Don't push to `main` directly.
- **`main` is branch-protected:** requires the `Build, Lint & Test` and
  `Vitest (Postgres 16)` checks, plus a non-author approval. On a solo repo the
  approval can't be met by the API, so merges go through the repo owner's
  **admin override** in the GitHub UI.
- CI: `.github/workflows/test.yml` runs build + tests against a Postgres 16 service container.
- Verify before claiming done: `npm run check`, `npm run build`, and `npm test`
  (with `TEST_DATABASE_URL`) all pass — 227 tests at last count.

## Known debt

- Duplicate route registrations in `routes.ts` (#35) and the hybrid-router shadowing.
- A few server files still carry `@ts-nocheck` (parts of the engine, business-intelligence).
- ESLint isn't migrated to flat config (`eslint.config.js`), so `npm run lint` is a no-op.
