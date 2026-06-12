// ESLint flat config for SALIS-GMS.
//
// Rule selection is guided by the ecomfe/spec style guides
// (https://github.com/ecomfe/spec) — specifically the ESNext and React
// guides — adapted to this project's modern stack: TypeScript, React 18
// with function components + hooks, and Prettier for formatting.
//
// Notes:
//   * All *formatting* concerns (indentation, quotes, semicolons, line
//     width, JSX attribute wrapping) are intentionally delegated to
//     Prettier; eslint-config-prettier disables any rules that would
//     conflict. The ecomfe formatting rules live in .prettierrc.
//   * Obsolete ecomfe React rules that assume the class-component era
//     (React.createClass, propTypes, @autobind, shouldComponentUpdate)
//     are deliberately omitted — they do not apply to a hooks codebase.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default tseslint.config(
  {
    // Mirror .prettierignore plus build/output artifacts.
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'migrations/**',
      'coverage/**',
      '**/*.min.js',
      'gallery.html',
      'public/**', // static assets served as-is
      'client/src/components/ui/**', // generated shadcn/ui primitives
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ---- ESNext spec rules (apply to all JS/TS) -------------------------
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    plugins: { 'unused-imports': unusedImports },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      // ecomfe ESNext: prefer let/const, never var.
      'no-var': 'error',
      'prefer-const': 'error',
      // ecomfe ESNext: rest params instead of `arguments`, spread instead of apply.
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      // ecomfe general JS: strict equality.
      eqeqeq: ['error', 'smart'],
      // ecomfe ESNext: consistent object method/property shorthand.
      'object-shorthand': ['error', 'always'],
      // ecomfe ESNext: template literals over string concatenation.
      'prefer-template': 'error',
      'no-useless-concat': 'error',
      // ecomfe ESNext: dot notation / no redundant else.
      'dot-notation': 'error',
      'no-else-return': 'error',
      // Unused imports are auto-removed; unused locals stay a (non-blocking) warning.
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      // Existing escape-hatch comments are deliberate; flag for review, don't block.
      '@typescript-eslint/ban-ts-comment': 'warn',
      // TS namespaces are occasionally legitimate (module augmentation, .d.ts).
      '@typescript-eslint/no-namespace': 'off',
      // ecomfe ESNext: declarations in case blocks need their own scope —
      // worth flagging but kept non-blocking for incremental cleanup.
      'no-case-declarations': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  // ---- CommonJS scripts & config files (require() is expected) ---------
  {
    files: ['**/*.cjs', 'scripts/**/*.js', '*.config.{js,ts,cjs,mjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // A handful of server modules use dynamic require(); flag, don't block.
  {
    files: ['server/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },

  // ---- React spec rules (client only) ---------------------------------
  {
    files: ['client/**/*.{jsx,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // ecomfe React: PascalCase component names.
      'react/jsx-pascal-case': 'warn',
      // ecomfe React: self-close components without children.
      'react/self-closing-comp': 'warn',
      // ecomfe React: omit `={true}` for boolean props.
      'react/jsx-boolean-value': ['warn', 'never'],
      // ecomfe React: never use array indices as keys.
      'react/no-array-index-key': 'warn',
      // ecomfe React: no duplicate props.
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-key': 'error',
      // TS + new JSX transform make these unnecessary.
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },

  // ---- Test files: relax a few rules ----------------------------------
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/__tests__/**', 'e2e/**', 'client/src/test/**'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Must come last: turn off everything that fights Prettier.
  prettier,
);
