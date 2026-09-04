// @ts-nocheck
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import {
  insertArticleCategorySchema,
  insertKnowledgeArticleSchema,
  insertTrainingModuleSchema,
  insertCertificationSchema,
  insertCertificationAttemptSchema,
} from '@shared/schema';

const router = Router();

// Helper — mirrors sanitizeZodError from the monolith
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// ==================== KNOWLEDGE BASE ROUTES ====================

router.get('/knowledge-base/categories', isAuthenticated, async (req, res) => {
  try {
    const categories = await storage.getArticleCategories();
    res.json({ data: categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/knowledge-base/categories', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertArticleCategorySchema.parse(req.body);
    const category = await storage.createArticleCategory(validatedData);
    res.json({ data: category });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/knowledge-base/articles', isAuthenticated, async (req, res) => {
  try {
    const articles = await storage.getKnowledgeArticles(req.query.categoryId as string, req.query.isPublished === 'true');
    res.json({ data: articles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/knowledge-base/articles/:id', isAuthenticated, async (req, res) => {
  try {
    const article = await storage.getKnowledgeArticle(req.params.id);
    if (article) {
      await storage.incrementArticleViews(req.params.id);
    }
    res.json({ data: article });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/knowledge-base/articles', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertKnowledgeArticleSchema.parse(req.body);
    const article = await storage.createKnowledgeArticle(validatedData);
    res.json({ data: article });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

router.patch('/knowledge-base/articles/:id', isAuthenticated, async (req, res) => {
  try {
    const article = await storage.updateKnowledgeArticle(req.params.id, req.body);
    res.json({ data: article });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TRAINING LMS ROUTES ====================

router.get('/training/modules', isAuthenticated, async (req, res) => {
  try {
    const modules = await storage.getTrainingModules(req.query.isActive === 'true');
    res.json({ data: modules });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/training/modules', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertTrainingModuleSchema.parse(req.body);
    const module = await storage.createTrainingModule(validatedData);
    res.json({ data: module });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
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

router.post('/training/certifications', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertCertificationSchema.parse(req.body);
    const certification = await storage.createCertification(validatedData);
    res.json({ data: certification });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

router.get('/training/attempts', isAuthenticated, async (req, res) => {
  try {
    const attempts = await storage.getCertificationAttempts(req.query.userId as string, req.query.certificationId as string);
    res.json({ data: attempts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/training/attempts', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertCertificationAttemptSchema.parse(req.body);
    const attempt = await storage.createCertificationAttempt(validatedData);
    res.json({ data: attempt });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

// ==================== GAMIFICATION ROUTES ====================

router.get('/gamification/leaderboard', isAuthenticated, async (req: any, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    const leaderboard = await storage.getLeaderboard(
      period as string,
      parseInt(limit as string)
    );
    res.json(leaderboard);
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

router.get('/gamification/profile/:technicianId', isAuthenticated, async (req: any, res) => {
  try {
    const [points, badges, recentEvents] = await Promise.all([
      storage.getTechnicianPoints(req.params.technicianId),
      storage.getTechnicianBadges(req.params.technicianId),
      storage.getTechnicianRecentEvents(req.params.technicianId, 10),
    ]);

    res.json({ points, badges, recentEvents });
  } catch (error: any) {
    console.error("Error fetching gamification profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.get('/gamification/badges', isAuthenticated, async (req: any, res) => {
  try {
    const badges = await storage.getGamificationBadges();
    res.json(badges);
  } catch (error: any) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ message: "Failed to fetch badges" });
  }
});

export default router;
