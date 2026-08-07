import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/supplier-payments', isAuthenticated, async (req: any, res) => {
  try {
    const { status } = req.query;
    const pg = parsePagination(req);
    const opts = pg.explicit ? { limit: pg.limit, offset: pg.offset } : undefined;
    const [data, total] = await Promise.all([
      storage.getSupplierPayments(req.user.garageId, status as string, opts),
      pg.explicit ? storage.countSupplierPayments(req.user.garageId, status as string) : Promise.resolve(0),
    ]);
    sendPaginated(res, data, total, pg, pg.explicit);
  } catch (error) {
    console.error('Error fetching supplier payments:', error);
    res.status(500).json({ message: 'Failed to fetch supplier payments' });
  }
});

router.get('/supplier-payments/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const payment = await storage.getSupplierPayment(id, req.user.garageId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Error fetching supplier payment:', error);
    res.status(500).json({ message: 'Failed to fetch supplier payment' });
  }
});

export default router;
