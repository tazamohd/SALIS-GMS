import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'drizzle/**',
      '*.config.js',
      '*.config.ts',
      'scripts/**',
      'attached_assets/**',
      '_bmad*/**',
      '.understand-anything/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-case-declarations': 'warn',
      'no-empty': 'warn',
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'off',
      'prefer-const': 'warn',
    },
  },
);
