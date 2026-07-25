import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/appointments', isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const pagination = parsePagination(req);
    const gid = (garage_id as string) || (req.user as any)?.garageId;
    const [data, total] = await Promise.all([
      storage.getAppointmentsPaginated(gid, pagination.limit, pagination.offset),
      storage.countAppointments(gid),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

router.get('/appointments/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await storage.getAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Failed to fetch appointment' });
  }
});

export default router;
