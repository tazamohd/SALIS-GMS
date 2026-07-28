import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

const authorizeTechnician = (req: any, res: any, next: any) => {
  const { technicianId } = req.params;

  if (req.user?.id !== technicianId && !['admin', 'manager'].includes(req.user?.userType)) {
    return res.status(403).json({ message: 'Access denied - you can only view your own data' });
  }

  next();
};

router.get('/technicians', isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const pagination = parsePagination(req);
    // Session garage wins; honor ?garage_id only for garage-less principals
    // (platform admins). The reverse order allowed forged cross-tenant reads.
    const gid = (req.user as any)?.garageId || (garage_id as string);
    const [data, total] = await Promise.all([
      storage.getTechniciansPaginated(gid, pagination.limit, pagination.offset),
      storage.countTechnicians(gid),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ message: 'Failed to fetch technicians' });
  }
});

router.get('/technicians/:technicianId/job-cards', isAuthenticated, authorizeTechnician, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const jobCards = await storage.getTechnicianJobCards(technicianId);
    res.json(jobCards);
  } catch (error) {
    console.error('Error fetching technician job cards:', error);
    res.status(500).json({ message: 'Failed to fetch job cards' });
  }
});

router.get('/technicians/:technicianId/time-clock', isAuthenticated, authorizeTechnician, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const entries = await storage.getTechnicianTimeClockEntries(technicianId);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching time clock entries:', error);
    res.status(500).json({ message: 'Failed to fetch time clock entries' });
  }
});

export default router;
