import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification, createNotification, getPreferences, updatePreferences } from '../services/notification-center';
import { validate } from '../middleware/validate';
import { notificationPreferencesSchema } from '../schemas/validation';

const router = Router();

router.get('/notifications', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const { unreadOnly, category, limit } = req.query;
  const notifs = await getNotifications(userId, {
    unreadOnly: unreadOnly === 'true',
    category: category as string,
    limit: limit ? Number(limit) : 50,
  });
  const unreadCount = await getUnreadCount(userId);
  res.json({ notifications: notifs, unreadCount });
}));

router.get('/notifications/unread-count', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  res.json({ count: await getUnreadCount(userId) });
}));

router.post('/notifications/:id/read', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const ok = await markAsRead(req.params.id, userId);
  if (!ok) { res.status(404).json({ message: 'Notification not found' }); return; }
  res.json({ success: true });
}));

router.post('/notifications/read-all', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const count = await markAllAsRead(userId);
  res.json({ success: true, markedCount: count });
}));

router.delete('/notifications/:id', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const ok = await deleteNotification(req.params.id, userId);
  if (!ok) { res.status(404).json({ message: 'Notification not found' }); return; }
  res.json({ success: true });
}));

router.get('/notifications/preferences', isAuthenticated, (req, res) => {
  const userId = (req as any).user.id;
  res.json({ preferences: getPreferences(userId) });
});

router.put('/notifications/preferences', isAuthenticated, validate(notificationPreferencesSchema), (req, res) => {
  const userId = (req as any).user.id;
  updatePreferences(userId, req.body.preferences);
  res.json({ success: true });
});

// Demo: seed some notifications
router.post('/notifications/seed', isAuthenticated, asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const garageId = (req as any).user.garageId;
  const demos = [
    { title: 'Job #1042 Completed', message: 'Oil change for Toyota Camry 2022 is done', type: 'success' as const, category: 'Job Updates', actionUrl: '/job-cards' },
    { title: 'Low Stock Alert', message: 'Brake Pads Front - only 2 remaining', type: 'warning' as const, category: 'Inventory Alerts', actionUrl: '/inventory-management' },
    { title: 'Payment Received', message: 'SAR 1,250 received for Invoice #INV-2024-089', type: 'success' as const, category: 'Payment Received', actionUrl: '/invoices' },
    { title: 'Appointment Tomorrow', message: 'Ahmed Al-Rashid - AC Service at 10:00 AM', type: 'info' as const, category: 'Appointment Reminders', actionUrl: '/appointments' },
    { title: 'Overdue Invoice', message: 'Invoice #INV-2024-076 is 15 days overdue', type: 'error' as const, category: 'Payment Received', actionUrl: '/invoices' },
  ];
  for (const d of demos) {
    await createNotification({ userId, garageId, ...d });
  }
  res.json({ success: true, count: demos.length });
}));

export default router;
