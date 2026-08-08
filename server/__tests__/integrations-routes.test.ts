import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the integrations extraction (Phase E). The 16
 * `/api/integrations/*` handlers (connections CRUD, sync-logs, Google-Calendar
 * sync, Gmail send, accounting + OBD reads/stubs) moved from the monolith into
 * `server/modules/integrations`. Behavioral coverage: the module service tests.
 */
describe('Integrations extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/integrations/index.ts');
  const service = read('server/modules/integrations/services/integrations.service.ts');
  const repository = read('server/modules/integrations/repositories/integrations.repository.ts');

  it('mounts the integrations module from the hybrid router', () => {
    expect(hybrid).toMatch(/import integrationsRoutes from ["']\.\.\/modules\/integrations["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*integrationsRoutes\)/);
  });

  it('removes every /api/integrations/* handler from the legacy monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/integrations\//);
  });

  it('registers the 16 routes and keeps the connection ownership guard', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(16);
    expect(moduleIndex).toMatch(/requireResourceOwnership\(\{ table: 'integration_connections' \}\)/);
  });

  it('keeps the sync-log orchestration + 404 in the service and the storage/provider seams in the repository', () => {
    expect(service).toMatch(/NotFoundError/);
    expect(service).toMatch(/createSyncLog/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(repository).toMatch(/integrations\/googleCalendar\.js/);
    expect(repository).toMatch(/integrations\/gmail\.js/);
  });
});
