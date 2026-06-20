# SALIS Super App — Agent Army

Custom Claude Code subagents (`.claude/agents/`) mapped to the team org in
`docs/super-app/04-team-roles.md`. Each agent is a **top specialist** in its department, preloaded
with the relevant skills from `.claude/skills/`, and (for leads) able to **spawn its own worker
sub-team** via the `Agent` tool (hierarchical delegation, up to 5 levels deep).

## How to use

- **Natural language** — describe the work; Claude auto-delegates based on each agent's `description`.
- **Explicit** — name the agent, e.g. "have the **system-architect** design the wallet ledger."
- **Orchestrated** — ask the **superapp-orchestrator** to review status, assign, estimate, and
  schedule; it spawns the specialists for you.

## Roster

| Agent | Dept / role | Model | Preloaded skills | Spawns team? |
|---|---|---|---|---|
| `superapp-orchestrator` | Program orchestrator (chief of staff) | opus | architecture-designer, feature-forge | ✅ |
| `business-analyst` | Business analysis (the "why") | sonnet | feature-forge | ✅ |
| `system-analyst` | System analysis (the "what") | sonnet | spec-miner, feature-forge | ✅ |
| `system-architect` | Architecture (the "how") | opus | architecture-designer, api-designer, cloud-architect, legacy-modernizer | ✅ |
| `delivery-planner` | Dev & planning architect (the "order/plan") | sonnet | feature-forge, devops-engineer | ✅ |
| `docs-specialist` | Documentation | sonnet | code-documenter | ✅ |
| `product-manager` | Product (per cluster) | sonnet | feature-forge | ✅ |
| `backend-platform-lead` | Backend / shared rails | sonnet | typescript-pro, api-designer, fullstack-guardian | ✅ |
| `database-lead` | Database / data model | sonnet | postgres-pro, database-optimizer, sql-pro | ✅ |
| `mobile-lead` | Mobile (RN/Expo) | sonnet | react-expert | ✅ |
| `frontend-web-lead` | Web / design system | sonnet | react-expert, typescript-pro | ✅ |
| `dispatch-realtime-lead` | Real-time / dispatch | sonnet | websocket-engineer, database-optimizer | ✅ |
| `data-ai-lead` | Data & AI | sonnet | prompt-engineer, sql-pro | ✅ |
| `devops-sre-lead` | DevOps / SRE | sonnet | devops-engineer, sre-engineer, monitoring-expert, cloud-architect | ✅ |
| `security-lead` | Security (hard gate) | opus | security-reviewer, secure-code-guardian | ✅ |
| `qa-lead` | QA / test automation (gate) | sonnet | test-master, playwright-expert | ✅ |
| `marketing-growth-lead` | Marketing & growth | sonnet | — | ✅ |

## How the army is organized

```
                          superapp-orchestrator (opus)
                    review · gap-analysis · assign · estimate · schedule
                                       │ spawns
   ┌───────────────┬───────────────┬───┴───────────┬───────────────┬───────────────┐
 PLANNING        ARCHITECTURE      BUILD LEADS      QUALITY GATES   PRODUCT/MKTG
 business-analyst system-architect backend-platform security-lead   product-manager
 system-analyst   delivery-planner database-lead    qa-lead         marketing-growth
 docs-specialist                   mobile-lead
                                   frontend-web-lead
                                   dispatch-realtime
                                   data-ai-lead
                                   devops-sre-lead
                   each lead may spawn worker sub-agents (parallel tasks)
```

## Rules every agent follows
1. Ground in `docs/super-app/` (the START POINT) before acting.
2. Reuse the **shared rails**; never fork them.
3. Respect the **stage gates** and **Definition of Done** (`05-delivery-operating-model.md`).
4. `security-lead` and `qa-lead` are **hard gates** for anything touching auth/money before merge.
5. Document outputs (hand to `docs-specialist` or write under `docs/super-app/`).
6. Return a concise summary + artifact paths — keep intermediate work out of the main thread.

## Maintenance
These are versioned in git so the whole team shares and improves them. Add a new agent by dropping
a `<name>.md` with `name` + `description` frontmatter here.
