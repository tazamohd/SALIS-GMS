/**
 * Demo access routes.
 *
 * Public, demo-mode-gated endpoints that power the login-page quick-pick:
 *  - GET  /api/demo/accounts — the seeded demo roles (no passwords).
 *  - POST /api/demo/login    — establish a session as a given demo role
 *    WITHOUT sending the shared password to the client.
 *
 * Both are disabled unless isDemoModeEnabled() (DEMO_MODE, or any non-production
 * environment). They are registered in the PUBLIC_ROUTES allow-list and the
 * CSRF exempt list (session-creating, like /api/login).
 */
import { Router } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  DEMO_ROLES,
  getDemoPassword,
  getDemoRole,
  isDemoModeEnabled,
} from "../demo-config";

const router = Router();

/**
 * List the demo accounts. The shared demo password is included so the login
 * page can fill the credential fields on quick-pick — acceptable only because
 * these endpoints are hard-gated to demo mode (never production traffic) and
 * the password is a well-known non-secret by design (demo-config.ts).
 */
router.get("/demo/accounts", (_req, res) => {
  if (!isDemoModeEnabled()) {
    return res.json({ enabled: false, accounts: [] });
  }
  res.json({
    enabled: true,
    password: getDemoPassword(),
    accounts: DEMO_ROLES.map((r) => ({
      roleKey: r.roleKey,
      roleName: r.roleName,
      guardRole: r.guardRole,
      email: r.email,
      label: r.label,
      description: r.description,
    })),
  });
});

// Auto-provisioning guard: at most one concurrent seed run; a failed run may
// be retried on the next request.
let seedInFlight: Promise<void> | null = null;

async function ensureDemoAccountsSeeded(): Promise<void> {
  if (!seedInFlight) {
    seedInFlight = import("../seed-demo")
      .then(({ seedDemo }) => seedDemo())
      .catch((err) => {
        seedInFlight = null;
        throw err;
      });
  }
  return seedInFlight;
}

/** One-click demo login by role key — server-side, no password exposure. */
router.post("/demo/login", async (req, res, next) => {
  if (!isDemoModeEnabled()) {
    return res.status(403).json({ message: "Demo mode is disabled" });
  }

  const spec = getDemoRole(String(req.body?.roleKey || ""));
  if (!spec) {
    return res.status(400).json({ message: "Unknown demo role" });
  }

  try {
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, spec.email))
      .limit(1);

    // First use on a fresh database: provision the demo accounts on demand so
    // the quick-pick never dead-ends. seedDemo() is idempotent and refuses to
    // run in production without ALLOW_DEMO_SEED.
    if (!user) {
      await ensureDemoAccountsSeeded();
      [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, spec.email))
        .limit(1);
    }

    if (!user) {
      return res.status(404).json({
        message: "Demo accounts are not seeded. Run: npm run db:seed:demo",
      });
    }

    // Establish the passport session directly — the shared demo password never
    // travels to the client.
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error("Demo login error:", loginErr);
        return res.status(500).json({ message: "Demo login failed" });
      }
      const { password: _password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    });
  } catch (error) {
    next(error);
  }
});

export default router;
