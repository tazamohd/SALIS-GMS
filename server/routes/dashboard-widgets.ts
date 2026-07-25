import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/dashboard/widgets', isAuthenticated, async (req, res) => {
  try {
    const garageId = (req.user as any)?.garageId || 'default-garage';
    const widgets = await storage.getDashboardWidgets((req.user as any)?.id, garageId);
    res.json(widgets);
  } catch (error) {
    console.error('Error fetching widgets:', error);
    res.status(500).json({ message: 'Failed to fetch widgets' });
  }
});

router.get('/dashboard/widgets/defaults', isAuthenticated, async (_req, res) => {
  try {
    const defaults = await storage.getDefaultWidgets();
    res.json(defaults);
  } catch (error) {
    console.error('Error fetching default widgets:', error);
    res.status(500).json({ message: 'Failed to fetch default widgets' });
  }
});

export default router;
