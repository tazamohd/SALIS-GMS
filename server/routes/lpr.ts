import { Router } from 'express';
import { isAuthenticated } from '../auth';
import * as phase7Service from '../phase7-hardware-service';

const router = Router();

router.get('/lpr/scans', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { limit } = req.query;
    const scans = await phase7Service.getLicensePlateScans(garageId, limit ? parseInt(limit) : 100);
    res.json(scans);
  } catch (error) {
    console.error('Error fetching license plate scans:', error);
    res.status(500).json({ message: 'Failed to fetch license plate scans' });
  }
});

router.get('/lpr/entry-logs', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { status } = req.query;
    const logs = await phase7Service.getVehicleEntryLogs(garageId, status as string);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching entry logs:', error);
    res.status(500).json({ message: 'Failed to fetch entry logs' });
  }
});

export default router;
