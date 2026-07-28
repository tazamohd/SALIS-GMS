import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { predictMaintenance, getMaintenanceStats } from '../services/predictive-maintenance';

const router = Router();

// All routes in this router require an authenticated session.
router.use(isAuthenticated);

router.get('/predictive-maintenance/predictions', async (req, res) => {
  const garageId = (req as any).user.garageId;
  try {
    const predictions = await predictMaintenance(garageId);
    res.json({ predictions });
  } catch (e) { res.json({ predictions: [] }); }
});

router.get('/predictive-maintenance/stats', async (req, res) => {
  const garageId = (req as any).user.garageId;
  try {
    const stats = await getMaintenanceStats(garageId);
    res.json(stats);
  } catch (e) { res.json({ vehicleCount: 0, critical: 0, high: 0, medium: 0, low: 0, estimatedRevenue: 0 }); }
});

export default router;
