/**
 * Real file uploads (M3.1).
 *
 *   POST /api/uploads        multipart { file, name?, category, description?, tags? }
 *                            → stores the file on disk + a tenant-scoped `documents` row
 *                              + a `document_library_items` row (backs the Document
 *                              Management page list/stats), returns metadata.
 *   GET  /api/uploads/:id    → streams the file back (tenant-scoped; cross-tenant = 404)
 *
 * Storage: multer disk storage under UPLOAD_DIR (default ./uploads, created if
 * missing). The stored filename is `${randomUUID()}.${sanitized ext}` — the
 * client-supplied filename is NEVER used for the on-disk path (path traversal).
 *
 * Tenant guard: global `requireAuthByDefault` enforces auth; every DB read/write
 * here is scoped via resolveGarageScope (same pattern as the modular routes).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { documents } from "@shared/schema";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { resolveGarageScope, isCrossGarageRole } from "../middleware/garageScope";
import { logger } from "../logger";

const router = Router();

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/** images / pdf / office docs — keep in sync with the upload UI hint. */
const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
]);

/** Same category slugs as server/routes/documents.ts. */
const CATEGORIES = [
  "invoices",
  "contracts",
  "insurance",
  "vehicle-docs",
  "employee-docs",
  "compliance",
] as const;

/**
 * Extension → acceptable client MIME types. The browser-supplied Content-Type
 * is attacker-controlled, so this is NOT authentication of the content — it is
 * a cross-check that rejects the cheap "HTML saved as .txt" class of smuggling
 * (security review HIGH-1). Download responses always force nosniff +
 * attachment, which is the real inline-execution defense.
 */
const ALLOWED_MIME_BY_EXT: Record<string, string[]> = {
  pdf: ["application/pdf"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  gif: ["image/gif"],
  webp: ["image/webp"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  csv: ["text/csv", "application/vnd.ms-excel", "text/plain"],
  txt: ["text/plain"],
};

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));

/**
 * Per-user upload throttle (security review HIGH-2: disk-exhaustion DoS).
 * Same express-rate-limit library as the global limiters in server/index.ts.
 */
const uploadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  // ipKeyGenerator collapses IPv6 addresses to their /56 so a single v6
  // host can't rotate through addresses to dodge the limit (ERR_ERL_KEY_GEN_IPV6).
  keyGenerator: (req: Request) =>
    (req as Request & { user?: { id?: string } }).user?.id ||
    (req.ip ? ipKeyGenerator(req.ip) : "anon"),
  message: { error: "Too many uploads — try again later" },
});

function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}
ensureUploadDir();

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Lowercase extension from the client filename, or null when not allowlisted. */
function allowedExtension(originalName: string): string | null {
  const ext = path.extname(originalName).slice(1).toLowerCase();
  if (!/^[a-z0-9]{1,10}$/.test(ext)) return null;
  return ALLOWED_EXTENSIONS.has(ext) ? ext : null;
}

/** Display name: strip any directory components + control chars, cap length. */
function sanitizeDisplayName(originalName: string): string {
  const base = path.basename(originalName.replace(/\\/g, "/"));
  // Allowlist: anything outside [a-zA-Z0-9._ -] becomes "_" so the name is safe
  // to echo into Content-Disposition. Hyphen is LAST in the class (literal, not a
  // range) - the prior /[ -]/ was an ASCII 0x20-0x2D range bug (review HIGH/MED-1).
  return base.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 255) || "upload";
}

const uploadBodySchema = z.object({
  name: z.string().trim().min(1).max(500).optional(),
  category: z.enum(CATEGORIES),
  description: z.string().trim().max(2000).optional().default(""),
  tags: z.string().trim().max(1000).optional().default(""),
});

const idParamSchema = z.string().uuid();

// ── Multer setup ─────────────────────────────────────────────────────────────

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = allowedExtension(file.originalname);
    // fileFilter has already rejected disallowed extensions; ext is non-null here.
    cb(null, `${randomUUID()}.${ext ?? "bin"}`);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = allowedExtension(file.originalname);
    if (!ext) {
      cb(new DisallowedExtensionError(file.originalname));
      return;
    }
    // Cross-check the client MIME against the extension (HIGH-1). Either field
    // alone is forgeable; requiring them to agree blocks naive smuggling.
    const allowedMimes = ALLOWED_MIME_BY_EXT[ext] ?? [];
    if (!allowedMimes.includes((file.mimetype || "").toLowerCase())) {
      cb(new DisallowedExtensionError(file.originalname));
      return;
    }
    cb(null, true);
  },
});

class DisallowedExtensionError extends Error {
  constructor(filename: string) {
    super(`File type not allowed: ${path.extname(filename) || "(none)"}`);
    this.name = "DisallowedExtensionError";
  }
}

