import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/vehicles', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.query;
    const pagination = parsePagination(req);
    // Session garage wins; the query param is only a fallback for
    // garageless (platform admin) sessions — the reverse order was a
    // cross-tenant read.
    const gid = (req.user as any)?.garageId || (garageId as string);
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
