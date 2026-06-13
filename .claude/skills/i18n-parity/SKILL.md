---
name: i18n-parity
description: >-
  Audit and maintain translation-key parity across the locale files in
  client/src/i18n/locales. Use when adding UI strings, adding/translating a
  language, fixing "key shows in English", or gating CI on missing translations.
  English (en.json) is the source of truth; all other locales must mirror its keys.
---

# i18n Parity

SALIS AUTO ships UI in 7 languages. The translation source of truth is
`client/src/i18n/locales/en.json`. Every other locale
(`ar, fr, es, de, zh, hi`) must contain the **same set of nested keys** as
`en.json`. `i18next` is configured with `fallbackLng: 'en'`, so a missing key
silently renders the English string — which looks like a bug to translators and
QA, not a clean fallback.

## When to use this skill

- You added or renamed UI strings and need the other locales updated.
- A screen shows English text while a non-English language is selected.
- You're adding a new language to `supportedLanguages` in `i18n/config.ts`.
- You want a CI gate that fails when translations drift out of parity.

## How to run the check

A helper script reports, per locale, the keys that are **missing**, **extra**
(present in the locale but not in `en.json`), and **untranslated** (value
identical to English — often a placeholder copy):

```bash
node .claude/skills/i18n-parity/check-i18n-parity.mjs
```

Useful flags:

- `--locale=fr` — check a single locale instead of all.
- `--json` — machine-readable output (for tooling).
- `--strict` — exit non-zero if any locale has **untranslated** keys too,
  not just missing ones (default only fails on missing/extra).

The script exits non-zero when any locale is out of parity, so it can be wired
into CI or a pre-commit hook.

## Fixing parity gaps

1. Run the check to get the flattened dot-paths (e.g. `app.tagline`,
   `dashboard.kpi.revenue`) that are missing from a locale.
2. Edit the target locale JSON, adding the missing keys with the **same nested
   structure** as `en.json`. Do not flatten — keep the object shape.
3. Translate the values. If you cannot translate a value yet, still add the key
   (copying the English value) so the structure stays in parity, and note it —
   `--strict` will surface these as untranslated.
4. Remove any **extra** keys the script flags, unless they are intentionally
   locale-specific (rare; prefer keeping all locales identical in shape).
5. Re-run the check until the locale is clean.
6. Sanity-check the JSON is still valid and that
   `client/src/i18n/config.ts` imports the locale (every language listed in
   `supportedLanguages` must have a matching import + `resources` entry).

## Conventions

- **English is canonical.** Add new strings to `en.json` first, then propagate.
- Keys are `snake_case`/`kebab-case` leaf names under nested namespaces; mirror
  whatever pattern the surrounding section already uses.
- Keep keys sorted the same way as `en.json` within each object to keep diffs
  small and reviewable.
- Don't introduce a new top-level namespace in a non-English locale before it
  exists in `en.json`.

## Verify

After editing, confirm parity and that nothing else broke:

```bash
node .claude/skills/i18n-parity/check-i18n-parity.mjs   # parity is clean
npm run check                                           # types still compile
```
