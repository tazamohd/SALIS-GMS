import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// All reads are scoped to the caller's garage (B11). Lists ignore any
// client-supplied garage_id; by-id and child routes 404 across tenants.

router.get('/purchase-orders', isAuthenticated, async (req: any, res) => {
  try {
    const { status } = req.query;
    const orders = await storage.getPurchaseOrders(req.user.garageId, status as string);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: 'Failed to fetch purchase orders' });
  }
});

router.get('/purchase-orders/:id', isAuthenticated, async (req: any, res) => {
  try {
    const order = await storage.getPurchaseOrder(req.params.id, req.user.garageId);
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ message: 'Failed to fetch purchase order' });
  }
});

router.get('/purchase-orders/:id/items', isAuthenticated, async (req: any, res) => {
  try {
    // Verify the parent order belongs to this garage before exposing items.
    const order = await storage.getPurchaseOrder(req.params.id, req.user.garageId);
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    const items = await storage.getPurchaseOrderItems(req.params.id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching purchase order items:', error);
    res.status(500).json({ message: 'Failed to fetch purchase order items' });
  }
});

router.get('/purchase-tasks', isAuthenticated, async (req: any, res) => {
  try {
    const { status, priority } = req.query;
    const tasks = await storage.getPurchaseTasks(
      req.user.garageId,
      status as string,
      priority as string,
    );
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching purchase tasks:', error);
    res.status(500).json({ message: 'Failed to fetch purchase tasks' });
  }
});

router.get('/purchase-tasks/:id', isAuthenticated, async (req: any, res) => {
  try {
    const task = await storage.getPurchaseTask(req.params.id, req.user.garageId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching purchase task:', error);
    res.status(500).json({ message: 'Failed to fetch purchase task' });
  }
});

router.get('/purchase-tasks/:id/parts', isAuthenticated, async (req: any, res) => {
  try {
    const task = await storage.getPurchaseTask(req.params.id, req.user.garageId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const parts = await storage.getPurchaseTaskParts(req.params.id);
    res.json(parts);
  } catch (error) {
    console.error('Error fetching task parts:', error);
    res.status(500).json({ message: 'Failed to fetch task parts' });
  }
});

export default router;
