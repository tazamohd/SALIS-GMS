import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// When TEST_DATABASE_URL is set (e.g. on Windows where embedded PG cannot bind,
// or in CI with a Postgres service container), use it as DATABASE_URL for the
// whole test process. This must happen before the forked worker spawns so the
// child inherits the override.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

// The test suite boots the full production route tree (server/routes.ts), and a
// few optional paid integrations hard-throw at import when their credentials are
// absent — notably server/paypal.ts ("Missing PAYPAL_CLIENT_ID"), whose snippet
// is vendor-locked and must not be edited. Provide inert placeholders so import
// succeeds; any real credentials already in the environment are preserved.
process.env.PAYPAL_CLIENT_ID ||= 'test-paypal-client-id';
process.env.PAYPAL_CLIENT_SECRET ||= 'test-paypal-client-secret';

// express-session requires a non-empty `secret`; auth.ts reads SESSION_SECRET
// (set in production/Replit). Without it, every login in the suite 500s with
// "secret option required for sessions". Provide a deterministic test secret.
process.env.SESSION_SECRET ||= 'test-session-secret';

// Use DB global setup only when running server tests (not shared-only)
const needsDb = !process.argv.some(a => a === 'shared/' || a.startsWith('shared/'));

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'e2e/**',
    ],
    // Vitest 4 removed `environmentMatchGlobs`. Default everything to `node`
    // (server + shared). DOM-dependent client tests opt into jsdom with a
    // `// @vitest-environment jsdom` docblock at the top of the file
    // (see client/src/test/setup.ts for the convention).
    environment: 'node',
    setupFiles: ['./client/src/test/setup.ts'],
    globalSetup: needsDb ? ['./server/__tests__/globalSetup.ts'] : [],
    testTimeout: 30000,
    hookTimeout: 60000,
    pool: 'forks',
    forks: {
      singleFork: true,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['server/**/*.ts', 'shared/**/*.ts', 'client/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**',
        'server/**/seed*.ts',
        'server/**/seeds/**',
        'shared/**/*.test.ts',
        'client/src/test/**',
        'client/src/components/ui/**', // generated shadcn primitives
        '**/*.d.ts',
      ],
      // Wave 0 floor: a non-zero baseline that blocks regression to zero.
      // Ratcheted toward 70% in the Wave 6 coverage-backfill (see plan).
      thresholds: {
        lines: 10,
        functions: 10,
        statements: 10,
        branches: 25,
      },
    },
  },
  // Client components use the automatic JSX runtime (the app's vite.config.ts
  // applies @vitejs/plugin-react). Mirror that here so component tests don't
  // need to import React explicitly.
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
