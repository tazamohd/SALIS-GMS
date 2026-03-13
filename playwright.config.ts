import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5000,
    reuseExistingServer: true,
  },
});
