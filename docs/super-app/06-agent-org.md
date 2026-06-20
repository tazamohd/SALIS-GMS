# 06 — The Agent Army (AI delivery team)

We operate the program with a team of **specialist Claude Code subagents** in `.claude/agents/`,
one per department, each preloaded with its skills and able to spawn its own worker sub-team.
The full roster, models, and skills are in **`.claude/agents/README.md`** — this file explains how
the agent army maps to the human org and how to drive it.

## Agent ↔ human role mapping

| Human role (`04-team-roles.md`) | Agent |
|---|---|
| Program/Project coordination | `superapp-orchestrator` |
| Business Analyst | `business-analyst` |
| System Analyst | `system-analyst` |
| System Architect | `system-architect` |
| Development & Planning Architect | `delivery-planner` |
| Documentation Specialist | `docs-specialist` |
| Product Manager | `product-manager` |
| Backend/Platform Eng | `backend-platform-lead` |
| Database Eng | `database-lead` |
| Mobile Eng | `mobile-lead` |
| Web/Frontend Eng | `frontend-web-lead` |
| Real-time/Dispatch Eng | `dispatch-realtime-lead` |
| Data/AI Eng | `data-ai-lead` |
| DevOps/SRE | `devops-sre-lead` |
| Security Eng | `security-lead` |
| QA/Test | `qa-lead` |
| Marketing & Growth | `marketing-growth-lead` |

## How it works (Claude Code mechanics)
- Each agent is a markdown file with `name` + `description` frontmatter, a chosen `model`, and
  preloaded `skills`. Its body is the system prompt (role, what it owns, rules, output format).
- **Hierarchical delegation:** lead agents can call the `Agent` tool to spawn worker sub-agents for
  parallel subtasks (up to 5 levels deep). Only the top agent's summary returns to the main thread,
  keeping intermediate work out of context.
- **Auto vs explicit:** Claude auto-delegates from the `description`, or you can name an agent
  explicitly ("have the `security-lead` audit the wallet endpoints").

## Two ways to drive the army
1. **Direct** — call a specialist for a scoped task
   (e.g. *"`database-lead`: design the wallet ledger schema"*).
2. **Orchestrated** — call `superapp-orchestrator` for a planning round; it reviews status, does
   gap analysis, assigns to specialists, estimates, maps dependencies, schedules into sprints, and
   writes the plan to `07-master-plan-and-schedule.md`.

## Guardrails
- Every agent grounds in this `docs/super-app/` set first.
- Shared rails are reused, never forked.
- `security-lead` and `qa-lead` are **hard gates** before merging auth/money code.
- All outputs are documented (via `docs-specialist` or written under `docs/super-app/`).
