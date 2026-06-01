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
    environmentMatchGlobs: [
      ['server/**', 'node'],
      ['client/**', 'jsdom'],
      ['shared/**', 'node'],
    ],
    setupFiles: ['./client/src/test/setup.ts'],
    globalSetup: needsDb ? ['./server/__tests__/globalSetup.ts'] : [],
    testTimeout: 30000,
    hookTimeout: 60000,
    pool: 'forks',
    forks: {
      singleFork: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
