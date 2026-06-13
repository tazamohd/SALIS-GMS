---
name: reviewing-code
description: Reviewing a SALIS-GMS change by dispatching parallel specialist reviewers (correctness, security/RBAC, tests) over the git diff and aggregating findings by severity. Use before merging a branch/PR, or at epic cadence inside running-dev-cycle. Report-only — it flags issues, it does not fix them. Skip for trivial doc-only or formatting-only diffs.
---

# Reviewing Code (SALIS-GMS)

Adapted from Ring's parallel code-review. Run several focused reviewers over the
**same diff** at once, then merge their findings. Each reviewer is a lens; running
them in parallel beats one pass that tries to hold everything in mind.

## Step 1 — Establish the diff

```
git diff main...HEAD        # or the PR base
git diff --stat main...HEAD
```
Scope the review to changed files plus their direct callers/callees.

## Step 2 — Dispatch reviewers in parallel

Launch these as concurrent subagents (`.claude/agents/`), each over the same diff:

| Reviewer | Looks for |
|----------|-----------|
| `code-reviewer` | Correctness, architecture, dead code, error handling, `any` leaks, Drizzle/Zod misuse, naming |
| `security-reviewer` | Missing RBAC/auth, unvalidated input, injection, PII/secret leakage, IDOR, session/auth flaws |
| `test-reviewer` | Coverage of new behavior, test independence, real assertions, missing edge/negative cases |

For diffs touching financial/invoice/date code, also check compliance utils reuse
(`shared/vatUtils`, `zatcaUtils`, `hijriUtils`, `saudi-compliance`).

## Step 3 — Aggregate by severity

- **BLOCKER** — must fix before merge (security hole, broken behavior, missing
  RBAC, failing/absent test for new logic, type error).
- **MAJOR** — should fix (weak validation, poor error handling, untested branch).
- **MINOR** — nice to fix (naming, duplication, style not caught by prettier).

De-duplicate overlapping findings. Output one ranked list with `file:line` refs.

## SALIS-GMS review checklist

**Correctness**
- [ ] No `any` used to silence the compiler; `unknown` + Zod where needed.
- [ ] Promises awaited; no floating async in request handlers.
- [ ] Drizzle queries scoped correctly (e.g. `garageId` tenancy filter present).
- [ ] Consistent error JSON shape + correct HTTP status.

**Security**
- [ ] Every new/changed route has auth + RBAC role check.
- [ ] Request body/params/query validated with Zod before use.
- [ ] No raw SQL interpolation of user input.
- [ ] No secrets, tokens, or PII in logs or responses.
- [ ] Authorization checks object ownership (no IDOR via guessed ids).

**Tests**
- [ ] New behavior has a test that would fail without the change.
- [ ] Negative/permission-denied paths tested, not just happy path.
- [ ] Tests don't depend on each other's ordering or leak DB state.

**Frontend (if client/ touched)**
- [ ] Server state via TanStack Query (no ad-hoc fetch-in-effect).
- [ ] Inputs labeled/accessible; RTL (Arabic) not broken.
- [ ] No secret/keys shipped to the client bundle.

## Output format

```
## Review — <branch>
BLOCKER (n) / MAJOR (n) / MINOR (n)

### BLOCKERS
1. server/routes/x.ts:42 — POST /api/x has no requireRole(...) → unauthorized write. Add RBAC middleware.
...
```

This skill **does not edit code**. Hand blockers back to `running-dev-cycle`.
