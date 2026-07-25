import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/training/modules', isAuthenticated, async (req, res) => {
  try {
    const modules = await storage.getTrainingModules(req.query.isActive === 'true');
    res.json({ data: modules });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/training/certifications', isAuthenticated, async (req, res) => {
  try {
    const certifications = await storage.getCertifications(req.query.isActive === 'true');
    res.json({ data: certifications });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/training/attempts', isAuthenticated, async (req, res) => {
  try {
    const attempts = await storage.getCertificationAttempts(
      req.query.userId as string,
      req.query.certificationId as string,
    );
    res.json({ data: attempts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
