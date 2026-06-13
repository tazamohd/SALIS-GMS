#!/usr/bin/env node
/**
 * i18n parity checker for SALIS AUTO.
 *
 * Compares every locale in client/src/i18n/locales against en.json
 * (the source of truth) and reports, per locale:
 *   - missing      keys present in en.json but absent in the locale
 *   - extra        keys present in the locale but absent in en.json
 *   - untranslated keys whose value is byte-identical to English
 *
 * Exit code is non-zero when any locale is out of parity, so this can gate CI.
 *
 * Flags:
 *   --locale=<code>  check a single locale (e.g. --locale=fr)
 *   --json           emit machine-readable JSON
 *   --strict         also fail when a locale has untranslated keys
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// .claude/skills/i18n-parity -> repo root is three levels up.
const REPO_ROOT = resolve(__dirname, '..', '..', '..');
const LOCALES_DIR = join(REPO_ROOT, 'client', 'src', 'i18n', 'locales');
const SOURCE = 'en';

const args = process.argv.slice(2);
const opts = {
  json: args.includes('--json'),
  strict: args.includes('--strict'),
  locale: (args.find((a) => a.startsWith('--locale=')) || '').split('=')[1] || null,
};

/** Flatten a nested object into a Map of dot-path -> leaf value. */
function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out.set(path, value);
    }
  }
  return out;
}

function loadLocale(code) {
  const raw = readFileSync(join(LOCALES_DIR, `${code}.json`), 'utf8');
  return flatten(JSON.parse(raw));
}

function discoverLocales() {
  return readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

const source = loadLocale(SOURCE);
const allLocales = discoverLocales().filter((c) => c !== SOURCE);
const targets = opts.locale ? [opts.locale] : allLocales;

const report = {};
let hasMissingOrExtra = false;
let hasUntranslated = false;

for (const code of targets) {
  let locale;
  try {
    locale = loadLocale(code);
  } catch (err) {
    report[code] = { error: `could not load locale: ${err.message}` };
    hasMissingOrExtra = true;
    continue;
  }

  const missing = [];
  const untranslated = [];
  for (const [path, value] of source) {
    if (!locale.has(path)) {
      missing.push(path);
    } else if (locale.get(path) === value && typeof value === 'string' && value.trim() !== '') {
      untranslated.push(path);
    }
  }
  const extra = [...locale.keys()].filter((path) => !source.has(path));

  if (missing.length || extra.length) hasMissingOrExtra = true;
  if (untranslated.length) hasUntranslated = true;

  report[code] = {
    total: source.size,
    present: source.size - missing.length,
    missing,
    extra,
    untranslated,
  };
}

if (opts.json) {
  console.log(JSON.stringify({ source: SOURCE, sourceKeys: source.size, report }, null, 2));
} else {
  const pct = (n) => `${((n / source.size) * 100).toFixed(1)}%`;
  console.log(`i18n parity vs ${SOURCE}.json (${source.size} keys)\n`);
  for (const [code, r] of Object.entries(report)) {
    if (r.error) {
      console.log(`✗ ${code}: ${r.error}\n`);
      continue;
    }
    const clean = r.missing.length === 0 && r.extra.length === 0;
    const mark = clean ? '✓' : '✗';
    console.log(`${mark} ${code}: ${r.present}/${r.total} keys (${pct(r.present)})`);
    if (r.missing.length) {
      console.log(`    missing (${r.missing.length}): ${preview(r.missing)}`);
    }
    if (r.extra.length) {
      console.log(`    extra (${r.extra.length}): ${preview(r.extra)}`);
    }
    if (r.untranslated.length) {
      console.log(`    untranslated (${r.untranslated.length}): ${preview(r.untranslated)}`);
    }
    console.log('');
  }
}

function preview(list, n = 8) {
  const shown = list.slice(0, n).join(', ');
  return list.length > n ? `${shown}, … (+${list.length - n} more)` : shown;
}

const failed = hasMissingOrExtra || (opts.strict && hasUntranslated);
process.exit(failed ? 1 : 0);
