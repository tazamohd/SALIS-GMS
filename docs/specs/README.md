# Specifications (SDD)

This folder holds **Specifications-Driven Development** artifacts, produced by the
`/specs:*` slash commands (see `.claude/commands/specs/`). The workflow is
adapted from [developer-kit](https://github.com/giuseppe-trisciuoglio/developer-kit),
trimmed to a focused loop and retuned for the SALIS-GMS stack.

## Workflow

```
/specs:brainstorm "<idea>"                       → docs/specs/<id>/specification.md
/specs:spec-to-tasks docs/specs/<id>/            → docs/specs/<id>/tasks/TASK-*.md
/specs:task-implementation .../tasks/TASK-001.md → code + tests (TDD)
/specs:task-review docs/specs/<id>/              → coverage + convention report
```

## Layout of a spec folder

```
docs/specs/<NNN-feature-name>/
  specification.md     technology-agnostic functional spec (WHAT)
  user-request.md      the original request, verbatim
  data-model.md        entities/relationships (when schema changes)
  tasks.md             task index + requirement→task traceability
  tasks/TASK-001.md …  ordered, implementable tasks (HOW)
```

Templates live in `.claude/templates/` (`functional-specification.md`, `task.md`).

## Conventions
- `brainstorm` is **documentation only** — it never edits code, and the spec
  stays free of frameworks/tables/components.
- `spec-to-tasks` is where stack decisions are made, grounded in `CLAUDE.md`.
- Tasks are ordered schema → storage → API → client, ending with an
  integration/e2e test task and a cleanup task (`npm run check` + `npm run lint`).
