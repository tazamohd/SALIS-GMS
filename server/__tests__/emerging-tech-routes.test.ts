import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the emerging-tech extraction (Phase E). The 15
 * `/api/emerging-tech/*` handlers (14 showcase reads + the sample-data seeder)
 * moved from the monolith into `server/modules/emerging-tech`. Behavioral
 * coverage: the module service tests.
 */
describe('Emerging-tech extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/emerging-tech/index.ts');
  const service = read('server/modules/emerging-tech/services/emerging-tech.service.ts');
  const repository = read('server/modules/emerging-tech/repositories/emerging-tech.repository.ts');

  it('mounts the emerging-tech module from the hybrid router', () => {
    expect(hybrid).toMatch(/import emergingTechRoutes from ["']\.\.\/modules\/emerging-tech["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*emergingTechRoutes\)/);
  });

  it('removes every /api/emerging-tech/* handler from the legacy monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/emerging-tech\//);
  });

  it('registers the 15 routes (14 reads + seed)', () => {
    const routes = (moduleIndex.match(/router\.(get|post|patch|delete)\(/g) || []).length;
    expect(routes).toBe(15);
    expect((moduleIndex.match(/router\.get\(/g) || []).length).toBe(14);
    expect((moduleIndex.match(/router\.post\(/g) || []).length).toBe(1);
  });

  it('keeps the seed rule + biometric fallback in the service, storage in the repository', () => {
    expect(service).toMatch(/ValidationError\('Seed requires at least one vehicle in this garage'\)/);
    expect(service).toMatch(/return profile \|\| \{\}/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
  });
});
