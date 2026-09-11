import { Router, Request, Response } from "express";
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { db } from "../db";
import {
  fleetOpsAccounts,
  fleetOpsVehicles,
  fleetDrivers,
  fleetMaintenanceRecords,
  telematicsEvents,
  fleetTrips,
  fleetDocuments,
  fuelTransactions,
  insertFleetOpsAccountSchema,
  insertFleetOpsVehicleSchema,
  insertFleetDriverSchema,
  insertFleetMaintenanceRecordSchema,
  insertFuelTransactionSchema,
} from "@shared/schema/index";
import { requestAssignment, type DispatchCandidate } from "../clients/dispatchClient";

const router = Router();

// ── Fleet Accounts ──────────────────────────────────────────────

router.get("/fleet/accounts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetOpsAccounts)
      .where(eq(fleetOpsAccounts.status, "active"))
      .orderBy(desc(fleetOpsAccounts.createdAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet accounts list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fleet/accounts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertFleetOpsAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    const [account] = await db.insert(fleetOpsAccounts).values(parsed.data).returning();
    res.status(201).json(account);
  } catch (error) {
    console.error("Fleet account create error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/fleet/accounts/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const [account] = await db
      .select()
      .from(fleetOpsAccounts)
      .where(eq(fleetOpsAccounts.id, req.params.id));
    if (!account) { res.status(404).json({ message: "Fleet account not found" }); return; }
    res.json(account);
  } catch (error) {
    console.error("Fleet account get error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Vehicles ────────────────────────────────────────────────────

router.get("/fleet/accounts/:accountId/vehicles", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetOpsVehicles)
      .where(eq(fleetOpsVehicles.fleetAccountId, req.params.accountId))
      .orderBy(desc(fleetOpsVehicles.createdAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet vehicles list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fleet/accounts/:accountId/vehicles", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertFleetOpsVehicleSchema.safeParse({
      ...req.body,
      fleetAccountId: req.params.accountId,
    });
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    const [vehicle] = await db.insert(fleetOpsVehicles).values(parsed.data).returning();
    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Fleet vehicle create error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/fleet/vehicles/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const [vehicle] = await db
      .select()
      .from(fleetOpsVehicles)
      .where(eq(fleetOpsVehicles.id, req.params.id));
    if (!vehicle) { res.status(404).json({ message: "Vehicle not found" }); return; }
    res.json(vehicle);
  } catch (error) {
    console.error("Fleet vehicle get error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/fleet/vehicles/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(fleetOpsVehicles)
      .set({ ...req.body, updatedAt: sql`now()` })
      .where(eq(fleetOpsVehicles.id, req.params.id))
      .returning();
    if (!updated) { res.status(404).json({ message: "Vehicle not found" }); return; }
    res.json(updated);
  } catch (error) {
    console.error("Fleet vehicle update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Drivers ─────────────────────────────────────────────────────

router.get("/fleet/accounts/:accountId/drivers", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetDrivers)
      .where(eq(fleetDrivers.fleetAccountId, req.params.accountId))
      .orderBy(desc(fleetDrivers.createdAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet drivers list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fleet/accounts/:accountId/drivers", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertFleetDriverSchema.safeParse({
      ...req.body,
      fleetAccountId: req.params.accountId,
    });
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    const [driver] = await db.insert(fleetDrivers).values(parsed.data).returning();
    res.status(201).json(driver);
  } catch (error) {
    console.error("Fleet driver create error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Maintenance ─────────────────────────────────────────────────

router.get("/fleet/vehicles/:vehicleId/maintenance", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetMaintenanceRecords)
      .where(eq(fleetMaintenanceRecords.vehicleId, req.params.vehicleId))
      .orderBy(desc(fleetMaintenanceRecords.createdAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet maintenance list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fleet/vehicles/:vehicleId/maintenance", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertFleetMaintenanceRecordSchema.safeParse({
      ...req.body,
      vehicleId: req.params.vehicleId,
    });
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    const [record] = await db
      .insert(fleetMaintenanceRecords)
      .values(parsed.data)
      .returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Fleet maintenance create error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Telematics ──────────────────────────────────────────────────

router.get("/fleet/vehicles/:vehicleId/telematics", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const rows = await db
      .select()
      .from(telematicsEvents)
      .where(eq(telematicsEvents.vehicleId, req.params.vehicleId))
      .orderBy(desc(telematicsEvents.recordedAt))
      .limit(limit);
    res.json(rows);
  } catch (error) {
    console.error("Fleet telematics error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Trips ───────────────────────────────────────────────────────

router.get("/fleet/vehicles/:vehicleId/trips", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetTrips)
      .where(eq(fleetTrips.vehicleId, req.params.vehicleId))
      .orderBy(desc(fleetTrips.startedAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet trips error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Fuel ────────────────────────────────────────────────────────

router.get("/fleet/vehicles/:vehicleId/fuel", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fuelTransactions)
      .where(eq(fuelTransactions.vehicleId, req.params.vehicleId))
      .orderBy(desc(fuelTransactions.fueledAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet fuel error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fleet/vehicles/:vehicleId/fuel", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertFuelTransactionSchema.safeParse({
      ...req.body,
      vehicleId: req.params.vehicleId,
    });
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    const [record] = await db.insert(fuelTransactions).values(parsed.data).returning();
    res.status(201).json(record);
  } catch (error) {
    console.error("Fleet fuel create error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Documents / Compliance ──────────────────────────────────────

router.get("/fleet/accounts/:accountId/documents", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetDocuments)
      .where(eq(fleetDocuments.fleetAccountId, req.params.accountId))
      .orderBy(desc(fleetDocuments.expiryDate));
    res.json(rows);
  } catch (error) {
    console.error("Fleet documents error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/fleet/accounts/:accountId/documents/expiring", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetDocuments)
      .where(
        and(
          eq(fleetDocuments.fleetAccountId, req.params.accountId),
          sql`${fleetDocuments.expiryDate} <= now() + interval '30 days'`,
          sql`${fleetDocuments.expiryDate} >= now()`,
        ),
      )
      .orderBy(fleetDocuments.expiryDate);
    res.json(rows);
  } catch (error) {
    console.error("Fleet expiring docs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── Dispatch (first consumer of the extracted Dispatch service) ────
// See docs/02-technical/adr/ADR-001-dispatch-service-extraction.md. This
// endpoint resolves candidates (drivers under the fleet account) itself and
// sends the resolved list to Dispatch — Dispatch never queries this DB.
// Returns a recommendation only; it does not mutate any fleet data.

const dispatchAssignSchema = z.object({
  taskType: z.string().default("fleet_trip"),
  entityId: z.string(),
  requiredSkills: z.array(z.string()).default([]),
  estimatedHours: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

router.post(
  "/fleet/accounts/:accountId/dispatch/assign",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const parsed = dispatchAssignSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
        return;
      }
      const { taskType, entityId, requiredSkills, estimatedHours, priority } = parsed.data;

      const drivers = await db
        .select()
        .from(fleetDrivers)
        .where(
          and(
            eq(fleetDrivers.fleetAccountId, req.params.accountId),
            eq(fleetDrivers.status, "active"),
          ),
        );

      if (drivers.length === 0) {
        res.status(404).json({ message: "No active drivers found for this fleet account" });
        return;
      }

      const activeTripCounts = await db
        .select({
          driverId: fleetTrips.driverId,
          count: sql<number>`count(*)::int`,
        })
        .from(fleetTrips)
        .where(eq(fleetTrips.status, "in_progress"))
        .groupBy(fleetTrips.driverId);
      const loadByDriver = new Map(
        activeTripCounts
          .filter((r: { driverId: string | null; count: number }) => r.driverId !== null)
          .map((r: { driverId: string | null; count: number }) => [r.driverId as string, r.count]),
      );

      const candidates: DispatchCandidate[] = drivers.map((d: typeof drivers[number]) => ({
        id: d.id,
        name: d.userId, // display name resolution happens client-side from userId
        skills: d.licenseType ? [d.licenseType] : [],
        currentLoad: loadByDriver.get(d.id) ?? 0,
        maxLoad: 3,
        available: d.status === "active",
        efficiency: 0.8,
      }));

      const result = await requestAssignment({
        entityType: "fleet_trip",
        entityId,
        taskType,
        requiredSkills,
        estimatedHours,
        priority,
        candidates,
      });

      res.json(result);
    } catch (error) {
      console.error("Fleet dispatch assign error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export const fleetRoutes = router;
