import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Recurring appointment read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const recurringAppointmentRoutesSource = fs.readFileSync(
    path.resolve(process.cwd(), 'server/routes/recurring-appointments.ts'),
    'utf-8',
  );

  it('mounts the extracted recurring appointment router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import recurringAppointmentRoutes from ['"]\.\/recurring-appointments['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*recurringAppointmentRoutes\)/);
  });

  it('removes active recurring appointment read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/recurring-appointments\/:garageId['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/recurring-appointments\/detail\/:id['"]/);
  });

  it('leaves recurring appointment mutation and generate handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/recurring-appointments['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/recurring-appointments\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/recurring-appointments\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/recurring-appointments\/:id\/generate['"]/);
  });

  it('preserves garage recurring appointment list behavior', () => {
    expect(recurringAppointmentRoutesSource).toMatch(
      /router\.get\(['"]\/recurring-appointments\/:garageId['"],\s*isAuthenticated/,
    );
    expect(recurringAppointmentRoutesSource).toMatch(/const \{ garageId \} = req\.params/);
    expect(recurringAppointmentRoutesSource).toMatch(/storage\.getRecurringAppointments\(garageId\)/);
    expect(recurringAppointmentRoutesSource).toMatch(/Failed to fetch recurring appointments/);
  });

  it('preserves recurring appointment detail 404 behavior', () => {
    expect(recurringAppointmentRoutesSource).toMatch(
      /router\.get\(['"]\/recurring-appointments\/detail\/:id['"],\s*isAuthenticated/,
    );
    expect(recurringAppointmentRoutesSource).toMatch(/const \{ id \} = req\.params/);
    expect(recurringAppointmentRoutesSource).toMatch(/storage\.getRecurringAppointment\(id\)/);
    expect(recurringAppointmentRoutesSource).toMatch(/return res\.status\(404\)\.json\(\{ message: ['"]Recurring appointment not found['"] \}\)/);
  });
});
