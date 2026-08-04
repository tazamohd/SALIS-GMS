import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/support/tickets', isAuthenticated, async (req: any, res) => {
  try {
    const { status, priority, assignedTo, category } = req.query;

    const tickets = await storage.getSupportTickets(req.user.garageId, {
      status: status as string,
      priority: priority as string,
      assignedTo: assignedTo as string,
      category: category as string,
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ message: 'Failed to fetch support tickets' });
  }
});

router.get('/support/tickets/:id', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const ticket = await storage.getSupportTicket(id, req.user.garageId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

router.get('/support/tickets/:id/events', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const ticket = await storage.getSupportTicket(id, req.user.garageId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const events = await storage.getSupportTicketEvents(id);
    res.json(events);
  } catch (error) {
    console.error('Error fetching ticket events:', error);
    res.status(500).json({ message: 'Failed to fetch ticket events' });
  }
});

export default router;
