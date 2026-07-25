import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/job-cards/:jobCardId/chat', isAuthenticated, async (req, res) => {
  try {
    const { jobCardId } = req.params;
    const messages = await storage.getServiceChatMessages(jobCardId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages' });
  }
});

export default router;
