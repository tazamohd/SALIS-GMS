import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/push-subscriptions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const subscriptions = await storage.getPushSubscriptions(userId);
    res.json(subscriptions);
  } catch (error: any) {
    console.error('Error fetching push subscriptions:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
