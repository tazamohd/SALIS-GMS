import { Router } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { sanitizeForLog } from "../utils/sanitizeForLog";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
  };
}

// Export jobs are personal — ownership is scoped to garage AND the requesting user.
async function loadOwnedJob(req: any, res: any, id: string) {
  const job = await storage.getExportJob(id);
  if (!job || job.garageId !== req.user?.garageId || job.userId !== req.user?.id) {
    res.status(404).json({ message: "Export job not found" });
    return null;
  }
  return job;
}

// GET /api/export-jobs — scoped to the caller's garage + user (not a query param)
router.get("/export-jobs", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.json([]);
    res.json(await storage.getExportJobs(garageId, req.user?.id));
  } catch (error) {
    console.error("Error getting export jobs:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to get export jobs" });
  }
});

router.get("/export-jobs/:id", isAuthenticated, async (req: any, res) => {
  try {
    const job = await loadOwnedJob(req, res, req.params.id);
    if (!job) return;
    res.json(job);
  } catch (error) {
    console.error("Error getting export job:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to get export job" });
  }
});

const exportRequestSchema = z.object({
  module: z.string().min(1),
  format: z.string().min(1),
  filterConfig: z.any().optional(),
});

// POST /api/export — kicks off an async export scoped to the caller's garage.
router.post("/export", isAuthenticated, async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    if (!garageId) return res.status(400).json({ message: "User has no garage assigned" });
    const parsed = exportRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(sanitizeZodError(parsed.error));
    const { module, format, filterConfig } = parsed.data;

    const job = await storage.createExportJob({
      garageId,
      userId: req.user?.id,
      module,
      format,
      filterConfig,
      status: "processing",
    });

    // Start async export process (simplified — in production, use a queue).
    (async () => {
      try {
        let data: any[] = [];
        switch (module) {
          case "jobCards":
            data = await storage.getJobCards(garageId);
            break;
          case "customers":
            data = await storage.getCustomers(garageId);
            break;
          case "vehicles":
            data = await storage.getVehicles(garageId);
            break;
          case "invoices":
            data = await storage.getInvoices(garageId);
            break;
          case "estimates":
            data = await storage.getEstimates(garageId);
            break;
          default:
            throw new Error(`Export not supported for module: ${module}`);
        }

        let fileContent = "";
        const fileName = `${module}-export-${Date.now()}.${format}`;
        if (format === "csv") {
          if (data.length > 0) {
            const headers = Object.keys(data[0]).join(",");
            const rows = data.map((row) => Object.values(row).join(","));
            fileContent = [headers, ...rows].join("\n");
          }
        } else if (format === "json") {
          fileContent = JSON.stringify(data, null, 2);
        }
        void fileContent; // file persistence is out of scope here

        await storage.updateExportJob(job.id, {
          status: "completed",
          fileName,
          fileUrl: `/exports/${fileName}`,
          recordCount: data.length,
          completedAt: new Date(),
        });
      } catch (error: any) {
        await storage.updateExportJob(job.id, {
          status: "failed",
          errorMessage: error.message,
        });
      }
    })();

    res.status(202).json(job);
  } catch (error) {
    console.error("Error creating export:", sanitizeForLog(error));
    res.status(500).json({ message: "Failed to create export" });
  }
});

export const exportJobsRoutes = router;
