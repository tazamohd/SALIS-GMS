import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireResourceOwnership } from '../middleware/resourceOwnership';
import { storage } from '../storage';

const router = Router();

router.get('/service-reminders/due', isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const reminders = await storage.getServiceRemindersDue(garageId);
    res.json(reminders);
  } catch (error: any) {
    console.error('Error fetching due reminders:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/service-reminders/vehicle/:vehicleId', isAuthenticated, requireResourceOwnership({ table: 'vehicles', idParam: 'vehicleId' }), async (req, res) => {
  try {
    const reminders = await storage.getServiceRemindersByVehicle(req.params.vehicleId);
    res.json(reminders);
  } catch (error: any) {
    console.error('Error fetching vehicle reminders:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/service-reminders/customer/:customerId', isAuthenticated, requireResourceOwnership({ table: 'users', idParam: 'customerId' }), async (req, res) => {
  try {
    const reminders = await storage.getServiceRemindersByCustomer(req.params.customerId);
    res.json(reminders);
  } catch (error: any) {
    console.error('Error fetching customer reminders:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
