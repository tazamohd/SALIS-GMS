import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/appointments', isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const pagination = parsePagination(req);
    // Session garage wins; honor ?garage_id only for garage-less principals
    // (platform admins). The reverse order allowed forged cross-tenant reads.
    const gid = (req.user as any)?.garageId || (garage_id as string);
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
    // Ownership check: a caller with a garage may only read records of that
    // garage (404, not 403, to avoid confirming the record exists).
    const sessionGarage = (req.user as any)?.garageId;
    if (sessionGarage && appointment.garageId && appointment.garageId !== sessionGarage) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Failed to fetch appointment' });
  }
});

export default router;
