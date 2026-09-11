import { Router, Request, Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { assignmentRequests, assignmentDecisions } from "../schema";
import { rankCandidates, type Candidate, type Task } from "../engine/matcher";
import { publish } from "../lib/eventPublisher";
import type { RequestWithCorrelation } from "../middleware/correlation";

const router = Router();

const candidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(z.string()).default([]),
  currentLoad: z.number().min(0),
  maxLoad: z.number().min(1),
  available: z.boolean(),
  efficiency: z.number().min(0).max(1),
});

const assignmentRequestSchema = z.object({
  entityType: z.string(), // job_card | fleet_trip | roadside_call | ride
  entityId: z.string(),
  taskType: z.string(),
  requiredSkills: z.array(z.string()).default([]),
  estimatedHours: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  candidates: z.array(candidateSchema).min(1),
});

// POST /v1/assignments — synchronous scoring (sub-100ms, pure CPU). See
// ADR-001: caller resolves candidates, Dispatch only scores + persists.
router.post("/v1/assignments", async (req: Request, res: Response) => {
  const parsed = assignmentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
    return;
  }

  const { entityType, entityId, taskType, requiredSkills, estimatedHours, priority, candidates } =
    parsed.data;
  const correlationId = (req as RequestWithCorrelation).correlationId;

  try {
    const [request] = await db
      .insert(assignmentRequests)
      .values({
        entityType,
        entityId,
        taskType,
        requiredSkills,
        estimatedHours,
        priority,
        candidateCount: candidates.length,
        correlationId,
      })
      .returning();

    const task: Task = {
      id: request.id,
      type: taskType,
      requiredSkills,
      estimatedHours: estimatedHours ?? 0,
      priority,
    };

    const decision = rankCandidates(candidates as Candidate[], task);

    const [saved] = await db
      .insert(assignmentDecisions)
      .values({
        requestId: request.id,
        bestCandidateId: decision.best?.candidateId ?? null,
        bestCandidateName: decision.best?.candidateName ?? null,
        bestScore: decision.best?.score ?? null,
        ranked: decision.ranked,
        status: decision.best ? "decided" : "no_match",
      })
      .returning();

    await publish({
      type: decision.best ? "dispatch.assignment.decided" : "dispatch.assignment.failed",
      requestId: request.id,
      payload: { entityType, entityId, decision },
    });

    res.status(201).json({
      requestId: request.id,
      decisionId: saved.id,
      status: saved.status,
      best: decision.best,
      ranked: decision.ranked,
    });
  } catch (error) {
    console.error("[dispatch] assignment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/v1/assignments/:requestId", async (req: Request, res: Response) => {
  try {
    const [decision] = await db
      .select()
      .from(assignmentDecisions)
      .where(eq(assignmentDecisions.requestId, req.params.requestId));
    if (!decision) {
      res.status(404).json({ message: "Assignment decision not found" });
      return;
    }
    res.json(decision);
  } catch (error) {
    console.error("[dispatch] fetch decision error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const assignmentsRouter = router;
