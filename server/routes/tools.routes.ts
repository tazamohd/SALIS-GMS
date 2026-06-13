import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { insertToolSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

// Tools are a shared catalogue (no garageId column; isGlobal/createdBy instead),
// so these are not tenant-scoped. createdBy is taken from the session.
const updateToolSchema = insertToolSchema.partial();

// GET /api/tools - list active tools
router.get("/tools", isAuthenticated, async (req, res) => {
  try {
    const { garage_id, is_global } = req.query;
    const tools = await storage.getTools(garage_id as string, is_global === "true");
    res.json(tools);
  } catch (error) {
    console.error("Error fetching tools:", error);
    res.status(500).json({ message: "Failed to fetch tools" });
  }
});

// GET /api/tools/:id - single tool
router.get("/tools/:id", isAuthenticated, async (req, res) => {
  try {
    const tool = await storage.getTool(req.params.id);
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }
    res.json(tool);
  } catch (error) {
    console.error("Error fetching tool:", error);
    res.status(500).json({ message: "Failed to fetch tool" });
  }
});

// POST /api/tools - create a tool (createdBy from session)
router.post("/tools", isAuthenticated, async (req: any, res) => {
  try {
    const parsed = insertToolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(sanitizeZodError(parsed.error));
    }
    const tool = await storage.createTool({
      ...parsed.data,
      createdBy: req.user?.id || "default-user",
    });
    res.status(201).json(tool);
  } catch (error) {
    console.error("Error creating tool:", error);
    res.status(500).json({ message: "Failed to create tool" });
  }
});

// PUT /api/tools/:id - update a tool
router.put("/tools/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await storage.getTool(id);
    if (!existing) {
      return res.status(404).json({ message: "Tool not found" });
    }
    const parsed = updateToolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(sanitizeZodError(parsed.error));
    }
    const updatedTool = await storage.updateTool(id, parsed.data);
    res.json(updatedTool);
  } catch (error) {
    console.error("Error updating tool:", error);
    res.status(500).json({ message: "Failed to update tool" });
  }
});

export const toolRoutes = router;
