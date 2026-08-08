import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { EMAIL_TRIGGERS, SMS_TRIGGERS } from '../modules/notifications/controllers/notifications.controller';

/**
 * Source-contract tests for the notifications extraction (Phase E). The in-app
 * notification CRUD, the test endpoint, the 13 email/SMS triggers and the
 * `/my/notifications` surface moved from the monolith into
 * `server/modules/notifications`, preserving the ownership guards on `:id`.
 */
describe('Notifications extraction (Phase E module)', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');
  const legacy = read('server/routes.ts');
  const hybrid = read('server/routes/index.ts');
  const moduleIndex = read('server/modules/notifications/index.ts');
  const service = read('server/modules/notifications/services/notifications.service.ts');
  const repository = read('server/modules/notifications/repositories/notifications.repository.ts');

  it('mounts the notifications module from the hybrid router', () => {
    expect(hybrid).toMatch(/import notificationsRoutes from ["']\.\.\/modules\/notifications["']/);
    expect(hybrid).toMatch(/app\.use\(["']\/api["'],\s*notificationsRoutes\)/);
  });

  it('removes every /api/notifications + /api/my/notifications handler from the legacy monolith', () => {
    expect(legacy).not.toMatch(/app\.(get|post|patch|delete)\(['"]\/api\/notifications/);
    expect(legacy).not.toMatch(/app\.(get|post)\(['"]\/api\/my\/notifications/);
  });

  it('has 5 email + 8 sms triggers in the config tables', () => {
    expect(EMAIL_TRIGGERS).toHaveLength(5);
    expect(SMS_TRIGGERS).toHaveLength(8);
    // Every trigger declares a schema, template, category and messages.
    for (const t of [...EMAIL_TRIGGERS, ...SMS_TRIGGERS]) {
      expect(t.schema).toBeTruthy();
      expect(t.template).toBeTruthy();
      expect(t.ok).toBeTruthy();
      expect(t.err).toBeTruthy();
    }
  });

  it('preserves the requireResourceOwnership guard on the :id routes and registers triggers by config', () => {
    expect(moduleIndex).toMatch(/requireResourceOwnership\(\{ table: 'notifications' \}\)/);
    expect(moduleIndex).toMatch(/for \(const cfg of EMAIL_TRIGGERS\)/);
    expect(moduleIndex).toMatch(/for \(const cfg of SMS_TRIGGERS\)/);
    // unread-count registered before :id so the literal wins.
    expect(moduleIndex.indexOf("'/notifications/unread-count'")).toBeLessThan(moduleIndex.indexOf("'/notifications/:id'"));
  });

  it('keeps 404 + defaults in the service and storage/email/sms access in the repository', () => {
    expect(service).toMatch(/NotFoundError/);
    expect(repository).toMatch(/from '\.\.\/\.\.\/\.\.\/storage'/);
    expect(repository).toMatch(/emailService/);
    expect(repository).toMatch(/smsService/);
  });
});
