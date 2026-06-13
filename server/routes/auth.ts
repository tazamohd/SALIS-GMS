import { Router } from "express";
import passport from "passport";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { regenerateAndLogin } from "../auth";

const router = Router();

// Subscription plan is included in req.user via passport.deserializeUser.
// Custom callback so the session id is rotated on login (fixation defense, FR-6).
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid email or password" });
    }
    regenerateAndLogin(req, user, (loginErr) => {
      if (loginErr) return next(loginErr);
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    });
  })(req, res, next);
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
