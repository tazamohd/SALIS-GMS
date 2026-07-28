import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Technician read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const technicianRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/technicians.ts'), 'utf-8');

  it('mounts the extracted technician router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import technicianRoutes from ['"]\.\/technicians['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*technicianRoutes\)/);
  });

  it('removes active technician read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/technicians['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/technicians\/:technicianId\/job-cards['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/technicians\/:technicianId\/time-clock['"]/);
  });

  it('leaves mutating technician handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/technicians['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/technicians\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/technicians\/:technicianId\/time-clock['"]/);
  });

  it('preserves technician list authentication, garage scoping, and pagination', () => {
    expect(technicianRoutesSource).toMatch(/router\.get\(['"]\/technicians['"],\s*isAuthenticated/);
    expect(technicianRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(technicianRoutesSource).toMatch(/const gid = \(req\.user as any\)\?\.garageId \|\| \(garage_id as string\)/);
    expect(technicianRoutesSource).toMatch(/storage\.getTechniciansPaginated\(gid,\s*pagination\.limit,\s*pagination\.offset\)/);
    expect(technicianRoutesSource).toMatch(/storage\.countTechnicians\(gid\)/);
    expect(technicianRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
  });

  it('preserves technician-scoped read authorization and storage calls', () => {
    expect(technicianRoutesSource).toMatch(/const authorizeTechnician = \(req: any,\s*res: any,\s*next: any\)/);
    expect(technicianRoutesSource).toMatch(/req\.user\?\.id !== technicianId/);
    expect(technicianRoutesSource).toMatch(/\['admin', 'manager'\]\.includes\(req\.user\?\.userType\)/);
    expect(technicianRoutesSource).toMatch(/Access denied - you can only view your own data/);
    expect(technicianRoutesSource).toMatch(/router\.get\(['"]\/technicians\/:technicianId\/job-cards['"],\s*isAuthenticated,\s*authorizeTechnician/);
    expect(technicianRoutesSource).toMatch(/storage\.getTechnicianJobCards\(technicianId\)/);
    expect(technicianRoutesSource).toMatch(/router\.get\(['"]\/technicians\/:technicianId\/time-clock['"],\s*isAuthenticated,\s*authorizeTechnician/);
    expect(technicianRoutesSource).toMatch(/storage\.getTechnicianTimeClockEntries\(technicianId\)/);
  });
});
