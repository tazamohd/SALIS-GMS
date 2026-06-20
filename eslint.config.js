// Flat ESLint config (ESLint v9). Wave 0 baseline: establishes a working lint
// gate for a large, previously-unlinted codebase. Real correctness issues are
// errors; stylistic / large-codebase-noise rules are warnings (eslint exits 0
// on warnings, so CI can gate on errors today and ratchet rules up in later waves).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    // Generated, vendored, binary-adjacent, and non-source assets.
    ignores: [
      'dist/**',
      'node_modules/**',
      'migrations/**',
      'public/**',
      'attached_assets/**',
      'screenshots/**',
      'ui-screens/**',
      'GUI PRTSCN/**',
      '.claude/**',
      '.claude-flow/**',
      '.snapshots/**',
      'docs/**',
      'gallery.html',
      '**/*.min.js',
      'coverage/**',
      '*.config.{js,ts,cjs,mjs}',
      'drizzle.config.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Project-wide language options and rule tuning.
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2024,
      },
    },
    rules: {
      // Large-codebase noise → warnings, not errors. Tightened in later waves.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // TS `namespace` is required for Express/global type augmentation
      // (server/rbac-middleware.ts) and appears in vendor-locked snippets.
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/prefer-as-const': 'warn',
      'no-empty': 'warn',
      'prefer-const': 'warn',
      'no-case-declarations': 'off',
      // TypeScript handles undefined-symbol resolution; avoid false positives.
      'no-undef': 'off',
    },
  },

  // Client React code: enforce Rules of Hooks (real bugs), warn on deps.
  {
    files: ['client/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Config / script files and tests may use Node globals freely.
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'scripts/**', 'server/**'],
    languageOptions: { globals: { ...globals.node } },
  },
);
