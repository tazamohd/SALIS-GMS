# Knowledge Base

Self-learning memory for the SALIS-GMS swarm. Captures durable lessons so agents stop
re-learning the same things.

- **`knowledge.jsonl`** — the entries (one JSON object per line).
- **`SCHEMA.md`** — the record shape and the four types
  (`pattern` / `anti-pattern` / `decision` / `gotcha`).

## Prime before a task

Load only what's relevant to the area you're touching:

```bash
grep -i -E 'rbac|tenant|garageid' .claude/knowledge/knowledge.jsonl
grep -F 'shared/vatUtils.ts'      .claude/knowledge/knowledge.jsonl
```

## Capture after a task

Run `/self-reflect` (skill: `.claude/skills/knowledge-base/SKILL.md`). Append only
lessons that generalize beyond the single change. Don't duplicate — update instead.

Keep it small and high-signal: this file is read often.
