import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Garage and role route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const garageRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/garages.ts'), 'utf-8');

  it('mounts the extracted garage router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import garageRoutes from ['"]\.\/garages['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*garageRoutes\)/);
  });

  it('removes the active garage and role handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/garages['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/garages\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/garages\/:id\/branches['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/roles['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/user\/:id\/roles['"]/);
  });

  it('preserves all extracted route paths and authentication middleware', () => {
    const routePatterns = [
      /router\.get\(['"]\/garages['"],\s*isAuthenticated/,
      /router\.get\(['"]\/garages\/:id['"],\s*isAuthenticated/,
      /router\.get\(['"]\/garages\/:id\/branches['"],\s*isAuthenticated/,
      /router\.get\(['"]\/roles['"],\s*isAuthenticated/,
      /router\.get\(['"]\/user\/:id\/roles['"],\s*isAuthenticated/,
    ];

    for (const pattern of routePatterns) {
      expect(garageRoutesSource).toMatch(pattern);
    }
  });

  it('keeps pagination behavior for garage listings', () => {
    expect(garageRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(garageRoutesSource).toMatch(/storage\.getGaragesPaginated\(pagination\.limit,\s*pagination\.offset\)/);
    expect(garageRoutesSource).toMatch(/storage\.countGarages\(\)/);
    expect(garageRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
  });
});
