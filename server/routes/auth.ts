import { Router } from "express";
import passport from "passport";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { regenerateAndLogin } from "../auth";
import { storage } from "../storage";

const router = Router();

// Subscription plan is included in req.user via passport.deserializeUser.
// Custom callback so the session id is rotated on login (fixation defense, FR-6)
// and, when MFA is enabled, the session is NOT authenticated until the second
// factor is verified at POST /login/mfa (FR-11).
router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid email or password" });
    }
    try {
      const tfa = await storage.getTwoFactorAuth(user.id);
      if (tfa && tfa.isEnabled) {
        // Defer full authentication: rotate the session id and stash the pending
        // user WITHOUT calling req.login — the second factor must be verified first.
        return req.session.regenerate((regenErr) => {
          if (regenErr) return next(regenErr);
          (req.session as any).pendingMfaUserId = user.id;
          req.session.save((saveErr) => {
            if (saveErr) return next(saveErr);
            res.status(200).json({ mfaRequired: true, userId: user.id });
          });
        });
      }
    } catch (e) {
      return next(e);
    }
    regenerateAndLogin(req, user, (loginErr) => {
      if (loginErr) return next(loginErr);
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    });
  })(req, res, next);
});

// Second-factor verification: completes a login that returned { mfaRequired: true }.
router.post("/login/mfa", async (req, res, next) => {
  const pendingMfaUserId = (req.session as any)?.pendingMfaUserId as string | undefined;
  if (!pendingMfaUserId) {
    return res.status(401).json({ message: "No pending MFA login" });
  }
  const { token, isBackupCode } = req.body ?? {};
  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }
  try {
    const tfa = await storage.getTwoFactorAuth(pendingMfaUserId);
    if (!tfa || !tfa.isEnabled) {
      return res.status(400).json({ message: "2FA is not enabled" });
    }
    const { verifyTwoFactorToken, verifyBackupCode, is2FALockedOut, record2FAFailure, clear2FAAttempts } =
      await import("../twoFactorAuth");

    if (is2FALockedOut(pendingMfaUserId)) {
      return res.status(429).json({ message: "Too many failed attempts. Try again in 15 minutes." });
    }

    let isValid = false;
    if (isBackupCode) {
      const result = verifyBackupCode((tfa.backupCodes as string[]) ?? [], token);
      isValid = result.valid;
      if (isValid && result.remainingCodes) {
        await storage.updateTwoFactorAuth(pendingMfaUserId, { backupCodes: result.remainingCodes });
      }
    } else {
      isValid = verifyTwoFactorToken(tfa.secret, token);
    }

    if (!isValid) {
      const nowLocked = record2FAFailure(pendingMfaUserId);
      return res
        .status(nowLocked ? 429 : 401)
        .json({ message: nowLocked ? "Too many failed attempts. Try again in 15 minutes." : "Invalid verification code" });
    }

    clear2FAAttempts(pendingMfaUserId);
    const user = await storage.getUser(pendingMfaUserId);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Complete authentication on a fresh session (also clears the pending marker).
    regenerateAndLogin(req, user as Express.User, (loginErr) => {
      if (loginErr) return next(loginErr);
      const { password: _, ...userWithoutPassword } = user as any;
      res.status(200).json(userWithoutPassword);
    });
  } catch (e) {
    return next(e);
  }
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
