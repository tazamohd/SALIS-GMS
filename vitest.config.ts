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
      // Report on files the tests actually execute. The all-files pass (default
      // when `include` is set) makes the v8 provider parse every matching file —
      // including untested client .tsx — and rolldown fails on their JSX
      // (`Parse failed` in remapCoverage), which crashed the whole coverage run
      // and is why the gate below sat at 0. With `all: false` coverage reflects
      // exercised code and the run is stable, so the thresholds can be enforced.
      all: false,
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
        // Ratchet gate over executed code (storage.ts/routes.ts excluded).
        // Tightened now that CI is stable (run #145 green on clean-source) to
        // sit ~1 point below the measured baseline (lines 37.4 / stmts 36.3 /
        // funcs 19.6 / branches 24.3) — a small margin keeps run-to-run
        // variance from false-failing while a real regression drops CI. Raise
        // these as coverage improves — never lower them.
        lines: 36,
        statements: 35,
        functions: 19,
        branches: 23,
      },
    },
    projects: [
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['server/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**', '**/dist/**'],
          // Provisions the test database (TEST_DATABASE_URL or embedded PG),
          // pushes the schema and seeds a garage. The setup file predates
          // this entry but was never referenced from the config, so
          // integration tests always started against an empty database.
          globalSetup: ['./server/__tests__/globalSetup.ts'],
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
