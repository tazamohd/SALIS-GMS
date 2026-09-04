import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/marketing/accounts', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  res.json({ accounts: [] }); // Will be populated when marketing integrations are added
});

router.get('/marketing/campaigns', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  res.json({ campaigns: [] });
});

router.get('/marketing/tasks', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  res.json({ tasks: [] });
});

router.get('/marketing/social', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
  res.json({ conversations: [], messages: [], commentThreads: [], comments: [] });
});

export default router;
