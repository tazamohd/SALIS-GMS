import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the reporting surface. Phase E migrated the
 * standalone `server/routes/reports.ts` router into a layered module
 * (`server/modules/reports`); assertions target the module's controller /
 * service / repository. Behavioral coverage lives in
 * `server/modules/reports/__tests__/reports.service.test.ts`; role gating and
 * tenant scope are exercised end-to-end by the existing reports integration test.
 */
describe('Reports route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/reports/index.ts');
  const controllerSource = read('server/modules/reports/controllers/reports.controller.ts');
  const serviceSource = read('server/modules/reports/services/reports.service.ts');
  const repositorySource = read('server/modules/reports/repositories/reports.repository.ts');

  it('mounts the reports module from the hybrid router and retires the legacy file', () => {
    expect(hybridRoutesSource).toMatch(/import reportsRoutes from ["']\.\.\/modules\/reports["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*reportsRoutes\)/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/reports.ts'))).toBe(false);
  });

  it('preserves the five reports with their financial/management role guards', () => {
    expect(moduleIndexSource).toMatch(/requireRole\(\['ADMIN', 'MANAGER', 'ACCOUNTANT'\]\)/);
    expect(moduleIndexSource).toMatch(/requireRole\(\['ADMIN', 'MANAGER'\]\)/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/reports\/revenue['"],\s*isAuthenticated,\s*requireFinancialRole/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/reports\/technician-performance['"],\s*isAuthenticated,\s*requireManagementRole/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/reports\/inventory-turnover['"],\s*isAuthenticated,\s*requireFinancialRole/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/reports\/customer-analytics['"],\s*isAuthenticated,\s*requireManagementRole/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/reports\/summary['"],\s*isAuthenticated,\s*requireFinancialRole/);
  });

  it('keeps the session-garage 403 in the controller and the groupBy mapping in the service', () => {
    expect(controllerSource).toMatch(/No garage associated/);
    expect(serviceSource).toMatch(/YYYY-MM-DD/);
    expect(serviceSource).toMatch(/IYYY-IW/);
  });

  it('routes all raw SQL through the repository (the only data-layer access)', () => {
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    expect(repositorySource).toMatch(/db\.execute\(/);
    expect(controllerSource).not.toMatch(/db\.execute/);
    expect(serviceSource).not.toMatch(/db\.execute/);
  });
});
