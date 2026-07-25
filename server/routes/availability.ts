import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/availability/technician/:technicianId', isAuthenticated, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { startDate, endDate } = req.query;

    const availability = await storage.getTechnicianAvailability(
      technicianId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );
    res.json(availability);
  } catch (error) {
    console.error('Error fetching technician availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
});

router.get('/availability/garage/:garageId', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const availability = await storage.getGarageAvailability(
      garageId,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.json(availability);
  } catch (error) {
    console.error('Error fetching garage availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
});

export default router;
