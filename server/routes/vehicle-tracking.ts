import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireResourceOwnership } from '../middleware/resourceOwnership';
import { storage } from '../storage';

const router = Router();

router.get('/vehicle-tracking', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const data = await storage.getVehicleTrackingData(garageId);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching vehicle tracking data:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/vehicle-tracking/:vehicleId', isAuthenticated, requireResourceOwnership({ table: 'vehicles', idParam: 'vehicleId' }), async (req, res) => {
  try {
    const data = await storage.getVehicleTrackingByVehicleId(req.params.vehicleId);
    if (!data) {
      return res.status(404).json({ message: 'No tracking data found for this vehicle' });
    }
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching vehicle tracking:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/vehicle-tracking/:vehicleId/history', isAuthenticated, requireResourceOwnership({ table: 'vehicles', idParam: 'vehicleId' }), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = await storage.getVehicleTrackingHistory(req.params.vehicleId, limit);
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching tracking history:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
