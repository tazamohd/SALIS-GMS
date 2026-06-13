# Vendored Claude Code Skills

This directory contains a **curated, vendored subset** of the
[Trail of Bits Skills](https://github.com/trailofbits/skills) marketplace,
selected for relevance to this codebase (an Express + Passport + Drizzle +
Stripe/PayPal + OpenAI TypeScript application).

These are picked up automatically as **project skills** by Claude Code when
working in this repository.

## Vendored skills

| Skill | Why it's here |
|-------|---------------|
| `insecure-defaults` | Detects fail-open insecure defaults — hardcoded secrets, `env.get('X') or 'default'` fallbacks, permissive security config. Directly relevant to `server/config.ts` and `.env.example`. |
| `semgrep-rule-creator` | Helps author custom Semgrep rules for JS/TS to catch project-specific vulnerability and bug patterns. |
| `supply-chain-risk-auditor` | Assesses npm dependency attack surface and dependency health. Relevant given the large dependency tree in `package.json`. |

## License & attribution

The vendored skills are © Trail of Bits and licensed under
**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**,
NOT the MIT license that covers the rest of this repository. The full license
text is preserved here as `LICENSE.trailofbits-CC-BY-SA-4.0`. Keep the
attribution and license intact, and note that modifications to these skill
files must be shared under the same license.

Source: https://github.com/trailofbits/skills (commit pinned at vendor time).

## Preferred path: install via the marketplace

Vendoring is a convenience snapshot. The canonical, auto-updating way to use
these (and the full catalog of ~40 skills) is the plugin marketplace. From the
Claude Code CLI:

```
/plugin marketplace add trailofbits/skills
/plugin menu
```

### Other skills worth installing (not vendored here)

For this stack, also consider installing via the marketplace:

- `static-analysis` — Semgrep + CodeQL + SARIF parsing (heavier; CodeQL bundled).
- `differential-review` — security-focused review of a diff/PR.
- `variant-analysis` — find other instances of a discovered bug class.
- `entry-point-analyzer` — map externally reachable entry points (HTTP routes).
- `agentic-actions-auditor` — audit the OpenAI-driven AI features for unsafe agentic actions.

Smart-contract, C/C++, reversing (DWARF), YARA, and mobile/Firebase skills in
the catalog are **not relevant** to this codebase.
