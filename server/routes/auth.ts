import { Router } from "express";
import passport from "passport";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "../storage";
import { resolvePrimaryPortal } from "../portal-routing";

const router = Router();

// Subscription plan is now included in req.user via passport.deserializeUser
router.post("/login", passport.authenticate("local"), (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user as any;
  res.status(200).json(userWithoutPassword);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// The client routes on `primaryPortal`, so the session endpoint has to carry
// it: without it every audience lands on the garage dashboard.
router.get("/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { password: _, ...userWithoutPassword } = req.user as any;

  let roleNames: string[] = [];
  try {
    const userRoles = await storage.getUserRoles(userWithoutPassword.id);
    roleNames = userRoles.map((ur: any) => ur.role?.name).filter(Boolean);
  } catch (error) {
    // A role-lookup failure must not log the user out; fall back to the coarse
    // userType/role routing below.
    console.error("Failed to load RBAC roles for the session user:", error);
  }

  res.json({
    ...userWithoutPassword,
    roles: roleNames,
    primaryPortal: resolvePrimaryPortal(userWithoutPassword, roleNames),
  });
});

export const authRoutes = router;
