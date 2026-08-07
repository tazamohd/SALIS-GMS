import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireResourceOwnership } from '../middleware/resourceOwnership';
import { storage } from '../storage';

const router = Router();

router.get('/recurring-appointments/:garageId', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.params;
    const appointments = await storage.getRecurringAppointments(garageId);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching recurring appointments:', error);
    res.status(500).json({ message: 'Failed to fetch recurring appointments' });
  }
});

router.get('/recurring-appointments/detail/:id', isAuthenticated, requireResourceOwnership({ table: 'recurring_appointments' }), async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await storage.getRecurringAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Recurring appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching recurring appointment:', error);
    res.status(500).json({ message: 'Failed to fetch recurring appointment' });
  }
});

export default router;
