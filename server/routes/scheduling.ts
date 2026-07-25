import { Router } from 'express';
import { isAuthenticated } from '../auth';
import * as phase5Service from '../phase5-operations-service';

const router = Router();

function parseLimit(limit: unknown, fallback: number) {
  if (typeof limit !== 'string') {
    return fallback;
  }

  const parsed = Number.parseInt(limit, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

router.get('/scheduling/rules', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const rules = await phase5Service.getSchedulingRules(garageId);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching scheduling rules:', error);
    res.status(500).json({ message: 'Failed to fetch scheduling rules' });
  }
});

router.get('/scheduling/history', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { limit } = req.query;
    const history = await phase5Service.getSchedulingHistory(garageId, parseLimit(limit, 30));
    res.json(history);
  } catch (error) {
    console.error('Error fetching scheduling history:', error);
    res.status(500).json({ message: 'Failed to fetch scheduling history' });
  }
});

router.get('/scheduling/optimizations', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { limit } = req.query;
    const optimizations = await phase5Service.getSchedulingHistory(garageId, parseLimit(limit, 30));
    res.json(optimizations);
  } catch (error) {
    console.error('Error fetching scheduling optimizations:', error);
    res.status(500).json({ message: 'Failed to fetch scheduling optimizations' });
  }
});

export default router;
