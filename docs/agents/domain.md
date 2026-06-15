# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

SALIS-GMS is a **single-context** repo.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root (the domain glossary), if it exists.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

Useful existing orientation while `CONTEXT.md` is still thin:

- `README.md` — project overview and setup.
- `replit.md` — running notes about the deployed environment.
- `docs/` — feature and refactoring notes.
- `shared/` — Drizzle schema / shared types (the canonical data model).

## File structure

Single-context repo:

```
/
├── CONTEXT.md          ← domain glossary (created lazily by /grill-with-docs)
├── docs/adr/           ← architectural decision records
├── client/             ← React frontend
├── server/             ← Express backend
└── shared/             ← Drizzle schema + shared types
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 — but worth reopening because…_
