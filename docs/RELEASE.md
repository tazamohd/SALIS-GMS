# Release Procedure

Single release path through `main`. No exceptions.

## Branch strategy

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Protected release trunk. All production deploys come from here. | Permanent |
| `claude/*`, `feature/*` | Development work. One PR per branch, targeting `main`. | Deleted after merge |

## Merge sequence

1. Create a feature branch from `main`.
2. Open a **draft PR** targeting `main`.
3. CI must pass: `Build, Lint & Test` + `Vitest (Postgres 16)`.
4. Request review — one non-author approval required (admin override for solo repo).
5. Squash-merge into `main`. Delete the source branch.
6. Tag the merge commit for release: `git tag -a v<semver> -m "Release v<semver>"`.

## Rollback

- **Code rollback:** `git revert <merge-commit>`, open a PR for the revert, merge normally.
- **Emergency:** Admin force-pushes `main` to the previous tag. Re-deploy from that tag.
- **Database:** If the release included a migration (`npm run db:push`), restore from the most recent backup before re-deploying.

## Required branch protection rules (GitHub Settings > Branches)

- Require pull request reviews before merging (1 approval minimum)
- Require status checks to pass before merging:
  - `Build, Lint & Test`
  - `Vitest (Postgres 16)`
- Require branches to be up to date before merging
- Do not allow bypassing the above settings (admin override allowed for solo repo)
- Restrict force pushes (no one, or admin-only for emergencies)
- Automatically delete head branches after merge

## Prohibited

- Multiple open PRs from the same long-lived integration branch.
- Merging without green CI.
- Pushing directly to `main`.
- Readiness claims without a tag or exact commit SHA.

## Branch cleanup policy

- Feature branches are deleted immediately after their PR is merged.
- Stale branches (no commits in 30 days, no open PR) are deleted.
- The `clean-source` branch is an archived snapshot — do not target new PRs to it.
