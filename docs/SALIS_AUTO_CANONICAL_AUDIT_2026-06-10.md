# SALIS AUTO Canonical Audit and GitHub Recovery

**Authoritative repository:** `tazamohd/SALIS-GMS`

**Repository state reviewed:** remote `pr-branch` at `6c34e32501caf37733345341de4dac6fd5fa3fb4`

**Audit date:** June 10, 2026

**Classification:** Internal engineering and launch-readiness report

## 1. Executive Verdict

SALIS AUTO is a substantial, functioning automotive group-management platform with broad operational coverage. It is not yet ready for an unconditional Kingdom of Saudi Arabia production launch.

The current codebase has a real application shell, 250 React page files, 406 Drizzle table declarations, 254 route elements, authentication middleware, tenant-aware infrastructure, PostgreSQL tests, a production build path, and working CI runs. Earlier reports that described the product as a prototype, asserted that source code was absent, or attributed defects from other repositories to SALIS-GMS are not current descriptions of this repository.

The release recommendation is **controlled pilot only** until the following launch blockers are closed with recorded evidence:

1. ZATCA Phase 2 clearance/reporting must use an accredited production integration rather than simulated responses.
2. Production payment flows must replace simulated gateways and be verified end to end.
3. Fine-grained RBAC and tenant-boundary enforcement must be demonstrated for sensitive finance, HR, inventory, and administration operations.
4. Branch governance must establish one protected integration path and eliminate competing pull requests from the same long-lived branch.
5. Type-suppressed modules and high-risk workflows need sufficient automated coverage for a release decision.

No percentage-complete or "production-ready" claim is accepted without explicit acceptance criteria and repeatable evidence.

## 2. Scope, Method, and Evidence Rules

Eleven supplied reports were treated as evidence inputs, not as trusted truth. Every useful unique assertion was classified as:

- **Verified current:** reproduced against the June 10 SALIS-GMS state.
- **Verified fixed:** historically plausible and no longer reproducible.
- **Still open:** current evidence confirms remaining work.
- **Outdated:** superseded by later code or GitHub state.
- **Contradictory:** conflicts with stronger current evidence.
- **Unverified:** insufficient evidence to assert as fact.
- **Wrong repository:** belongs to `tazamohd/mnus` or `MotazMohd/SalisAutoPlatform`.

Evidence was checked against repository files, repeatable counts, current pull requests and issues, workflow results, dependency installation, TypeScript compilation, production build output, and the PostgreSQL test path. Historical observations are retained in the reconciliation appendix rather than silently discarded.

## 3. Repository and Branch Topology

| Repository or branch | Role on June 10, 2026 | Audit treatment |
|---|---|---|
| `tazamohd/SALIS-GMS` | Authoritative product implementation | Source of current defect and readiness findings |
| `main` | Default branch; does not yet contain the broad PR #6 integration | Authoritative release trunk; protection remains required |
| `pr-branch` | Audited implementation baseline at `6c34e325` | Canonical integration head; PR #23 now exposes it to `main` |
| `review-base` | PR #6 was merged here on June 10, 2026 | Temporary review branch, not the release trunk |
| `tazamohd/mnus` | Separate repository referenced by Manus reports | External context only |
| `MotazMohd/SalisAutoPlatform` | Separate planning/specification repository | External context only |

PR #3 and PR #6 shared the same long-lived head branch but advertised different scopes and bases. PR #3 was closed as superseded, while PR #6 merged into the temporary `review-base`, not `main`. PR #21 remains a focused remediation PR into `pr-branch`; draft PR #23 is the canonical `pr-branch` to `main` integration path. Issue #22 tracks branch protection and release controls.

## 4. Repeatable Current Metrics

Counts describe code volume, not delivery completeness.

