# Database migrations

This project uses **Drizzle** for schema and migrations. The schema of record is
[`shared/schema.ts`](../shared/schema.ts); the applied history is the SQL files
in this folder plus `meta/_journal.json`.

## `0001_performance_indexes.sql` — a note

`0001` adds btree indexes to the tenant (`garage_id`) and foreign-key columns
that had none (audit DB-C1/DB-C2). It is a **raw-SQL, index-only** migration:
the indexes are not modelled in `shared/schema.ts`, so its `meta/0001_snapshot.json`
is intentionally identical to `0000` (drift check stays green — `drizzle-kit
generate` sees no schema change). Because indexes live only in the migration and
not in the Drizzle model, **do not use `drizzle-kit push`** against a real
database (push syncs the DB to `schema.ts` and would drop them) — always apply
via `npm run db:migrate`, which this project already uses in CI/containers.

The statements use plain `CREATE INDEX IF NOT EXISTS` (the migrator wraps each
file in a transaction, so `CONCURRENTLY` — which cannot run in a transaction — is
not used here). On a large production database, building ~840 indexes takes a
brief write lock per table; if that is unacceptable, apply the same statements
manually with `CREATE INDEX CONCURRENTLY` during a maintenance window, then
`server/scripts/baseline-stamp.ts`-style record `0001` as applied so the
migrator treats it as a no-op.

## Layout

```
migrations/
  0000_baseline.sql        # full schema baseline (see "Baseline squash")
  meta/
    _journal.json          # ordered list of migrations (tag + timestamp)
    0000_snapshot.json      # drizzle-kit's model of the schema at each entry
```

## How migrations are applied

`npm run db:migrate` runs [`server/scripts/migrate.ts`](../server/scripts/migrate.ts),
which uses drizzle-orm's production migrator:

- it reads `meta/_journal.json` for the ordered list of migrations and each
  `<tag>.sql` file;
- it records every applied migration in `drizzle.__drizzle_migrations`
  (`hash = sha256(<tag>.sql)`, `created_at = the journal entry's "when"`);
- it applies only migrations newer than the last recorded one, so **re-running is
  a no-op**. It never introspects `shared/schema.ts` at runtime.

The test harness is different: it builds the schema straight from `schema.ts`
with `drizzle-kit push`, so tests do not depend on the migration files.

## Bootstrapping a database

- **Fresh database** → `npm run db:migrate`. The baseline creates every table.
- **Database already migrated under the old history** → see
  [Adopting the squashed baseline](#adopting-the-squashed-baseline-existing-databases).

## Authoring a new migration

1. Edit `shared/schema.ts`.
2. Generate the migration and its snapshot:
   ```
   DATABASE_URL=… npx drizzle-kit generate --name <change_name>
   ```
   (For a change drizzle-kit can't express — a data backfill, a tricky index —
   hand-author the `.sql` and add a matching `meta/_journal.json` entry.)
3. Review the generated SQL, then commit the new `.sql` **and** the `meta/`
   changes together.
4. `npm run db:check-drift` must pass (CI enforces it — see below).

## Drift guard

`npm run db:check-drift` ([`scripts/check-migration-drift.sh`](../scripts/check-migration-drift.sh))
runs `drizzle-kit generate` and fails if it would produce a new migration —
i.e. if `schema.ts` has changed without a matching migration. CI runs this in
the **migrations apply cleanly** job, so the `meta/` snapshots can no longer
fall silently behind the schema (which is exactly what forced the baseline
squash below).

## Baseline squash

The history was squashed from 25 incremental files (`0001`–`0025`) into a single
`0000_baseline.sql` because the `meta/` snapshots had drifted (they stopped at
`0003` while the schema evolved to `0025`), which broke `drizzle-kit generate`.
The superseded files remain in git history. The only content a schema baseline
cannot carry is the one-time **data backfills** (SAR-currency defaults, trial
backfill) — both no-ops on a fresh database.

## Adopting the squashed baseline (existing databases)

A database that already has the tables from the old `0001`–`0025` history has
none of the *new* journal's hashes, so `db:migrate` would try to re-run
`0000_baseline.sql` and fail with `relation … already exists`. Stamp it once:

```
DATABASE_URL=… npm run db:baseline-stamp
```

[`server/scripts/baseline-stamp.ts`](../server/scripts/baseline-stamp.ts) records
each journal migration in `drizzle.__drizzle_migrations` with the exact hash and
timestamp drizzle's migrator expects — without running any migration SQL — so the
next `db:migrate` is a clean no-op. It is idempotent (already-recorded rows are
skipped) and refuses to run against a database with no application schema (there
you want `db:migrate`, not a stamp).
