import { Router, Request, Response } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { isAuthenticated } from "../auth";
import { db } from "../db";
import {
  fleetAccounts,
  fleetVehicles,
  fleetDrivers,
  fleetMaintenanceRecords,
  telematicsEvents,
  fleetTrips,
  fleetDocuments,
  fuelTransactions,
  insertFleetAccountSchema,
  insertFleetVehicleSchema,
  insertFleetDriverSchema,
  insertFleetMaintenanceRecordSchema,
  insertFuelTransactionSchema,
} from "@shared/schema/index";

const router = Router();

// ── Fleet Accounts ──────────────────────────────────────────────

router.get("/fleet/accounts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(fleetAccounts)
      .where(eq(fleetAccounts.status, "active"))
      .orderBy(desc(fleetAccounts.createdAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet accounts list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fleet/accounts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertFleetAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    const [account] = await db.insert(fleetAccounts).values(parsed.data).returning();
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
      .from(fleetAccounts)
      .where(eq(fleetAccounts.id, req.params.id));
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
      .from(fleetVehicles)
      .where(eq(fleetVehicles.fleetAccountId, req.params.accountId))
      .orderBy(desc(fleetVehicles.createdAt));
    res.json(rows);
  } catch (error) {
    console.error("Fleet vehicles list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fleet/accounts/:accountId/vehicles", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const parsed = insertFleetVehicleSchema.safeParse({
      ...req.body,
      fleetAccountId: req.params.accountId,
    });
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      return;
    }
    const [vehicle] = await db.insert(fleetVehicles).values(parsed.data).returning();
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
      .from(fleetVehicles)
      .where(eq(fleetVehicles.id, req.params.id));
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
      .update(fleetVehicles)
      .set({ ...req.body, updatedAt: sql`now()` })
      .where(eq(fleetVehicles.id, req.params.id))
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

export const fleetRoutes = router;
