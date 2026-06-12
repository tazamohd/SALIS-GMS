# `.claude/` — Claude Code setup for SALIS-GMS

Project-scoped configuration that teaches Claude this repo's conventions.
Adapted from patterns in
[developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit) and
**retuned for the actual stack** (React 18 + Wouter + shadcn/Radix, plain
Express, Drizzle) — the upstream TypeScript plugin assumes NestJS + React 19,
which this project does not use.

## Contents

| File | Purpose |
|------|---------|
| `../CLAUDE.md` | Project memory: stack, layout, path aliases, real npm scripts, conventions. Loaded automatically. |
| `commands/code-review.md` | `/code-review` — review the diff against this repo's conventions, security, and tests. |
| `commands/security-review.md` | `/security-review` — auth, RBAC, multi-tenant isolation, secrets, ZATCA integrity. |
| `commands/add-route.md` | `/add-route` — scaffold a domain `*.routes.ts` module + test following the existing pattern. |
| `commands/specs/*.md` | SDD workflow: `/specs:brainstorm`, `/specs:spec-to-tasks`, `/specs:task-implementation`, `/specs:task-review`. Outputs to `docs/specs/`. |
| `templates/*.md` | `functional-specification.md` and `task.md` used by the SDD commands. |
| `agents/react-frontend-expert.md` | Sub-agent for the React 18 client. |
| `agents/express-api-expert.md` | Sub-agent for the Express/Drizzle/RBAC backend. |
| `agents/drizzle-schema-expert.md` | Sub-agent for `shared/schema.ts` and migrations. |
| `settings.json` | Allowlist for common safe commands to reduce permission prompts. |

## Using it
- Commands: type `/code-review`, `/security-review`, or `/add-route <domain>`.
- Agents activate automatically by description, or invoke explicitly
  (e.g. "use the express-api-expert to add …").

## SDD workflow (Specifications-Driven Development)
A trimmed, stack-tuned adaptation of developer-kit's SDD loop:
```
/specs:brainstorm "<idea>"                       → docs/specs/<id>/specification.md
/specs:spec-to-tasks docs/specs/<id>/            → docs/specs/<id>/tasks/TASK-*.md
/specs:task-implementation .../tasks/TASK-001.md → code + tests (TDD)
/specs:task-review docs/specs/<id>/              → coverage + convention report
```
See `docs/specs/README.md` for details.

## Want the full upstream marketplace instead?
You can additionally install developer-kit's plugins:
```
/plugin marketplace add giuseppe-trisciuoglio/developer-kit
/plugin install developer-kit-core
/plugin install developer-kit-specs   # SDD workflow
```
Be aware its `developer-kit-typescript` guidance targets NestJS + React 19; the
local agents here are the stack-correct version for SALIS-GMS.

## Maintaining
Keep `CLAUDE.md` accurate when scripts, aliases, or architecture change. These
files are version-controlled so the whole team shares the same Claude setup.
