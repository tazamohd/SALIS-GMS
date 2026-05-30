// @ts-nocheck
/**
 * OBD Diagnostic Viewer — backs GET /api/diagnostics/obd/:vehicleId.
 * Pulls latest realtime params, active DTCs, freeze frame, and scan history
 * from the obdDiagnosticData store. Returns empty-state shape if no readings yet.
 */
import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { obdDiagnosticData } from "../../shared/schema";
import { and, eq, desc } from "drizzle-orm";
import { isAuthenticated } from "../auth";

const router = Router();

router.get("/diagnostics/obd/:vehicleId", isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });
  const { vehicleId } = req.params;

  try {
    const rows = await db.select()
      .from(obdDiagnosticData)
      .where(and(
        eq(obdDiagnosticData.garageId, user.garageId),
        eq(obdDiagnosticData.vehicleId, vehicleId),
      ))
      .orderBy(desc(obdDiagnosticData.createdAt))
      .limit(20);

    if (rows.length === 0) {
      return res.json({
        live: null,
        activeDtcs: [],
        freezeFrames: [],
        history: [],
      });
    }

    const latest = rows[0];
    const liveRaw: any = latest.liveData || {};
    const live = {
      engineRpm: liveRaw.engineRpm ?? liveRaw.rpm ?? null,
      speedMph: liveRaw.speedMph ?? liveRaw.speed ?? null,
      coolantTempC: liveRaw.coolantTempC ?? liveRaw.coolant ?? null,
      fuelLevelPct: liveRaw.fuelLevelPct ?? liveRaw.fuel ?? null,
      mafGramsPerSec: liveRaw.mafGramsPerSec ?? liveRaw.maf ?? null,
      throttlePosPct: liveRaw.throttlePosPct ?? liveRaw.throttle ?? null,
      capturedAt: latest.createdAt,
    };

    const codesRaw: any = latest.diagnosticCodes || [];
    const activeDtcs = Array.isArray(codesRaw)
      ? codesRaw.map((c: any) => ({
          code: String(c.code ?? c.dtc ?? c),
          description: String(c.description ?? c.desc ?? "Diagnostic trouble code"),
          severity: String(c.severity ?? "warning"),
          status: String(c.status ?? "active"),
        }))
      : [];

    const freezeRaw: any = latest.freezeFrameData || [];
    const freezeFrames = Array.isArray(freezeRaw)
      ? freezeRaw.map((f: any) => ({
          forCode: String(f.code ?? f.forCode ?? "—"),
          snapshot: f.snapshot ?? f,
        }))
      : [];

    const history = rows.map(r => {
      const codes = Array.isArray(r.diagnosticCodes) ? r.diagnosticCodes : [];
      return {
        scannedAt: r.createdAt,
        codesFound: codes.map((c: any) => String(c.code ?? c.dtc ?? c)),
        action: codes.length === 0 ? "No codes found" : `${codes.length} code(s) detected`,
      };
    });

    res.json({ live, activeDtcs, freezeFrames, history });
  } catch (err) {
    console.error("[obd/diagnostics] error:", err);
    res.status(500).json({ message: "Failed to read OBD data" });
  }
});

export const obdDiagnosticsRoutes = router;
