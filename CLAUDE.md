# CLAUDE.md

Guidance for agents working in the SALIS-GMS repo.

## Project at a glance

Full-stack TypeScript application:

- **client/** — React 18 + Vite + Tailwind + Radix UI, Wouter routing, TanStack Query, i18next.
- **server/** — Express API, Passport auth, Drizzle ORM over Postgres (Neon).
- **shared/** — Drizzle schema and shared types (the canonical data model).
- **e2e/** — Playwright end-to-end tests.

See `README.md` for setup and `replit.md` for deployment notes.

## Commands

| Task                | Command                  |
| ------------------- | ------------------------ |
| Dev server          | `npm run dev`            |
| Type check          | `npm run check`          |
| Lint                | `npm run lint`           |
| Format              | `npm run format`         |
| Unit/integration    | `npm test`               |
| Watch tests         | `npm run test:watch`     |
| Server tests        | `npm run test:server`    |
| Route/integration   | `npm run test:integration` |
| Coverage            | `npm run test:coverage`  |
| Push DB schema      | `npm run db:push`        |

## Agent skills

This repo has [mattpocock/skills](https://github.com/mattpocock/skills) installed
under `.claude/skills/`. The engineering skills read the per-repo config below.

### Issue tracker

Issues live as GitHub issues on `tazamohd/salis-gms` (via the `gh` CLI locally, or
the GitHub MCP tools in remote sessions). See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map to identically-named GitHub labels.
See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. Glossary lives in `CONTEXT.md` (created lazily by `/grill-with-docs`),
decisions in `docs/adr/`. See `docs/agents/domain.md`.
