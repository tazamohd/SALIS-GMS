import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vehicle tracking read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const vehicleTrackingRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/vehicle-tracking.ts'), 'utf-8');

  it('mounts the extracted vehicle tracking router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import vehicleTrackingRoutes from ['"]\.\/vehicle-tracking['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*vehicleTrackingRoutes\)/);
  });

  it('removes active vehicle tracking read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vehicle-tracking['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vehicle-tracking\/:vehicleId['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/vehicle-tracking\/:vehicleId\/history['"]/);
  });

  it('leaves vehicle tracking update handler in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/vehicle-tracking['"]/);
    expect(legacyRoutesSource).toMatch(/storage\.upsertVehicleTracking\(vehicleId,\s*\{/);
    expect(legacyRoutesSource).toMatch(/storage\.createVehicleTrackingHistory\(\{/);
  });

  it('preserves garage-scoped tracking list behavior', () => {
    expect(vehicleTrackingRoutesSource).toMatch(/router\.get\(['"]\/vehicle-tracking['"],\s*isAuthenticated/);
    expect(vehicleTrackingRoutesSource).toMatch(/const garageId = req\.user\?\.garageId/);
    expect(vehicleTrackingRoutesSource).toMatch(/storage\.getVehicleTrackingData\(garageId\)/);
    expect(vehicleTrackingRoutesSource).toMatch(/res\.json\(data\)/);
  });

  it('preserves vehicle detail 404 and history limit behavior', () => {
    expect(vehicleTrackingRoutesSource).toMatch(/router\.get\(['"]\/vehicle-tracking\/:vehicleId['"],\s*isAuthenticated/);
    expect(vehicleTrackingRoutesSource).toMatch(/storage\.getVehicleTrackingByVehicleId\(req\.params\.vehicleId\)/);
    expect(vehicleTrackingRoutesSource).toMatch(
      /return res\.status\(404\)\.json\(\{ message: ['"]No tracking data found for this vehicle['"] \}\)/,
    );
    expect(vehicleTrackingRoutesSource).toMatch(/router\.get\(['"]\/vehicle-tracking\/:vehicleId\/history['"],\s*isAuthenticated/);
    expect(vehicleTrackingRoutesSource).toMatch(/const limit = parseInt\(req\.query\.limit as string\) \|\| 100/);
    expect(vehicleTrackingRoutesSource).toMatch(/storage\.getVehicleTrackingHistory\(req\.params\.vehicleId,\s*limit\)/);
  });
});
