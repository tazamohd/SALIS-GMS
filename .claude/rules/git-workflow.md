# Rule: Git workflow

Always-on guardrails for version control in SALIS-GMS.

- Never commit directly to `main`. Branch first; develop on a feature branch.
- Keep commits focused and message them clearly (what + why). Conventional
  prefixes used here: `feat:`, `fix:`, `chore:`, `docs:`, `ci:`.
- Do not commit secrets. `.env` is local-only; `.env.example` documents the
  required keys without values.
- Run `npm run check` and the relevant tests **before** committing — a green
  type-check and test run is the bar this repo holds.
- Don't push or open/merge PRs unless the user asks. When you do push, open a
  **draft** PR if none exists for the branch.
- Don't rewrite published history or force-push shared branches.
