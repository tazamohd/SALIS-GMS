import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/knowledge-base/categories', isAuthenticated, async (_req, res) => {
  try {
    const categories = await storage.getArticleCategories();
    res.json({ data: categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/knowledge-base/articles', isAuthenticated, async (req, res) => {
  try {
    const articles = await storage.getKnowledgeArticles(
      req.query.categoryId as string,
      req.query.isPublished === 'true',
    );
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

export default router;
