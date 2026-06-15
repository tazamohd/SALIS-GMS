# CLAUDE.md — SALIS AUTO (SALIS-GMS)

Project context for AI coding agents. Read this first, every session.

## What this is

SALIS AUTO is an enterprise automotive ERP / Garage Management System. Full-stack
TypeScript monorepo with a React client, an Express API server, and a shared layer
of types/schemas/domain utilities. Heavy Saudi-Arabia compliance domain (VAT 15%,
ZATCA e-invoicing, Hijri calendar, Zakat, TRN validation, Arabic/RTL).

## Repo layout

```
client/          React 18 + Vite + wouter + TanStack Query + shadcn/ui (Radix)
  src/
    components/  UI + 7 archetype layout wrappers (StandardPageLayout, etc.)
    pages/       Route pages (~150+)
    hooks/  lib/  contexts/  i18n/  config/  styles/
    test/        Vitest setup (setup.ts)
server/          Express + TypeScript
  index.ts       Entry (tsx in dev, esbuild bundle in prod)
  routes/        Modular routes (loaded first, priority) + routes/__tests__
  routes.ts      Legacy routes (fallback)
  ai/  engine/  integrations/  middleware/  schemas/  services/  utils/  seeds/
  __tests__/     Server tests + globalSetup.ts (boots Postgres)
shared/          Cross-cutting: schema.ts (Drizzle), zod schemas, domain utils
                 (hijriUtils, vatUtils, zatcaUtils, workflows, plans, vehicleCatalogs)
migrations/      Drizzle migrations
e2e/             Playwright specs
```

Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`.

## Commands (use these exact scripts)

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Typecheck (no emit) | `npm run check` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Unit/integration tests | `npm test` (`vitest run`) |
| Watch tests | `npm run test:watch` |
| Server tests only | `npm run test:server` |
| Route integration tests | `npm run test:integration` |
| Coverage | `npm run test:coverage` |
| Coverage gate (thresholds) | `npm run coverage:gate` |
| DB push schema | `npm run db:push` |
| DB seed | `npm run db:seed` |

## Testing notes (important)

- Runner is **Vitest**, `pool: 'forks'`, `singleFork: true`. Env split by glob:
  `server/**` and `shared/**` → node, `client/**` → jsdom.
- The suite **boots the full route tree** and needs **Postgres**. Locally rely on the
  embedded/global setup; in CI a `postgres:16` service is used and
  `TEST_DATABASE_URL` / `DATABASE_URL` point at it (`npx drizzle-kit push --force`
  runs before tests).
- `vitest.config.ts` injects inert placeholders for `PAYPAL_*`, `SESSION_SECRET`, etc.
  Do not remove these — some paid integrations hard-throw at import without them.
- `server/paypal.ts` is **vendor-locked — do not edit**.

## Conventions

- TypeScript everywhere, `strict: true`. Prefer fixing types over `any`/`@ts-ignore`.
- Validation: **Zod schemas shared between client and server** (`shared/`). Reuse them.
- Modern React: function components + hooks. TanStack Query for server state.
- **Dark theme enforced** — avoid white backgrounds; grayscale design system.
- New backend routes go in `server/routes/` (modular), not `server/routes.ts` (legacy).
- RBAC is pervasive (24 roles, 156+ resources). Respect `garageId` tenant isolation —
  production must enforce it; `AUTH_BYPASS=true` is dev-only.
- Domain math (VAT, Zakat, ZATCA QR, Hijri dates) lives in `shared/*Utils.ts` and is
  **unit-tested** — change it only with tests.

## Definition of Done (every change)

1. `npm run check` passes (zero TS errors).
2. `npm test` passes (and new logic has tests — TDD preferred).
3. `npm run lint` clean for touched files.
4. Coverage does not regress below `.coverage-thresholds.json`.
5. No secrets, no edits to vendor-locked files, tenant isolation respected.

## Agent workflow

This repo uses a metaswarm-inspired orchestration layer under `.claude/`. See
`.claude/README.md` for the phase workflow, agent personas, skills, rubrics, and the
knowledge base. Start a structured task with `/start-task`.
