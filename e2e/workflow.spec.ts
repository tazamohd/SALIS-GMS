import { test, expect } from '@playwright/test';

test.describe('Workflow & Financial Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Command Center loads with KPI cards', async ({ page }) => {
    await page.goto('/command-center');
    await expect(page.locator('text=Command Center').first()).toBeVisible({ timeout: 10000 });
  });

  test('General Ledger page loads', async ({ page }) => {
    await page.goto('/general-ledger');
    await expect(page.locator('text=General Ledger').first()).toBeVisible({ timeout: 10000 });
  });

  test('Balance Sheet page loads', async ({ page }) => {
    await page.goto('/balance-sheet');
    await expect(page.locator('text=Balance Sheet').first()).toBeVisible({ timeout: 10000 });
  });

  test('AI Insights page loads', async ({ page }) => {
    await page.goto('/ai-insights');
    await expect(page.locator('text=AI').first()).toBeVisible({ timeout: 10000 });
  });

  test('workflow transition API rejects invalid data', async ({ request }) => {
    const response = await request.post('/api/workflow/transition', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });
});
