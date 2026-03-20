import { Router } from 'express';

const router = Router();

router.get('/marketing/accounts', (req, res) => {
  res.json({ accounts: [] }); // Will be populated when marketing integrations are added
});

router.get('/marketing/campaigns', (req, res) => {
  res.json({ campaigns: [] });
});

router.get('/marketing/tasks', (req, res) => {
  res.json({ tasks: [] });
});

router.get('/marketing/social', (req, res) => {
  res.json({ conversations: [], messages: [], commentThreads: [], comments: [] });
});

export default router;
