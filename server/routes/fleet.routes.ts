import { Router } from "express";

const router = Router();

// Fleet management routes are served by the monolith (server/routes.ts).
// This module is reserved for future extraction of fleet endpoints.

export const fleetRoutes = router;
