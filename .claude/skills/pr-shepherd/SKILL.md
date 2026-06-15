---
name: pr-shepherd
description: Procedure for opening and driving a SALIS-GMS pull request to green CI and merge. Use after all gates pass to create a draft PR and babysit it through CI and review.
---

# PR Shepherd

Take a gated change to a merge-ready, green draft PR — and keep it green.

## Preconditions (re-verify, don't trust)

```bash
npm run check && npm test && npm run lint && npm run coverage:gate
```

## Open

1. Push: `git push -u origin claude/wizardly-dirac-1shjtu`
   (retry on network error with backoff 2s/4s/8s/16s).
2. Create a **draft** PR with `mcp__github__create_pull_request` (`draft: true`),
   base `main`, head `claude/wizardly-dirac-1shjtu`. Body from
   `.claude/templates/pr-body.md`. One PR per branch — reuse if it exists.

## Shepherd

- **CI**: watch the `Tests` and `quality-gate` workflows. On failure, fetch job logs
  via the GitHub MCP tools, diagnose the real cause, fix, re-run gates locally, push.
  Re-diagnose and re-kick on every red run — one round is not the job.
- **Reviews**: investigate each comment. Clear & in-scope → fix and push. Ambiguous or
  architecturally significant → ask the human before acting.
- **Live state**: refresh the PR checklist on every event.
- **Frugality**: comment only to resolve a thread or ask a blocking question — the diff
  is the record.

## Events & follow-up

- Offer `subscribe_pr_activity` so CI/review events wake the session; `sleep`-polling
  is not allowed.
- CI success, new pushes, and merge-conflict transitions are not delivered as events —
  if a self-check-in scheduler is available, arm one ~1h out and re-check state.
- Done only when the PR is **MERGED** or **CLOSED**. Stop immediately if the user says
  to (`unsubscribe_pr_activity`).
