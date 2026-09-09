/**
 * Object store drivers (local disk / Cloudflare R2).
 *
 * The R2 network path needs real credentials, so what is covered here is
 * everything that decides *whether the wiring is correct* before a byte moves:
 * driver selection, config parsing, and the local driver end-to-end. The
 * traversal cases matter most — the store is the last checkpoint between a
 * `documents.fileUrl` value and the filesystem.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import {
  createObjectStore,
  readR2Config,
  UPLOAD_DIR,
  R2_REQUIRED_VARS,
} from "../objectStore";

/** Minimal env that satisfies the r2 driver. */
const R2_ENV = {
  STORAGE_DRIVER: "r2",
  R2_ACCOUNT_ID: "18a80452ad",
  R2_BUCKET: "salis-gms-uploads",
  R2_ACCESS_KEY_ID: "test-access-key",
  R2_SECRET_ACCESS_KEY: "test-secret-key",
} as NodeJS.ProcessEnv;

describe("createObjectStore — driver selection", () => {
  it("defaults to the local driver when STORAGE_DRIVER is unset", () => {
    expect(createObjectStore({} as NodeJS.ProcessEnv).driver).toBe("local");
  });

  it("selects the r2 driver when fully configured", () => {
    expect(createObjectStore(R2_ENV).driver).toBe("r2");
  });

  it.each(R2_REQUIRED_VARS)(
    "refuses to start with STORAGE_DRIVER=r2 and %s missing",
    (missingVar) => {
      const env = { ...R2_ENV };
      delete env[missingVar];
      // Falling back to local disk here would silently write uploads to a
      // container filesystem that gets thrown away on the next deploy.
      expect(() => createObjectStore(env)).toThrow(missingVar);
    },
  );

  it("rejects an unknown driver name instead of guessing", () => {
    expect(() =>
      createObjectStore({ STORAGE_DRIVER: "s3" } as NodeJS.ProcessEnv),
    ).toThrow(/Unknown STORAGE_DRIVER/);
  });

  it("ignores case and surrounding whitespace in STORAGE_DRIVER", () => {
    expect(createObjectStore({ ...R2_ENV, STORAGE_DRIVER: "  R2 " }).driver).toBe("r2");
  });
});

describe("readR2Config", () => {
  it("returns null when nothing is configured", () => {
    expect(readR2Config({} as NodeJS.ProcessEnv)).toBeNull();
  });

  it("derives the account's S3 endpoint by default", () => {
    expect(readR2Config(R2_ENV)?.endpoint).toBe(
      "https://18a80452ad.r2.cloudflarestorage.com",
    );
  });

  it("honours an explicit R2_ENDPOINT override", () => {
    const cfg = readR2Config({ ...R2_ENV, R2_ENDPOINT: "https://custom.example.com" });
    expect(cfg?.endpoint).toBe("https://custom.example.com");
  });

  it("normalises R2_PREFIX to a single trailing slash", () => {
    expect(readR2Config({ ...R2_ENV, R2_PREFIX: "uploads" })?.prefix).toBe("uploads/");
    expect(readR2Config({ ...R2_ENV, R2_PREFIX: "/uploads/" })?.prefix).toBe("uploads/");
    expect(readR2Config({ ...R2_ENV, R2_PREFIX: "a/b" })?.prefix).toBe("a/b/");
  });

  it("treats an absent prefix as the empty string, not 'undefined/'", () => {
    expect(readR2Config(R2_ENV)?.prefix).toBe("");
  });
});

describe("local driver", () => {
  const store = createObjectStore({} as NodeJS.ProcessEnv);
  let stagingDir: string;
  const writtenKeys: string[] = [];

  beforeEach(() => {
    stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), "salis-store-"));
  });

  afterEach(async () => {
    for (const key of writtenKeys.splice(0)) await store.delete(key);
    fs.rmSync(stagingDir, { recursive: true, force: true });
  });

  /** Write a staged temp file the way multer would, and return its path. */
  function stage(contents: string): string {
    const tmp = path.join(stagingDir, randomUUID());
    fs.writeFileSync(tmp, contents);
    return tmp;
  }

  it("stores a staged file and reads the same bytes back", async () => {
    const key = `${randomUUID()}.txt`;
    const tmp = stage("hello r2");
    await store.put(key, tmp, "text/plain");
    writtenKeys.push(key);

    // The staged copy is consumed, not duplicated.
    expect(fs.existsSync(tmp)).toBe(false);

    const stream = await store.createReadStream(key);
    expect(stream).not.toBeNull();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks).toString()).toBe("hello r2");
  });

  it("resolves keys inside UPLOAD_DIR", async () => {
    const key = `${randomUUID()}.txt`;
    await store.put(key, stage("x"), "text/plain");
    writtenKeys.push(key);
    expect(store.localPath(key)).toBe(path.join(UPLOAD_DIR, key));
  });

  it("returns null for a key that is not stored", async () => {
    expect(await store.createReadStream(`${randomUUID()}.txt`)).toBeNull();
  });

  it.each([
    ["../../etc/passwd", "parent-dir traversal"],
    ["..\\..\\windows\\system32\\config\\sam", "windows-separator traversal"],
    ["/etc/passwd", "absolute path"],
    ["..", "bare parent ref"],
  ])("never escapes UPLOAD_DIR for %s (%s)", async (key) => {
    const resolved = store.localPath(key);
    // Either rejected outright, or reduced to a basename inside UPLOAD_DIR.
    if (resolved !== null) {
      expect(resolved.startsWith(UPLOAD_DIR + path.sep)).toBe(true);
      expect(resolved).not.toContain("..");
    }
    // And it must not read a file that exists outside the upload dir.
    expect(await store.createReadStream(key)).toBeNull();
  });

  it("deletes a stored object and treats a repeat delete as a no-op", async () => {
    const key = `${randomUUID()}.txt`;
    await store.put(key, stage("bye"), "text/plain");
    await store.delete(key);
    expect(await store.createReadStream(key)).toBeNull();
    await expect(store.delete(key)).resolves.toBeUndefined();
  });
});

describe("r2 driver", () => {
  const store = createObjectStore(R2_ENV);

  it("reports no local path — downloads must stream through the app", () => {
    // routes/uploads.ts branches on this: a non-null value would send the
    // request down the res.download() path and miss the object entirely.
    expect(store.localPath("anything.pdf")).toBeNull();
  });
});
