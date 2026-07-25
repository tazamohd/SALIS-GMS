import { Router } from "express";
import passport from "passport";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    const { password: _, ...userWithoutPassword } = req.user as any;
    return res.json(userWithoutPassword);
  }
  res.status(401).json({ message: "Not authenticated" });
});

export const authRoutes = router;
