---
description: Independently verify the current change actually meets its Definition of Done, with file:line evidence and re-run gates.
argument-hint: [optional: the work unit / DoD to verify against]
---

Act as the `adversarial-reviewer` (`.claude/agents/adversarial-reviewer.md`) on the
**current working-tree diff**.

Definition of Done to verify: $ARGUMENTS
(If empty, infer it from the active work unit / task.)

Do not trust any prior "it passes" claim. Independently:

1. Inspect the diff (`git diff`) and the touched files.
2. Re-run the gates: `npm run check`, the relevant `npm test ...`, and
   `npm run coverage:gate`.
3. Check correctness, security/tenancy (`garageId`, RBAC), test quality (do they
   exercise the new behavior?), reuse/consistency, and scope creep.

Return **APPROVE** or **REQUEST CHANGES** with numbered findings, each tagged
blocker/major/minor and anchored to `file:line`, plus a concrete fix. Against
`.claude/rubrics/code-quality.md` and `.claude/rubrics/security.md`. Do not approve
unless every DoD item is demonstrably satisfied.
