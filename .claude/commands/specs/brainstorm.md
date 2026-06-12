---
description: Turn a feature idea into a technology-agnostic functional specification under docs/specs/. Documentation only — never writes code.
argument-hint: "<feature idea>"
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite
model: inherit
---

# /specs:brainstorm — functional specification

Transform the idea in `$ARGUMENTS` into a **functional specification** describing
WHAT the system does, not HOW it is built. This is **documentation only** — do
not edit source, tests, or config. (Adapted from developer-kit's SDD workflow.)

## Rules
- **Technology-agnostic**: describe behaviour, inputs, outputs, rules, and roles.
  Do NOT name frameworks, tables, or components — those decisions belong to
  `/specs:spec-to-tasks`.
- Requirements use IDs and obligation keywords: `REQ-001 The system SHALL …`
  (SHALL = mandatory, SHOULD = recommended, MAY = optional).
- Acceptance criteria must be **testable**.
- Include **Non-Goals** (≥3) and **Negative requirements** (≥3 things the system
  SHALL NOT do — security, data integrity, tenant isolation).
- At most 3 `[NEEDS CLARIFICATION]` markers for genuinely blocking unknowns; use
  `AskUserQuestion` for those rather than guessing.

## Steps
1. **Discover context**: skim relevant areas of the repo (pages, routes, schema)
   to ground the spec — but keep the spec itself implementation-free. Note which
   of the 7 roles the feature touches and whether it's tenant-scoped
   (garage/branch).
2. **Refine**: ask 1–3 sharp questions if scope is ambiguous. If the idea looks
   larger than ~15 tasks, propose splitting it into multiple specs.
3. **Assign an id**: `NNN-feature-name` (next free number under `docs/specs/`),
   e.g. `001-vehicle-recall-alerts`.
4. **Write the spec** to `docs/specs/<id>/specification.md` using the structure
   in `.claude/templates/functional-specification.md` (Business context, Roles,
   Functional requirements, User flows, Acceptance criteria, Saudi/compliance
   considerations, Negative requirements, Non-Goals, Assumptions, Open
   questions).
5. **Save the original request** verbatim to `docs/specs/<id>/user-request.md`.
6. **Quality check**: every requirement testable, Non-Goals present, no tech
   leakage. Summarize and point to the next step:
   `/specs:spec-to-tasks docs/specs/<id>/`.
