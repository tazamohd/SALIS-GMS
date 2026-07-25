import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/quotation-requests', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, status } = req.query;
    const requests = await storage.getQuotationRequests(garage_id as string, status as string);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching quotation requests:', error);
    res.status(500).json({ message: 'Failed to fetch quotation requests' });
  }
});

router.get('/quotation-requests/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await storage.getQuotationRequest(id);
    if (!request) {
      return res.status(404).json({ message: 'Quotation request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching quotation request:', error);
    res.status(500).json({ message: 'Failed to fetch quotation request' });
  }
});

router.get('/quotation-requests/:id/quotations', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const quotations = await storage.getSupplierQuotations(id);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Failed to fetch quotations' });
  }
});

router.get('/supplier-quotations/:id/items', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await storage.getQuotationItems(id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching quotation items:', error);
    res.status(500).json({ message: 'Failed to fetch quotation items' });
  }
});

export default router;
