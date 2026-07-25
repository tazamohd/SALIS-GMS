import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Availability read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const availabilityRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/availability.ts'), 'utf-8');

  it('mounts the extracted availability router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import availabilityRoutes from ['"]\.\/availability['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*availabilityRoutes\)/);
  });

  it('removes active availability read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/availability\/technician\/:technicianId['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/availability\/garage\/:garageId['"]/);
  });

  it('leaves availability mutation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/availability['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/availability\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/availability\/:id['"]/);
  });

  it('preserves technician availability optional date filters', () => {
    expect(availabilityRoutesSource).toMatch(/router\.get\(['"]\/availability\/technician\/:technicianId['"],\s*isAuthenticated/);
    expect(availabilityRoutesSource).toMatch(/const \{ technicianId \} = req\.params/);
    expect(availabilityRoutesSource).toMatch(/const \{ startDate,\s*endDate \} = req\.query/);
    expect(availabilityRoutesSource).toMatch(/storage\.getTechnicianAvailability\(\s*technicianId,\s*startDate \? new Date\(startDate as string\) : undefined,\s*endDate \? new Date\(endDate as string\) : undefined,\s*\)/);
  });

  it('preserves garage availability required date range', () => {
    expect(availabilityRoutesSource).toMatch(/router\.get\(['"]\/availability\/garage\/:garageId['"],\s*isAuthenticated/);
    expect(availabilityRoutesSource).toMatch(/if \(!startDate \|\| !endDate\)/);
    expect(availabilityRoutesSource).toMatch(/startDate and endDate are required/);
    expect(availabilityRoutesSource).toMatch(/storage\.getGarageAvailability\(\s*garageId,\s*new Date\(startDate as string\),\s*new Date\(endDate as string\),\s*\)/);
  });
});
