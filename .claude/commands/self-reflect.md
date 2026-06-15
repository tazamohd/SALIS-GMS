---
description: Extract reusable lessons from this task/PR into the knowledge base (patterns, anti-patterns, decisions).
argument-hint: [optional: focus area, e.g. "the RBAC bug"]
---

Run the **Closure & Learning** step (`.claude/skills/knowledge-base/SKILL.md`).

Focus: $ARGUMENTS

Review what happened in this task — the diff, review findings, any CI failures, and
anything the user had to correct more than once — and capture durable lessons.

For each lesson, append one JSONL record to `.claude/knowledge/knowledge.jsonl`
following `.claude/knowledge/SCHEMA.md`:

- `type`: `pattern` | `anti-pattern` | `decision` | `gotcha`
- a crisp `title`, a `detail` with the why, `tags`, affected `paths`, and `date`.

Rules:
- Only record lessons that generalize beyond this single change.
- If a correction recurred, note it as a candidate for a new skill/rubric update.
- If a coverage threshold or convention was changed, record the rationale as a
  `decision`.
- Keep entries short and specific; the base is primed selectively, so titles/tags
  matter. Do not duplicate an existing entry — update it instead.

End by listing the records you added.
