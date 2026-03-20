import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'server/routes/__tests__/**',
      'server/services/__tests__/**',
      'e2e/**',
    ],
    environmentMatchGlobs: [
      ['server/**', 'node'],
      ['client/**', 'jsdom'],
      ['shared/**', 'node'],
    ],
    setupFiles: ['./client/src/test/setup.ts'],
    globalSetup: ['./server/__tests__/globalSetup.ts'],
    testTimeout: 30000,
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
