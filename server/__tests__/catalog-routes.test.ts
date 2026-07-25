import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vehicle catalog route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const catalogRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/catalogs.ts'), 'utf-8');

  it('mounts the extracted catalog router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import catalogRoutes from ['"]\.\/catalogs['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*catalogRoutes\)/);
  });

  it('removes active catalog handlers from the legacy monolith', () => {
    for (const route of [
      'vehicle-makes',
      'vehicle-models',
      'nationalities',
      'years',
      'colors',
      'engine-types',
      'transmission-types',
    ]) {
      expect(legacyRoutesSource).not.toMatch(new RegExp(`app\\.get\\(['"]/api/catalogs/${route}`));
    }
  });

  it('preserves all catalog routes and authentication middleware', () => {
    for (const route of [
      'vehicle-makes',
      'vehicle-models',
      'nationalities',
      'years',
      'colors',
      'engine-types',
      'transmission-types',
    ]) {
      expect(catalogRoutesSource).toMatch(new RegExp(`router\\.get\\(['"]/catalogs/${route}['"],\\s*isAuthenticated`));
    }
  });

  it('preserves make-filtered vehicle model lookup behavior', () => {
    expect(catalogRoutesSource).toMatch(/const \{ makeId \} = req\.query/);
    expect(catalogRoutesSource).toMatch(/getModelsForMake\(makeId as string\)/);
    expect(catalogRoutesSource).toMatch(/res\.json\(vehicleModels\)/);
  });
});
