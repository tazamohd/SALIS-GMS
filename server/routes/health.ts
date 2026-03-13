import { Router } from "express";
import { checkDatabaseHealth } from "../db";

const router = Router();

router.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/api/ready", async (_req, res) => {
  const dbHealthy = await checkDatabaseHealth();

  res.json({
    status: dbHealthy ? "ready" : "degraded",
    database: dbHealthy ? "connected" : "disconnected",
  });
});

export default router;
