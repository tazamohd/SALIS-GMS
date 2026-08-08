import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the subscriptions/billing feature set. Phase E
 * extracted `server/routes/subscriptions.ts` into a layered module
 * (`server/modules/subscriptions`). Behavioral coverage lives in
 * `server/modules/subscriptions/__tests__/subscription.service.test.ts`.
 */
describe('Subscriptions consolidation (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/subscriptions/index.ts');
  const controllerSource = read('server/modules/subscriptions/controllers/subscription.controller.ts');
  const serviceSource = read('server/modules/subscriptions/services/subscription.service.ts');
  const repositorySource = read('server/modules/subscriptions/repositories/subscription.repository.ts');

  it('mounts the module and retires the legacy route file', () => {
    expect(hybridRoutesSource).toMatch(/import subscriptionsRoutes from ["']\.\.\/modules\/subscriptions["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*subscriptionsRoutes\)/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/subscriptions.ts'))).toBe(false);
  });

  it('preserves the seven routes with their gates', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/plans['"]/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/subscriptions\/current['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/subscriptions\/change-plan['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/subscriptions\/cancel['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/subscriptions\/resume['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/subscriptions\/all['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/subscriptions\/:garageId['"],\s*isAuthenticated/);
  });

  it('keeps the guards/validation in the controller and data access behind the repository', () => {
    expect(controllerSource).toMatch(/No garage associated/);
    expect(controllerSource).toMatch(/PLATFORM_ADMIN/);
    expect(controllerSource).toMatch(/Forbidden/);
    expect(controllerSource).toMatch(/STRIPE_SECRET_KEY/);
    expect(controllerSource).toMatch(/safeParse/);
    // storage lives only in the repository.
    expect(repositorySource).toMatch(/from '.*\/storage'/);
    expect(serviceSource).not.toMatch(/from '.*\/storage'/);
    expect(controllerSource).not.toMatch(/from '.*\/storage'/);
  });
});