| Metric | June 10 result | Counting method |
|---|---:|---|
| React page files | 250 | Files matching `client/src/pages/**/*.tsx` |
| Route elements | 254 | `<Route` occurrences in `client/src/App.tsx` |
| Drizzle table declarations | 406 | `pgTable(` occurrences in `shared/schema.ts` |
| Test/spec files | 42 | Repository files matching test/spec naming |
| Playwright specs | 2 | Files matching `*.spec.ts` under `e2e` |
| Files with `@ts-nocheck` | 60 | Files containing the directive |
| Console calls | 1,860 | `console.log/warn/error/debug/info` occurrences |
| `server/routes.ts` | 20,654 lines | Physical line count |
| `server/storage.ts` | 10,979 lines | Physical line count |
| `shared/schema.ts` | 10,147 lines | Physical line count |

Earlier values such as 76 tables, 343 tables, 283 routes, 255 routes, or approximately 1,400 endpoints used different repositories or counting methods. They must not be combined into a single progress trend.

## 5. Severity-Ranked Findings

### Critical

#### C1. ZATCA Phase 2 is not production-cleared

The repository contains invoice XML and QR-oriented implementation, but the clearance/reporting integration includes simulated behavior. This is useful development infrastructure, not evidence of accredited production compliance.

**Release gate:** accredited sandbox and production credentials, signed invoice validation, clearance/reporting response persistence, retry/idempotency controls, rejection handling, and finance-owner acceptance evidence.

#### C2. Payment integrations are not demonstrated as production-real

The platform exposes payment-related services and UI, but supplied reports and current code do not establish live production processing, callback verification, reconciliation, refunds, or failure recovery.

**Release gate:** provider certification, secret management, signed webhook validation, idempotency, settlement reconciliation, refund paths, and finance/security approval.

#### C3. Branch governance obscures the releasable state

Two open pull requests use the same `pr-branch` head with different bases and scopes, while audit and CI pull requests overlap. A reviewer cannot identify one authoritative merge sequence.

**Release gate:** one protected trunk, one canonical integration PR, required green checks, current review approval, and explicit supersession of stale PRs.

### High

#### H1. Fine-grained RBAC remains incomplete

The current `defaultAuth` middleware establishes a useful default-deny boundary for `/api`, so earlier claims of a globally unauthenticated API are outdated. That control does not prove operation-level authorization. Sensitive routes still require role/permission checks and tenant ownership tests.

**Acceptance:** deny-by-default permission middleware on critical mutations; cross-role and cross-tenant negative tests; administrator override behavior documented and audited.

#### H2. Type safety is materially suppressed

Sixty files use `@ts-nocheck`, including large or business-critical surfaces. `npm run check` passing therefore does not mean all application code is type checked.

**Acceptance:** inventory directives by risk, remove them incrementally, prevent new suppressions, and add tests around modules that remain temporarily exempt.

#### H3. The hybrid routing model has a high change radius

The modular route direction is sound, but the 20,654-line legacy router remains a concentration of authorization, validation, and regression risk.

**Acceptance:** migrate bounded domains behind explicit routers, preserve compatibility tests, and track legacy route reduction.

#### H4. Client and end-to-end regression coverage is too shallow

The repository has 42 test/spec files but only two Playwright specifications for roughly 250 page files. File counts alone do not show behavioral coverage.

**Acceptance:** critical-path tests for authentication, tenant isolation, invoice lifecycle, workshop/service flow, inventory posting, payroll approval, and privileged administration.

#### H5. Deployment configuration did not declare `SESSION_SECRET`

The server requires a session secret, while `render.yaml` declared only `NODE_ENV` and `DATABASE_URL`. The remediation adds generated secret configuration; the deployment still needs a smoke test and documented secret-rotation ownership.

### Medium

#### M1. Core modules remain too large

`routes.ts`, `storage.ts`, and `schema.ts` are independently large enough to slow review and broaden regression impact. This is maintainability and control risk, not proof that the platform is nonfunctional.

The production build also reports duplicate class members in `server/storage.ts`, including IoT alert, loyalty account, and notification methods. Later declarations override earlier declarations at runtime, making the active contract difficult to reason about.

#### M2. Production logging is not consistently structured

There are 1,860 console calls. Existing logger adoption is incomplete, reducing correlation, redaction, severity consistency, and operational observability.

#### M3. Finance and HR maturity is uneven

