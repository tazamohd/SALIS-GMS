# SALIS AUTO — Claude Code Skills

Project-level [Claude Code](https://code.claude.com/docs) skills for SALIS AUTO.
Each skill is a `SKILL.md` playbook the agent can invoke with `/<skill-name>` (or `@<skill-name>`
in other agent tools).

## Source

Most skills here were curated from
[antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) and filtered to
those relevant to this stack (TypeScript full-stack ERP: React/Vite + Express/Drizzle, Docker,
GitHub Actions, security/RBAC/2FA, Saudi ZATCA compliance).

To re-install / update from upstream:

```bash
# Curated relevant categories at low risk, into this directory
npx antigravity-awesome-skills --path .claude/skills \
  --category "test-automation,devops,reliability,api-integration,backend,web-development,security,architecture" \
  --risk "safe,none"
```

> Note: the upstream installer also drops a `docs/` folder and some off-topic skills; prune anything
> not relevant to this project (the original curation removed Java/Hono/region-specific payment and
> media-generation skills).

## Installed skills

| Skill | Purpose |
|-------|---------|
| **salis-release-qa** | 🟢 Project-specific. End-to-end release QA & launch gate for SALIS AUTO (type-check, lint, tests, migrations, RBAC/2FA, ZATCA/VAT). |
| **vibecode-production-qa-validator** | Generic fullstack production QA / build-verification checklist. |
| **github-actions-advanced** | Design, debug, and harden GitHub Actions CI/CD workflows. |
| **container-security-hardening** | Harden Docker images and runtime configuration. |
| **mise-configurator** | Generate `mise.toml` for local dev / CI toolchain standardization. |
| **security/** | AWS-oriented security bundle: compliance checker, IAM best practices, secrets rotation, security audit. |
| **audit-skills** | Static security auditor for AI skills/bundles. |
| **skill-audit** | Pre-install security scanner — vet a skill before trusting it. |
| **bumblebee** | Supply-chain inventory & exposure scan for compromised packages. |
| **tool-use-guardian** | Tool-call reliability wrapper (monitor / retry / recover). |

`salis-release-qa` is maintained in-repo and tailored to this project's actual commands and
compliance requirements; the rest are reusable, upstream-sourced playbooks.
