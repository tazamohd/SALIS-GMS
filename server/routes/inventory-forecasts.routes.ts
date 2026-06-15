import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { insertInventoryForecastSchema } from "@shared/schema";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Client supplies everything except the server-owned garageId.
const forecastBody = insertInventoryForecastSchema.omit({ garageId: true });

// GET /api/inventory-forecasts — scoped to the caller's garage (not a query param)
router.get("/inventory-forecasts", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getInventoryForecasts(garageId));
  } catch (error) {
    console.error("Error fetching inventory forecasts:", error);
    res.status(500).json({ message: "Failed to fetch inventory forecasts" });
  }
});

router.get("/inventory-forecasts/:id", isAuthenticated, async (req: any, res) => {
  try {
    const forecast = await storage.getInventoryForecast(req.params.id);
    if (!forecast || forecast.garageId !== req.user?.garageId) {
      return res.status(404).json({ message: "Forecast not found" });
    }
    res.json(forecast);
  } catch (error) {
    console.error("Error fetching inventory forecast:", error);
    res.status(500).json({ message: "Failed to fetch inventory forecast" });
  }
});

router.post("/inventory-forecasts", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = forecastBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    res.status(201).json(await storage.createInventoryForecast({ ...parsed.data, garageId }));
  } catch (error) {
    console.error("Error creating inventory forecast:", error);
    res.status(500).json({ message: "Failed to create inventory forecast" });
  }
});

export const inventoryForecastsRoutes = router;
