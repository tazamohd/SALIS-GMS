# Running the Test Suite

How to run the vitest suite locally (Windows + macOS/Linux) and in CI.

- **Test count:** 227 tests across 30 files (`server/__tests__`, `server/routes/__tests__`, `server/services/__tests__`, `shared/`, `client/`)
- **Runner:** vitest with `pool: 'forks'`, `singleFork: true`
- **DB:** real Postgres 16, schema isolation via `DROP SCHEMA public CASCADE` per run

> **TL;DR (Windows):**
> ```powershell
> $env:TEST_DATABASE_URL = 'postgresql://postgres:<password>@localhost:5432/slis_gms_test'
> npm test
> ```
> First run auto-creates `slis_gms_test` if missing.

---

## Quick start

### Windows (host Postgres)

The embedded-postgres binary fails to bind localhost on Windows (`could not bind IPv6 address "::1": Permission denied`). Use the `TEST_DATABASE_URL` escape hatch to point at a host Postgres instance instead.

```powershell
# One-time: install Postgres 16 and confirm the service is running.
# Then point the suite at it:
$env:TEST_DATABASE_URL = 'postgresql://postgres:<password>@localhost:5432/slis_gms_test'
npm test
```

URL-encode special characters in the password (e.g. `M@ssw0rd@88` → `M%40ssw0rd%4088`).

The dev DB (`slis_gms`) is **never touched** — the suite wipes and recreates `public` in `slis_gms_test`.

### macOS / Linux

`npm test` alone works — the embedded binary boots on demand. To opt into a real Postgres locally:

```bash
createdb slis_gms_test
TEST_DATABASE_URL=postgresql://postgres@localhost:5432/slis_gms_test npm test
```

### CI

`.github/workflows/test.yml` spins a `postgres:16` service container and exports `TEST_DATABASE_URL` automatically. No embedded binary involved. See [CI workflow](#ci-workflow) below.

---

## What `TEST_DATABASE_URL` does

When set, `vitest.config.ts` copies it to `DATABASE_URL` before the forked worker spawns (env propagation), and `server/__tests__/globalSetup.ts` skips the embedded-postgres path entirely.

When unset, globalSetup falls back to the embedded binary at `postgresql://postgres:postgres@localhost:5432/slis_gms` — works on Linux, broken on Windows.

---

## What globalSetup does

`server/__tests__/globalSetup.ts` runs once before any test file, in this order:

1. **Resolve DB** — `TEST_DATABASE_URL` → use it; otherwise boot embedded PG.
2. **Auto-create the DB** if missing (connects to `postgres` maintenance DB).
3. **Reset schema** — `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`. Ensures no leftover state from prior runs.
4. **Push Drizzle schema** — `npx drizzle-kit push --force` with `DATABASE_URL` set to the test URL.
5. **Seed the test garage** — one row into `garages`, plus an `ENTERPRISE` / `active` `subscriptions` row so tests can hit every `requirePlan()`-gated route.
6. **Write `.test-garage-id`** — the garage UUID, read by `server/__tests__/setup.ts` and exposed to tests as `process.env.TEST_GARAGE_ID`.

Teardown drops `public` again and stops embedded PG if it was started.

---

## How tests get an authenticated admin

`server/__tests__/helpers.ts` exports `loginAsAdmin(app)`. It:

1. Registers a fresh user via `POST /api/register`.
2. **Patches `users.garage_id`** directly in Postgres to attach the user to the seeded test garage. `/api/register` doesn't accept `garageId`, but most tenant-scoped routes pull it from `req.user.garageId`.
3. Logs in via `POST /api/login` so passport's `deserializeUser` re-reads the row.
4. Returns `{ agent, user, garageId }`.

Use it like:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "./setup";
import { loginAsAdmin } from "./helpers";

let app: Express;
let agent: supertest.Agent;
let garageId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  garageId = login.garageId;
});

