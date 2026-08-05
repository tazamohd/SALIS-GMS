import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// Registered before the :garageId matcher, which would otherwise capture
// /calendar-events/detail/<id> and 400 on missing dates.
router.get('/calendar-events/detail/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await storage.getCalendarEvent(id);
    if (!event) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({ message: 'Failed to fetch calendar event' });
  }
});

router.get('/calendar-events/:garageId', isAuthenticated, async (req, res) => {
  try {
    const { garageId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const events = await storage.getCalendarEvents(
      garageId,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
});


export default router;