Several surfaces are real or partial, while historical reports identify mock tabs, hardcoded regulatory values, and incomplete workflows. These claims require feature-level acceptance testing before being called fixed.

#### M4. Performance claims lack repeatable evidence

No supplied report provides a current load-test baseline tied to the June 10 commit. Scale and response-time claims remain unverified.

#### M5. Repository hygiene has drifted

Overlapping workflows, stale status documents, vendored tooling content, and competing audit PRs make operational truth harder to locate.

## 6. Verified Historical Improvements

The following June 1-9 concerns are no longer accurate as blanket current findings:

- A default-deny authentication gate now protects `/api` routes, subject to a public allowlist.
- The dependency lockfile supports a clean `npm ci`; bypassing it with `npm install` is no longer justified.
- Current GitHub workflow runs for `pr-branch` completed successfully before this audit.
- The local PostgreSQL 16 verification completed with 40 test files and 227 tests passing.
- PWA assets exist, including `public/manifest.json` and `public/service-worker.js`; offline completeness remains unverified.
- The codebase is not missing, and it is materially larger than the separate repositories described by the Manus reports.

These improvements do not close the fine-grained authorization, compliance, payment, test-depth, or governance gates.

## 7. Portal and Feature Maturity

| Capability | Rating | Current interpretation |
|---|---|---|
| Authentication and sessions | Real | Default-deny API gate exists; production secret handling requires verification |
| Tenant infrastructure | Partial | Tenant concepts are pervasive; adversarial isolation tests are insufficient |
| Executive/admin portal | Real | Broad implemented navigation and pages |
| Workshop/service operations | Real | Core implementation exists; ownership and regression coverage need verification |
| Vehicle sales and inventory | Real | Broad implementation exists |
| CRM and customer portal | Partial | Real surfaces with historical wiring/ownership findings needing retest |
| Finance and accounting | Partial | Broad schema/UI, but control and workflow depth are uneven |
| HR and payroll | Partial | Broad implementation with historical mock/hardcoded areas |
| ZATCA Phase 2 | Demo/partial | XML/QR foundation exists; production clearance is not verified |
| Payment gateways | Demo/partial | Production processing and reconciliation are not verified |
| PWA/offline | Partial | Assets exist; offline behavior and installability are unverified |
| Mobile application | Unverified | No release evidence accepted by this audit |
| AI and automation features | Partial | Multiple surfaces exist; production model/data controls are unverified |

## 8. Contradiction Matrix

| Supplied claim | Canonical disposition |
|---|---|
| "Source code is missing" | Wrong repository; contradicted by SALIS-GMS |
| "All 38 issues are fixed in `fixes/`" | Wrong repository and unverified integration |
| "76 tables / 283 routes / 429 endpoints" | Wrong repository or obsolete counting basis |
| "343 tables from the database dump" | External repository context |
| "API routes are broadly unauthenticated" | Historically relevant, now outdated as a blanket claim |
| "PWA is missing" | Contradicted; manifest and service worker exist |
| "Core platform is production-grade" | Unsupported without compliance, payments, RBAC, and release gates |
| "CI is fixed by replacing `npm ci` with `npm install`" | Outdated; the synchronized lockfile now supports `npm ci` |

Detailed source-by-source reconciliation is in `SALIS_AUTO_AUDIT_SOURCE_RECONCILIATION_2026-06-10.md`.

## 9. Pull Request Disposition

| PR | Disposition | Evidence-based reason |
|---|---|---|
| #3 | Close as superseded | Title describes i18n while the shared head branch has expanded far beyond that scope |
| #5 | Close or relocate | Vendored Claude skill is tooling content outside the product delivery boundary |
| #6 | Merged into `review-base` June 10, 2026 | The broad changes are reviewed but not yet part of the release trunk |
| #19 | Close as superseded | Its audit claims are reconciled and replaced by this canonical report |
| #20 | Close as superseded | It overlaps CI and did not establish deterministic lockfile installation |
| #21 | Draft; review against `pr-branch` | Canonical report and deployment-secret fix are published; workflow consolidation remains blocked on workflow-write scope |
| #23 | Draft canonical integration PR | Promotes audited `pr-branch` to `main` after focused remediation and release gates |

