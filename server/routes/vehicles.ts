import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/vehicles', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.query;
    const pagination = parsePagination(req);
    const gid = (garageId as string) || (req.user as any)?.garageId;
    const [data, total] = await Promise.all([
      storage.getVehiclesPaginated(gid, pagination.limit, pagination.offset),
      storage.countVehicles(gid),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

export default router;
