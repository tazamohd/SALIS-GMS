import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertLoanerVehicleSchema, insertLoanerReservationSchema } from "../../shared/schema";

const router = Router();

// ── Loaner Vehicles ────────────────────────────────────────────────────

router.post("/loaner-vehicles", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = insertLoanerVehicleSchema.parse(req.body);
    const vehicle = await storage.createLoanerVehicle({ ...data, garageId: user.garageId });
    res.status(201).json(vehicle);
  } catch (error: any) {
    console.error("Error creating loaner vehicle:", error);
    res.status(400).json({ error: error.message || "Failed to create loaner vehicle" });
  }
});

router.get("/loaner-vehicles", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, condition } = req.query;
    const vehicles = await storage.getLoanerVehicles(user.garageId, {
      status: status as string | undefined,
      condition: condition as string | undefined,
    });
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching loaner vehicles:", error);
    res.status(500).json({ error: "Failed to fetch loaner vehicles" });
  }
});

router.get("/loaner-vehicles/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const vehicle = await storage.getLoanerVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Loaner vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    console.error("Error fetching loaner vehicle:", error);
    res.status(500).json({ error: "Failed to fetch loaner vehicle" });
  }
});

router.patch("/loaner-vehicles/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const data = insertLoanerVehicleSchema.partial().parse(req.body);
    const updated = await storage.updateLoanerVehicle(req.params.id, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating loaner vehicle:", error);
    res.status(400).json({ error: error.message || "Failed to update loaner vehicle" });
  }
});

router.delete("/loaner-vehicles/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    await storage.deleteLoanerVehicle(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting loaner vehicle:", error);
    res.status(500).json({ error: "Failed to delete loaner vehicle" });
  }
});

// ── Loaner Reservations ────────────────────────────────────────────────

router.post("/loaner-reservations", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = insertLoanerReservationSchema.parse(req.body);
    const reservation = await storage.createLoanerReservation({ ...data, createdBy: user.id });
    res.status(201).json(reservation);
  } catch (error: any) {
    console.error("Error creating loaner reservation:", error);
    res.status(400).json({ error: error.message || "Failed to create loaner reservation" });
  }
});

router.get("/loaner-reservations", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, loanerVehicleId } = req.query;
    const reservations = await storage.getLoanerReservations(user.garageId, {
      status: status as string | undefined,
      loanerVehicleId: loanerVehicleId as string | undefined,
    });
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching loaner reservations:", error);
    res.status(500).json({ error: "Failed to fetch loaner reservations" });
  }
});

router.get("/loaner-reservations/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const reservation = await storage.getLoanerReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Loaner reservation not found" });
    res.json(reservation);
  } catch (error) {
    console.error("Error fetching loaner reservation:", error);
    res.status(500).json({ error: "Failed to fetch loaner reservation" });
  }
});

router.patch("/loaner-reservations/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const data = insertLoanerReservationSchema.partial().parse(req.body);
    const updated = await storage.updateLoanerReservation(req.params.id, data);
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating loaner reservation:", error);
    res.status(400).json({ error: error.message || "Failed to update loaner reservation" });
  }
});

router.delete("/loaner-reservations/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    await storage.deleteLoanerReservation(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting loaner reservation:", error);
    res.status(500).json({ error: "Failed to delete loaner reservation" });
  }
});

export const loanerVehicleRoutes = router;
