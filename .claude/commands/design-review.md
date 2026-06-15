---
description: Run a parallel multi-specialist design review (architecture, security, tests, domain/UX) on a design or significant change.
argument-hint: [optional: path or summary of the design/change]
---

Run the **Design-Review Gate** (`.claude/skills/design-review-gate/SKILL.md`).

Under review: $ARGUMENTS
(If empty, review the current design/diff in this session.)

Dispatch specialist reviewers **in parallel** (one Agent call per reviewer, in a
single message) and then synthesize:

- `architect` — structure, boundaries, data model, trade-offs, simplicity.
- `security-auditor` — RBAC, `garageId` tenant isolation, secrets, input validation,
  compliance-data integrity.
- `test-engineer` — test strategy adequacy and coverage-gate impact.
- `adversarial-reviewer` — tries to break the design and verifies DoD realism.

Collect each verdict, then produce a single consolidated decision: **APPROVE** or
**REQUEST CHANGES**, deduplicated and severity-ordered (blocker/major/minor) with
`file:line` or design-section references. Max 3 iterations before escalating to the
human. Gate rubric: `.claude/rubrics/design-review.md`.
