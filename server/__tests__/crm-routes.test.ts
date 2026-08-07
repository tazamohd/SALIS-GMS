import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the CRM read surface. Phase E migrated the
 * standalone `server/routes/crm.ts` router into a layered module
 * (`server/modules/crm`); assertions target the module's controller / service /
 * repository. Behavioral coverage lives in
 * `server/modules/crm/__tests__/crm.service.test.ts`.
 */
describe('CRM route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/crm/index.ts');
  const controllerSource = read('server/modules/crm/controllers/crm.controller.ts');
  const serviceSource = read('server/modules/crm/services/crm.service.ts');
  const repositorySource = read('server/modules/crm/repositories/crm.repository.ts');

  it('mounts the CRM module from the hybrid router and retires the legacy file', () => {
    expect(hybridRoutesSource).toMatch(/import crmRoutes from ["']\.\.\/modules\/crm["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*crmRoutes\)/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/crm.ts'))).toBe(false);
  });

  it('preserves the seven CRM routes, incl. the validated award-points POST', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/crm\/customers['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/crm\/customers\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/crm\/segments['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/crm\/loyalty\/summary['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/crm\/loyalty\/points['"]/);
    expect(moduleIndexSource).toMatch(/validate\(awardLoyaltyPointsSchema\)/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/crm\/retention['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/crm\/campaigns['"],\s*isAuthenticated/);
  });

  it('keeps the garage-required 403 and graceful-degradation defaults in the controller', () => {
    expect(controllerSource).toMatch(/No garage associated/);
    expect(controllerSource).toMatch(/Customer not found/);
    expect(controllerSource).toMatch(/Failed to load customer detail/);
  });

  it('routes all raw SQL through the repository (the only data-layer access)', () => {
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    expect(repositorySource).toMatch(/db\.execute\(/);
    // Controller and service never touch the data layer directly.
    expect(controllerSource).not.toMatch(/\bdb\.execute\b/);
    expect(serviceSource).not.toMatch(/\bdb\.execute\b/);
  });
});
