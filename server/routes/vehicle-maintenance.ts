import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireResourceOwnership } from '../middleware/resourceOwnership';
import { storage } from '../storage';

const router = Router();

router.get('/vehicles/:id/service-history', isAuthenticated, requireResourceOwnership({ table: 'vehicles' }), async (req, res) => {
  try {
    const { id } = req.params;
    const history = await storage.getVehicleServiceHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching service history:', error);
    res.status(500).json({ message: 'Failed to fetch service history' });
  }
});

router.get('/vehicles/:id/maintenance-schedules', isAuthenticated, requireResourceOwnership({ table: 'vehicles' }), async (req, res) => {
  try {
    const { id } = req.params;
    const schedules = await storage.getMaintenanceSchedules(id);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance schedules' });
  }
});

router.get('/vehicles/:id/service-reminders', isAuthenticated, requireResourceOwnership({ table: 'vehicles' }), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const reminders = await storage.getServiceReminders(id, status as string | undefined);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching service reminders:', error);
    res.status(500).json({ message: 'Failed to fetch service reminders' });
  }
});

export default router;
