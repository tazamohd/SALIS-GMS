---
name: design-review-gate
description: Parallel multi-specialist review of a design or significant change in SALIS-GMS (architecture, security, tests, adversarial). Use for high-impact changes — new tables, endpoints, auth/RBAC, payments, or cross-cutting refactors.
---

# Design-Review Gate (parallel specialists)

For significant changes, run several specialist reviewers **concurrently** and
synthesize one decision. This catches blind spots a single reviewer misses.

## When to use

- New Drizzle tables or migrations; new/changed API surface.
- Anything touching auth, RBAC, `garageId` tenant isolation, payments, PII.
- Cross-cutting refactors (e.g. route architecture, shared schema changes).

## Procedure

1. **Dispatch in parallel** — issue one `Agent` call per reviewer in a single message:
   - `architect` — structure, boundaries, data model, trade-offs, simplicity.
   - `security-auditor` — RBAC, tenant isolation, secrets, input validation,
     compliance-data integrity.
   - `test-engineer` — is the test strategy adequate; coverage-gate impact.
   - `adversarial-reviewer` — break the design; verify DoD realism.
2. **Collect** each verdict and findings.
3. **Synthesize** a single decision: **APPROVE** or **REQUEST CHANGES**, with
   deduplicated, severity-ordered findings (blocker/major/minor), each anchored to a
   `file:line` or design section.

## Exit

- No unresolved blocker → APPROVE.
- Otherwise revise and re-run. Max **3** iterations, then escalate to the human.
- Rubric: `.claude/rubrics/design-review.md`.
