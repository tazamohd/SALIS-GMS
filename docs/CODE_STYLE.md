# Code Style

SALIS-GMS follows a code style derived from the [ecomfe/spec](https://github.com/ecomfe/spec)
front-end style guides (Baidu EFE team), adapted to this project's modern stack:
**TypeScript + React 18 (function components & hooks) + Prettier**.

## How it's enforced

| Concern | Tool | Config |
| --- | --- | --- |
| Formatting (indent, quotes, semicolons, width, JSX wrapping) | Prettier | `.prettierrc` |
| Code quality / spec rules | ESLint 9 (flat config) | `eslint.config.js` |
| Type safety | TypeScript | `tsconfig.json` |

```bash
npm run lint       # report issues
npm run lint:fix   # auto-fix what can be fixed
npm run format     # apply Prettier formatting
npm run check      # type-check
```

`eslint-config-prettier` disables every ESLint rule that would fight Prettier, so the
two tools never disagree — formatting is owned entirely by Prettier (matching ecomfe's
formatting rules via `.prettierrc`), and ESLint handles everything else.

## Spec rules applied (from ecomfe ESNext & React guides)

These ESNext rules are **errors** (enforced, CI-blocking):
- `no-var`, `prefer-const` — use `let`/`const`, never `var`
- `prefer-rest-params`, `prefer-spread` — rest/spread over `arguments`/`apply`
- `eqeqeq` (smart) — strict equality
- `object-shorthand` — consistent method/property shorthand
- `prefer-template`, `no-useless-concat` — template literals over string concat
- `dot-notation`, `no-else-return` — general hygiene
- `unused-imports/no-unused-imports` — unused imports are auto-removed by `lint:fix`
- `no-case-declarations` — `case` bodies must not leak block-scoped declarations
- `@typescript-eslint/no-require-imports` — use ESM `import`, not `require()` (off for `.cjs`/config files)

**React**
- `react/jsx-pascal-case` — PascalCase component names
- `react/self-closing-comp` — self-close childless elements
- `react/jsx-boolean-value: never` — omit `={true}` on boolean props
- `react/no-array-index-key` — stable keys, never array indices
- `react/jsx-key`, `react/jsx-no-duplicate-props` — JSX correctness
- `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps` — hooks safety

## Deliberately **not** adopted

ecomfe's React guide predates hooks; rules assuming the class-component era do not
apply here and are omitted: `React.createClass`, `propTypes`/`defaultProps`,
`@autobind`, and manual `shouldComponentUpdate`. TypeScript replaces `propTypes`, and
the new JSX transform makes `react-in-jsx-scope` unnecessary.

## Adoption status

ESLint passes with **0 errors** and is enforced in CI (the `ESLint` job in
`.github/workflows/test.yml`). The correctness and auto-fixable ESNext/React
rules above are **errors**; the remaining items are **warnings** — a cleanup
backlog teams can draw down incrementally without blocking development.

Current warning backlog (run `npm run lint` for the live list):

| Rule | Count* | Why it's a warning |
| --- | --- | --- |
| `unused-imports/no-unused-vars` | ~289 vars + 31 args | Unused locals/args need human judgment (imports are auto-removed) |
| `react/no-array-index-key` | ~191 | Each fix needs a stable id; bulk auto-changing keys risks reconciliation bugs |
| `@typescript-eslint/ban-ts-comment` | ~60 | Existing escape hatches; review case-by-case |
| `react-hooks/exhaustive-deps` | ~14 | Adding deps can change behavior; fix per-site |

\* Snapshot at adoption time; run the linter for the current count.

Unused **args** are the safest next target (prefix with `_` or drop trailing
params). Unused **vars** and array-index keys should be cleaned per-file as
those files are touched, since both can hide intent or affect behavior.
