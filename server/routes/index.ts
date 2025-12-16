import { Express } from "express";
import { Server } from "http";
import { authRoutes } from "./auth";
import { registerRoutes as registerLegacyRoutes } from "../routes";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔄 Initializing Hybrid Router...");

  app.use("/api", authRoutes);
  console.log("✅ Auth Module Loaded");

  const server = await registerLegacyRoutes(app);
  console.log("⚠️ Legacy Routes Loaded (Background)");
  
  return server;
}
