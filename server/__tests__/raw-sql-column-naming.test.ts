/**
 * Guard against a recurring, high-cost bug class: raw SQL referencing
 * quoted camelCase identifiers as COLUMN references. Drizzle maps every
 * TS field to a snake_case DB column (varchar("snake_case")), so a query
 * like `u."fullName"` or `INSERT INTO x ("garageId", ...)` throws
 * `column ... does not exist` at runtime — and because these queries sit
 * behind catch-all fallbacks, the failure is silent (empty results) or a
 * blanket 500. Six modules shipped broken this way (analytics, HR payroll,
 * parts recommender, predictive maintenance, technician mobile, CRM
 * detail) before this guard existed.
 *
 * The rule enforced here: inside raw `sql`...`` template literals, a
 * double-quoted identifier used as a column reference must be snake_case.
 * OUTPUT ALIASES (`... as "camelCase"`) are legitimate and allowed — a
 * column reference is distinguished because it is either dot-prefixed
 * (`alias."camelCase"`, which can never be an alias) or a bare identifier
 * inside an INSERT column list.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// All server source, excluding tests.
function collectTsFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      collectTsFiles(full, acc);
    } else if (entry.name.endsWith(".ts")) {
      acc.push(full);
    }
  }
  return acc;
}

const SERVER_DIR = path.resolve(process.cwd(), "server");
const files = collectTsFiles(SERVER_DIR);

// Extract the contents of every `sql`...`` template literal in a source
// string. Interpolations (${...}) don't contain backticks in this codebase,
// so a non-greedy backtick-delimited capture after the `sql` tag is reliable.
function extractSqlBlocks(src: string): { sql: string; index: number }[] {
  const blocks: { sql: string; index: number }[] = [];
  const re = /\bsql`([^`]*)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    blocks.push({ sql: m[1], index: m.index });
  }
  return blocks;
}

const camelIdent = /"[a-z_]*[a-z][A-Z][a-zA-Z_]*"/; // a quoted identifier containing a lowercase→uppercase hump

describe("raw SQL uses snake_case column references (no quoted camelCase)", () => {
  it("has no dot-prefixed quoted-camelCase column references", () => {
    const offenders: string[] = [];
    // alias."camelCase" — a dot prefix means it's a column ref, never an alias.
    const dotCamel = /[a-zA-Z_]+\.("[a-z_]*[a-z][A-Z][a-zA-Z_]*")/g;
    for (const file of files) {
      const src = fs.readFileSync(file, "utf-8");
      for (const block of extractSqlBlocks(src)) {
        let m: RegExpExecArray | null;
        const re = new RegExp(dotCamel);
        while ((m = re.exec(block.sql)) !== null) {
          offenders.push(`${path.relative(process.cwd(), file)}: ${m[0]}`);
        }
      }
    }
    expect(offenders, `Dot-prefixed camelCase column refs (use snake_case):\n${offenders.join("\n")}`).toEqual([]);
  });

  it("has no camelCase identifiers in INSERT column lists", () => {
    const offenders: string[] = [];
    // INSERT INTO <table> ( ...column list... ) — flag camelCase inside it.
    const insertRe = /INSERT\s+INTO\s+[a-z_]+\s*\(([^)]*)\)/gi;
    for (const file of files) {
      const src = fs.readFileSync(file, "utf-8");
      for (const block of extractSqlBlocks(src)) {
        let m: RegExpExecArray | null;
        const re = new RegExp(insertRe);
        while ((m = re.exec(block.sql)) !== null) {
          const cols = m[1];
          const found = cols.match(new RegExp(camelIdent, "g"));
          if (found) {
            offenders.push(`${path.relative(process.cwd(), file)}: INSERT (... ${found.join(", ")} ...)`);
          }
        }
      }
    }
    expect(offenders, `camelCase columns in INSERT lists (use snake_case):\n${offenders.join("\n")}`).toEqual([]);
  });
});
