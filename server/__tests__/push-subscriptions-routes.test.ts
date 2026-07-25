import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Push subscription read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const pushSubscriptionRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/push-subscriptions.ts'), 'utf-8');

  it('mounts the extracted push subscription router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import pushSubscriptionRoutes from ['"]\.\/push-subscriptions['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*pushSubscriptionRoutes\)/);
  });

  it('removes active push subscription read handler from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/push-subscriptions['"]/);
  });

  it('leaves push subscription mutation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/push-subscriptions['"]/);
    expect(legacyRoutesSource).toMatch(/storage\.createPushSubscription\(\{/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/push-subscriptions\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/storage\.deletePushSubscription\(req\.params\.id\)/);
  });

  it('preserves user-scoped subscription lookup behavior', () => {
    expect(pushSubscriptionRoutesSource).toMatch(/router\.get\(['"]\/push-subscriptions['"],\s*isAuthenticated/);
    expect(pushSubscriptionRoutesSource).toMatch(/const userId = req\.user\?\.id/);
    expect(pushSubscriptionRoutesSource).toMatch(/storage\.getPushSubscriptions\(userId\)/);
    expect(pushSubscriptionRoutesSource).toMatch(/res\.json\(subscriptions\)/);
  });
});
