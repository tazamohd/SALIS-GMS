/* Regenerates src/fonts.css and src/fonts/*.woff2 from Google Fonts.
   Run from the public-portal directory: `npm run fonts`, then `npm run build`.

   Not part of the build — fonts change only when a weight or family does, and the
   output is committed. Needs network access.

   To add a family or weight, edit FAMILIES below. A variable build is requested first
   (one file covering the whole weight range) and only families without one fall back to
   static faces. Subsets are limited to what the portal renders.

   This does NOT fetch licences: fonts/OFL.txt is maintained separately and must be
   updated by hand if a family is added. */
import { writeFileSync } from 'node:fs';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const FAMILIES = [
  { name:'Montserrat',      css:'Montserrat',      lo:600, hi:800, weights:[600,700,800], subsets:['latin','latin-ext'] },
  { name:'Inter',           css:'Inter',           lo:400, hi:600, weights:[400,500,600], subsets:['latin','latin-ext'] },
  { name:'Poppins',         css:'Poppins',         lo:500, hi:600, weights:[500,600],     subsets:['latin','latin-ext'] },
  { name:'JetBrains Mono',  css:'JetBrains+Mono',  lo:400, hi:500, weights:[400,500],     subsets:['latin','latin-ext'] },
  { name:'Noto Sans Arabic',css:'Noto+Sans+Arabic',lo:400, hi:700, weights:[400,500,600,700], subsets:['arabic'] },
];
const slug = s => s.toLowerCase().replace(/\s+/g,'-');
const get = async (u) => (await fetch(u, { headers:{'User-Agent':UA} })).text();
let out=[], total=0, n=0;

for (const f of FAMILIES) {
  let css = await get(`https://fonts.googleapis.com/css2?family=${f.css}:wght@${f.lo}..${f.hi}&display=swap`);
  let variable = /font-weight:\s*\d+\s+\d+/.test(css);
  if (!variable) {
    css = await get(`https://fonts.googleapis.com/css2?family=${f.css}:wght@${f.weights.join(';')}&display=swap`);
  }
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)];
  let kept = 0;
  for (const [, subset, block] of blocks) {
    if (!f.subsets.includes(subset)) continue;
    const wt = block.match(/font-weight:\s*([\d ]+)/)?.[1].trim();
    const src = block.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
    const range = block.match(/unicode-range:\s*([^;}]+)/)?.[1]?.trim();
    if (!wt || !src) continue;
    if (!variable && !f.weights.includes(+wt)) continue;
    const file = `${slug(f.name)}-${variable ? 'var' : wt}-${subset}.woff2`;
    const buf = Buffer.from(await (await fetch(src,{headers:{'User-Agent':UA}})).arrayBuffer());
    if (buf.subarray(0,4).toString('latin1') !== 'wOF2') throw new Error('not woff2: '+file);
    writeFileSync('src/fonts/'+file, buf); total += buf.length; n++; kept++;
    out.push(`/* ${f.name} ${wt} — ${subset} */\n@font-face{font-family:'${f.name}';font-style:normal;font-weight:${wt};font-display:swap;src:url("fonts/${file}") format("woff2");unicode-range:${range}}`);
  }
  console.log(`${f.name.padEnd(18)} ${variable?'variable':'static  '}  ${kept} file(s)`);
}
writeFileSync('src/fonts.css',
`/* SALIS AUTO — self-hosted web fonts.
   Generated from Google Fonts; do not hand-edit. Only the weights the portal uses and only
   the Latin and Arabic subsets are included. Variable files carry a weight RANGE, so one
   file covers every weight the design asks for.

   All five families are under the SIL Open Font License 1.1, which permits redistribution
   and self-hosting. See fonts/OFL.txt. */\n\n${out.join('\n\n')}\n`);
console.log(`\n${n} files, ${(total/1024).toFixed(0)} KB total`);
