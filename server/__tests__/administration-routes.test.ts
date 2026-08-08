import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the platform-administration surface. Phase E
 * extracted the fourteen `/api/platform-admin/*` handlers (stats, garages,
 * suppliers, support tickets, system-health, and the onboarding + subscription-
 * request review queues) out of the monolith into a layered module
 * (`server/modules/administration`). The interleaved PUBLIC intake endpoints
 * (`POST /api/garage-applications`, `POST /api/subscription-requests`) stay in
 * the monolith by design. Behavioral coverage lives in the module service tests.
 */
describe('Platform-administration extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/administration/index.ts');
  const serviceSource = read('server/modules/administration/services/administration.service.ts');
  const repositorySource = read('server/modules/administration/repositories/administration.repository.ts');
  const controllerSource = read('server/modules/administration/controllers/administration.controller.ts');

  it('mounts the administration module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import administrationRoutes from ["']\.\.\/modules\/administration["']/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*administrationRoutes\)/);
  });

  it('removes every /api/platform-admin/* handler from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/platform-admin\//);
  });

  it('keeps the interleaved public intake endpoints in the monolith', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/garage-applications['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/subscription-requests['"]/);
  });

  it('registers all fourteen routes behind requirePlatformAdmin', () => {
    const guards = (moduleIndexSource.match(/requirePlatformAdmin/g) || []).length;
    expect(guards).toBeGreaterThanOrEqual(14);
    // The seven mutating routes keep auditLog.
    const audits = (moduleIndexSource.match(/auditLog/g) || []).length;
    // 1 import + 7 route usages.
    expect(audits).toBeGreaterThanOrEqual(8);
  });

  it('keeps the workflow rules in the service, data/infra access in the repository, and 500-shapes in the controller', () => {
    expect(serviceSource).toMatch(/A garage with this name already exists/);
    expect(serviceSource).toMatch(/Application already rejected/);
    expect(serviceSource).toMatch(/already/); // subscription-request conflict translation
    // Data / infra access only in the repository (Drizzle + storage + system probes).
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/db'/);
    expect(repositorySource).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(repositorySource).toMatch(/pg_stat_activity/);
    // The controller preserves the fixed 500 strings.
    expect(controllerSource).toMatch(/Failed to list applications/);
    expect(controllerSource).toMatch(/Failed to approve request/);
  });
});
