# Branch protection for `clean-source`

Two equivalent ways to apply the same policy to the canonical branch. Pick one.

## A. Repository Ruleset (recommended, importable)

`clean-source-ruleset.json` — GitHub → **Settings → Rules → Rulesets → New ruleset → Import a ruleset**, select the file.

- Targets `~DEFAULT_BRANCH`, so it applies to whichever branch is the default —
  make `clean-source` the default first (Settings → Branches), and it takes effect
  there automatically (and keeps working if you later rename it to `main`).
- `bypass_actors` grants the **Repository admin** role (`actor_id: 5`) an always-on
  bypass so you're never locked out. If import rejects the actor, remove that block
  and set **Bypass list → Repository admin → Always** in the UI after import.

## B. Classic branch protection (REST API / `gh`)

`clean-source-protection.json` — applies protection directly to the `clean-source`
branch:

```bash
gh api -X PUT repos/tazamohd/SALIS-GMS/branches/clean-source/protection \
  -H "Accept: application/vnd.github+json" \
  --input .github/rulesets/clean-source-protection.json
```

## What the policy enforces

- PR required before merging; **0** required approvals (raise to 1 with a second
  reviewer), stale approvals dismissed on push, conversations must be resolved.
- Required status checks (strict / branch-up-to-date): `typecheck · test · build`,
  `migrations apply cleanly`, `dependency CVE audit (blocking on critical)`.
  (`ruflo change-risk` is advisory and intentionally not required — add it if you
  want it to gate.)
- Linear history; force-push and deletion blocked; admins not enforced (emergency
  bypass) — set `enforce_admins: true` / include administrators for max strictness.

## Companion repo settings (Settings → General → Pull Requests)

- Enable **only** *Allow squash merging* (matches the linear-history rule and how
  everything has been merged).
- Enable *Automatically delete head branches* to keep the branch/PR list tidy.

> Required-status-check names must match exactly. All three have already reported
> on this repo (PRs #72–#74), so they are selectable immediately.
