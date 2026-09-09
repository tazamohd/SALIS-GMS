/**
 * Object storage abstraction for uploaded files (M3.1 → Cloudflare R2).
 *
 * Two drivers behind one interface, selected by `STORAGE_DRIVER`:
 *
 *   local (default) — files live on disk under UPLOAD_DIR. Unchanged legacy
 *                     behaviour; the only option before R2 was wired.
 *   r2              — files live in a Cloudflare R2 bucket, reached over R2's
 *                     S3-compatible API with @aws-sdk/client-s3.
 *
 * ## Why downloads still proxy through the app
 *
 * R2 objects are NOT served to the browser directly and the bucket stays
 * private (no public r2.dev domain, no presigned GET). `GET /api/uploads/:id`
 * keeps streaming through Express so the existing tenant guard in
 * routes/uploads.ts remains the only way to reach a file. A presigned or public
 * URL would be a bearer token for the object: anyone holding the link reads it,
 * cross-garage isolation included. The extra hop costs bandwidth; it buys the
 * multi-tenant isolation this app is built around. Do not "optimize" it into a
 * redirect without replacing the guard.
 *
 * ## Key shape
 *
 * The stored key is the same opaque `${uuid}.${ext}` used on disk, so the
 * `documents.fileUrl` column keeps its meaning across drivers and switching
 * drivers needs no migration. Keys are always basenames — never client input.
 */
import path from "path";
import fs from "fs";
import type { Readable } from "stream";
import { logger } from "../../logger";

export type StorageDriver = "local" | "r2";

/** Absolute directory backing the local driver (also the staging dir for r2). */
export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"),
);

/** Where multer writes before a file is handed to the store. */
export const STAGING_DIR = path.join(UPLOAD_DIR, ".staging");

export interface ObjectStore {
  readonly driver: StorageDriver;
  /**
   * Take ownership of a fully-written temp file and store it under `key`.
   * The temp file is consumed (moved or uploaded-then-deleted) either way.
   */
  put(key: string, tempPath: string, contentType: string): Promise<void>;
  /** Open the object for reading, or null when it is not in storage. */
  createReadStream(key: string): Promise<Readable | null>;
  /**
   * Absolute on-disk path when the driver is local, else null. Lets the
   * download route keep using res.download() (range requests, Content-Length)
   * for local files instead of a hand-rolled stream.
   */
  localPath(key: string): string | null;
  /** Best-effort removal; a missing object is not an error. */
  delete(key: string): Promise<void>;
}

// ── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Reduce a key to a safe basename. Every caller already generates keys itself,
 * but this is the last line of defense against a traversal key reaching either
 * the filesystem or an R2 prefix.
 */
function safeKey(key: string): string | null {
  const base = path.basename(String(key || "").replace(/\\/g, "/"));
  if (!base || base === "." || base === "..") return null;
  return base;
}

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function removeQuietly(filePath: string): void {
  fs.promises.unlink(filePath).catch(() => {
    // Orphaned staging file; nothing actionable.
  });
}

// ── Local driver ─────────────────────────────────────────────────────────────

class LocalObjectStore implements ObjectStore {
  readonly driver = "local" as const;

  async put(key: string, tempPath: string, _contentType: string): Promise<void> {
    const name = safeKey(key);
    if (!name) throw new Error("Invalid storage key");
    ensureDir(UPLOAD_DIR);
    const dest = path.join(UPLOAD_DIR, name);
    try {
      await fs.promises.rename(tempPath, dest);
    } catch (err) {
      // rename fails across devices (staging on a different mount); fall back
      // to copy+unlink, which works everywhere.
      if ((err as NodeJS.ErrnoException)?.code === "EXDEV") {
        await fs.promises.copyFile(tempPath, dest);
        removeQuietly(tempPath);
        return;
      }
      throw err;
    }
  }

  async createReadStream(key: string): Promise<Readable | null> {
    const abs = this.localPath(key);
    if (!abs || !fs.existsSync(abs)) return null;
    return fs.createReadStream(abs);
  }

  localPath(key: string): string | null {
    const name = safeKey(key);
    if (!name) return null;
    const abs = path.resolve(UPLOAD_DIR, name);
    // Defense in depth: never resolve outside UPLOAD_DIR.
    if (!abs.startsWith(UPLOAD_DIR + path.sep)) return null;
    return abs;
  }

  async delete(key: string): Promise<void> {
    const abs = this.localPath(key);
    if (!abs) return;
    await fs.promises.unlink(abs).catch(() => {
      // Already gone.
    });
  }
}

// ── R2 driver ────────────────────────────────────────────────────────────────

/**
 * R2 config, read once. Bucket + account id + an S3 API token (Access Key ID /
 * Secret Access Key pair issued under R2 → "Manage R2 API Tokens").
 */
export interface R2Config {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Optional key prefix, e.g. "uploads/" for a bucket shared with other data. */
  prefix: string;
  /** Full endpoint override; defaults to the account's R2 S3 endpoint. */
  endpoint: string;
}

