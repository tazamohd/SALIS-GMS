import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/push-notifications', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { status, type } = req.query;
    const notifications = await storage.getPushNotifications({
      userId,
      status: status as string,
      type: type as string,
    });
    res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/push-notifications/unread-count', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const count = await storage.getUnreadNotificationCount(userId);
    res.json({ count });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
