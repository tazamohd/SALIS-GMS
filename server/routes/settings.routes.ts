import { Router } from "express";

const router = Router();

// Settings routes (PATCH /api/settings) are served by the monolith (server/routes.ts).
// This module is reserved for future extraction of settings endpoints.

export const settingsRoutes = router;
