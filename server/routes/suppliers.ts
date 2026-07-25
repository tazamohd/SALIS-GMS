import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/suppliers', isAuthenticated, async (req, res) => {
  try {
    const { garage_id } = req.query;
    const pagination = parsePagination(req);
    const gid = (garage_id as string) || (req.user as any)?.garageId;
    const [data, total] = await Promise.all([
      storage.getSuppliersPaginated(gid, pagination.limit, pagination.offset),
      storage.countSuppliers(gid),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
});

router.get('/suppliers/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await storage.getSupplier(id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Failed to fetch supplier' });
  }
});

router.get('/supplier-price-lists', isAuthenticated, async (req, res) => {
  try {
    const { supplierId, sparePartId } = req.query;
    const priceLists = await storage.getSupplierPriceLists(
      supplierId as string | undefined,
      sparePartId as string | undefined,
    );
    res.json(priceLists);
  } catch (error) {
    console.error('Error fetching supplier price lists:', error);
    res.status(500).json({ message: 'Failed to fetch price lists' });
  }
});

router.get('/supplier-price-lists/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const priceList = await storage.getSupplierPriceList(id);
    if (!priceList) {
      return res.status(404).json({ message: 'Price list not found' });
    }
    res.json(priceList);
  } catch (error) {
    console.error('Error fetching price list:', error);
    res.status(500).json({ message: 'Failed to fetch price list' });
  }
});

router.get('/supplier-price-lists/compare/:sparePartId', isAuthenticated, async (req, res) => {
  try {
    const { sparePartId } = req.params;
    const comparison = await storage.comparePrices(sparePartId);
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({ message: 'Failed to compare prices' });
  }
});

export default router;
