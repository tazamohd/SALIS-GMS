/**
 * Notifications module assembly (Phase E1/E2). Wires the notifications domain —
 * the in-app notification CRUD, the test notification, the 13 email/SMS
 * notification triggers, and the customer-facing `/my/notifications` surface —
 * into an Express router via DI. The `:id` routes keep their tenant-scoped
 * `requireResourceOwnership` guards; the triggers are registered from the
 * controller's config tables. All routes are `isAuthenticated`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { NOTIFICATIONS_SERVICE } from '../../infrastructure/di/tokens';
import { makeNotificationsController, EMAIL_TRIGGERS, SMS_TRIGGERS } from './controllers/notifications.controller';
import type { NotificationsService } from './services/notifications.service';

export interface NotificationsModuleDeps {
  service?: NotificationsService;
}

export function createNotificationsModule(deps: NotificationsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(NOTIFICATIONS_SERVICE);
  const c = makeNotificationsController(service);
  const router = Router();
  const own = requireResourceOwnership({ table: 'notifications' });

  // Core CRUD (unread-count before :id so the literal wins).
  router.get('/notifications', isAuthenticated, asyncHandler(c.list));
  router.get('/notifications/unread-count', isAuthenticated, asyncHandler(c.unreadCount));
  router.get('/notifications/:id', isAuthenticated, own, asyncHandler(c.get));
  router.post('/notifications', isAuthenticated, asyncHandler(c.create));
  router.patch('/notifications/:id', isAuthenticated, own, asyncHandler(c.update));
  router.patch('/notifications/:id/read', isAuthenticated, own, asyncHandler(c.markRead));
  router.delete('/notifications/:id', isAuthenticated, own, asyncHandler(c.remove));
  router.post('/notifications/test', isAuthenticated, asyncHandler(c.test));

  // Email notification triggers (config-driven).
  for (const cfg of EMAIL_TRIGGERS) {
    router.post(`/notifications/email/${cfg.path}`, isAuthenticated, asyncHandler(c.emailTrigger(cfg)));
  }
  // SMS notification triggers (config-driven).
  for (const cfg of SMS_TRIGGERS) {
    router.post(`/notifications/sms/${cfg.path}`, isAuthenticated, asyncHandler(c.smsTrigger(cfg)));
  }

  // Customer self-service — a user's own in-app notifications (recipient-scoped).
  router.get('/my/notifications', isAuthenticated, asyncHandler(c.listMine));
  router.post('/my/notifications/:id/read', isAuthenticated, asyncHandler(c.markMineRead));

  return router;
}

export default createNotificationsModule();
