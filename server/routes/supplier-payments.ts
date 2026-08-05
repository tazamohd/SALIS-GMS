import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/supplier-payments', isAuthenticated, async (req: any, res) => {
  try {
    const { status } = req.query;
    const payments = await storage.getSupplierPayments(req.user.garageId, status as string);
    res.json(payments);
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
