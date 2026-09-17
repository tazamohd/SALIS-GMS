/* SALIS AUTO — public portal build.
   Resolves `<!-- include: name -->` against src/partials/<name>.html and writes plain
   static HTML to dist/. No dependencies; `node build.mjs`.

   Includes may nest. A cycle, a missing partial, or an unresolved include is a hard
   error — a page that ships with a hole in it is worse than a build that stops. */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, cpSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const SRC = 'src';
const PARTIALS = join(SRC, 'partials');
const DIST = 'dist';
const ASSETS = ['portal.css', 'portal.js', 'fonts.css'];
const DIRS = ['fonts'];
const INCLUDE = /^([ \t]*)<!--[ \t]*include:[ \t]*([\w.-]+)[ \t]*-->[ \t]*$/gm;

const partials = new Map();
for (const f of readdirSync(PARTIALS).filter((f) => f.endsWith('.html'))) {
  partials.set(basename(f, '.html'), readFileSync(join(PARTIALS, f), 'utf8').replace(/\n+$/, ''));
}

/* `stack` carries the include chain so a cycle names the path that caused it. */
function resolve(text, stack) {
  return text.replace(INCLUDE, (_, indent, name) => {
    if (stack.includes(name)) {
      throw new Error(`include cycle: ${[...stack, name].join(' -> ')}`);
    }
    const body = partials.get(name);
    if (body === undefined) {
      throw new Error(
        `unknown partial "${name}" (from ${stack.at(-1)}); have: ${[...partials.keys()].join(', ')}`
      );
    }
    /* Re-indent so a partial pulled in at depth still reads correctly in the output. */
    const nested = resolve(body, [...stack, name]);
    return nested.split('\n').map((l) => (l ? indent + l : l)).join('\n');
  });
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const pages = readdirSync(SRC).filter((f) => f.endsWith('.html'));
if (!pages.length) throw new Error(`no pages in ${SRC}/`);

for (const page of pages) {
  const out = resolve(readFileSync(join(SRC, page), 'utf8'), [page]);
  const leftover = out.match(INCLUDE);
  if (leftover) throw new Error(`${page}: unresolved ${leftover[0].trim()}`);
  writeFileSync(join(DIST, page), out);
  console.log(`  ${page.padEnd(16)} ${out.length.toLocaleString()} B`);
}

for (const asset of ASSETS) {
  copyFileSync(join(SRC, asset), join(DIST, asset));
  console.log(`  ${asset.padEnd(16)} copied`);
}

for (const dir of DIRS) {
  cpSync(join(SRC, dir), join(DIST, dir), { recursive: true });
  const files = readdirSync(join(DIST, dir));
  const bytes = files.reduce((n, f) => n + statSync(join(DIST, dir, f)).size, 0);
  console.log(`  ${(dir + '/').padEnd(16)} ${files.length} files, ${(bytes / 1024).toFixed(0)} KB`);
}

console.log(`\n${pages.length} pages + ${ASSETS.length} assets -> ${DIST}/`);
