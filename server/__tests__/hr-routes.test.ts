import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the HR/payroll surface. Phase E migrated the
 * standalone `server/routes/hr-payroll.ts` router into a layered module
 * (`server/modules/hr`); assertions target the module's controller / service /
 * repository. Behavioral coverage lives in
 * `server/modules/hr/__tests__/hr.service.test.ts`; role gating and tenant
 * scope are exercised end-to-end by the existing hr integration tests.
 */
describe('HR/payroll route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/hr/index.ts');
  const serviceSource = read('server/modules/hr/services/hr.service.ts');
  const controllerSource = read('server/modules/hr/controllers/hr.controller.ts');
  const repositorySource = read('server/modules/hr/repositories/hr.repository.ts');

  it('mounts the HR module from the hybrid router and retires the legacy file', () => {
    expect(hybridRoutesSource).toMatch(/import hrPayrollRoutes from ["']\.\.\/modules\/hr["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*hrPayrollRoutes\)/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/hr-payroll.ts'))).toBe(false);
  });

  it('preserves the 10 routes with their role guards and leave validation', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/hr\/employees['"],\s*isAuthenticated,\s*requireManagerOrAbove/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/hr\/employees['"],\s*isAuthenticated,\s*requireManagerOrAbove/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/hr\/attendance['"]/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/hr\/attendance\/clock['"]/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/hr\/leave-requests['"],\s*isAuthenticated,\s*validate\(createLeaveRequestSchema\)/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/hr\/leave-requests\/:id['"],\s*isAuthenticated,\s*requireManagerOrAbove/);
    // Payroll routes gate on ADMIN/MANAGER/ACCOUNTANT.
    expect(moduleIndexSource).toMatch(/requireRole\(\['ADMIN', 'MANAGER', 'ACCOUNTANT'\]\)/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/hr\/payroll\/summary['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/hr\/payroll\/slip\/:employeeId['"]/);
  });

  it('keeps the Saudi-compliance math + domain errors in the service', () => {
    expect(serviceSource).toMatch(/calculateGOSI/);
    expect(serviceSource).toMatch(/calculateEndOfService/);
    expect(serviceSource).toMatch(/calculateVacationBalance/);
    expect(serviceSource).toMatch(/Employee not found/);
    expect(serviceSource).toMatch(/ConflictError/);
    // The controller keeps the graceful-degradation defaults.
    expect(controllerSource).toMatch(/employees: \[\], total: 0/);
  });

  it('routes all data access through the repository (the only data-layer access)', () => {
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(controllerSource).not.toMatch(/db\.execute/);
    expect(serviceSource).not.toMatch(/db\.execute/);
  });
});
