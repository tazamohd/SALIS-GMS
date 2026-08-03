/**
 * Vehicle-document field extraction for the scan feature.
 *
 * Scanning has two stages: (1) turn an image into raw text (OCR), and (2) turn
 * that text into structured vehicle/insurance fields. Stage 2 is provider-
 * agnostic, deterministic, and testable, so it lives here and runs on whatever
 * text is supplied — whether produced client-side (e.g. Tesseract.js in the
 * browser) or by a cloud OCR provider wired behind the scan endpoint's seam.
 *
 * The extractor is intentionally conservative: it only returns a field when it
 * is reasonably confident, leaving the rest for the user to fill in. It never
 * fabricates values.
 */
import { vehicleMakes } from "@shared/vehicleCatalogs";

export type VehicleDocType = "license" | "insurance";

export interface ExtractedVehicleFields {
  vin?: string;
  make?: string;
  year?: number;
  licensePlate?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string; // ISO yyyy-mm-dd
}

// Common insurers in the Saudi/GCC market. Matched case-insensitively.
const INSURERS = [
  "Tawuniya", "Bupa Arabia", "Bupa", "Malath", "MedGulf", "Medgulf",
  "Al Rajhi Takaful", "Walaa", "Salama", "ACIG", "Gulf Union", "SAICO",
  "Allianz", "AXA", "Wataniya", "Arabian Shield", "Saudi Enaya", "Amana",
  "Buruj", "Chubb", "Gulf General", "Enaya",
];

export function extractVehicleFields(rawText: string, docType: VehicleDocType): ExtractedVehicleFields {
  const text = rawText ?? "";
  const lower = text.toLowerCase();
  const out: ExtractedVehicleFields = {};

  // VIN: 17 chars, excludes I/O/Q by standard.
  const vin = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
  if (vin) out.vin = vin[0].toUpperCase();

  // Model year: a plausible 1980–2049 four-digit year.
  const year = text.match(/\b(19[89]\d|20[0-4]\d)\b/);
  if (year) out.year = parseInt(year[0], 10);

  // Make: longest catalog brand name found in the text (longest-first so
  // "Land Rover" wins over a stray "Rover").
  const makeMatch = [...vehicleMakes]
    .sort((a, b) => b.name.length - a.name.length)
    .find((m) => lower.includes(m.name.toLowerCase()));
  if (makeMatch) out.make = makeMatch.name;

  if (docType === "license") {
    // License plate: best-effort — 1–3 letters then 3–4 digits (or reversed).
    const plate =
      text.match(/\b[A-Z]{1,3}[-\s]?\d{3,4}\b/) || text.match(/\b\d{3,4}[-\s]?[A-Z]{1,3}\b/);
    if (plate) out.licensePlate = plate[0].replace(/\s+/g, "-").toUpperCase();
  }

  if (docType === "insurance") {
    const ins = INSURERS.find((n) => lower.includes(n.toLowerCase()));
    if (ins) out.insuranceProvider = ins;

    const policy = text.match(/policy\s*(?:no\.?|number|num|#)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{4,})/i);
    if (policy) out.insurancePolicyNumber = policy[1].toUpperCase();

    const iso = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
    const dmy = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
    const pad = (s: string) => s.padStart(2, "0");
    if (iso) out.insuranceExpiry = `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;
    else if (dmy) out.insuranceExpiry = `${dmy[3]}-${pad(dmy[2])}-${pad(dmy[1])}`;
  }

  return out;
}
