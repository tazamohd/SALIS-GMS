// Flat ESLint config for SALIS-GMS.
//
// This codebase had no linter for its entire history, so the config is tuned for
// *signal over noise*: rules that catch genuine bugs are errors, while the
// high-frequency stylistic/legacy patterns (unused vars, `any`, etc.) are relaxed so
// the gate is green and meaningful. Tighten incrementally as the code is cleaned up.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    // Not linted: build output, deps, generated assets, vendored HTML, migrations.
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'public/**',
      'migrations/**',
      'attached_assets/**',
      'screenshots/**',
      'ui-screens/**',
      '**/*.min.js',
      'gallery.html',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // Project-wide language + globals (browser for client, node for server/tooling).
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // --- Relaxed: pervasive in legacy code, not bug indicators on their own. ---
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // require() is used deliberately: `.cjs` tooling scripts and a few lazy/dynamic
      // server imports. Not a bug indicator here.
      '@typescript-eslint/no-require-imports': 'off',
      // Intentional declaration-merging / global augmentation (PayPal SDK, RBAC types).
      '@typescript-eslint/no-namespace': 'off',
      'no-empty': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
      // Pre-existing pattern in one large switch (storage.ts); surfaced as a warning to
      // fix incrementally without blocking CI.
      'no-case-declarations': 'warn',

      // --- Errors: these catch real defects. ---
      'no-debugger': 'error',
      'no-cond-assign': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-unreachable': 'error',
      'no-unsafe-negation': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-fallthrough': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-misused-new': 'error',
    },
  },

  {
    // React Hooks correctness — only for the client.
    files: ['client/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    // Test files: allow test-runner globals.
    files: ['**/*.{test,spec}.{ts,tsx}', 'e2e/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
