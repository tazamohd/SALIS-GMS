import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/service-bays', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.query;
    const bays = await storage.getServiceBays(garageId as string);
    res.json(bays);
  } catch (error) {
    console.error('Error fetching service bays:', error);
    res.status(500).json({ message: 'Failed to fetch service bays' });
  }
});

router.get('/service-bays/with-sessions', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.query;
    const baysWithSessions = await storage.getServiceBaysWithSessions(garageId as string);
    res.json(baysWithSessions);
  } catch (error) {
    console.error('Error fetching service bays with sessions:', error);
    res.status(500).json({ message: 'Failed to fetch service bays with sessions' });
  }
});

router.get('/service-bays/statistics', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.query;
    const statistics = await storage.getServiceBayStatistics(garageId as string);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching service bay statistics:', error);
    res.status(500).json({ message: 'Failed to fetch service bay statistics' });
  }
});

export default router;
