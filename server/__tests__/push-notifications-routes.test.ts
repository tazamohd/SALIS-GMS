import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Push notification read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const pushNotificationRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/push-notifications.ts'), 'utf-8');

  it('mounts the extracted push notification router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import pushNotificationRoutes from ['"]\.\/push-notifications['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*pushNotificationRoutes\)/);
  });

  it('removes active push notification read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/push-notifications['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/push-notifications\/unread-count['"]/);
  });

  it('leaves push notification action handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/push-notifications['"]/);
    expect(legacyRoutesSource).toMatch(/storage\.createPushNotification\(\{/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/push-notifications\/:id\/read['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/push-notifications\/:id\/clicked['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/push-notifications\/:id\/send['"]/);
  });

  it('preserves user-scoped notification list filters', () => {
    expect(pushNotificationRoutesSource).toMatch(/router\.get\(['"]\/push-notifications['"],\s*isAuthenticated/);
    expect(pushNotificationRoutesSource).toMatch(/const userId = req\.user\?\.id/);
    expect(pushNotificationRoutesSource).toMatch(/const \{ status,\s*type \} = req\.query/);
    expect(pushNotificationRoutesSource).toMatch(/storage\.getPushNotifications\(\{\s*userId,\s*status: status as string,\s*type: type as string,\s*\}\)/);
  });

  it('preserves unread-count behavior', () => {
    expect(pushNotificationRoutesSource).toMatch(/router\.get\(['"]\/push-notifications\/unread-count['"],\s*isAuthenticated/);
    expect(pushNotificationRoutesSource).toMatch(/storage\.getUnreadNotificationCount\(userId\)/);
    expect(pushNotificationRoutesSource).toMatch(/res\.json\(\{ count \}\)/);
  });
});
