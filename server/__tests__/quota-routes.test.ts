import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the entitlement-quota subsystem (Phase D.1 / LIC-2):
 * the `GET /api/quota` status surface + the `enforceQuota` middleware wired onto
 * a create path. Behavioral coverage lives in the quota service tests.
 */
describe('Quota subsystem (Phase D.1 / LIC-2)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/quota/index.ts');
  const middleware = read('server/modules/quota/quota.middleware.ts');
  const service = read('server/modules/quota/services/quota.service.ts');
  const repository = read('server/modules/quota/repositories/quota.repository.ts');
  const legacy = read('server/routes.ts');

  it('mounts the quota module and exposes GET /api/quota behind auth', () => {
    expect(hybrid).toMatch(/import quotaRoutes from ["']\.\.\/modules\/quota["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*quotaRoutes\)/);
    expect(moduleIndex).toMatch(/router\.get\(\s*'\/quota',\s*isAuthenticated/);
  });

  it('re-exports the enforceQuota middleware from the module', () => {
    expect(moduleIndex).toMatch(/export \{ enforceQuota \} from '\.\/quota\.middleware'/);
  });

  it('enforcement is fail-open (garage-less / error → next)', () => {
    expect(middleware).toMatch(/if \(!garageId\) return next\(\)/);
    expect(middleware).toMatch(/Fail-open/);
  });

  it('resolves limits from @shared/plans and reads usage in the repository', () => {
    expect(service).toMatch(/from '@shared\/plans'/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    expect(repository).toMatch(/from '@shared\/schema'/);
  });

  it('wires enforceQuota(vehicles) onto the monolith vehicle-create route', () => {
    expect(legacy).toMatch(/import \{ enforceQuota \} from "\.\/modules\/quota"/);
    expect(legacy).toMatch(/app\.post\('\/api\/vehicles',\s*isAuthenticated,\s*enforceQuota\('vehicles'\)/);
  });
});
