import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Direct service reminder read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const serviceReminderRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/service-reminders.ts'), 'utf-8');

  it('mounts the extracted direct service reminder router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import serviceReminderRoutes from ['"]\.\/service-reminders['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*serviceReminderRoutes\)/);
  });

  it('removes active direct service reminder read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-reminders\/due['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-reminders\/vehicle\/:vehicleId['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/service-reminders\/customer\/:customerId['"]/);
  });

  it('leaves direct service reminder actions in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/service-reminders\/:id\/status['"]/);
    expect(legacyRoutesSource).toMatch(/storage\.updateServiceReminderStatus\(req\.params\.id,\s*status\)/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/service-reminders\/generate['"]/);
    expect(legacyRoutesSource).toMatch(/storage\.generateAutoServiceReminders\(\)/);
  });

  it('preserves due reminder garage scoping', () => {
    expect(serviceReminderRoutesSource).toMatch(/router\.get\(['"]\/service-reminders\/due['"],\s*isAuthenticated/);
    expect(serviceReminderRoutesSource).toMatch(/const garageId = req\.user\?\.garageId/);
    expect(serviceReminderRoutesSource).toMatch(/storage\.getServiceRemindersDue\(garageId\)/);
    expect(serviceReminderRoutesSource).toMatch(/res\.json\(reminders\)/);
  });

  it('preserves vehicle and customer reminder lookups', () => {
    expect(serviceReminderRoutesSource).toMatch(/router\.get\(['"]\/service-reminders\/vehicle\/:vehicleId['"],\s*isAuthenticated/);
    expect(serviceReminderRoutesSource).toMatch(/storage\.getServiceRemindersByVehicle\(req\.params\.vehicleId\)/);
    expect(serviceReminderRoutesSource).toMatch(/router\.get\(['"]\/service-reminders\/customer\/:customerId['"],\s*isAuthenticated/);
    expect(serviceReminderRoutesSource).toMatch(/storage\.getServiceRemindersByCustomer\(req\.params\.customerId\)/);
  });
});
