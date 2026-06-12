# SALIS-GMS — Project Guide for Claude

SALIS AUTO is an enterprise automotive ERP / garage-management system for the
Saudi market (full ZATCA e-invoicing, 15% VAT, Hijri calendar, Arabic RTL).
This file gives Claude the conventions to work in this repo correctly. Keep it
short and accurate — update it when conventions change.

## Stack

- **Client**: React 18 + TypeScript, Vite, **Wouter** (routing), **TanStack
  Query v5** (server state), **shadcn/ui** (Radix primitives in
  `client/src/components/ui`), Tailwind CSS, react-hook-form + Zod, i18next
  (en/ar, RTL).
- **Server**: Express (plain — **not** NestJS), Drizzle ORM on PostgreSQL
  (Neon), Passport (session auth, 2FA), `ws` WebSocket, Zod validation.
- **Shared**: `shared/` holds Drizzle schema and domain utilities used by both
  sides (VAT, ZATCA, Hijri, plans, workflows).
- **Tests**: Vitest (unit/integration), supertest (API), Testing Library
  (client, jsdom), Playwright (`e2e/`).
- **Integrations**: Stripe, PayPal, Twilio (SMS), OpenAI, Google
  Calendar/Gmail, NHTSA VIN decode.

## Layout

```
client/src/
  components/ui/   shadcn/ui primitives (Radix) — reuse these, don't reinvent
  components/      feature components (customer/, layouts/, ...)
  pages/           route pages (role-scoped: customer/, technician/, ...)
  hooks/  lib/  contexts/  config/  i18n/
server/
  routes/          domain route modules: <domain>.routes.ts, mounted in index.ts
  routes.ts        LEGACY monolith being decomposed into routes/ — don't grow it
  storage.ts       data-access monolith (has @ts-nocheck); being split by domain
  services/  middleware/  schemas/  integrations/  engine/  ai/  utils/
  rbac-config.ts  rbac-middleware.ts   role-based access control
shared/
  schema.ts        Drizzle tables + drizzle-zod insert schemas (source of truth)
  vatUtils / zatcaUtils / hijriUtils / zatcaUtils   Saudi compliance helpers
```

## Path aliases

- `@/*`  → `client/src/*`
- `@shared/*` → `shared/*`

Always import shared code via `@shared/...`, never deep relative paths across
boundaries.

## Commands (from package.json — use these exact ones)

```bash
npm run dev          # dev server (tsx server/index.ts)
npm run build        # vite build + esbuild server bundle
npm run check        # tsc type-check (no emit) — the type-check command
npm run lint         # eslint .
npm run format       # prettier write
npm run test         # vitest run (all)
npm run test:server  # vitest run server/__tests__
npm run test:integration  # vitest run server/routes/__tests__
npm run test:coverage
npm run db:push      # drizzle-kit push (apply schema)
npm run db:seed      # tsx server/seed.ts
npm run db:verify    # tsx scripts/verify-db.ts
```

> Note: there is no `db:studio` or `type-check` script despite older README
> text — use `npm run check` for type-checking.

## Conventions

### Adding/changing an API route
- Put it in the matching `server/routes/<domain>.routes.ts` and ensure it's
  mounted in `server/routes/index.ts`. Do **not** add new endpoints to the
  legacy `server/routes.ts`.
- Validate request bodies with Zod (prefer the `insert*` schemas from
  `@shared/schema`). Return JSON.
- Authenticated by default (session). Enforce permissions with the RBAC
  middleware (`server/rbac-middleware.ts`); respect the 7 roles (Super Admin,
  Garage Owner, Manager, Service Advisor, Technician, Parts Manager,
  Accountant).
- Data access goes through `server/storage.ts` (or its domain successor), not
  ad-hoc Drizzle queries scattered in routes.

### Database / schema
- `shared/schema.ts` is the single source of truth. Add tables/columns there,
  export `insert`/`select` types, then `npm run db:push`.
- Multi-tenant: most tables are scoped by garage/branch — always filter by
  tenant where applicable.

### Client
- Reuse `components/ui/*` (shadcn) primitives; style with Tailwind. Match the
  monochrome design system.
- Server state via TanStack Query (`@tanstack/react-query`); forms via
  react-hook-form + Zod resolver. Routing via Wouter (not react-router).
- All user-facing strings go through i18next; keep en + ar in sync and don't
  break RTL.
- Keep `data-testid` attributes — the suite relies on them.

### Saudi compliance (do not regress)
- VAT = 15% via `@shared/vatUtils`; ZATCA QR via `@shared/zatcaUtils`; Hijri
  dates via `@shared/hijriUtils`. Use these helpers rather than recomputing.

### TypeScript
- Strict mode is on. New code must type-check (`npm run check`). `storage.ts`
  carries a temporary `@ts-nocheck` — don't add new `@ts-nocheck`/`any` to
  other files.

### Tests
- API/integration tests live in `server/routes/__tests__/*.test.ts`; use
  `createTestApp()` and `loginAsAdmin()` from `server/__tests__`. Follow the
  existing tolerant-status pattern (e.g. `expect([200,404]).toContain(...)`).
- Run `npm run test:integration` (or `:server`) before pushing server changes;
  `npm run check` always.

## Workflow expectations
- Work on the designated feature branch; keep `routes.ts`/`storage.ts` from
  growing — move logic into domain modules instead.
- Before pushing: `npm run check` and the relevant `npm run test:*` must pass.

---
*This `.claude/` setup was adapted from patterns in
[developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit),
retuned for this repo's actual stack (React 18 + Radix, plain Express, Drizzle).*
