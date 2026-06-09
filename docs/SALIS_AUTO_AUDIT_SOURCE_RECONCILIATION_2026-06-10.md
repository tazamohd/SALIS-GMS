# SALIS AUTO Audit Source-Claim Reconciliation

**Canonical date:** June 10, 2026

**Authoritative implementation repository:** `tazamohd/SALIS-GMS`

## 1. Source Inventory

| Source | Apparent observation date | Repository context | Canonical use |
|---|---|---|---|
| `SALIS AUTO - Complete End-to-End Audit Report` | Undated/Manus | `tazamohd/mnus` | External historical context |
| `SALIS AUTO (SLS-MANUS) - Comprehensive End-to-End Audit Report` | Undated/Manus | `tazamohd/mnus` | External historical context |
| `Create Platform Audit Report MD File.txt` | June 2026 | Mixed instructions/assertions | Planning input only |
| `Deep Analysis of the SalisAutoPlatform GitHub Repository.docx` | June 2026 | `MotazMohd/SalisAutoPlatform` | External planning context |
| `Deep Review Report.docx` | June 1-4, 2026 | SALIS-GMS or mixed | Historical finding source |
| `Platform Audit Report.txt` | June 2026 | SALIS-GMS or mixed | Historical finding source |
| `SALIS AUTO Deep Review Report.docx` | June 1-4, 2026 | SALIS-GMS or mixed | Historical finding source |
| `SALIS.docx` | June 2026 | Mixed | Historical narrative input |
| `SALIS_AUTO_REVIEW.md` | June 2026 | SALIS-GMS | Historical code-review input |
| `SalisAuto GMS Complete Platform Review And GitHub Recovery Plan.docx` | June 2026 | SALIS-GMS | Recovery-plan input |
| `SalisAuto GMS Deep Platform Audit And Recovery Plan.docx` | June 2026 | SALIS-GMS | Recovery-plan input |

The two extensionless reports and the DOCX reports are preserved as evidence inputs. Their claims are not merged into the current defect count unless independently verified against SALIS-GMS.

## 2. Claim Reconciliation

| Retained claim or metric | Source theme | June 10 classification | Current evidence or disposition |
|---|---|---|---|
| Source code is missing | SLS-MANUS | Wrong repository | SALIS-GMS contains a large active application |
| 38 findings were fixed under `fixes/` | Manus complete audit | Wrong repository/unverified | No integration into SALIS-GMS is inferred |
| 76 tables, 283 routes, 429 endpoints | Manus complete audit | Wrong repository/outdated | Current SALIS-GMS count is 406 `pgTable` declarations and 254 route elements |
| 343 tables from a dump | SLS-MANUS | Wrong repository | External database artifact only |
| 406 tables | PR #19/report family | Verified current | Repeatable `pgTable(` count in `shared/schema.ts` |
| 250 page files | PR #19/report family | Verified current | Repeatable file count under `client/src/pages` |
| 255 routes | PR #19/report family | Approximately current | Current `<Route` count is 254 |
| Approximately 1,400 endpoints | PR #19/report family | Unverified | No accepted parser/counting definition supplied |
| API broadly lacked authentication | June 1-4 reviews | Verified fixed as blanket claim | `defaultAuth` now protects `/api` by default |
| Fine-grained RBAC is incomplete | Multiple reviews | Still open | Default authentication does not prove permission enforcement |
| Tenant isolation needs adversarial tests | Multiple reviews | Still open | No sufficient cross-tenant negative suite identified |
| Three TypeScript errors remained | Older reviews | Outdated | Current `npm run check` succeeds, subject to 60 `@ts-nocheck` files |
| Lockfile prevents clean `npm ci` | CI reports/PR #20 | Verified fixed | Clean installation succeeds from the synchronized lockfile |
| `npm install` is required in CI | Current workflow comment | Outdated | Deterministic `npm ci` now succeeds |
| CI uses duplicate workflows | Recovery reports | Verified current before remediation | Consolidated by the remediation change |
| PWA is missing | PR #19/report family | Contradictory | Manifest and service worker exist; offline maturity is unverified |
| ZATCA Phase 2 is complete | Optimistic status reports | Contradictory/unverified | Production clearance/reporting is not demonstrated |
| Payment integration is complete | Optimistic status reports | Unverified | Production provider and reconciliation evidence is absent |
| Core platform is production-grade | PR #19/report family | Unsupported | Critical compliance, payment, RBAC, and governance gates remain |
| `server/routes.ts` is monolithic | Multiple reviews | Verified current | 20,654 physical lines |
| `server/storage.ts` is monolithic | Multiple reviews | Verified current | 10,979 physical lines |
| `shared/schema.ts` is monolithic | Multiple reviews | Verified current | 10,147 physical lines |
| Type suppression is extensive | Multiple reviews | Verified current | 60 files contain `@ts-nocheck` |
| Console logging is widespread | Multiple reviews | Verified current | 1,860 console call occurrences |
| Client/E2E tests are sparse | Multiple reviews | Verified current | Only two Playwright specs for approximately 250 pages |
| Customer invoice PDF/Arabic shaping may fail | Deep review family | Unverified current | Preserve for targeted customer-portal retest |
| Service tracking may lack ownership enforcement | Deep review family | Unverified current/high risk | Preserve for tenant/ownership negative testing |
| Appointment rendering may display objects directly | Deep review family | Unverified current | Preserve for regression test |
| Upload/call/email/contact/dismiss controls may be unwired | Deep review family | Unverified current | Preserve as UX acceptance checklist |
| HR tabs contain mock data | Deep review family | Unverified current | Preserve for HR feature-by-feature validation |
| GOSI values are hardcoded | Deep review family | Unverified current | Preserve for regulatory validation |
| Duplicate storage methods exist | Deep review family | Verified current | Production build reports duplicate IoT alert, loyalty account, and notification class members |
| `apiRequest` argument order was inconsistent | Deep review family | Outdated or localized | Current helper signature is `(method, url, data)`; callers still need lint/type coverage |
| Employee passwords may be stored or displayed in plaintext | Deep review family | Unverified current/critical if reproduced | Requires targeted data-flow and UI verification before closure |
| A live `u.filter` error existed | Deep review family | Unverified current | Preserve for regression reproduction |
| Navigation and route labels diverge | Multiple reviews | Partially verified/hygiene | Treat as UX inventory work, not a launch blocker by itself |

## 3. Historical Evidence Retention

Unique historical claims that could not be reproduced within the canonical audit are retained because they identify useful test cases. They are not counted as current defects until a maintainer records:

1. the exact route or component,
2. reproduction steps,
3. the affected commit,
4. expected and actual behavior, and
5. tenant, role, and data preconditions.

This rule prevents stale reports from inflating the current defect count while preserving potentially important evidence.

## 4. Evidence Hierarchy

When sources disagree, the canonical report uses this order:

1. Reproducible behavior on the audited commit.
2. Current repository code and configuration.
3. Current GitHub workflow, PR, and issue artifacts.
4. Dated reports that clearly identify SALIS-GMS and a commit.
5. Undated or mixed-repository reports.
6. Completion percentages and readiness labels without acceptance evidence.

## 5. Canonical Status Language

Use:

- "implemented" when code exists;
- "verified" only when a repeatable check passed;
- "production-ready" only after release gates and accountable approval;
- "fixed" only when the original acceptance criteria pass on the target branch;
- "external context" for claims about `tazamohd/mnus` and `MotazMohd/SalisAutoPlatform`.

Do not aggregate table, route, endpoint, or feature counts across repositories.
