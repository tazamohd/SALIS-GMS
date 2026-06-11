#!/usr/bin/env node
/**
 * Bans arbitrary-hex Tailwind utility classes (`text-[#0A5ED7]`, `bg-[#F97316]/30`,
 * `border-[#fff]`, etc.) in client TSX/TS code, plus raw `text-{red|green|...}-NNN`
 * palette utilities outside the design-system token surface.
 *
 * Why: the design-system audit found 1,435+ hardcoded hex values and 168+ raw
 * Tailwind palette utilities bypassing semantic tokens (`--success`, `--warning`,
 * `--info`, `--destructive`, `--muted`). This script keeps the count from growing.
 *
 * Allowlist: a small set of files are permitted to use the patterns during the
 * incremental migration. Adding to ALLOWED is reviewable in PR and shouldn't
 * grow — preferred path is to fix the file instead.
 *
 * Exit codes:
 *   0  no violations
 *   1  violations found (CI fails)
 *   2  scanner error (missing dir, etc.)
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["client/src"];

// Files that may legitimately reference brand hex during the consolidation.
// Add sparingly; remove as files get migrated.
const ALLOWED = new Set([
  // The semantic tokens themselves live in this file.
  "client/src/index.css",
]);

// Patterns to ban inside Tailwind class strings.
const HEX_CLASS = /(?:text|bg|border|ring|fill|stroke|from|via|to|decoration|outline|shadow|caret|accent|divide|placeholder)-\[#[0-9A-Fa-f]{3,8}(?:\/\d{1,3})?\]/g;
const PALETTE_CLASS =
  /(?:text|bg|border)-(?:red|green|blue|yellow|orange|purple|pink|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-\d{2,3}\b/g;

const SCAN_EXT = new Set([".ts", ".tsx", ".css"]);
const EXCLUDE_SEGMENTS = new Set(["node_modules", "dist", "build", ".next", ".cache"]);

/** @type {{file: string, line: number, snippet: string, kind: string}[]} */
const findings = [];

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  for (const e of entries) {
    if (EXCLUDE_SEGMENTS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full);
    } else if (e.isFile()) {
      const dot = e.name.lastIndexOf(".");
      const ext = dot === -1 ? "" : e.name.slice(dot);
      if (SCAN_EXT.has(ext)) await scan(full);
    }
  }
}

async function scan(path) {
  const rel = relative(ROOT, path).split(sep).join("/");
  if (ALLOWED.has(rel)) return;
  const content = await readFile(path, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    // Skip comment lines (cheap heuristic — covers both // and /* in TS/CSS).
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    let m;
    while ((m = HEX_CLASS.exec(line)) !== null) {
      findings.push({ file: rel, line: i + 1, snippet: m[0], kind: "arbitrary-hex" });
    }
    HEX_CLASS.lastIndex = 0;
    while ((m = PALETTE_CLASS.exec(line)) !== null) {
      findings.push({ file: rel, line: i + 1, snippet: m[0], kind: "raw-palette" });
    }
    PALETTE_CLASS.lastIndex = 0;
  });
}

async function main() {
  for (const d of SCAN_DIRS) {
    const abs = join(ROOT, d);
    try {
      const s = await stat(abs);
      if (!s.isDirectory()) continue;
    } catch {
      console.error(`Scanner: missing scan dir ${d}, skipping.`);
      continue;
    }
    await walk(abs);
  }

  if (findings.length === 0) {
    console.log("✓ No banned color utilities found.");
    return 0;
  }

  // Group by file for readable output.
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  console.error(`✗ Found ${findings.length} banned color utility usage${findings.length === 1 ? "" : "s"} in ${byFile.size} file${byFile.size === 1 ? "" : "s"}:\n`);
  for (const [file, items] of byFile) {
    console.error(`  ${file}`);
    for (const it of items.slice(0, 5)) {
      console.error(`    L${it.line}  ${it.kind === "arbitrary-hex" ? "hex" : "palette"}: ${it.snippet}`);
    }
    if (items.length > 5) console.error(`    ... and ${items.length - 5} more`);
  }
  console.error(
    `\nUse a semantic token instead:` +
      `\n  - bg-[#0A5ED7] -> bg-primary (or hsl(var(--primary)))` +
      `\n  - text-green-700 -> text-[hsl(var(--success))]` +
      `\n  - bg-red-100 -> bg-[hsl(var(--destructive)/0.12)]` +
      `\n\nIf the file is in active migration, add it to ALLOWED in scripts/check-hex-classes.mjs ` +
      `with a TODO and link to a follow-up issue. Allowlist entries should shrink over time.`,
  );
  return 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error("Scanner error:", err);
    process.exit(2);
  });