/** Map multer / filter errors to clean HTTP responses instead of a 500. */
function handleUploadErrors(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof DisallowedExtensionError) {
    res.status(400).json({
      error: "File type not allowed",
      allowed: Array.from(ALLOWED_EXTENSIONS).sort(),
    });
    return;
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File exceeds the 10MB limit" });
      return;
    }
    res.status(400).json({ error: `Upload failed: ${err.code}` });
    return;
  }
  next(err);
}

function removeQuietly(filePath: string | undefined): void {
  if (!filePath) return;
  fs.promises.unlink(filePath).catch(() => {
    // Best-effort cleanup of an orphaned temp file; nothing actionable.
  });
}

// ── POST /api/uploads ────────────────────────────────────────────────────────

router.post(
  "/uploads",
  // No global auth-by-default exists on this app — the guard has to be
  // explicit or anonymous callers reach multer and get a 403/400 instead
  // of the 401 the contract expects.
  isAuthenticated,
  uploadsLimiter,
  upload.single("file"),
  handleUploadErrors,
  async (req: Request, res: Response) => {
    const file = req.file;
    try {
      if (!file) {
        return res.status(400).json({ error: "A file is required (multipart field 'file')" });
      }

      const parsed = uploadBodySchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        removeQuietly(file.path);
        return res.status(400).json({
          error: "Validation failed",
          details: parsed.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      // req.user is typed globally in server/auth.ts. The previous local cast
      // fell back to `{}`, which widened the union and hid id/fullName/email.
      const user = req.user;
      const garageId = resolveGarageScope(req);
      if (!garageId) {
        removeQuietly(file.path);
        return res.status(403).json({ error: "No garage associated with this account" });
      }

      const displayName = sanitizeDisplayName(file.originalname);
      const ext = allowedExtension(file.originalname) ?? "bin";
      const tags = parsed.data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Tenant-scoped file record (the source of truth for downloads).
      const [doc] = await db
        .insert(documents)
        .values({
          garageId,
          documentName: parsed.data.name || displayName,
          description: parsed.data.description,
          fileUrl: path.basename(file.path), // stored name only; resolved against UPLOAD_DIR
          fileName: displayName,
          fileSize: file.size,
          mimeType: file.mimetype,
          tags,
          uploadedBy: user?.id ?? null,
          status: "active",
        })
        .returning();

      // Page-facing metadata row so /api/documents list + stats reflect the
      // upload. The `file:<id>` tag links it back to the downloadable file.
      let libraryItemId: string | undefined;
      try {
        const item = await storage.createDocumentLibraryItem({
          name: parsed.data.name || displayName,
          type: ext,
          category: parsed.data.category,
          size: file.size,
          uploadedBy: user?.fullName || user?.email || "System User",
          tags: [...tags, `file:${doc.id}`],
          description: parsed.data.description,
        });
        libraryItemId = item?.id;
      } catch (libErr) {
        // The file itself is stored and downloadable; surface but don't fail.
        logger.warn("uploads: library metadata row failed", { error: String(libErr) });
      }

      return res.status(201).json({
        id: doc.id,
        libraryItemId,
        name: doc.documentName,
        fileName: doc.fileName,
        size: doc.fileSize,
        mimeType: doc.mimeType,
        category: parsed.data.category,
        tags,
        downloadUrl: `/api/uploads/${doc.id}`,
        createdAt: doc.createdAt,
      });
    } catch (error) {
      removeQuietly(file?.path);
      logger.error("uploads: create failed", { error: String(error) });
      return res.status(500).json({ error: "Failed to store upload" });
    }
  },
);

// ── GET /api/uploads/:id ─────────────────────────────────────────────────────

router.get("/uploads/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const idCheck = idParamSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: "Invalid upload id" });
    }

    const [doc] = await db.select().from(documents).where(eq(documents.id, idCheck.data)).limit(1);
    if (!doc) return res.status(404).json({ error: "Upload not found" });

    // Tenant guard: cross-tenant access must look like a missing resource.
    const garageId = resolveGarageScope(req);
    if (!isCrossGarageRole(req) && doc.garageId !== garageId) {
      return res.status(404).json({ error: "Upload not found" });
    }

    // Defense in depth: only ever serve basenames resolved inside UPLOAD_DIR.
    const storedName = path.basename(doc.fileUrl || "");
    const absPath = path.resolve(UPLOAD_DIR, storedName);
    if (!storedName || !absPath.startsWith(UPLOAD_DIR + path.sep)) {
      return res.status(404).json({ error: "Upload not found" });
    }
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ error: "Upload file is missing from storage" });
    }

    return res.download(absPath, doc.fileName || storedName);
  } catch (error) {
    logger.error("uploads: download failed", { error: String(error) });
    return res.status(500).json({ error: "Failed to download upload" });
  }
});

export default router;
