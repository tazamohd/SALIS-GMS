// @ts-nocheck
import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { z } from "zod";
import {
  insertGoogleBusinessProfileSchema,
  insertGmbPostSchema,
  insertGmbReviewSchema,
} from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// ==================== GOOGLE MY BUSINESS ROUTES ====================

// List GMB profiles
router.get('/gmb/profiles', isAuthenticated, async (req: any, res) => {
  try {
    const profiles = await storage.getGoogleBusinessProfiles(req.user?.garageId);
    res.json({ data: profiles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create GMB profile
router.post('/gmb/profiles', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertGoogleBusinessProfileSchema.parse(req.body);
    const profile = await storage.createGoogleBusinessProfile(validatedData);
    res.json({ data: profile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

// List GMB posts
router.get('/gmb/posts', isAuthenticated, async (req, res) => {
  try {
    const posts = await storage.getGmbPosts(req.query.profileId as string, req.query.status as string);
    res.json({ data: posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create GMB post
router.post('/gmb/posts', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertGmbPostSchema.parse(req.body);
    const post = await storage.createGmbPost(validatedData);
    res.json({ data: post });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

// Publish GMB post
router.patch('/gmb/posts/:id/publish', isAuthenticated, async (req, res) => {
  try {
    const post = await storage.publishGmbPost(req.params.id);
    res.json({ data: post });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List GMB reviews
router.get('/gmb/reviews', isAuthenticated, async (req, res) => {
  try {
    const reviews = await storage.getGmbReviews(req.query.profileId as string);
    res.json({ data: reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create GMB review
router.post('/gmb/reviews', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertGmbReviewSchema.parse(req.body);
    const review = await storage.createGmbReview(validatedData);
    res.json({ data: review });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

// Respond to GMB review
router.patch('/gmb/reviews/:id/respond', isAuthenticated, async (req, res) => {
  try {
    const review = await storage.respondToGmbReview(req.params.id, req.body.responseText);
    res.json({ data: review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
