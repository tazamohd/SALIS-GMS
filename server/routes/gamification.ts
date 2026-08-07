import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireResourceOwnership } from '../middleware/resourceOwnership';
import { storage } from '../storage';

const router = Router();

router.get('/gamification/leaderboard', isAuthenticated, async (req, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    const leaderboard = await storage.getLeaderboard(
      period as string,
      parseInt(limit as string),
    );
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

router.get('/gamification/profile/:technicianId', isAuthenticated, requireResourceOwnership({ table: 'users', idParam: 'technicianId' }), async (req, res) => {
  try {
    const [points, badges, recentEvents] = await Promise.all([
      storage.getTechnicianPoints(req.params.technicianId),
      storage.getTechnicianBadges(req.params.technicianId),
      storage.getTechnicianRecentEvents(req.params.technicianId, 10),
    ]);

    res.json({ points, badges, recentEvents });
  } catch (error) {
    console.error('Error fetching gamification profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

router.get('/gamification/badges', isAuthenticated, async (_req, res) => {
  try {
    const badges = await storage.getGamificationBadges();
    res.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

export default router;
