import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the analytics surface. Phase E consolidated the
 * standalone `server/routes/analytics-performance.ts` and the monolith
 * `/api/analytics/*` handlers into one layered module (`server/modules/analytics`).
 * Behavioral coverage lives in
 * `server/modules/analytics/__tests__/analytics.service.test.ts`.
 */
describe('Analytics extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/analytics/index.ts');
  const controllerSource = read('server/modules/analytics/controllers/analytics.controller.ts');
  const serviceSource = read('server/modules/analytics/services/analytics.service.ts');
  const repositorySource = read('server/modules/analytics/repositories/analytics.repository.ts');

  it('mounts the analytics module from the hybrid router and retires the legacy file', () => {
    expect(hybridRoutesSource).toMatch(/import analyticsRoutes from ["']\.\.\/modules\/analytics["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*analyticsRoutes\)/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/analytics-performance.ts'))).toBe(false);
  });

  it('removes the migrated /api/analytics handlers from the legacy monolith', () => {
    // Anchor to a real (non-commented) registration: newline + indent + app.<verb>(.
    // The monolith still holds distinct, out-of-scope analytics routes
    // (bi-report, realtime-kpis, profit-margins, custom-report [singular],
    // widgets) plus some commented-out dead namesakes — those must be ignored.
    const live = (verb: string, route: string) =>
      new RegExp(`\\n\\s+app\\.${verb}\\(['"]\\/api\\/analytics\\/${route}['"]`);
    expect(legacyRoutesSource).not.toMatch(live('get', 'dashboard-metrics'));
    expect(legacyRoutesSource).not.toMatch(live('(get|post)', 'custom-reports'));
    expect(legacyRoutesSource).not.toMatch(live('post', 'custom-reports/:id/run'));
    expect(legacyRoutesSource).not.toMatch(live('get', 'profit-analysis'));
    expect(legacyRoutesSource).not.toMatch(live('get', 'customer-ltv'));
    expect(legacyRoutesSource).not.toMatch(live('get', 'heatmaps'));
    expect(legacyRoutesSource).not.toMatch(live('get', 'performance'));
  });

  it('registers all 8 analytics routes', () => {
    for (const r of [
      "get\\(\\s*['\"]/analytics/performance['\"]",
      "get\\(\\s*['\"]/analytics/dashboard-metrics['\"]",
      "get\\(\\s*['\"]/analytics/custom-reports['\"]",
      "post\\(\\s*['\"]/analytics/custom-reports['\"]",
      "post\\(\\s*['\"]/analytics/custom-reports/:id/run['\"]",
      "get\\(\\s*['\"]/analytics/profit-analysis['\"]",
      "get\\(\\s*['\"]/analytics/customer-ltv['\"]",
      "get\\(\\s*['\"]/analytics/heatmaps['\"]",
    ]) {
      expect(moduleIndexSource).toMatch(new RegExp(`router\\.${r}`));
    }
  });

  it('keeps the performance garage + management 403s in the controller', () => {
    expect(controllerSource).toMatch(/No garage associated/);
    expect(controllerSource).toMatch(/Insufficient privileges for performance analytics/);
    expect(controllerSource).toMatch(/isManagementUser/);
  });

  it('routes the BI facades + direct SQL through the repository (the only data-layer access)', () => {
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/analytics-service'/);
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/ai\/business-intelligence'/);
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    expect(serviceSource).not.toMatch(/analytics-service/);
    expect(serviceSource).not.toMatch(/db\.execute/);
  });
});
