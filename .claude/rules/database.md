# SALIS — Database / Drizzle Rules

> Extends `~/.claude/rules/ecc/common/*` plus the `database-migrations` skill.
> SALIS uses Drizzle ORM on Neon/Postgres.

## Source of truth

- Schema lives in `shared/schema.ts`. All schema changes go through Drizzle:
  edit the schema, then `npm run db:push` (or generate a migration in
  `migrations/`). **No raw SQL drift** against the live DB.
- Keep `drizzle-zod` insert/select schemas in sync with table definitions so API
  validation matches the DB.

## Money & tax columns

- Currency, VAT (15%), and Zakat (2.5%) amounts use integer minor units or
  Drizzle `numeric` — never floating-point columns or `parseFloat` round-trips.

## Query safety & performance

- Parameterized queries only (Drizzle query builder). Never interpolate user
  input into SQL.
- Add indexes for new foreign keys and frequent filter/sort columns. Avoid N+1 —
  batch or join. Always bound list queries with `limit`/pagination.
- Multi-tenant: scope tenant-owned tables by tenant/org id in every query; never
  return cross-tenant rows.

## When changing schema/migrations/queries

Run the `database-reviewer` agent. Verify with `npm run db:verify`.
