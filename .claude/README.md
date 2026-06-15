# SALIS-GMS Orchestration Layer

A lightweight, single-repo adaptation of the
[metaswarm](https://github.com/dsifry/metaswarm) multi-agent framework, tuned to
this TypeScript monorepo (Vitest + Postgres, Drizzle, Playwright, Saudi/ZATCA
domain). It gives Claude Code a repeatable **issue → merged PR** workflow with hard
quality gates, adversarial review, and a self-learning knowledge base.

## The workflow

```
Research → Plan → Plan-Review Gate → Decompose → Execute (loop) → Final Review → PR → Shepherd → Learn
```

For non-trivial work this maps to the **4-phase execution loop**, run per work unit:

```
IMPLEMENT → VALIDATE → ADVERSARIAL REVIEW → COMMIT
```

Core principle (from metaswarm): **trust nothing, verify everything** — the
orchestrator validates results independently (`npm run check` / `npm test` /
`npm run coverage:gate`) and never relies on a subagent's self-report.

## What's here

| Path | Purpose |
|------|---------|
| `agents/` | Persona definitions (subagents): orchestrator, researcher, architect, coder, test-engineer, adversarial-reviewer, security-auditor, pr-shepherd. |
| `commands/` | Slash commands: `/start-task`, `/plan-review`, `/design-review`, `/adversarial-review`, `/coverage-gate`, `/pr-shepherd`, `/self-reflect`. |
| `skills/` | Reusable procedures the agents invoke (execution loop, review gates, PR shepherd, knowledge base). |
| `rubrics/` | Pass/fail standards used by the review gates. |
| `knowledge/` | JSONL knowledge base of patterns/anti-patterns + schema + how to prime. |
| `templates/` | Work-unit and PR-body templates. |
| `hooks/` | `session-start.sh` (wired in `settings.json`). |

## Quality gates (must pass before PR)

1. **Typecheck** — `npm run check` (zero errors).
2. **Tests** — `npm test`, with tests for new logic (TDD preferred).
3. **Lint** — `npm run lint` clean for touched files.
4. **Coverage gate** — `npm run coverage:gate` against `.coverage-thresholds.json`.
5. **Adversarial review** — a reviewer persona verifies the Definition of Done with
   `file:line` evidence; the writer never approves their own work.

## How to use

- `/start-task <plain-English description>` to kick off the full workflow.
- The orchestrator decomposes into work units, runs the loop on each, and gates the
  result before opening a **draft** PR on branch `claude/wizardly-dirac-1shjtu`.
- After merge, `/self-reflect` extracts lessons into `knowledge/knowledge.jsonl`.

## Differences from upstream metaswarm

- Single repo, no BEADS/Gemini/Codex multi-CLI plugin machinery.
- Gates are wired to this project's real scripts and CI (`quality-gate.yml`).
- Personas are Claude Code subagents (`agents/*.md`), not an external swarm runtime.
