/**
 * Training / LMS routes.
 *
 * Wires the training_modules / certifications / certification_attempts tables
 * (which existed in the schema but had no implemented storage methods or routes)
 * directly via Drizzle, to the paths the TrainingLMS page expects:
 *
 *   GET/POST/PATCH/DELETE  /api/training/modules        (+ :id)
 *   GET/POST/PATCH/DELETE  /api/training/certifications (+ :id)
 *   GET/POST/PATCH         /api/training/attempts       (+ :id)
 *
 * Turns the LMS module from "schema only" into a working API.
 */
import { Router } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { db } from "../db";
import {
  trainingModules,
  certifications,
  certificationAttempts,
  insertTrainingModuleSchema,
  insertCertificationSchema,
  insertCertificationAttemptSchema,
} from "@shared/schema";
import { logger } from "../logger";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
  };
}

// ── Training modules ────────────────────────────────────────────────────────
router.get("/training/modules", isAuthenticated, async (req, res) => {
  try {
    const rows = req.query.isActive !== undefined
      ? await db.select().from(trainingModules).where(eq(trainingModules.isActive, req.query.isActive === "true"))
      : await db.select().from(trainingModules);
    res.json({ data: rows });
  } catch (error: any) {
    logger.error("training modules list failed", { error: String(error) });
    res.status(500).json({ message: "Failed to fetch training modules" });
  }
});

router.get("/training/modules/:id", isAuthenticated, async (req, res) => {
  try {
    const [row] = await db.select().from(trainingModules).where(eq(trainingModules.id, req.params.id)).limit(1);
    if (!row) return res.status(404).json({ message: "Training module not found" });
    res.json({ data: row });
  } catch {
    res.status(500).json({ message: "Failed to fetch training module" });
  }
});

router.post("/training/modules", isAuthenticated, async (req, res) => {
  try {
    const parsed = insertTrainingModuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const [row] = await db.insert(trainingModules).values(parsed.data as any).returning();
    res.status(201).json({ data: row });
  } catch (error: any) {
    logger.error("training module create failed", { error: String(error) });
    res.status(500).json({ message: "Failed to create training module" });
  }
});

router.patch("/training/modules/:id", isAuthenticated, async (req, res) => {
  try {
    const [row] = await db.update(trainingModules).set(req.body).where(eq(trainingModules.id, req.params.id)).returning();
    res.json({ data: row });
  } catch {
    res.status(500).json({ message: "Failed to update training module" });
  }
});

router.delete("/training/modules/:id", isAuthenticated, async (req, res) => {
  try {
    await db.delete(trainingModules).where(eq(trainingModules.id, req.params.id));
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete training module" });
  }
});

// ── Certifications ──────────────────────────────────────────────────────────
router.get("/training/certifications", isAuthenticated, async (req, res) => {
  try {
    const rows = req.query.isActive !== undefined
      ? await db.select().from(certifications).where(eq(certifications.isActive, req.query.isActive === "true"))
      : await db.select().from(certifications);
    res.json({ data: rows });
  } catch (error: any) {
    logger.error("certifications list failed", { error: String(error) });
    res.status(500).json({ message: "Failed to fetch certifications" });
  }
});

router.get("/training/certifications/:id", isAuthenticated, async (req, res) => {
  try {
    const [row] = await db.select().from(certifications).where(eq(certifications.id, req.params.id)).limit(1);
    if (!row) return res.status(404).json({ message: "Certification not found" });
    res.json({ data: row });
  } catch {
    res.status(500).json({ message: "Failed to fetch certification" });
  }
});

router.post("/training/certifications", isAuthenticated, async (req, res) => {
  try {
    const parsed = insertCertificationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const [row] = await db.insert(certifications).values(parsed.data as any).returning();
    res.status(201).json({ data: row });
  } catch (error: any) {
    logger.error("certification create failed", { error: String(error) });
    res.status(500).json({ message: "Failed to create certification" });
  }
});

router.patch("/training/certifications/:id", isAuthenticated, async (req, res) => {
  try {
    const [row] = await db.update(certifications).set(req.body).where(eq(certifications.id, req.params.id)).returning();
    res.json({ data: row });
  } catch {
    res.status(500).json({ message: "Failed to update certification" });
  }
});

router.delete("/training/certifications/:id", isAuthenticated, async (req, res) => {
  try {
    await db.delete(certifications).where(eq(certifications.id, req.params.id));
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete certification" });
  }
});

// ── Certification attempts (quiz results / progress) ────────────────────────
router.get("/training/attempts", isAuthenticated, async (req: any, res) => {
  try {
    // A user sees their own attempts unless a userId is passed (managers).
    const userId = (req.query.userId as string) || req.user?.id;
    const certificationId = req.query.certificationId as string | undefined;
    const conds = [];
    if (userId) conds.push(eq(certificationAttempts.userId, userId));
    if (certificationId) conds.push(eq(certificationAttempts.certificationId, certificationId));
    const rows = conds.length
      ? await db.select().from(certificationAttempts).where(conds.length === 1 ? conds[0] : and(...conds))
      : await db.select().from(certificationAttempts);
    res.json({ data: rows });
  } catch (error: any) {
    logger.error("certification attempts list failed", { error: String(error) });
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
});

router.post("/training/attempts", isAuthenticated, async (req: any, res) => {
  try {
    const body = { userId: req.user?.id, ...req.body };
    const parsed = insertCertificationAttemptSchema.safeParse(body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const [row] = await db.insert(certificationAttempts).values(parsed.data as any).returning();
    res.status(201).json({ data: row });
  } catch (error: any) {
    logger.error("certification attempt create failed", { error: String(error) });
    res.status(500).json({ message: "Failed to record attempt" });
  }
});

router.patch("/training/attempts/:id", isAuthenticated, async (req, res) => {
  try {
    const [row] = await db.update(certificationAttempts).set(req.body).where(eq(certificationAttempts.id, req.params.id)).returning();
    res.json({ data: row });
  } catch {
    res.status(500).json({ message: "Failed to update attempt" });
  }
});

export default router;
