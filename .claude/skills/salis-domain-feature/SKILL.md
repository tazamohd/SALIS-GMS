---
name: salis-domain-feature
description: >-
  Build or modify a backend domain feature in the SALIS-GMS automotive ERP as a
  full vertical slice — Drizzle table + drizzle-zod insert schema in
  shared/schema.ts, a storage method on IStorage + DatabaseStorage in
  server/storage.ts, a {domain}.routes.ts Express module, mounting in
  server/routes/index.ts, and a Vitest integration test in
  server/routes/__tests__. Use this whenever you are adding, extending, or
  fixing any server-side API endpoint, CRUD operation, database table/column,
  storage method, or "domain" in this repo — including phrasings like "add an
  endpoint for…", "create a new resource/table", "wire up the X API", "expose Y
  to the frontend", or "the route for Z returns the wrong data". It encodes the
  layering, the tenant-scoping rules, and the legacy-monolith shadowing gotcha
  that are easy to get wrong here.
---

# SALIS-GMS domain feature

SALIS-GMS (SALIS AUTO) is an automotive ERP: a React/Vite client, an Express +
TypeScript server, PostgreSQL via Drizzle ORM, and Vitest/Playwright for tests.
Backend features are built as a **vertical slice** through five layers. Touch
all the layers that a change needs and keep them consistent — a route that
calls a storage method that doesn't exist, or a storage method that reads a
column the schema never declared, is the most common way to break the build.

The layers, in dependency order:

| # | Layer | File | Responsibility |
|---|-------|------|----------------|
| 1 | Schema | `shared/schema.ts` | Drizzle table, `drizzle-zod` insert schema, exported types |
| 2 | Storage | `server/storage.ts` | DB access: method on the `IStorage` interface **and** its `DatabaseStorage` implementation |
| 3 | Route | `server/routes/{domain}.routes.ts` | HTTP handlers — validation, auth, calling `storage.*` |
| 4 | Mounting | `server/routes/index.ts` | Import the router and `app.use("/api", …)` it |
| 5 | Test | `server/routes/__tests__/{domain}.test.ts` | Vitest + supertest integration test |

Not every change spans all five. Adding a field to an existing resource might be
schema + storage + maybe a route tweak. A brand-new resource is all five. Read
the existing file for the domain you're touching first and match its style —
these files were extracted from a 22k-line monolith and the conventions are
remarkably consistent, so the nearest sibling is your best template.

`@shared/*` maps to `shared/*` and `@/*` maps to `client/src/*` (see
`tsconfig.json`); the same aliases are wired into `vitest.config.ts`.

## Workflow

1. **Find the domain.** Look in `server/routes/` for an existing `{domain}.routes.ts`
   (e.g. `customers.routes.ts`, `vehicles.routes.ts`, `invoices.routes.ts`). If
   the feature fits an existing domain, extend that file rather than making a new
   one. `server/routes/REFACTORING_GUIDE.md` lists every domain and its endpoints.
2. **Schema first** (only if you need new tables/columns). Add the `pgTable`, the
   `createInsertSchema(...).omit({...})`, and the `$inferSelect`/`$inferInsert`
   type exports. Then apply it with `npm run db:push`.
3. **Storage next.** Add the method signature to the `IStorage` interface
   (~line 771) and implement it in `DatabaseStorage` (~line 2078). Both, always —
   the interface is the contract the route layer trusts.
4. **Route.** Add handlers to the domain router, following the try/catch +
   `console.error` + `res.status(...).json({ message })` shape used everywhere.
5. **Mount** the router in `server/routes/index.ts` if it's new — but read the
   shadowing warning below before you do.
6. **Test** in `server/routes/__tests__/`, using `createTestApp` + `loginAsAdmin`.
7. **Verify:** `npm run check` (tsc, must be clean — the project prides itself on
   zero TS errors) then the targeted test, e.g. `npx vitest run server/routes/__tests__/{domain}.test.ts`.

Full copy-paste templates for every layer live in
[`references/templates.md`](references/templates.md). Read it when you're writing
a new file from scratch — it has a complete worked example.

## Things that bite people here

**Tenant scoping is not optional.** This is multi-tenant: almost every row
belongs to a garage. List/read storage methods take an optional `garageId` and
filter on it; authenticated routes pull the tenant from `req.user.garageId` (or
accept `garage_id` as a query param for list endpoints). If you forget to scope a
query, one garage sees another garage's data. When you add a table that holds
tenant data, give it a `garageId` column referencing `garages.id` and thread it
through the storage method. Mirror exactly how the sibling resource does it.

**The legacy monolith still serves many routes — don't shadow it.** A
22k-line `server/routes.ts` is still mounted last as a fallback. Several modular
`*.routes.ts` files are *intentionally not mounted* in `index.ts` because their
handlers were stubs or used in-memory demo stores that would shadow the
monolith's real DB-backed CRUD. You'll see explicit comment blocks in
`index.ts` saying so (e.g. `estimates`, `supplier-portal`, `misc.routes`).
Before mounting a router, confirm the same `/api/...` path isn't already served
with real data by the monolith. If it is, either extend the monolith handler or
make the modular file fully DB-backed via `storage.*` before mounting — never
mount something that returns empty arrays over a working endpoint. When in
doubt, grep `server/routes.ts` for the path.

**Validate with the schema's own Zod, server-managed fields omitted.** Insert
schemas are built with `createInsertSchema(table).omit({ id: true, createdAt:
true, createdBy: true, ... })` — anything the server sets (ids, timestamps,
the acting user) is omitted so clients can't supply it. Routes validate with
`insertXSchema.safeParse(req.body)` and, on failure, return 400 with a mapped
`errors` array (see `customers.routes.ts` `POST /customers/:id/notes` for the
canonical shape). Set the server-managed fields yourself after parsing.

**Route ordering within a file:** register specific paths before parametric
ones (`/vehicles/catalogs` before `/vehicles/:id`) so Express doesn't capture
the literal segment as a param.

**Tests tolerate "not mounted."** Many existing tests assert
`expect([200, 404]).toContain(res.status)` because a route may be unmounted by
design. That's fine for guarding shape, but for a route you *just mounted and
own*, assert the real status (200/201/400) so the test actually proves your
endpoint works — a permanently-404-tolerant test is worthless.

**DB-backed tests need a database.** `globalSetup.ts` seeds a test garage and
writes `.test-garage-id`; helpers attach the test user to it. If `DATABASE_URL`
isn't set, the global setup is skipped and DB tests can't run — say so rather
than reporting a false pass.

## Commands

- `npm run dev` — run the server (tsx, watch)
- `npm run check` — typecheck (must be clean)
- `npm run db:push` — apply `shared/schema.ts` changes to the database
- `npm test` — full Vitest suite; `npx vitest run <path>` for one file
- `npm run test:integration` — just `server/routes/__tests__`
- `npm run lint` / `npm run format` — eslint / prettier
