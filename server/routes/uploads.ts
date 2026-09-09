/**
 * Real file uploads (M3.1).
 *
 *   POST /api/uploads        multipart { file, name?, category, description?, tags? }
 *                            → stores the file on disk + a tenant-scoped `documents` row
 *                              + a `document_library_items` row (backs the Document
 *                              Management page list/stats), returns metadata.
 *   GET  /api/uploads/:id    → streams the file back (tenant-scoped; cross-tenant = 404)
 *
 * Storage: multer writes to a staging dir, then the file is handed to the
 * configured object store (`STORAGE_DRIVER`: local disk under UPLOAD_DIR, or a
 * Cloudflare R2 bucket — see services/storage/objectStore.ts). The stored key is
 * `${randomUUID()}.${sanitized ext}` — the client-supplied filename is NEVER
 * used for the stored key (path traversal).
 *
 * Downloads always stream back through this route, on both drivers, so the
 * tenant guard below stays the only path to a file. R2 objects are never made
 * public and are never presigned.
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
import { objectStore, STAGING_DIR, ensureDir } from "../services/storage/objectStore";

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

/**
 * Multer stages here; the object store then moves (local) or uploads (r2) the
 * file. Staging first means a half-written upload never appears as a stored
 * object, on either driver.
 */
function ensureStagingDir(): void {
  ensureDir(STAGING_DIR);
}
ensureStagingDir();

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
    ensureStagingDir();
    cb(null, STAGING_DIR);
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
    // Set once the object store owns the file, so the catch below can roll the
    // stored object back when the DB write (the source of truth) fails.
    let storedKey: string | null = null;
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

      // Hand the staged file to the configured store (local move / R2 upload)
      // before writing the row, so a documents row never points at an object
      // that failed to store.
      const storageKey = path.basename(file.path);
      await objectStore.put(storageKey, file.path, file.mimetype);
      storedKey = storageKey;

      // Tenant-scoped file record (the source of truth for downloads).
      const [doc] = await db
        .insert(documents)
        .values({
          garageId,
          documentName: parsed.data.name || displayName,
          description: parsed.data.description,
          fileUrl: storageKey, // opaque key; resolved by the object store
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
      // Roll back the stored object when the row that would reference it never
      // landed — otherwise it is unreachable garbage nothing will ever delete.
      if (storedKey) {
        objectStore.delete(storedKey).catch(() => {
          // Best-effort; already logged inside the store.
        });
      }
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

    // Defense in depth: the key is always reduced to a basename before it
    // reaches the store, which resolves it inside UPLOAD_DIR / the R2 prefix.
    const storedName = path.basename(doc.fileUrl || "");
    if (!storedName) {
      return res.status(404).json({ error: "Upload not found" });
    }
    const downloadName = doc.fileName || storedName;

    // Local files keep going through res.download(): it handles range requests
    // and Content-Length, which a hand-rolled stream would drop.
    const absPath = objectStore.localPath(storedName);
    if (absPath) {
      if (!fs.existsSync(absPath)) {
        return res.status(404).json({ error: "Upload file is missing from storage" });
      }
      return res.download(absPath, downloadName);
    }

    // Remote driver (R2): proxy the object so the tenant guard above stays the
    // only way to reach it. Never redirect to a public or presigned URL.
    const stream = await objectStore.createReadStream(storedName);
    if (!stream) {
      return res.status(404).json({ error: "Upload file is missing from storage" });
    }
    // Force download semantics: the stored bytes are user-supplied, so they must
    // never be sniffed into an inline-rendered document.
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    // downloadName came from sanitizeDisplayName() ([a-zA-Z0-9._ -] only), so
    // it cannot break out of the quoted string.
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    if (doc.fileSize) res.setHeader("Content-Length", String(doc.fileSize));

    stream.on("error", (streamErr) => {
      logger.error("uploads: stream failed", { error: String(streamErr) });
      // Headers are already sent once bytes flow; destroying the socket is the
      // only honest signal that the body is truncated.
      if (!res.headersSent) res.status(500).json({ error: "Failed to download upload" });
      else res.destroy();
    });
    return stream.pipe(res);
  } catch (error) {
    logger.error("uploads: download failed", { error: String(error) });
    return res.status(500).json({ error: "Failed to download upload" });
  }
});

export default router;
