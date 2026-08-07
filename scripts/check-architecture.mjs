#!/usr/bin/env node
/**
 * Architecture governance check (Phase E14).
 *
 * Dependency-free static guard that enforces the layering rules for the new
 * modular architecture. Runs in CI / pre-commit without extra tooling:
 *
 *   1. Controllers must not import the data layer (`storage` / `db`) directly.
 *   2. Services must not import the data layer directly — go through a repository.
 *   3. No module may import another module's repository (cross-module data
 *      access); the composition root is the only allowed external wiring point.
 *
 * Scope is intentionally narrow: it only inspects the new `server/modules/**`
 * tree, so it never flags the legacy monolith that migration is retiring.
 * Exits non-zero (with a report) on any violation.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const MODULES_DIR = join(ROOT, 'server', 'modules');

/** Recursively collect .ts files under a directory. */
function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

const IMPORT_RE = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]/g;

function importsOf(file) {
  const src = readFileSync(file, 'utf8');
  const specs = [];
  let m;
  while ((m = IMPORT_RE.exec(src)) !== null) specs.push(m[1]);
  return specs;
}

const violations = [];

function moduleOf(file) {
  const rel = relative(MODULES_DIR, file);
  return rel.split(/[\\/]/)[0];
}

for (const file of walk(MODULES_DIR)) {
  const rel = relative(ROOT, file);
  const layer = rel.includes('/controllers/')
    ? 'controller'
    : rel.includes('/services/')
      ? 'service'
      : null;
  const owningModule = moduleOf(file);

  for (const spec of importsOf(file)) {
    const isDataLayer = /(^|\/)(storage|db)$/.test(spec) || /(^|\/)(storage|db)\.[jt]s$/.test(spec);
    if (layer && isDataLayer) {
      violations.push(
        `${rel}: ${layer} imports the data layer directly ("${spec}"). Use a repository.`,
      );
    }

    // Cross-module repository import: importing another module's repositories.
    const repoMatch = spec.match(/modules\/([^/]+)\/repositories\//);
    if (repoMatch && repoMatch[1] !== owningModule) {
      violations.push(
        `${rel}: imports another module's repository ("${spec}"). Cross-module data access is forbidden.`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error('\nArchitecture governance violations:\n');
  for (const v of violations) console.error('  ✗ ' + v);
  console.error(`\n${violations.length} violation(s).\n`);
  process.exit(1);
}

console.log('Architecture governance: OK (no boundary violations in server/modules).');
