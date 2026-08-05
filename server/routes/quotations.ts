import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// All reads scoped to the caller's garage (B11). supplier_quotations and
// quotation_items have no garage_id; they're scoped through the parent
// quotation request.

router.get('/quotation-requests', isAuthenticated, async (req: any, res) => {
  try {
    const { status } = req.query;
    const requests = await storage.getQuotationRequests(req.user.garageId, status as string);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching quotation requests:', error);
    res.status(500).json({ message: 'Failed to fetch quotation requests' });
  }
});

router.get('/quotation-requests/:id', isAuthenticated, async (req: any, res) => {
  try {
    const request = await storage.getQuotationRequest(req.params.id, req.user.garageId);
    if (!request) {
      return res.status(404).json({ message: 'Quotation request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching quotation request:', error);
    res.status(500).json({ message: 'Failed to fetch quotation request' });
  }
});

router.get('/quotation-requests/:id/quotations', isAuthenticated, async (req: any, res) => {
  try {
    const request = await storage.getQuotationRequest(req.params.id, req.user.garageId);
    if (!request) {
      return res.status(404).json({ message: 'Quotation request not found' });
    }
    const quotations = await storage.getSupplierQuotations(req.params.id);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Failed to fetch quotations' });
  }
});

router.get('/supplier-quotations/:id/items', isAuthenticated, async (req: any, res) => {
  try {
    // 2-hop scope: quotation → request → garage.
    const quotation = await storage.getSupplierQuotation(req.params.id, req.user.garageId);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    const items = await storage.getQuotationItems(req.params.id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching quotation items:', error);
    res.status(500).json({ message: 'Failed to fetch quotation items' });
  }
});

export default router;
