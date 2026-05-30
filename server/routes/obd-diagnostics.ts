/**
 * OBD Diagnostic Viewer — backs /api/diagnostics/obd/:vehicleId.
 *
 *   GET  /api/diagnostics/obd/:vehicleId    — latest live params, active DTCs,
 *                                             freeze frame, and scan history.
 *   POST /api/diagnostics/obd/:vehicleId    — store a new reading captured by
 *                                             an OBD scanner tool or technician.
 *
 * Reads/writes the `obd_diagnostic_data` table.
 */
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { obdDiagnosticData } from "../../shared/schema";
import { and, eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router = Router();

// Express's req.user is `any` in this project (Passport session). Narrow once.
interface AuthedUser { id?: string; garageId?: string; userType?: string }
const u = (req: Request): AuthedUser => (req.user as AuthedUser | undefined) ?? {};

router.get("/diagnostics/obd/:vehicleId", isAuthenticated, async (req: Request, res: Response) => {
  const user = u(req);
  if (!user.garageId) return res.status(403).json({ message: "No garage associated" });
  const { vehicleId } = req.params;

  try {
    const rows = await db
      .select()
      .from(obdDiagnosticData)
      .where(
        and(
          eq(obdDiagnosticData.garageId, user.garageId),
          eq(obdDiagnosticData.vehicleId, vehicleId),
        ),
      )
      .orderBy(desc(obdDiagnosticData.createdAt))
      .limit(20);

    if (rows.length === 0) {
      return res.json({ live: null, activeDtcs: [], freezeFrames: [], history: [] });
    }

    const latest = rows[0];
    const liveRaw = (latest.liveData ?? {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" ? v : null);
    const live = {
      engineRpm: num(liveRaw.engineRpm ?? liveRaw.rpm),
      speedMph: num(liveRaw.speedMph ?? liveRaw.speed),
      coolantTempC: num(liveRaw.coolantTempC ?? liveRaw.coolant),
      fuelLevelPct: num(liveRaw.fuelLevelPct ?? liveRaw.fuel),
      mafGramsPerSec: num(liveRaw.mafGramsPerSec ?? liveRaw.maf),
      throttlePosPct: num(liveRaw.throttlePosPct ?? liveRaw.throttle),
      capturedAt: latest.createdAt,
    };

    const codesRaw = latest.diagnosticCodes ?? [];
    const activeDtcs = Array.isArray(codesRaw)
      ? codesRaw.map((c: any) => ({
          code: String(c.code ?? c.dtc ?? c),
          description: String(c.description ?? c.desc ?? "Diagnostic trouble code"),
          severity: String(c.severity ?? "warning"),
          status: String(c.status ?? "active"),
        }))
      : [];

    const freezeRaw = latest.freezeFrameData ?? [];
    const freezeFrames = Array.isArray(freezeRaw)
      ? freezeRaw.map((f: any) => ({
          forCode: String(f.code ?? f.forCode ?? "—"),
          snapshot: f.snapshot ?? f,
        }))
      : [];

    const history = rows.map((r: typeof rows[number]) => {
      const codes = Array.isArray(r.diagnosticCodes) ? r.diagnosticCodes : [];
      return {
        scannedAt: r.createdAt,
        codesFound: codes.map((c: any) => String(c.code ?? c.dtc ?? c)),
        action: codes.length === 0 ? "No codes found" : `${codes.length} code(s) detected`,
      };
    });

    res.json({ live, activeDtcs, freezeFrames, history });
  } catch (err) {
    console.error("[obd/diagnostics] GET error:", err);
    res.status(500).json({ message: "Failed to read OBD data" });
  }
});

// --- Ingestion ---------------------------------------------------------------

const dtcSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(["critical", "high", "medium", "warning", "low"]).optional(),
  status: z.enum(["active", "pending", "cleared", "stored"]).optional(),
});

const freezeFrameSchema = z.object({
  code: z.string().optional(),
  forCode: z.string().optional(),
  snapshot: z.record(z.unknown()).optional(),
});

const ingestionSchema = z.object({
  jobCardId: z.string().uuid().optional(),
  liveData: z.record(z.unknown()).optional(),
  diagnosticCodes: z.array(dtcSchema).optional().default([]),
  freezeFrameData: z.array(freezeFrameSchema).optional().default([]),
  readinessStatus: z.record(z.unknown()).optional(),
  vehicleInfo: z.record(z.unknown()).optional(),
});

router.post("/diagnostics/obd/:vehicleId", isAuthenticated, async (req: Request, res: Response) => {
  const user = u(req);
  if (!user.garageId) return res.status(403).json({ message: "No garage associated" });
  const { vehicleId } = req.params;

  const parsed = ingestionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid OBD reading", errors: parsed.error.flatten() });
  }

  try {
    const [row] = await db
      .insert(obdDiagnosticData)
      .values({
        garageId: user.garageId,
        vehicleId,
        jobCardId: parsed.data.jobCardId ?? null,
        // JSONB columns expect plain JSON-compatible values.
        diagnosticCodes: parsed.data.diagnosticCodes as any,
        liveData: (parsed.data.liveData ?? null) as any,
        freezeFrameData: (parsed.data.freezeFrameData ?? null) as any,
        readinessStatus: (parsed.data.readinessStatus ?? null) as any,
        vehicleInfo: (parsed.data.vehicleInfo ?? null) as any,
      })
      .returning();
    res.status(201).json({ id: row.id, capturedAt: row.createdAt });
  } catch (err) {
    console.error("[obd/diagnostics] POST error:", err);
    res.status(500).json({ message: "Failed to store OBD reading" });
  }
});

export const obdDiagnosticsRoutes = router;
