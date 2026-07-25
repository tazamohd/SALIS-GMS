import express, { type Express } from "express";
import type { Server } from "http";
import fs from "fs";
import { beforeAll } from "vitest";

let cachedApp: Express | null = null;
let cachedServer: Server | null = null;

// Read the test garage ID written by globalSetup
beforeAll(() => {
  try {
    const garageId = fs.readFileSync(".test-garage-id", "utf-8").trim();
    process.env.TEST_GARAGE_ID = garageId;
  } catch {
    console.warn("Could not read .test-garage-id — garage seeding may have failed");
  }
});

export async function createTestApp(): Promise<{ app: Express; server: Server }> {
  if (cachedApp && cachedServer) {
    return { app: cachedApp, server: cachedServer };
  }

  // Use the production router (registers all route modules + legacy fallback)
  const { registerRoutes } = await import("../routes/index");

  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false }));

  const server = await registerRoutes(app);

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  cachedApp = app;
  cachedServer = server;
  return { app, server };
}

export function getTestApp() {
  if (!cachedApp) throw new Error("Call createTestApp() first");
  return cachedApp;
}