export function readR2Config(env: NodeJS.ProcessEnv = process.env): R2Config | null {
  const accountId = env.R2_ACCOUNT_ID?.trim() || "";
  const bucket = env.R2_BUCKET?.trim() || "";
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim() || "";
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim() || "";
  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) return null;

  let prefix = env.R2_PREFIX?.trim() || "";
  // Normalize to "" or "some/prefix/" so key joining is a plain concat.
  if (prefix) prefix = prefix.replace(/^\/+/, "").replace(/\/*$/, "/");

  return {
    accountId,
    bucket,
    accessKeyId,
    secretAccessKey,
    prefix,
    endpoint:
      env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`,
  };
}

/** Names of the vars that must all be present for the r2 driver. */
export const R2_REQUIRED_VARS = [
  "R2_ACCOUNT_ID",
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
] as const;

class R2ObjectStore implements ObjectStore {
  readonly driver = "r2" as const;
  private readonly cfg: R2Config;
  /** Lazily constructed so `import`ing this module never needs credentials. */
  private clientPromise: Promise<import("@aws-sdk/client-s3").S3Client> | null = null;

  constructor(cfg: R2Config) {
    this.cfg = cfg;
  }

  private async client() {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        const { S3Client } = await import("@aws-sdk/client-s3");
        return new S3Client({
          // R2 ignores the region but the SDK requires one; "auto" is
          // Cloudflare's documented value.
          region: "auto",
          endpoint: this.cfg.endpoint,
          credentials: {
            accessKeyId: this.cfg.accessKeyId,
            secretAccessKey: this.cfg.secretAccessKey,
          },
        });
      })();
    }
    return this.clientPromise;
  }

  private objectKey(key: string): string | null {
    const name = safeKey(key);
    return name ? `${this.cfg.prefix}${name}` : null;
  }

  async put(key: string, tempPath: string, contentType: string): Promise<void> {
    const objectKey = this.objectKey(key);
    if (!objectKey) throw new Error("Invalid storage key");

    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    // Content-Length must be explicit: a stream body without it makes the SDK
    // buffer the whole file to compute the length.
    const { size } = await fs.promises.stat(tempPath);

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: this.cfg.bucket,
          Key: objectKey,
          Body: fs.createReadStream(tempPath),
          ContentLength: size,
          ContentType: contentType || "application/octet-stream",
        }),
      );
    } finally {
      // The staging copy is never the source of truth once we've tried R2;
      // leaving it behind would slowly fill the disk the driver exists to avoid.
      removeQuietly(tempPath);
    }
  }

  async createReadStream(key: string): Promise<Readable | null> {
    const objectKey = this.objectKey(key);
    if (!objectKey) return null;

    const { GetObjectCommand, NoSuchKey } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    try {
      const res = await client.send(
        new GetObjectCommand({ Bucket: this.cfg.bucket, Key: objectKey }),
      );
      // In Node the SDK returns the body as a Readable.
      return (res.Body as Readable) ?? null;
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (err instanceof NoSuchKey || name === "NoSuchKey" || name === "NotFound") {
        return null;
      }
      throw err;
    }
  }

  localPath(_key: string): string | null {
    return null; // Not on this filesystem.
  }

  async delete(key: string): Promise<void> {
    const objectKey = this.objectKey(key);
    if (!objectKey) return;
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    await client
      .send(new DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: objectKey }))
      .catch((err) => {
        logger.warn("objectStore: R2 delete failed", { key: objectKey, error: String(err) });
      });
  }
}

// ── Selection ────────────────────────────────────────────────────────────────

/**
 * Resolve the configured driver. An explicit `STORAGE_DRIVER=r2` with missing
 * credentials is a configuration error, not a reason to silently write to a
 * local disk that a container will throw away — so it throws.
 */
export function createObjectStore(env: NodeJS.ProcessEnv = process.env): ObjectStore {
  const requested = (env.STORAGE_DRIVER || "local").trim().toLowerCase();

  if (requested === "r2") {
    const cfg = readR2Config(env);
    if (!cfg) {
      const missing = R2_REQUIRED_VARS.filter((v) => !env[v]?.trim());
      throw new Error(
        `STORAGE_DRIVER=r2 but missing: ${missing.join(", ")}. ` +
          `Set them (see .env.example) or unset STORAGE_DRIVER to use local disk.`,
      );
    }
    return new R2ObjectStore(cfg);
  }

  if (requested !== "local") {
    throw new Error(`Unknown STORAGE_DRIVER "${requested}" — expected "local" or "r2".`);
  }
  return new LocalObjectStore();
}

/** Process-wide store used by the upload routes. */
export const objectStore: ObjectStore = createObjectStore();

if (process.env.NODE_ENV !== "test") {
  console.warn(
    objectStore.driver === "r2"
      ? `📦 Uploads: Cloudflare R2 (bucket ${process.env.R2_BUCKET})`
      : `📦 Uploads: local disk (${UPLOAD_DIR}) — set STORAGE_DRIVER=r2 for object storage`,
  );
}
