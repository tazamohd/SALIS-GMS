---
name: knowledge-base
description: How to prime from and contribute to the SALIS-GMS knowledge base (patterns, anti-patterns, decisions, gotchas). Use at task start to load relevant lessons, and at task close to capture new ones.
---

# Knowledge Base

A self-learning store of durable lessons so the swarm gets better over time without
re-learning the same mistakes. Backed by `.claude/knowledge/knowledge.jsonl`
(schema: `.claude/knowledge/SCHEMA.md`).

## Priming (task start)

Load only what's relevant — keep context lean. Match the task's files/keywords against
the base:

```bash
# entries touching the area you're about to change
grep -i -E 'vat|zatca|invoice' .claude/knowledge/knowledge.jsonl
grep -F 'server/routes/' .claude/knowledge/knowledge.jsonl
```

Read matching records' `detail` and apply them. Prefer `anti-pattern` and `gotcha`
records — they're the ones that bite. Do not load the whole file when a filtered slice
will do.

## Capturing (task close — `/self-reflect`)

After a task/PR, append durable lessons. A lesson qualifies if it **generalizes beyond
this one change** — a convention, a non-obvious gotcha, a decision with rationale, or a
correction the user made more than once.

Append one JSONL object per lesson (see SCHEMA.md), e.g.:

```json
{"type":"gotcha","title":"Server tests need Postgres","detail":"vitest globalSetup boots the route tree; without DATABASE_URL/TEST_DATABASE_URL server & route tests fail. Use the CI postgres:16 service or a local TEST_DATABASE_URL.","tags":["testing","vitest","postgres"],"paths":["server/__tests__/globalSetup.ts","vitest.config.ts"],"date":"2026-06-13"}
```

## Hygiene

- Don't duplicate — update the existing record instead.
- Keep `title`/`tags` precise; they drive priming.
- A recurring correction is a signal to add/adjust a skill or rubric, not just a note.
- Threshold/convention changes go in as `decision` records with the why.
