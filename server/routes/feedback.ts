import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// Get feedback for a job card
router.get("/feedback/job-card/:jobCardId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const feedback = await storage.getServiceFeedbackByJobCard(req.params.jobCardId);
    res.json(feedback);
  } catch (error: any) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// Get feedback for a technician
router.get("/feedback/technician/:technicianId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const feedback = await storage.getServiceFeedbackByTechnician(req.params.technicianId);
    const summary = await storage.getTechnicianFeedbackSummary(req.params.technicianId);
    res.json({ feedback, summary });
  } catch (error: any) {
    console.error("Error fetching technician feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// Get all feedback with filters
router.get("/feedback", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { sentiment, minRating, maxRating, isFlagged, startDate, endDate, limit, offset } = req.query;
    const filters: any = {};
    if (sentiment) filters.sentiment = sentiment;
    if (minRating) filters.minRating = parseInt(minRating as string);
    if (maxRating) filters.maxRating = parseInt(maxRating as string);
    if (isFlagged !== undefined) filters.isFlagged = isFlagged === 'true';
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    const feedback = await storage.getAllServiceFeedback(filters);
    res.json(feedback);
  } catch (error: any) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// Get feedback analytics
router.get("/feedback/analytics", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const analytics = await storage.getFeedbackAnalytics();
    res.json(analytics);
  } catch (error: any) {
    console.error("Error fetching feedback analytics:", error);
    res.status(500).json({ message: "Failed to fetch feedback analytics" });
  }
});

// Get feedback by ID
router.get("/feedback/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const feedback = await storage.getServiceFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error: any) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// Respond to feedback
router.post("/feedback/:id/respond", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ message: "Response is required" });
    }
    const updated = await storage.respondToFeedback(req.params.id, response);
    res.json(updated);
  } catch (error: any) {
    console.error("Error responding to feedback:", error);
    res.status(500).json({ message: "Failed to respond to feedback" });
  }
});

// Flag feedback
router.post("/feedback/:id/flag", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }
    const updated = await storage.flagFeedback(req.params.id, reason);
    res.json(updated);
  } catch (error: any) {
    console.error("Error flagging feedback:", error);
    res.status(500).json({ message: "Failed to flag feedback" });
  }
});

// Unflag feedback
router.post("/feedback/:id/unflag", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const updated = await storage.unflagFeedback(req.params.id);
    res.json(updated);
  } catch (error: any) {
    console.error("Error unflagging feedback:", error);
    res.status(500).json({ message: "Failed to unflag feedback" });
  }
});

// Analyze sentiment using OpenAI
router.post("/feedback/:id/analyze-sentiment", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const feedback = await storage.getServiceFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const comments = (feedback as any).feedback?.comments;
    if (!comments) {
      return res.status(400).json({ message: "No comments to analyze" });
    }

    // Use OpenAI for sentiment analysis
    const openai = new (await import('openai')).default();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis assistant. Analyze the customer feedback and return a JSON response with: sentiment (positive/negative/neutral), score (-1.0 to 1.0), and keywords (array of 3-5 relevant keywords or phrases)."
        },
        {
          role: "user",
          content: `Analyze this customer feedback: "${comments}"`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const sentiment = result.sentiment || 'neutral';
    const sentimentScore = result.score || 0;
    const keywords = result.keywords || [];

    const updated = await storage.updateFeedbackSentiment(
      req.params.id,
      sentiment,
      sentimentScore,
      keywords
    );

    res.json({ ...updated, analysis: result });
  } catch (error: any) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ message: "Failed to analyze sentiment" });
  }
});

// Bulk analyze sentiment for all unanalyzed feedback
router.post("/feedback/analyze-all", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const allFeedback = await storage.getAllServiceFeedback({ limit: 100 });
    const unanalyzed = allFeedback.filter((f: any) => !f.feedback?.sentiment && f.feedback?.comments);

    const results: any[] = [];
    const openai = new (await import('openai')).default();

    for (const item of unanalyzed.slice(0, 20)) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Analyze this customer feedback. Return JSON with: sentiment (positive/negative/neutral), score (-1.0 to 1.0), keywords (array of 3-5 key phrases)."
            },
            {
              role: "user",
              content: `Feedback: "${(item as any).feedback?.comments}"`
            }
          ],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        await storage.updateFeedbackSentiment(
          (item as any).feedback?.id,
          result.sentiment || 'neutral',
          result.score || 0,
          result.keywords || []
        );
        results.push({ id: (item as any).feedback?.id, success: true, sentiment: result.sentiment });
      } catch (e) {
        results.push({ id: (item as any).feedback?.id, success: false, error: (e as Error).message });
      }
    }

    res.json({ analyzed: results.length, results });
  } catch (error: any) {
    console.error("Error analyzing all feedback:", error);
    res.status(500).json({ message: "Failed to analyze feedback" });
  }
});

export const feedbackRoutes = router;
