import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Appointment read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const appointmentRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/appointments.ts'), 'utf-8');

  it('mounts the extracted appointment router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import appointmentRoutes from ['"]\.\/appointments['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*appointmentRoutes\)/);
  });

  it('removes active appointment read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/appointments['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/appointments\/:id['"]/);
  });

  it('leaves mutating appointment handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/appointments['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/appointments\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/appointments\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/appointments\/:id\/status['"]/);
  });

  it('preserves appointment list pagination, garage scoping, and detail lookup', () => {
    expect(appointmentRoutesSource).toMatch(/router\.get\(['"]\/appointments['"],\s*isAuthenticated/);
    expect(appointmentRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(appointmentRoutesSource).toMatch(/const gid = \(req\.user as any\)\?\.garageId \|\| \(garage_id as string\)/);
    expect(appointmentRoutesSource).toMatch(/storage\.getAppointmentsPaginated\(gid,\s*pagination\.limit,\s*pagination\.offset\)/);
    expect(appointmentRoutesSource).toMatch(/storage\.countAppointments\(gid\)/);
    expect(appointmentRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    expect(appointmentRoutesSource).toMatch(/router\.get\(['"]\/appointments\/:id['"],\s*isAuthenticated/);
    expect(appointmentRoutesSource).toMatch(/storage\.getAppointment\(id\)/);
    expect(appointmentRoutesSource).toMatch(/Appointment not found/);
  });
});
