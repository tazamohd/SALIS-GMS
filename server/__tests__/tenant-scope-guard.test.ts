/**
 * Tenant-scope CI guard (Story 6.2 / FR-4).
 *
 * Static guard that fails the build if a known tenant-isolation anti-pattern is
 * reintroduced into server source. This is the regression net for the exact
 * classes of bug the 2026-06-13 code review found (e.g. `garageId || '1'`
 * raw-SQL fallbacks that read a hardcoded tenant).
 *
 * Scope note: a full AST check that every tenant-table query routes through the
 * scoped primitive is a larger follow-up; this guard covers the concrete,
 * zero-false-positive patterns that have already bitten us.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SERVER_DIR = join(process.cwd(), "server");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      out.push(...walk(full));
    } else if (entry.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const FORBIDDEN: Array<{ name: string; re: RegExp }> = [
  {
    name: "hardcoded garage fallback (e.g. `garageId || '1'`) — reads a fixed tenant",
    re: /garageId\s*\|\|\s*['"][^'"]+['"]/,
  },
  {
    name: "`req.user.garageId || <literal>` fallback — defaults to a fixed tenant",
    re: /\.garageId\s*\|\|\s*['"][^'"]+['"]/,
  },
];

describe("tenant-scope CI guard (Story 6.2)", () => {
  const files = walk(SERVER_DIR);

  it("scans a meaningful number of server source files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const { name, re } of FORBIDDEN) {
    it(`no source file contains: ${name}`, () => {
      const offenders: string[] = [];
      for (const f of files) {
        const src = readFileSync(f, "utf8");
        src.split("\n").forEach((line, i) => {
          if (re.test(line)) offenders.push(`${f.replace(process.cwd() + "/", "")}:${i + 1}  ${line.trim()}`);
        });
      }
      expect(offenders, `Tenant-isolation anti-pattern reintroduced:\n${offenders.join("\n")}`).toEqual([]);
    });
  }
});
