import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vehicle maintenance read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const maintenanceRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/vehicle-maintenance.ts'), 'utf-8');

  it('mounts the extracted vehicle maintenance router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import vehicleMaintenanceRoutes from ['"]\.\/vehicle-maintenance['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*vehicleMaintenanceRoutes\)/);
  });

  it('removes active read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vehicles\/:id\/service-history['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vehicles\/:id\/maintenance-schedules['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vehicles\/:id\/service-reminders['"]/);
  });

  it('leaves mutating maintenance and reminder handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/vehicles\/:id\/service-history['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/service-history\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/vehicles\/:id\/maintenance-schedules['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/maintenance-schedules\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/vehicles\/:id\/service-reminders['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/service-reminders\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/service-reminders\/:id['"]/);
  });

  it('preserves extracted route paths, auth, query handling, and storage lookups', () => {
    expect(maintenanceRoutesSource).toMatch(/router\.get\(['"]\/vehicles\/:id\/service-history['"],\s*isAuthenticated/);
    expect(maintenanceRoutesSource).toMatch(/storage\.getVehicleServiceHistory\(id\)/);
    expect(maintenanceRoutesSource).toMatch(/router\.get\(['"]\/vehicles\/:id\/maintenance-schedules['"],\s*isAuthenticated/);
    expect(maintenanceRoutesSource).toMatch(/storage\.getMaintenanceSchedules\(id\)/);
    expect(maintenanceRoutesSource).toMatch(/router\.get\(['"]\/vehicles\/:id\/service-reminders['"],\s*isAuthenticated/);
    expect(maintenanceRoutesSource).toMatch(/const \{ status \} = req\.query/);
    expect(maintenanceRoutesSource).toMatch(/storage\.getServiceReminders\(id,\s*status as string \| undefined\)/);
  });
});
