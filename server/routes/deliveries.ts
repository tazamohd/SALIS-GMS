import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// All reads scoped to the caller's garage (B11). Child collections (items,
// timeline, live status) are gated by verifying the parent delivery first.

router.get('/deliveries', isAuthenticated, async (req: any, res) => {
  try {
    const { status } = req.query;
    const deliveriesList = await storage.getDeliveries(req.user.garageId, status as string);
    res.json(deliveriesList);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ message: 'Failed to fetch deliveries' });
  }
});

router.get('/deliveries/:id', isAuthenticated, async (req: any, res) => {
  try {
    const delivery = await storage.getDelivery(req.params.id, req.user.garageId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({ message: 'Failed to fetch delivery' });
  }
});

router.get('/deliveries/:id/items', isAuthenticated, async (req: any, res) => {
  try {
    const delivery = await storage.getDelivery(req.params.id, req.user.garageId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    const items = await storage.getDeliveryItems(req.params.id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching delivery items:', error);
    res.status(500).json({ message: 'Failed to fetch delivery items' });
  }
});

router.get('/deliveries/:id/timeline', isAuthenticated, async (req: any, res) => {
  try {
    const delivery = await storage.getDelivery(req.params.id, req.user.garageId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    const timeline = await storage.getDeliveryTimeline(req.params.id);
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching delivery timeline:', error);
    res.status(500).json({ message: 'Failed to fetch delivery timeline' });
  }
});

router.get('/deliveries/:id/live', isAuthenticated, async (req: any, res) => {
  try {
    const delivery = await storage.getDelivery(req.params.id, req.user.garageId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    const liveStatus = await storage.getLiveDeliveryStatus(req.params.id);
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
