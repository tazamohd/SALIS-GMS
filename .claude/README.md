# SALIS-GMS agent workflow (`.claude/`)

This directory adapts the ideas from the [Ring](https://github.com/LerianStudio/ring)
agent-skills library into SALIS-GMS. Ring is built for Lerian's Go stack
(`lib-commons`, `lib-observability`, Go dev cycles); **none of its 68 skills run
as-is here.** What transfers is the *philosophy* — enforced TDD, gated dev cycle,
parallel code review, pre-dev planning, atomic conventional commits — re-tuned to
this repo's **TypeScript / Express / React / Drizzle** stack and real commands.

These skills and agents auto-load in any Claude Code session opened on this repo
(they're committed, unlike a global `~/.claude` install, which is ephemeral on
the web).

## Skills (`.claude/skills/`)

| Skill | Adapted from Ring | Purpose |
|-------|-------------------|---------|
| `test-driven-development` | `test-driven-development` | RED→GREEN→REFACTOR with Vitest/Supertest |
| `running-dev-cycle` | `running-dev-cycle` | Gated task-by-task implementation cycle |
| `reviewing-code` | `reviewing-code` (9-reviewer parallel) | Parallel correctness/security/test review |
| `planning-features` | `planning-small/large-features` | Small/Large pre-dev planning (PRD/TRD/plan) |
| `committing-changes` | `committing-changes` | Atomic Conventional Commits (no Lerian trailers) |

## Agents (`.claude/agents/`)

| Agent | Role |
|-------|------|
| `backend-ts` | Express + Drizzle + Zod + RBAC backend specialist |
| `frontend-react` | React + Vite + TanStack Query + Radix + i18n/RTL specialist |
| `code-reviewer` | Correctness & architecture review (parallel) |
| `security-reviewer` | Authz/RBAC/IDOR/injection/PII review (parallel) |
| `test-reviewer` | Test coverage & quality review (parallel) |

## What was intentionally dropped

- Go-specific skills: `using-lib-commons`, `using-lib-observability`,
  `detecting-goroutine-leaks`, `adding-multi-tenancy` (Go dispatch layer), etc.
- Lerian commit trailers (`X-Lerian-Ref`) and GPG signing requirement.
- The 8-gate Go backend cycle is compressed to the gates that map to this stack.

## How it ties together

`CLAUDE.md` (repo root) is the entry point and house rules. `ENGINEERING.md`
documents the same workflow for humans. CI enforces the static gates
(`.github/workflows/test.yml` = tests, `quality.yml` = typecheck + commit lint).

The loop: **plan → TDD → dev cycle gates → parallel review → conventional commit.**
