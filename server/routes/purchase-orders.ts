import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/purchase-orders', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, status } = req.query;
    const orders = await storage.getPurchaseOrders(garage_id as string, status as string);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: 'Failed to fetch purchase orders' });
  }
});

router.get('/purchase-orders/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await storage.getPurchaseOrder(id);
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ message: 'Failed to fetch purchase order' });
  }
});

router.get('/purchase-orders/:id/items', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await storage.getPurchaseOrderItems(id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching purchase order items:', error);
    res.status(500).json({ message: 'Failed to fetch purchase order items' });
  }
});

router.get('/purchase-tasks', isAuthenticated, async (req, res) => {
  try {
    const { garage_id, status, priority } = req.query;
    const tasks = await storage.getPurchaseTasks(
      garage_id as string,
      status as string,
      priority as string,
    );
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching purchase tasks:', error);
    res.status(500).json({ message: 'Failed to fetch purchase tasks' });
  }
});

router.get('/purchase-tasks/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await storage.getPurchaseTask(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching purchase task:', error);
    res.status(500).json({ message: 'Failed to fetch purchase task' });
  }
});

router.get('/purchase-tasks/:id/parts', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const parts = await storage.getPurchaseTaskParts(id);
    res.json(parts);
  } catch (error) {
    console.error('Error fetching task parts:', error);
    res.status(500).json({ message: 'Failed to fetch task parts' });
  }
});

export default router;
