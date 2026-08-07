import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.salisauto/**',
      'pg-data/**',
      'pg-test-data/**',
      'pg-local-data/**',
      'bin/**',
      'public/**',
      'tools/**',
      '*.config.{js,ts}',
      'vite.config.ts',
      'vitest.config.ts',
      'tailwind.config.ts',
      'postcss.config.js',
      'drizzle.config.ts',
      'scripts/**',
      'benchmarks/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['shared/**/*.{ts,tsx}', 'shared/vatUtils.test.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Architecture governance (Phase E14): controllers and services in the modular
  // architecture must not reach the data layer directly — they go through a
  // repository. `scripts/check-architecture.mjs` is the authoritative CI guard
  // (including cross-module repository imports); these rules surface the same
  // violations at edit time.
  {
    files: ['server/modules/**/controllers/**/*.ts', 'server/modules/**/services/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/storage', '**/storage.js', '**/storage.ts', '**/db', '**/db.js', '**/db.ts'],
              message:
                'Controllers/services must not access the data layer directly. Use a repository (Phase E4).',
            },
          ],
        },
      ],
    },
  },
];