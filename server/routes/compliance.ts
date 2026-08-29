import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import * as phase6Service from "../phase6-compliance-service";
import {
  insertCompliancePolicySchema,
  insertComplianceAuditSchema,
  insertComplianceTaskSchema,
} from "@shared/schema";

const router = Router();

// These storage methods exist on DatabaseStorage but not on the typed IStorage
// interface (the implementation file carries @ts-nocheck).  Cast once.
const complianceStorage = storage as any;

// ── Validation schemas ───────────────────────────────────────────────────────

const complianceRecordSchema = z.object({
  complianceType: z.enum([
    "waste-disposal",
    "emissions",
    "safety-inspection",
    "environmental-permit",
  ]),
  recordDate: z.string(),
  wasteType: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  disposalMethod: z.string().optional(),
  disposalCompany: z.string().optional(),
  certificationNumber: z.string().optional(),
  cost: z.string().optional(),
  regulatoryStandard: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

// ── Environmental Compliance ─────────────────────────────────────────────────

router.post(
  "/compliance/environmental",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const garageId = (req as any).user?.garageId;

      const validated = complianceRecordSchema.parse(req.body);

      const recordData = {
        garageId,
        complianceType: validated.complianceType,
        recordDate: new Date(validated.recordDate),
        wasteType: validated.wasteType,
        quantity: validated.quantity ? Number(validated.quantity) : undefined,
        unit: validated.unit,
        disposalMethod: validated.disposalMethod,
        disposalCompany: validated.disposalCompany,
        certificationNumber: validated.certificationNumber,
        cost: validated.cost ? Number(validated.cost) : undefined,
        regulatoryStandard: validated.regulatoryStandard,
        attachments: validated.attachments,
        notes: validated.notes,
      };
      const record = await phase6Service.createComplianceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      console.error("Error creating compliance record:", error);
      res.status(500).json({ message: "Failed to create compliance record" });
    }
  },
);

router.get(
  "/compliance/environmental",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const garageId = (req as any).user?.garageId;
      const { complianceType } = req.query;
      const records = await phase6Service.getComplianceRecords(
        garageId,
        complianceType as string,
      );
      res.json(records);
    } catch (error) {
      console.error("Error fetching compliance records:", error);
      res.status(500).json({ message: "Failed to fetch compliance records" });
    }
  },
);

router.get(
  "/compliance/environmental/analytics",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const garageId = (req as any).user?.garageId;
      const { startDate, endDate } = req.query;
      const analytics = await phase6Service.getComplianceAnalytics(
        garageId,
        startDate ? new Date(startDate as string) : new Date(0),
        endDate ? new Date(endDate as string) : new Date(),
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching compliance analytics:", error);
      res.status(500).json({ message: "Failed to fetch compliance analytics" });
    }
  },
);

// ── Compliance Policies ──────────────────────────────────────────────────────

router.get(
  "/compliance/policies",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const policies = await complianceStorage.getCompliancePolicies(
        (req as any).user?.garageId,
        req.query.status as string | undefined,
      );
      res.json({ data: policies });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/compliance/policies",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const validatedData = insertCompliancePolicySchema.parse(req.body);
      const policy = await complianceStorage.createCompliancePolicy(validatedData);
      res.json({ data: policy });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  },
);

// ── Compliance Audits ────────────────────────────────────────────────────────

router.get(
  "/compliance/audits",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const audits = await complianceStorage.getComplianceAudits(
        (req as any).user?.garageId,
        req.query.policyId as string | undefined,
        req.query.status as string | undefined,
      );
      res.json({ data: audits });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/compliance/audits",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const validatedData = insertComplianceAuditSchema.parse(req.body);
      const audit = await complianceStorage.createComplianceAudit(validatedData);
      res.json({ data: audit });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  },
);

// ── Compliance Tasks ─────────────────────────────────────────────────────────

router.get(
  "/compliance/tasks",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const tasks = await complianceStorage.getComplianceTasks(
        (req as any).user?.garageId,
        req.query.policyId as string | undefined,
        req.query.status as string | undefined,
      );
      res.json({ data: tasks });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/compliance/tasks",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const validatedData = insertComplianceTaskSchema.parse(req.body);
      const task = await complianceStorage.createComplianceTask(validatedData);
      res.json({ data: task });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(sanitizeZodError(error));
      }
      res.status(500).json({ error: error.message });
    }
  },
);

router.patch(
  "/compliance/tasks/:id/complete",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req: Request, res: Response) => {
    try {
      const task = await complianceStorage.completeComplianceTask(req.params.id);
      res.json({ data: task });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export const complianceRoutes = router;
