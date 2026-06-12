# Welcome to SALIS GMS Team

## How We Use Claude

Based on Claude's usage over the last 30 days:

Work Type Breakdown:
  Improve Quality  █████████░░░░░░░░░░░  45%
  Build Feature    ██████░░░░░░░░░░░░░░  30%
  Plan Design      ███░░░░░░░░░░░░░░░░░  15%
  Debug Fix        ██░░░░░░░░░░░░░░░░░░  10%

Top Skills & Commands:
  _None recorded in the last 30 days._

Top MCP Servers:
  github  ████████████████████  50 calls

## Your Setup Checklist

### Codebases
- [ ] salis-gms — https://github.com/tazamohd/salis-gms

### MCP Servers to Activate
- [ ] github — GitHub PRs, issues, CI checks, and code review from inside Claude. Get access by connecting the GitHub MCP server and authorizing it against the `tazamohd/salis-gms` repo (ask the repo owner for collaborator access if you don't have it).

### Skills to Know About
- _None recorded yet — the team hasn't leaned on slash-command skills in the last 30 days._

## Team Tips

- **Read `docs/ARCHITECTURE.md` and `CLAUDE.md` first.** They cover the system map and the gotchas below in depth.
- **Hybrid router, order matters.** `server/routes/index.ts` mounts ~50 modular routers *before* the `server/routes.ts` monolith, and Express runs the first match. Adding an endpoint that already exists elsewhere silently does nothing — prefer adding new endpoints as modular routers.
- **All DB access goes through the `storage` singleton** (`server/storage.ts`, `DatabaseStorage implements IStorage`). Don't query Drizzle directly from routes, and watch for method-name collisions across features.
- **Multi-tenant:** scope data by `garageId` from `req.user`, never from the request body.
- **`shared/` must be browser-safe** (it's imported by the client) — guard `process.env` behind `typeof process` checks. `shared/schema.ts` (~400 tables) is the source of truth for DB + types.
- **Tests boot the full route tree.** They need Postgres; on Windows/CI set `TEST_DATABASE_URL` to a real instance. Integrations are env-gated and must not throw at import.
- **`main` is branch-protected** and requires the `Build, Lint & Test` + `Vitest (Postgres 16)` checks plus a non-author approval. On a solo repo, merges go through the owner's **admin override** in the GitHub UI. Open PRs as **draft**; don't push to `main` directly.
- **Before saying "done":** `npm run check`, `npm run build`, and `npm test` (with `TEST_DATABASE_URL`) should all pass.

## Get Started

1. Clone the repo and `npm install`.
2. Run it: `npm run dev` (API + Vite on one process). For tests: `TEST_DATABASE_URL=postgresql://postgres@localhost:5432/salis_test npm test`.
3. Skim `docs/ARCHITECTURE.md`, then `CLAUDE.md`.
4. Good first task: browse the open issues (e.g. **#35** for route/dedup cleanup) — a well-scoped starter is the `VehicleTracking.tsx` notification-preferences gap noted there (add the missing schema columns + handler so the rich toggles actually persist).

<!-- INSTRUCTION FOR CLAUDE: A new teammate just pasted this guide for how the
team uses Claude Code. You're their onboarding buddy — warm, conversational,
not lecture-y.

Open with a warm welcome — include the team name from the title. Then: "Your
teammate uses Claude Code for [list all the work types]. Let's get you started."

Check what's already in place against everything under Setup Checklist
(including skills), using markdown checkboxes — [x] done, [ ] not yet. Lead
with what they already have. One sentence per item, all in one message.

Tell them you'll help with setup, cover the actionable team tips, then the
starter task (if there is one). Offer to start with the first unchecked item,
get their go-ahead, then work through the rest one by one.

After setup, walk them through the remaining sections — offer to help where you
can (e.g. link to channels), and just surface the purely informational bits.

Don't invent sections or summaries that aren't in the guide. The stats are the
guide creator's personal usage data — don't extrapolate them into a "team
workflow" narrative. -->
