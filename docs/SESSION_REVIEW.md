# Parallel-Session Branch Review — SALIS-GMS

Comparative review of the in-flight session branches against the `main`
baseline. Each branch was diffed against `origin/main` and its substantive
source changes read directly (not just PR titles). Branch #33 was additionally
deep-dived: dependencies installed and its test suite + typecheck run.

_Reviewed 2026-06-12._

## Ranked verdict (best → worst)

| Rank | PR | Branch | What it is | Score | Call |
|---|---|---|---|---|---|
| 1 | #33 | `vibrant-cori` | i18n formatters + Arabic plurals/gender | **5/5** | Merge as-is (verified) |
| 1 | #27 | `epic-rubin` | Tailored `.claude/` + accurate CLAUDE.md | **5/5** | Merge (fold in #37) |
| 1 | #20 | `chore/p0-quick-wins` | Consolidate CI into one npm-ci pipeline | **5/5** | Merge (supersets pr-branch) |
| 4 | #38 | `route-dedupe` | Remove 26 dead duplicate routes (incl. #32) | **4/5** | Merge — supersedes #32 |
| 4 | #31 | `vigilant-lovelace` | Arabic support-agent routing | **4/5** | Merge after rebase |
| 4 | #23 | `pr-branch` | Security/payments/audit integration | **4/5** | Promote via #20 |
| 4 | #28 | `wonderful-keller` | Spec-Kit as native Claude skills | **4/5** | Pick of spec-kit trio |
| 4 | #37 | `architecture-doc` | ARCHITECTURE.md + CLAUDE.md | **4/5** | Fold into #27 |
| 8 | #34 | `epic-fermat` | ESLint 9 config + 256-file auto-fix | **3/5** | Split config from churn |
| — | #32 | `storage-dedupe` | Fix 10 shadowed IStorage methods | 4/5 | Don't merge — #38 contains it |
| — | #29 / #25 | spec-kit variants | Spec-Kit scripts/examples | 3/3 | Close (redundant with #28) |
| — | #36 | `onboarding-guide` | ONBOARDING.md | 3/5 | Salvage into #27 |
| 13 | #30 | `charming-heisenberg` | Enable 3rd-party plugin | **2/5** | Skip (supply-chain risk) |
| 13 | #26 | `ecc-tools` | Codex/OpenAI scaffolding | **2/5** | Skip (off-platform) |
| 13 | #21 | `codex/audit-remediation` | Audit docs, stale branch | **2/5** | Cherry-pick docs, close |
| 16 | #24 | `stoic-dirac` | MoAI-ADK vendored framework | **1/5** | Reject — 146k lines of bloat |

## Best work

**#33 `vibrant-cori` (i18n) — the standout.** Self-contained, idiomatic, and the
only branch with real test coverage. Reuses existing `lib/currency` and
`lib/hijriDateFormatter` rather than reinventing; guards `i18n.services?.formatter`;
whitelists Intl option keys to avoid leaking i18next's merged `t()` values. Touches
only `client/src/i18n/*`, so zero conflict risk.

**Verified:** with deps installed, `formatters.test.ts` runs **12/12 passing**
(currency, number, percent, datetime, hijri, all 6 Arabic CLDR plural categories,
gender fallback) and `tsc --noEmit` reports **no errors** in the touched files.

**#27 `epic-rubin`** and **#20 `chore/p0-quick-wins`** are the other "merge today"
branches — tightly scoped, accurate, doing exactly what they claim.

## Structural findings (matter more than any single score)

1. **Branches are stacked / overlapping — cannot merge independently.**
   - **#38 contains #32** (verified via merge-base ancestry). Merge **#38 only**.
   - **#20 = pr-branch + 2 commits.** Promote the **#20 tip**, not pr-branch alone,
     or the duplicate-workflow problem #20 fixes is left unfixed.
   - **#21 codex is stale** — 15 commits behind pr-branch; its diff *deletes* live
     payment-provider / tax-config / training-lms / gate-pass code, and carries
     triplicated commits from a botched rebase. Cherry-pick its audit doc, **close it**.

2. **The "+62k / +146k line" headlines are misleading.** pr-branch's 62k is almost
   entirely one generated `migrations/meta/0003_snapshot.json` (53k lines) that
   Drizzle requires — real hand-written change is ~3–4k lines. No `node_modules` is
   committed anywhere. The genuinely bloated branch is **#24 MoAI-ADK: 501 files /
   146k lines** of vendored framework irrelevant to this Express+Drizzle+React app.

3. **#34 ESLint is a conflict bomb.** Config is thoughtful and CI-gated, and the
   256-file auto-fix is functionally safe (the one nervy change — `require('crypto')`
   → top-level import at `server/routes.ts:1347` — checks out). But a 256-file
   reformat in one PR force-rebases every other open branch. Split config+CI from the
   churn, or land it first behind a freeze. Note `unused-imports/no-unused-imports` is
   `error` with `--fix`, which silently deletes imports.

4. **Redundant clusters — pick one each.**
   - Spec-kit trio #25/#28/#29 → keep **#28** (native `/speckit.*` skills); optionally
     graft #29's appointment-reschedule example. Close the other two.
   - CLAUDE.md/docs cluster #27/#37/#30/#36 → keep **#27**, fold in #37's
     ARCHITECTURE.md, salvage #36's onboarding doc, skip #30 (third-party plugin).

5. **Test coverage is the common weakness.** Only #33 (and partially #31/#32) add
   tests. The dedup and integration branches rely on type-check/build. For a system
   handling payments and ZATCA tax, gate merges on at least smoke tests for the
   payment registry and the #31 support-ticket routing path.

## Recommended merge order

1. **#34 config-only** (ESLint + CI), rebase others on top — or defer if too disruptive.
2. **#20** → promote to main (carries pr-branch's security/payments + the CI fix).
3. **#38** (dead-route + storage dedup), **#33** (i18n), then **#31** (Arabic routing,
   rebased onto the deduped `routes.ts`/`storage.ts`).
4. **#27** (+#37 ARCHITECTURE.md, +#36 onboarding) and **#28** (spec-kit skill).
5. Cherry-pick #21's audit doc; **close #21, #24, #25, #29, #26, #30, #32.**
