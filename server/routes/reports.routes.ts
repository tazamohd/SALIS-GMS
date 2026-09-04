import { Router } from "express";

const router = Router();

// Reports and analytics routes are served by the monolith (server/routes.ts).
// This module is reserved for future extraction of reporting endpoints.

export const reportsRoutes = router;
