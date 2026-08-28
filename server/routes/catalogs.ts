import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../auth";

const router = Router();

router.get("/catalogs/vehicle-makes", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const { vehicleMakes } = await import("@shared/vehicleCatalogs");
    res.json(vehicleMakes);
  } catch (error) {
    console.error("Error fetching vehicle makes:", error);
    res.status(500).json({ message: "Failed to fetch vehicle makes" });
  }
});

router.get("/catalogs/vehicle-models", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { makeId } = req.query;
    const { vehicleModels, getModelsForMake } = await import("@shared/vehicleCatalogs");
    if (makeId) {
      res.json(getModelsForMake(makeId as string));
    } else {
      res.json(vehicleModels);
    }
  } catch (error) {
    console.error("Error fetching vehicle models:", error);
    res.status(500).json({ message: "Failed to fetch vehicle models" });
  }
});

router.get("/catalogs/nationalities", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const { nationalities } = await import("@shared/vehicleCatalogs");
    res.json(nationalities);
  } catch (error) {
    console.error("Error fetching nationalities:", error);
    res.status(500).json({ message: "Failed to fetch nationalities" });
  }
});

router.get("/catalogs/years", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const { vehicleYears } = await import("@shared/vehicleCatalogs");
    res.json(vehicleYears);
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({ message: "Failed to fetch years" });
  }
});

router.get("/catalogs/colors", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const { colors } = await import("@shared/vehicleCatalogs");
    res.json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ message: "Failed to fetch colors" });
  }
});

router.get("/catalogs/engine-types", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const { engineTypes } = await import("@shared/vehicleCatalogs");
    res.json(engineTypes);
  } catch (error) {
    console.error("Error fetching engine types:", error);
    res.status(500).json({ message: "Failed to fetch engine types" });
  }
});

router.get("/catalogs/transmission-types", isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const { transmissionTypes } = await import("@shared/vehicleCatalogs");
    res.json(transmissionTypes);
  } catch (error) {
    console.error("Error fetching transmission types:", error);
    res.status(500).json({ message: "Failed to fetch transmission types" });
  }
});

export const catalogRoutes = router;
