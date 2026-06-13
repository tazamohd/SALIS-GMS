# Engineering Workflow — SALIS-GMS

This is the human-readable companion to [`CLAUDE.md`](./CLAUDE.md) and the agent
skills in [`.claude/`](./.claude/README.md). Same workflow, written for people.

These practices are adapted from the [Ring](https://github.com/LerianStudio/ring)
engineering-skills library, re-tuned from its Go/Lerian origins to our
TypeScript / Express / React / Drizzle stack.

---

## The loop

Every change — yours or an agent's — follows five steps. Don't skip to step 3.

```
1. Plan   →  2. TDD   →  3. Dev-cycle gates  →  4. Review  →  5. Commit
```

### 1. Plan (`.claude/skills/planning-features`)
Anything touching multiple files, adding a route or table, or a new module gets a
short written plan first.
- **Small Track** (< ~2 days, no new table/dependency): Research → PRD → task list.
- **Large Track**: Research → PRD → TRD → plan.

One-line fixes and known-cause bugfixes skip planning — go straight to a failing test.

### 2. Test-Driven Development (`.claude/skills/test-driven-development`)
**RED → GREEN → REFACTOR.**
1. Write one failing test. Run it. See it fail for the right reason.
2. Write the minimum code to pass.
3. Refactor under green; re-run the suite.

Production code written before its test should be deleted and redone test-first.

- Domain logic → pure tests in `shared/*.test.ts` (fast, no DB).
- HTTP behavior → Supertest in `server/**/__tests__` (boots the app + real Postgres).
- Components → Vitest + Testing Library under jsdom.

### 3. Dev-cycle gates (`.claude/skills/running-dev-cycle`)
A task is **done** only when every gate passes:

| Gate | Check |
|------|-------|
| 0 | Implemented test-first (failing test existed first) |
| 1 | `npm run check` clean — no new `any` |
| 2 | Relevant suite + full suite green |
| 3 | New routes RBAC-protected; input Zod-validated; Drizzle-only; consistent errors |
| 4 | Financial/date logic reuses `shared/` compliance utils (VAT, ZATCA, Hijri, TRN) |
| 5 | `npm run format` (prettier) |

### 4. Review (`.claude/skills/reviewing-code`)
Before merge, run the parallel reviewers over the diff:
- `code-reviewer` — correctness & architecture
- `security-reviewer` — authz/RBAC/IDOR/injection/PII
- `test-reviewer` — coverage & test quality

Resolve every **BLOCKER** before merging.

### 5. Commit (`.claude/skills/committing-changes`)
Atomic [Conventional Commits](https://www.conventionalcommits.org/) —
`type(scope): subject`. One logical concern per commit. Never mix a feature, a
refactor, and a formatting sweep. Each commit leaves the tree green.

---

## House rules

- **No `any`** as an escape hatch — type it, or `unknown` + Zod parse.
- **Validate all input at the boundary** with Zod before it reaches a service.
- **Every new API route is RBAC-protected.** Payments + PII under Saudi PDPL/ZATCA —
  an unauthenticated or unauthorized route is a security bug.
- **Scope queries by tenant** (`garageId` / ownership) — guard against IDOR.
- **Drizzle for all DB access** — no raw SQL string interpolation with user input.
- **Keep `shared/` framework-free** — it's imported by both client and server.
- **Saudi compliance is correctness, not a toggle.** Reuse the tested utils in
  `shared/` (`vatUtils`, `zatcaUtils`, `hijriUtils`, `saudi-compliance`); never
  re-derive VAT, ZATCA QR, TRN, or Hijri logic.

## Commands

| Task | Command |
|------|---------|
| Tests | `npm test` (server tests need Postgres) |
| Typecheck | `npm run check` |
| Server tests | `npm run test:server` |
| Integration | `npm run test:integration` |
| Coverage | `npm run test:coverage` |
| Format | `npm run format` |
| Dev | `npm run dev` |
| Build | `npm run build` |
| DB push / seed | `npm run db:push` / `npm run db:seed` |

> `npm run lint` is declared but eslint is **not yet installed/configured**;
> `npm run check` (tsc) is the standing static gate until it is.

## CI

- `.github/workflows/test.yml` — Vitest against Postgres 16 on push/PR.
- `.github/workflows/quality.yml` — `npm run check` (typecheck) + PR-title
  Conventional-Commit lint.

Both must be green before merge.
