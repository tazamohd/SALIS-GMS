import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/assignments/history/:jobCardId', isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const { limit } = req.query;
    const userGarageId = (req.user as any)?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: 'User garage ID is required' });
    }

    const history = await storage.listAssignmentHistory(
      userGarageId,
      jobCardId,
      limit ? parseInt(limit as string) : 50,
    );
    res.json(history);
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({ message: 'Failed to fetch assignment history' });
  }
});

router.get('/assignments/rules', isAuthenticated, async (req, res) => {
  try {
    const { active } = req.query;
    const userGarageId = (req.user as any)?.garageId;

    if (!userGarageId) {
      return res.status(400).json({ message: 'User garage ID is required' });
    }

    const rules = await storage.listAssignmentRules(
      userGarageId,
      active === 'true' ? true : active === 'false' ? false : undefined,
    );
    res.json(rules);
  } catch (error) {
    console.error('Error fetching assignment rules:', error);
    res.status(500).json({ message: 'Failed to fetch assignment rules' });
  }
});

export default router;
