import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Support ticket read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const supportTicketRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/support-tickets.ts'), 'utf-8');

  it('mounts the extracted support ticket router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import supportTicketRoutes from ['"]\.\/support-tickets['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*supportTicketRoutes\)/);
  });

  it('removes active support ticket read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/support\/tickets['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/support\/tickets\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/support\/tickets\/:id\/events['"]/);
  });

  it('leaves support ticket mutation and action handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/support\/tickets['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/support\/tickets\/:id\/status['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/support\/tickets\/:id\/assign['"]/);
  });

  it('preserves support ticket list filters and garage fallback', () => {
    expect(supportTicketRoutesSource).toMatch(/router\.get\(['"]\/support\/tickets['"],\s*isAuthenticated/);
    expect(supportTicketRoutesSource).toMatch(/const \{ status,\s*priority,\s*assignedTo,\s*category,\s*garageId \} = req\.query/);
    expect(supportTicketRoutesSource).toMatch(/const userGarageId = req\.user\?\.garageId \|\| garageId/);
    expect(supportTicketRoutesSource).toMatch(/storage\.getSupportTickets\(userGarageId,\s*\{/);
    expect(supportTicketRoutesSource).toMatch(/assignedTo: assignedTo as string/);
  });

  it('preserves detail 404 and ticket event behavior', () => {
    expect(supportTicketRoutesSource).toMatch(/router\.get\(['"]\/support\/tickets\/:id['"],\s*isAuthenticated/);
    expect(supportTicketRoutesSource).toMatch(/storage\.getSupportTicket\(id\)/);
    expect(supportTicketRoutesSource).toMatch(/return res\.status\(404\)\.json\(\{ message: ['"]Ticket not found['"] \}\)/);
    expect(supportTicketRoutesSource).toMatch(/router\.get\(['"]\/support\/tickets\/:id\/events['"],\s*isAuthenticated/);
    expect(supportTicketRoutesSource).toMatch(/storage\.getSupportTicketEvents\(id\)/);
  });
});
