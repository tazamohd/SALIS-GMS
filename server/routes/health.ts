import { Router, Request, Response } from "express";
import { checkDatabaseHealth } from "../db";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("../../package.json");

const router = Router();

// Basic health check
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: pkg.version,
  });
});

// Readiness probe - checks DB connectivity
router.get("/health/ready", async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();
  const status = dbHealthy ? 200 : 503;
  res.status(status).json({
    ready: dbHealthy,
    db: dbHealthy ? "connected" : "disconnected",
  });
});

// Liveness probe - simple alive check for k8s
router.get("/health/live", (_req: Request, res: Response) => {
  res.json({ alive: true });
});

export default router;
