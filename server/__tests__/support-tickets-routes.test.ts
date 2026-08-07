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

  it('preserves support ticket list filters and scopes to the session garage', () => {
    expect(supportTicketRoutesSource).toMatch(/router\.get\(['"]\/support\/tickets['"],\s*isAuthenticated/);
    // B11: no client-supplied garageId fallback — always the session garage.
    expect(supportTicketRoutesSource).not.toMatch(/req\.user\?\.garageId \|\| garageId/);
    expect(supportTicketRoutesSource).toMatch(/storage\.getSupportTickets\(req\.user\.garageId,/);
    expect(supportTicketRoutesSource).toMatch(/assignedTo: assignedTo as string/);
  });

  it('scopes detail + events to the garage and preserves 404 behavior', () => {
    expect(supportTicketRoutesSource).toMatch(/router\.get\(['"]\/support\/tickets\/:id['"],\s*isAuthenticated/);
    expect(supportTicketRoutesSource).toMatch(/storage\.getSupportTicket\(id,\s*req\.user\.garageId\)/);
    expect(supportTicketRoutesSource).toMatch(/return res\.status\(404\)\.json\(\{ message: ['"]Ticket not found['"] \}\)/);
    expect(supportTicketRoutesSource).toMatch(/router\.get\(['"]\/support\/tickets\/:id\/events['"],\s*isAuthenticated/);
    expect(supportTicketRoutesSource).toMatch(/storage\.getSupportTicketEvents\(id\)/);
  });
});
