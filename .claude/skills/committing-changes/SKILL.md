---
name: committing-changes
description: Committing SALIS-GMS working-tree changes as atomic Conventional Commits — analyze the diff, group it into coherent single-concern commits, confirm the plan, then commit. Use when the user says "commit" or has changes ready to record. Skip when the tree is clean or work is mid-flight. One logical change per commit; never mix a feature, a refactor, and a formatting sweep in one commit.
---

# Committing Changes (SALIS-GMS)

Adapted from Ring's `committing-changes`, with Lerian-specific trailers removed.
Produces clean, atomic [Conventional Commits](https://www.conventionalcommits.org/).

## Process

1. **Inspect** — `git status` and `git diff` (and `git diff --staged`). Understand
   every hunk before staging anything.
2. **Group** — partition the changes into the *smallest set of coherent commits*.
   Each commit is one logical concern that builds and tests green on its own.
3. **Confirm** — state the planned commit breakdown to the user before committing
   if there's more than one commit or any ambiguity.
4. **Commit** — stage per group (`git add -p` or explicit paths) and commit each.

## Message format

```
<type>(<scope>): <subject>

<body: what & why, not how — wrap ~72 cols>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`,
`build`, `ci`.

**Scopes** (use the area touched): `server`, `client`, `shared`, `auth`, `rbac`,
`db`, `invoices`, `compliance`, `fleet`, `inventory`, `ci`, `deps`, ...

**Subject**: imperative, lowercase, no trailing period. ≤ ~72 chars.

### Examples
```
feat(invoices): add ZATCA QR to PDF export

fix(rbac): block technicians from editing financial records

test(server): cover unauthorized POST /api/customers

refactor(shared): extract VAT rounding into vatUtils

chore(deps): bump drizzle-orm to 0.39.1
```

## Rules

- **One concern per commit.** A bugfix and an unrelated refactor are two commits.
- **Don't bundle a formatting sweep** with logic changes — separate `style:` commit.
- Each commit should leave the tree **green** (tests + `npm run check`). Don't
  commit a known-broken intermediate state on a shared branch.
- **No secrets** in diffs or messages. Check `.env*` is gitignored and not staged.
- Subject says *what*; body says *why* (the diff already shows *how*).
- Reference issues in the body/footer when relevant: `Refs #123`, `Closes #123`.

## Branch & push

- This repo's web sessions develop on a dedicated feature branch — never commit
  straight to `main`.
- Push with `git push -u origin <branch>`; retry on transient network errors.
- After pushing, open a **draft PR** if one doesn't exist.

## Do not

- Squash unrelated changes "to save time."
- Write vague subjects (`fix stuff`, `update`, `wip`).
- Add tool/model attribution or non-standard trailers to messages.
