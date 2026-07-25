import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { parsePagination, sendPaginated } from './pagination';

const router = Router();

router.get('/spare-parts', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.query;
    const pagination = parsePagination(req);
    const gid = (garageId as string) || (req.user as any)?.garageId;
    const [data, total] = await Promise.all([
      storage.getSparePartsPaginated(gid, pagination.limit, pagination.offset),
      storage.countSpareParts(gid),
    ]);
    sendPaginated(res, data, total, pagination, pagination.explicit);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    res.status(500).json({ message: 'Failed to fetch spare parts' });
  }
});

router.get('/spare-parts/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const part = await storage.getSparePart(id);
    if (!part) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.json(part);
  } catch (error) {
    console.error('Error fetching spare part:', error);
    res.status(500).json({ message: 'Failed to fetch spare part' });
  }
});

router.get('/spare-part-inventories', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, spare_part_id } = req.query;
    if (!garage_id) {
      return res.status(400).json({ message: 'garage_id is required' });
    }
    const inventories = await storage.getSparePartInventories(
      garage_id as string,
      spare_part_id as string,
    );
    res.json(inventories);
  } catch (error) {
    console.error('Error fetching spare part inventories:', error);
    res.status(500).json({ message: 'Failed to fetch spare part inventories' });
  }
});

export default router;
