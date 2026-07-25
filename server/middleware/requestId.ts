import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers["x-request-id"] as string) || crypto.randomUUID();

  req.headers["x-request-id"] = id;
  req.requestId = id;
  res.setHeader("x-request-id", id);

  next();
}
