# Claude Skills

Project-level Claude Code skills for SALIS AUTO (automotive ERP / garage management).

These skills are sourced from [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) (MIT licensed) and curated to match this project's stack: React 18 + Vite + TanStack Query + Radix/Tailwind on the frontend, Express + TypeScript + Passport + WebSockets on the backend, PostgreSQL + Drizzle ORM, and integrations with OpenAI, Stripe, PayPal, and Twilio. Tests run on Vitest, Testing Library, Playwright, and Supertest.

Claude activates a skill automatically when a request matches its description/triggers.

## Installed skills

### Language & framework
- **typescript-pro** — TypeScript across client/server/shared
- **react-expert** — React 18 components, hooks, TanStack Query

### Data layer
- **postgres-pro** — PostgreSQL (Neon) tuning and features
- **database-optimizer** — query/index/schema optimization
- **sql-pro** — SQL authoring and review

### API & architecture
- **api-designer** — REST API design for the Express routes
- **architecture-designer** — system/module architecture
- **fullstack-guardian** — end-to-end feature coherence
- **websocket-engineer** — real-time WebSocket features
- **legacy-modernizer** — refactoring (see REFACTORING_CHECKLIST.md)

### Quality, testing & debugging
- **test-master** — Vitest / integration test strategy
- **playwright-expert** — Playwright e2e tests
- **code-reviewer** — code review
- **code-documenter** — documentation
- **debugging-wizard** — debugging workflows

### Security & ops
- **security-reviewer** — security review (auth, payments, compliance)
- **secure-code-guardian** — secure coding (bcrypt, 2FA, sessions)
- **devops-engineer** — Docker / Railway / Render deploy & CI
- **monitoring-expert** — logging, auditing, observability

### AI
- **prompt-engineer** — OpenAI integration prompting

## Adding more

The upstream repo has 66 skills. Framework experts for stacks this project does
not use (Angular, Django, Rails, NestJS, Spring, .NET, Go, Rust, PHP, Vue,
Flutter, etc.) and unused infra/data tooling (Terraform, Kubernetes, Spark,
pandas, ML pipelines) were intentionally omitted. To add one, copy its folder
from the upstream repo into this directory.
