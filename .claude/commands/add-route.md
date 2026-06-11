---
description: Scaffold a new domain API route module (+ test) following the SALIS-GMS routes/ pattern.
argument-hint: "<domain> [endpoints, e.g. 'GET /api/foo, POST /api/foo']"
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
model: inherit
---

# Add a domain route module

Create a new Express route module for the domain in `$ARGUMENTS`, following the
existing pattern in `server/routes/*.routes.ts`. Do **not** add endpoints to the
legacy `server/routes.ts`.

## Steps
1. **Study the pattern first.** Read an existing module such as
   `server/routes/customers.routes.ts` and `server/routes/index.ts` to match the
   router export, mounting, auth/RBAC usage, Zod validation, and storage calls.
2. **Create `server/routes/<domain>.routes.ts`** that:
   - exports an Express `Router`;
   - guards endpoints with session auth + the RBAC middleware
     (`server/rbac-middleware.ts`) using the appropriate role(s);
   - validates input with Zod, preferring `insert*` schemas from
     `@shared/schema`;
   - performs data access via `server/storage.ts` (add a method there if
     needed) rather than inline Drizzle in the handler;
   - enforces multi-tenant scoping (filter by the authenticated user's
     garage/branch).
3. **Mount it** in `server/routes/index.ts` alongside the other domain routers.
4. **Add a test** `server/routes/__tests__/<domain>.test.ts` using
   `createTestApp()` and `loginAsAdmin()` from `server/__tests__`, following the
   tolerant-status style of the existing tests.
5. **Verify**: run `npm run check` and
   `npm run test:integration` (scope to the new file if possible). Report
   results.

If schema changes are required, update `shared/schema.ts` and note that
`npm run db:push` must be run. Keep the change minimal and conventional.