it("GET /api/customers returns array", async () => {
  const res = await agent.get("/api/customers");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
```

Other helpers: `loginAsUser` (advisor role), `seedCustomer`, `seedVehicle`, `seedJobCard`, `unauthenticatedAgent`.

---

## Adding a new test

1. Place it next to existing peers:
   - **Unit / domain logic:** `shared/<name>.test.ts`
   - **API route:** `server/__tests__/<resource>.test.ts` (preferred) or `server/routes/__tests__/<resource>.test.ts`
   - **Service module:** `server/services/__tests__/<service>.test.ts`
2. For HTTP tests, **always use supertest against `createTestApp()`** — never `fetch('http://localhost:5000')`. The dev server isn't running during tests.
3. For routes behind `isAuthenticated`, use `loginAsAdmin(app)` from `helpers.ts`.
4. Name the file `*.test.ts` — vitest's `include` glob picks it up automatically.

---

## CI workflow

`.github/workflows/test.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: slis_gms_test
    ports: ['5432:5432']
    options: --health-cmd "pg_isready -U postgres" --health-interval 10s ...

env:
  TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/slis_gms_test
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/slis_gms_test
  SESSION_SECRET: ci-test-secret-not-used-for-anything-real-just-needs-to-exist

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with: { node-version: 20, cache: npm }
  - run: npm ci
  - run: npx drizzle-kit push --force
  - run: npm test
```

What passes on Windows passes in CI — same code path, same DB engine, same schema.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `could not bind IPv6 address "::1": Permission denied` | Embedded PG fallback on Windows | Set `TEST_DATABASE_URL` (see Quick start) |
| `password authentication failed for user "postgres"` | Wrong creds in `TEST_DATABASE_URL` | URL-encode special chars (`@` → `%40`) |
| `database "slis_gms_test" does not exist` | Auto-create couldn't reach `postgres` maintenance DB | Manually: `CREATE DATABASE slis_gms_test;` |
| `Seed job card failed: 400 {"message":"User has no garage assigned"}` | Test registered a user without calling `loginAsAdmin` | Use `loginAsAdmin(app)` from `helpers.ts` instead of raw `POST /api/register` |
| `402 Subscription inactive` on a `requirePlan()`-gated route | Test garage missing/lower-than-required plan | globalSetup seeds `ENTERPRISE` by default; check the route's `requirePlan(...)` minimum |
| `fetch failed` | Old-style test calling `localhost:5000` without dev server | Convert to supertest against `createTestApp()` |

---

## Known follow-ups

Two real backend bugs are currently tolerated in tests with `[200, 500]` assertions and `TODO` comments — fixing the handler will let the test enforce the stricter shape:

1. **`GET /api/forecasting/demand` 500s on empty data sets.**
   Source: `server/ai/business-intelligence.ts#getPartsForecastSnapshot`. The `LEFT JOIN sparePartInventories ... WHERE sparePartInventories.garageId = $1` collapses the outer join because the WHERE filters NULL right-side rows. Likely needs the predicate moved into the join condition or a `COALESCE`/`OR garage_id IS NULL` guard.
   Test reference: `server/__tests__/completed-pages-authed.test.ts` (forecasting block).

2. **`POST /api/payments` occasionally 400s on `insertPaymentSchema` validation** when the invoice was seeded via `/api/invoices/from-job/:id`. The fallback invoice creation in `server/__tests__/payments.test.ts` produces rows that don't always match the payment schema's shape expectations.
   Test reference: `server/__tests__/payments.test.ts` (CRUD block).

Once either is fixed, drop the `400`/`500` from the test's `expect([...]).toContain(...)` array.

---

## Reference

- `vitest.config.ts` — vitest configuration, `TEST_DATABASE_URL → DATABASE_URL` shim
- `server/__tests__/globalSetup.ts` — DB lifecycle (resolve, reset, push, seed, teardown)
- `server/__tests__/setup.ts` — per-test-file `createTestApp()` + `.test-garage-id` reader
- `server/__tests__/helpers.ts` — `loginAsAdmin`, seed helpers
- `.env.example` — `TEST_DATABASE_URL` documentation
- `.github/workflows/test.yml` — CI configuration
- [TESTING_STRATEGY_GUIDE.md](./TESTING_STRATEGY_GUIDE.md) — higher-level testing philosophy and pyramid
