import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/deliveries', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, status } = req.query;
    const deliveriesList = await storage.getDeliveries(garage_id as string, status as string);
    res.json(deliveriesList);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ message: 'Failed to fetch deliveries' });
  }
});

router.get('/deliveries/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await storage.getDelivery(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({ message: 'Failed to fetch delivery' });
  }
});

router.get('/deliveries/:id/items', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await storage.getDeliveryItems(id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching delivery items:', error);
    res.status(500).json({ message: 'Failed to fetch delivery items' });
  }
});

router.get('/deliveries/:id/timeline', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const timeline = await storage.getDeliveryTimeline(id);
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching delivery timeline:', error);
    res.status(500).json({ message: 'Failed to fetch delivery timeline' });
  }
});

router.get('/deliveries/:id/live', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const liveStatus = await storage.getLiveDeliveryStatus(id);
    if (!liveStatus) {
      return res.status(404).json({ message: 'Live status not found' });
    }
    res.json(liveStatus);
  } catch (error) {
    console.error('Error fetching live delivery status:', error);
    res.status(500).json({ message: 'Failed to fetch live delivery status' });
  }
});

export default router;
