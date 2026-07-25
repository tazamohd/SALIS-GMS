import type { Request, Response, NextFunction } from "express";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function createLogEntry(level: LogLevel, message: string, extra?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

function shouldLog(level: LogLevel): boolean {
  if (level === "debug" && process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

function writeLog(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const entry = createLogEntry(level, message, extra);
  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  debug: (message: string, extra?: Record<string, unknown>) => writeLog("debug", message, extra),
  info: (message: string, extra?: Record<string, unknown>) => writeLog("info", message, extra),
  warn: (message: string, extra?: Record<string, unknown>) => writeLog("warn", message, extra),
  error: (message: string, extra?: Record<string, unknown>) => writeLog("error", message, extra),
};

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
    });
  });

  next();
}
