import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
  }
}

export function generateCsrfToken(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  next();
}

export function csrfTokenRoute(req: Request, res: Response): void {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.json({ csrfToken: req.session.csrfToken });
}

const SKIP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  if (SKIP_METHODS.has(req.method)) {
    return next();
  }

  const token = req.headers["x-csrf-token"] as string | undefined;
  const sessionToken = req.session.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }

  next();
}
