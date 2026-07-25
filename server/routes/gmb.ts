import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/gmb/profiles', isAuthenticated, async (req: any, res) => {
  try {
    const profiles = await storage.getGoogleBusinessProfiles(req.user?.garageId);
    res.json({ data: profiles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gmb/posts', isAuthenticated, async (req, res) => {
  try {
    const posts = await storage.getGmbPosts(req.query.profileId as string, req.query.status as string);
    res.json({ data: posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/gmb/reviews', isAuthenticated, async (req, res) => {
  try {
    const reviews = await storage.getGmbReviews(req.query.profileId as string);
    res.json({ data: reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
