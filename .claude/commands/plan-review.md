---
description: Adversarially review a plan/design before any code is written, against the design rubric.
argument-hint: [optional: path or summary of the plan to review]
---

Run the **Plan-Review Gate** (`.claude/skills/plan-review-gate/SKILL.md`).

Plan under review: $ARGUMENTS
(If empty, review the most recent plan produced in this session.)

Acting as the `adversarial-reviewer`, scrutinize the plan against
`.claude/rubrics/design-review.md`. Check that it:

- Solves the stated problem with the simplest approach that fits the architecture.
- Has correct data-model/migration choices and preserves `garageId` tenant isolation.
- Puts new routes in modular `server/routes/`, reuses shared Zod schemas and
  `shared/*Utils.ts`, and respects RBAC + the dark-theme/RTL UI conventions.
- Decomposes into small, independently testable work units each with a concrete
  Definition of Done and a test strategy.
- Identifies risks, security-sensitive surface, and avoids vendor-locked files.

Return **APPROVE** or **REQUEST CHANGES** with a numbered, severity-tagged findings
list (blocker/major/minor) and a concrete fix for each. Do not pass a plan with
unresolved blockers. Escalate to the human after 3 failed iterations.
