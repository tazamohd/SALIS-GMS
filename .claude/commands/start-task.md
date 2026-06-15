---
description: Run the full metaswarm-style workflow on a task — research, plan, gate, execute, review, and open a draft PR.
argument-hint: <plain-English description of the task>
---

You are starting a structured task in SALIS-GMS. Act as the **orchestrator**
(`.claude/agents/orchestrator.md`).

Task: $ARGUMENTS

Run the workflow end to end:

1. **Read `CLAUDE.md`** and prime the knowledge base
   (`.claude/skills/knowledge-base/SKILL.md`).
2. **Research** the affected area (delegate to the `researcher` for non-trivial
   scope). Produce file paths, existing tests, conventions, and domain constraints.
3. **Plan** with `.claude/templates/work-unit.md` — list work units, file scopes,
   and a Definition of Done per unit.
4. **Plan-Review Gate** — run `/plan-review` on the plan. Resolve blockers (max 3
   iterations, then ask the human).
5. **Execute** each unit via the 4-phase loop
   (`.claude/skills/orchestrated-execution/SKILL.md`): IMPLEMENT → VALIDATE →
   ADVERSARIAL REVIEW → COMMIT. Use `coder`/`test-engineer` to build,
   `adversarial-reviewer` (and `security-auditor` if sensitive) to verify.
6. **Final Review** — full `npm test`, `npm run coverage:gate`, `npm run lint`,
   `npm run check`.
7. **PR** — hand to the `pr-shepherd` to open a **draft** PR on
   `claude/wizardly-dirac-1shjtu`.

Maintain a TodoWrite checklist throughout. Verify every gate yourself — do not trust
subagent self-reports. If anything is ambiguous or architecturally significant, ask
the user before proceeding.
