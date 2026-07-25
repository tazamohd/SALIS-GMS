import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Calendar event read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const calendarEventRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/calendar-events.ts'), 'utf-8');

  it('mounts the extracted calendar event router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import calendarEventRoutes from ['"]\.\/calendar-events['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*calendarEventRoutes\)/);
  });

  it('removes active calendar event read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/calendar-events\/:garageId['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/calendar-events\/detail\/:id['"]/);
  });

  it('leaves calendar event mutation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/calendar-events['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/calendar-events\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/calendar-events\/:id['"]/);
  });

  it('preserves calendar event list date-range validation and storage call', () => {
    expect(calendarEventRoutesSource).toMatch(/router\.get\(['"]\/calendar-events\/:garageId['"],\s*isAuthenticated/);
    expect(calendarEventRoutesSource).toMatch(/const \{ garageId \} = req\.params/);
    expect(calendarEventRoutesSource).toMatch(/const \{ startDate,\s*endDate \} = req\.query/);
    expect(calendarEventRoutesSource).toMatch(/if \(!startDate \|\| !endDate\)/);
    expect(calendarEventRoutesSource).toMatch(/startDate and endDate are required/);
    expect(calendarEventRoutesSource).toMatch(/storage\.getCalendarEvents\(\s*garageId,\s*new Date\(startDate as string\),\s*new Date\(endDate as string\),\s*\)/);
  });

  it('preserves calendar event detail 404 behavior', () => {
    expect(calendarEventRoutesSource).toMatch(/router\.get\(['"]\/calendar-events\/detail\/:id['"],\s*isAuthenticated/);
    expect(calendarEventRoutesSource).toMatch(/const \{ id \} = req\.params/);
    expect(calendarEventRoutesSource).toMatch(/storage\.getCalendarEvent\(id\)/);
    expect(calendarEventRoutesSource).toMatch(/return res\.status\(404\)\.json\(\{ message: ['"]Calendar event not found['"] \}\)/);
  });
});
