#!/usr/bin/env node
/**
 * Coverage gate — metaswarm-inspired quality gate for SALIS-GMS.
 *
 * Reads thresholds from .coverage-thresholds.json and compares them against the
 * Vitest json-summary report (coverage/coverage-summary.json). Exits non-zero if
 * any global metric or per-path file falls below its floor, so PRs can be blocked
 * before merge.
 *
 * Usage:
 *   npm run test:coverage          # produce coverage/coverage-summary.json
 *   node scripts/coverage-gate.mjs # enforce thresholds  (or: npm run coverage:gate)
 *
 * The npm "coverage:gate" script chains both steps.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';

const ROOT = process.cwd();
const THRESHOLDS_FILE = resolve(ROOT, '.coverage-thresholds.json');
const SUMMARY_FILE = resolve(ROOT, 'coverage', 'coverage-summary.json');

const METRICS = ['lines', 'statements', 'functions', 'branches'];
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function fail(msg) {
  console.error(red(`\n✖ coverage-gate: ${msg}\n`));
  process.exit(1);
}

if (!existsSync(THRESHOLDS_FILE)) fail(`missing ${relative(ROOT, THRESHOLDS_FILE)}`);
if (!existsSync(SUMMARY_FILE)) {
  fail(
    `missing ${relative(ROOT, SUMMARY_FILE)}.\n` +
      `  Run "npm run test:coverage" first (needs @vitest/coverage-v8 installed).`,
  );
}

const thresholds = JSON.parse(readFileSync(THRESHOLDS_FILE, 'utf8'));
const summary = JSON.parse(readFileSync(SUMMARY_FILE, 'utf8'));

const failures = [];

// --- Global totals ---------------------------------------------------------
const total = summary.total ?? {};
for (const metric of METRICS) {
  const floor = thresholds.global?.[metric];
  if (floor == null) continue;
  const actual = total[metric]?.pct ?? 0;
  const ok = actual >= floor;
  console.log(
    `${ok ? green('PASS') : red('FAIL')}  global.${metric.padEnd(10)} ` +
      `${String(actual).padStart(6)}%  ${dim(`(floor ${floor}%)`)}`,
  );
  if (!ok) failures.push(`global.${metric}: ${actual}% < ${floor}%`);
}

// --- Per-path files --------------------------------------------------------
const perPath = thresholds.perPath ?? {};
// Build a normalized lookup of the summary's file keys (absolute -> repo-relative).
const fileEntries = Object.entries(summary).filter(([k]) => k !== 'total');
for (const [target, floors] of Object.entries(perPath)) {
  if (target === '$comment') continue;
  const normTarget = target.split('/').join(sep);
  const match = fileEntries.find(([k]) => {
    const rel = relative(ROOT, k);
    return rel === normTarget || k.endsWith(normTarget);
  });
  if (!match) {
    failures.push(`perPath ${target}: file not found in coverage report`);
    console.log(`${red('FAIL')}  ${target}  ${dim('(not in coverage report)')}`);
    continue;
  }
  const [, data] = match;
  for (const metric of METRICS) {
    const floor = floors[metric];
    if (floor == null) continue;
    const actual = data[metric]?.pct ?? 0;
    const ok = actual >= floor;
    console.log(
      `${ok ? green('PASS') : red('FAIL')}  ${target} ${metric} ` +
        `${String(actual).padStart(6)}%  ${dim(`(floor ${floor}%)`)}`,
    );
    if (!ok) failures.push(`${target} ${metric}: ${actual}% < ${floor}%`);
  }
}

if (failures.length) {
  fail(`${failures.length} threshold(s) not met:\n  - ${failures.join('\n  - ')}`);
}
console.log(green('\n✔ coverage-gate: all thresholds met\n'));
