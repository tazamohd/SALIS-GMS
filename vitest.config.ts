import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./client/src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'server/**/*.ts',
        'shared/**/*.ts',
        'client/src/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/seed*.ts',
        '**/seeds/**',
        '**/__tests__/**',
        '**/migrations/**',
        '**/types/**',
        '**/*.d.ts',
        'server/storage.ts',
        'server/routes.ts',
        'server/seed-all-data.ts',
        'server/phase*-service.ts',
      ],
      thresholds: {
        // Wave B baseline. The codebase has near-zero existing tests.
        // Set to actual current level so CI doesn't block on this gate.
        // Wave I (coverage backfill) will raise these incrementally.
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
    projects: [
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['server/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**', '**/dist/**'],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './client/src'),
            '@shared': path.resolve(__dirname, './shared'),
          },
        },
      },
      {
        test: {
          name: 'client',
          environment: 'jsdom',
          setupFiles: ['./client/src/test/setup.ts'],
          include: ['client/**/*.test.{ts,tsx}', 'shared/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**', '**/dist/**'],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './client/src'),
            '@shared': path.resolve(__dirname, './shared'),
          },
        },
      },
    ],
  },
});