## 10. Issue Triage

| Issue | Priority | June 10 treatment |
|---|---|---|
| #7 | High | Canonical report establishes a source of truth; retain status-document consolidation and ownership |
| #8 | Critical | Typecheck/build design is verified locally; workflow publication, ESLint configuration, and required checks remain |
| #9 | High | Retain the verified 60-file `@ts-nocheck` burn-down with risk-based sequencing |
| #10 | High | Render secret declaration is prepared; retain environment documentation and deployment smoke-test evidence |
| #11 | Critical | Retain ZATCA production integration and certification work |
| #12 | Critical | Retain production payment integration and reconciliation work |
| #13 | High | Retain finance completion and control validation |
| #14 | High | Retain estimate-to-invoice and job-card-to-invoice workflow completion |
| #15 | High | Retain client-side and critical-path end-to-end coverage |
| #16 | Medium | Retain route decomposition with measurable legacy-router reduction |
| #17 | Critical | Elevate RBAC enforcement and tenant-negative tests to a release gate |
| #18 | Medium | Retain repository hygiene and documentation consolidation |
| #22 | Critical | Protected `main`, required checks, branch ownership, and one canonical release path |

## 11. Phased Remediation Roadmap

| Phase | Owner | Dependencies | Acceptance criteria | Release gate |
|---|---|---|---|---|
| 0. Reproducible delivery | Platform engineering | None | `npm ci`, typecheck, build, PostgreSQL tests, one CI workflow | Required |
| 1. Security boundary | Security/backend | Phase 0 | Permission matrix and cross-tenant negative tests | Required |
| 2. KSA compliance | Finance/compliance/backend | Phases 0-1 | Accredited ZATCA flow and rejection recovery | Required |
| 3. Payments | Finance/platform | Phases 0-1 | Live provider certification, webhooks, reconciliation, refunds | Required |
| 4. Critical workflows | Product QA/domain owners | Phases 1-3 | End-to-end invoice, workshop, inventory, payroll, admin tests | Required |
| 5. Architecture and observability | Platform engineering | Stable gates | Router/storage decomposition, structured logs, performance baseline | Pilot exit |
| 6. UX and scale | Product/design/SRE | Pilot evidence | Accessibility, offline, load, and operational readiness | General availability |

## 12. Release Decision Checklist

A production launch requires all of the following:

- Green required checks from a clean checkout using `npm ci`.
- Successful TypeScript check and production build.
- Full Vitest execution against PostgreSQL 16.
- Critical end-to-end tests, including negative role and tenant cases.
- ZATCA and payment evidence signed by accountable owners.
- Production secret, backup, restore, monitoring, and incident procedures.
- One protected trunk and no unresolved critical/high audit findings.
- Review approval on the exact release commit.

## 13. Evidence Commands

Representative repeatable commands:

```powershell
npm.cmd ci --no-audit --no-fund
npm.cmd run check
npm.cmd run build
npm.cmd test
rg --files client/src/pages -g '*.tsx'
rg -c '<Route' client/src/App.tsx
rg -c 'pgTable\(' shared/schema.ts
rg -l '@ts-nocheck'
rg -n 'console\.(log|warn|error|debug|info)'
```

The exact PostgreSQL test environment is encoded in `.github/workflows/ci.yml`.

Local verification on June 10, 2026 completed successfully with 40 test files and 227 tests against a disposable PostgreSQL 16 cluster. The production build passed with warnings for large chunks, mixed static/dynamic imports, and duplicate storage class members.

## 14. Final Assessment

SALIS AUTO has advanced beyond prototype status and contains meaningful implementation across the dealership operating model. The correct management posture is neither "rewrite everything" nor "ship immediately." It is a controlled recovery: establish reproducible delivery, prove authorization boundaries, complete regulated integrations, validate critical workflows, and merge through one governed path.

The readiness rating is **controlled pilot after critical gates**, not general production readiness.
