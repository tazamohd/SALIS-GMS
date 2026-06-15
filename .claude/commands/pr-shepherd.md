---
description: Open a draft PR (after gates pass) and shepherd it through CI to green.
argument-hint: [optional: PR title / summary]
---

Act as the `pr-shepherd` (`.claude/agents/pr-shepherd.md`).

Summary: $ARGUMENTS

1. **Verify gates first** (re-run, don't trust): `npm run check`, `npm test`,
   `npm run lint`, `npm run coverage:gate`.
2. **Push** the branch: `git push -u origin claude/wizardly-dirac-1shjtu` (retry on
   network error: 2s, 4s, 8s, 16s).
3. **Open a draft PR** with the GitHub MCP tools (`mcp__github__create_pull_request`,
   `draft: true`), body from `.claude/templates/pr-body.md`. Base: `main`. Only one
   PR per branch — reuse if it already exists.
4. **Watch CI** (`Tests`, `quality-gate`). On red: fetch job logs, diagnose, fix,
   re-run gates locally, push. Re-kick until green.
5. Offer to `subscribe_pr_activity` so review comments and CI events wake the session.

Keep a live checklist. Comment on the PR only to resolve a thread or ask a genuine,
blocking question. The job is done only when the PR is MERGED or CLOSED.
