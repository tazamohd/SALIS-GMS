import { isAuthenticated } from '../auth';
import { Router } from 'express';

const router = Router();

router.get('/marketing/accounts', isAuthenticated, (req, res) => {
  res.json({ accounts: [] }); // Will be populated when marketing integrations are added
});

router.get('/marketing/campaigns', isAuthenticated, (req, res) => {
  res.json({ campaigns: [] });
});

router.get('/marketing/tasks', isAuthenticated, (req, res) => {
  res.json({ tasks: [] });
});

router.get('/marketing/social', isAuthenticated, (req, res) => {
  res.json({ conversations: [], messages: [], commentThreads: [], comments: [] });
});

export default router;
