import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the appointment read surface. Phase E migrated the
 * extracted router into a layered module (`server/modules/appointments`);
 * assertions target the module's controller/service/repository. Behavioral
 * coverage lives in `server/modules/appointments/__tests__/appointment.service.test.ts`.
 */
describe('Appointment read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/appointments/index.ts');
  const controllerSource = read('server/modules/appointments/controllers/appointment.controller.ts');
  const serviceSource = read('server/modules/appointments/services/appointment.service.ts');
  const repositorySource = read('server/modules/appointments/repositories/appointment.repository.ts');

  it('mounts the appointment module from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import appointmentRoutes from ['"]\.\.\/modules\/appointments['"]/);
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
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/appointments['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/appointments\/:id['"],\s*isAuthenticated/);
    expect(controllerSource).toMatch(/parsePagination\(req\)/);
    expect(controllerSource).toMatch(/sendPaginated\(res,\s*rows,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    // Session garage takes precedence over ?garage_id (tenant isolation).
    expect(serviceSource).toMatch(/auth\.garageId \?\? garageIdParam/);
    expect(serviceSource).toMatch(/Appointment not found/);
    expect(repositorySource).toMatch(/storage\.getAppointmentsPaginated\(/);
    expect(repositorySource).toMatch(/storage\.countAppointments\(/);
    expect(repositorySource).toMatch(/storage\.getAppointment\(/);
  });
});
