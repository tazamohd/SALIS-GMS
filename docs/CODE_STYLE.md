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

**ESNext**
- `no-var`, `prefer-const` — use `let`/`const`, never `var`
- `prefer-rest-params`, `prefer-spread` — rest/spread over `arguments`/`apply`
- `eqeqeq` (smart) — strict equality
- `object-shorthand` — consistent method/property shorthand
- `prefer-template`, `no-useless-concat` — template literals over string concat
- `dot-notation`, `no-else-return` — general hygiene
- `no-case-declarations` — block-scope declarations inside `case`

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

ESLint currently passes with **0 errors**. Legacy patterns surface as **warnings**
(a cleanup backlog) rather than hard failures, so the rules can be tightened
incrementally without blocking development. The largest backlog is unused
variables/imports — run `npm run lint:fix` and prune as files are touched.
