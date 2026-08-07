import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrap an async route handler so a rejected promise is forwarded to Express's
 * error middleware instead of becoming an unhandled rejection.
 *
 * Express 4 does not await handlers, so an `async` handler that throws / rejects
 * without its own try/catch never calls `next` and never sends a response — the
 * client socket hangs until timeout (audit BE-H1). Wrapping with asyncHandler
 * routes the error to the global handler (server/index.ts), which responds 500
 * without leaking internals.
 *
 *   router.get("/x", asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    try {
      // A synchronous throw (before a promise is returned) is caught here; an
      // async rejection is caught by .catch(next). Either way `next` is called.
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };
}
