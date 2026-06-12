# Spec-Kit for Claude Code (SALIS-GMS)

Spec-Driven Development (SDD) skills and slash commands, ported to Claude Code's
native layout from
[compnew2006/Spec-Kit-Antigravity-Skills](https://github.com/compnew2006/Spec-Kit-Antigravity-Skills)
(itself adapted from [github/spec-kit](https://github.com/github/spec-kit)).

## What this gives you

A disciplined pipeline that turns an idea into shipped code through structured
artifacts (`spec.md`, `plan.md`, `tasks.md`) instead of ad-hoc prompting:

```
specify → clarify → plan → tasks → analyze → implement → checker → tester → reviewer → validate
```

## Layout

```
.claude/
├── skills/                 # @-mention capabilities (Read-and-execute know-how)
│   ├── speckit.<name>/SKILL.md
│   ├── speckit.<name>/templates/...
│   └── scripts/bash/       # shared git/file logic (check-prerequisites, setup-plan, ...)
└── commands/               # /slash-command orchestrators (one per workflow phase)
```

- **Skills** (`.claude/skills/speckit.*`): Claude auto-discovers these. Each
  `SKILL.md` carries the role + step-by-step protocol for one phase.
- **Commands** (`.claude/commands/*.md`): thin orchestrators. Typing
  `/04-speckit.plan` reads the matching skill and executes it against your input.

## Changes made during the port

This is the upstream content, reorganized to actually work in Claude Code (the
upstream "just rename `.agent` → `.claude`" note leaves the workflows dead,
because Claude Code reads slash commands from `.claude/commands/`, not
`.claude/workflows/`):

1. `workflows/*` → `.claude/commands/*` (so they register as slash commands).
2. Skill path references rewritten `.agent/skills/...` → `.claude/skills/...`.
3. Antigravity's `view_file` tool → Claude's `Read` tool.
4. Normalized inconsistent `.specify/scripts/bash/...` refs to the shipped
   `../scripts/bash/...` path.

The shared bash scripts are unchanged: they key off the git root and a `specs/`
directory, and expect feature branches named `NNN-short-name` (created for you
by `/02-speckit.specify`).

## Quick start

```
/01-speckit.constitution    # establish project rules first (recommended)
/02-speckit.specify  "Add a parts low-stock email alert"
/03-speckit.clarify         # resolve ambiguities
/04-speckit.plan
/05-speckit.tasks
/07-speckit.implement
```

Or run the front-half in one shot with `/speckit.prepare`, or the whole
specify→analyze pipeline with `/00-speckit.all`.

## Note on overlap with built-ins

The QA-stage commands (`/08-speckit.checker`, `/09-speckit.tester`,
`/10-speckit.reviewer`, `/11-speckit.validate`) overlap with Claude Code's
built-in `/code-review`, `/security-review`, and `/verify`. They're included for
a complete pipeline; use whichever fits your workflow.
