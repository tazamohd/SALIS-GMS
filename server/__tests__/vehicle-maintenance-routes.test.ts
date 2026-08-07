import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Source-contract tests for the vehicle maintenance reads. Phase E consolidated
 * these `/vehicles/:id/*` sub-resources into the vehicles module
 * (`server/modules/vehicles`), keeping the `requireResourceOwnership` guard.
 * Assertions target the module's route surface and repository bindings.
 */
describe('Vehicle maintenance read route extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacyRoutesSource = read('server/routes.ts');
  const hybridRoutesSource = read('server/routes/index.ts');
  const moduleIndexSource = read('server/modules/vehicles/index.ts');
  const repositorySource = read('server/modules/vehicles/repositories/vehicle.repository.ts');
  const controllerSource = read('server/modules/vehicles/controllers/vehicle.controller.ts');

  it('mounts the vehicle module (which now owns the maintenance reads)', () => {
    expect(hybridRoutesSource).toMatch(/import vehicleRoutes from ['"]\.\.\/modules\/vehicles['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*vehicleRoutes\)/);
    // The standalone maintenance router is retired.
    expect(hybridRoutesSource).not.toMatch(/vehicleMaintenanceRoutes/);
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

  it('preserves route paths, ownership guard, query handling, and storage lookups', () => {
    // Sub-resource reads keep the resource-ownership guard.
    expect(moduleIndexSource).toMatch(/requireResourceOwnership\(\{\s*table:\s*['"]vehicles['"]\s*\}\)/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/vehicles\/:id\/service-history['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/vehicles\/:id\/maintenance-schedules['"],\s*isAuthenticated/);
    expect(moduleIndexSource).toMatch(/router\.get\(\s*['"]\/vehicles\/:id\/service-reminders['"],\s*isAuthenticated/);
    expect(repositorySource).toMatch(/storage\.getVehicleServiceHistory\(/);
    expect(repositorySource).toMatch(/storage\.getMaintenanceSchedules\(/);
    expect(repositorySource).toMatch(/storage\.getServiceReminders\(/);
    // Reminder status filter is still threaded through.
    expect(controllerSource).toMatch(/req\.query\.status/);
  });
});
