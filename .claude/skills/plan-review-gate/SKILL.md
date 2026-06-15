---
name: plan-review-gate
description: Adversarial review of a plan/design before coding begins in SALIS-GMS. Use to catch flawed approaches, missing tenant-isolation, or untestable decomposition while changes are still cheap.
---

# Plan-Review Gate

A cheap gate that pays for itself: review the *plan* before a line of code is written.

## Inputs

- The plan / design (ideally expressed as work units via
  `.claude/templates/work-unit.md`).
- Rubric: `.claude/rubrics/design-review.md`.

## Procedure

1. Read the plan and the relevant code it touches.
2. As `adversarial-reviewer`, challenge it on:
   - **Problem fit & simplicity** — does it solve the actual problem the simplest way
     that fits the architecture?
   - **Data model** — Drizzle schema/migration choices; additive & backward-compatible;
     `garageId` preserved everywhere.
   - **API & reuse** — modular `server/routes/`; shared Zod schemas; no duplicated
     `shared/*Utils.ts` math.
   - **Decomposition** — small, independently testable units, each with a concrete DoD
     and test strategy.
   - **Risk & security surface** — flags auth/RBAC/payments/PII; avoids vendor-locked
     files; identifies unknowns.
3. Produce **APPROVE** or **REQUEST CHANGES** with numbered, severity-tagged findings
   (blocker/major/minor) and a concrete fix each.

## Exit

- No unresolved **blocker** → APPROVE, proceed to execution.
- Otherwise revise and re-review. After **3** iterations without approval, escalate to
  the human with the open blockers summarized.
