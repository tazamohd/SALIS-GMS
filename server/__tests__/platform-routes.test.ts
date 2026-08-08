import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the platform/administration feature set. Phase E
 * extracted `server/routes/feature-flags.ts` into a layered module
 * (`server/modules/platform`). Behavioral coverage lives in
 * `server/modules/platform/__tests__/feature-flag.service.test.ts`.
 */
describe('Platform feature-flags consolidation (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/platform/index.ts');
  const controllerSource = read('server/modules/platform/controllers/feature-flag.controller.ts');
  const serviceSource = read('server/modules/platform/services/feature-flag.service.ts');
  const repositorySource = read('server/modules/platform/repositories/feature-flag.repository.ts');
  const backupServiceSource = read('server/modules/platform/services/backup.service.ts');
  const backupControllerSource = read('server/modules/platform/controllers/backup.controller.ts');
  const backupRepositorySource = read('server/modules/platform/repositories/backup.repository.ts');

  it('mounts the platform module and retires the legacy route file', () => {
    expect(hybridRoutesSource).toMatch(/import platformRoutes from ["']\.\.\/modules\/platform["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*platformRoutes\)/);
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/feature-flags.ts'))).toBe(false);
    expect(hybridRoutesSource).not.toMatch(/featureFlagRoutes/);
  });

  it('retires the legacy backup route file and mounts backup via the platform module', () => {
    expect(fs.existsSync(path.resolve(process.cwd(), 'server/routes/backup.ts'))).toBe(false);
    expect(hybridRoutesSource).not.toMatch(/backupRoutes/);
  });

  it('preserves the four ADMIN-gated backup routes', () => {
    for (const [verb, route] of [
      ['get', '/backup/status'],
      ['post', '/backup/create'],
      ['get', '/backup/list'],
      ['get', '/backup/export/:type'],
    ] as const) {
      expect(moduleIndexSource).toMatch(
        new RegExp(`router\\.${verb}\\(\\s*['"]${route.replace(/[/:]/g, '\\$&')}['"],\\s*isAuthenticated,\\s*requireAdmin`),
      );
    }
  });

  it('preserves the five authenticated feature-flag routes', () => {
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/feature-flags['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/feature-flags\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.post\(\s*['"]\/feature-flags['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.patch\(\s*['"]\/feature-flags\/:id['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.delete\(\s*['"]\/feature-flags\/:id['"],\s*isAuthenticated/);
  });

  it('keeps the legacy wire shapes in the controller and the DB access behind the repository', () => {
    expect(controllerSource).toMatch(/Failed to fetch feature flags/);
    expect(controllerSource).toMatch(/Feature flag deleted/);
    expect(controllerSource).toMatch(/status\(201\)/);
    // Tenant-scoped Drizzle lives only in the repository.
    expect(repositorySource).toMatch(/featureFlags\.garageId/);
    expect(serviceSource).not.toMatch(/from '.*\/db'/);
    expect(controllerSource).not.toMatch(/from '.*\/db'/);
  });

  it('keeps backup data access in the repository and the export headers/400 in the controller', () => {
    // All DB/storage access is in the repository only.
    expect(backupRepositorySource).toMatch(/from '.*\/db'/);
    expect(backupRepositorySource).toMatch(/from '.*\/storage'/);
    expect(backupServiceSource).not.toMatch(/from '.*\/db'/);
    expect(backupServiceSource).not.toMatch(/from '.*\/storage'/);
    expect(backupControllerSource).not.toMatch(/from '.*\/db'/);
    // Controller preserves the legacy export download + unknown-type 400.
    expect(backupControllerSource).toMatch(/Content-Disposition/);
    expect(backupControllerSource).toMatch(/status\(400\)/);
    expect(backupControllerSource).toMatch(/Failed to export data/);
  });
});
