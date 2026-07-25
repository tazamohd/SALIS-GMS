/**
 * Tax / statutory rate configuration service.
 *
 * VAT and GOSI rates are stored in the `vat_config` / `gosi_config` tables so
 * they can change without a code deploy. This service keeps the active rates in
 * a small in-process cache (seeded with safe defaults), refreshed at startup
 * and whenever an admin updates them. Sync getters let the existing calculation
 * helpers stay synchronous.
 */
import { db } from '../db';
import { vatConfig, gosiConfig } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../logger';

export interface GosiRates {
  saudiEmployeeRate: number;
  saudiEmployerRate: number;
  nonSaudiEmployeeRate: number;
  nonSaudiEmployerRate: number;
  maxContributionSalary: number;
}

// Safe defaults — used until the DB is loaded, and as a fallback if the config
// rows are missing. Match the seeded values in shared/schema.ts.
let vatRateCache = 0.15;
let gosiCache: GosiRates = {
  saudiEmployeeRate: 0.0975,
  saudiEmployerRate: 0.1175,
  nonSaudiEmployeeRate: 0.0,
  nonSaudiEmployerRate: 0.02,
  maxContributionSalary: 45000,
};

/** Load the active VAT + GOSI rows into the cache. Call at startup. */
export async function loadTaxConfig(): Promise<void> {
  try {
    const [vat] = await db.select().from(vatConfig).where(eq(vatConfig.isActive, true)).limit(1);
    if (vat) vatRateCache = Number(vat.vatRate);

    const [gosi] = await db.select().from(gosiConfig).where(eq(gosiConfig.isActive, true)).limit(1);
    if (gosi) {
      gosiCache = {
        saudiEmployeeRate: Number(gosi.saudiEmployeeRate),
        saudiEmployerRate: Number(gosi.saudiEmployerRate),
        nonSaudiEmployeeRate: Number(gosi.nonSaudiEmployeeRate),
        nonSaudiEmployerRate: Number(gosi.nonSaudiEmployerRate),
        maxContributionSalary: Number(gosi.maxContributionSalary),
      };
    }
  } catch (err) {
    // Table may not exist yet (pre-migration) — keep defaults, don't crash boot.
    logger.warn('tax-config: using defaults (load failed)', { error: String(err) });
  }
}

export function getVatRate(): number {
  return vatRateCache;
}

export function getGosiRates(): GosiRates {
  return gosiCache;
}

/** Update VAT rate: supersede the active row, insert a new active row, refresh cache. */
export async function setVatConfig(
  patch: Partial<{ vatRate: number; vatRegistrationNumber: string; companyNameEn: string; companyNameAr: string }>,
  changedBy?: string,
  changeReason?: string,
): Promise<void> {
  const [current] = await db.select().from(vatConfig).where(eq(vatConfig.isActive, true)).limit(1);
  await db.update(vatConfig).set({ isActive: false, effectiveTo: new Date() }).where(eq(vatConfig.isActive, true));
  await db.insert(vatConfig).values({
    countryCode: current?.countryCode || 'SA',
    vatRate: patch.vatRate ?? Number(current?.vatRate ?? 0.15),
    vatRegistrationNumber: patch.vatRegistrationNumber ?? current?.vatRegistrationNumber ?? null,
    companyNameEn: patch.companyNameEn ?? current?.companyNameEn ?? null,
    companyNameAr: patch.companyNameAr ?? current?.companyNameAr ?? null,
    isActive: true,
    changedBy: changedBy || null,
    changeReason: changeReason || null,
  } as any);
  await loadTaxConfig();
}

/** Update GOSI rates: supersede the active row, insert a new active row, refresh cache. */
export async function setGosiConfig(
  patch: Partial<GosiRates>,
  changedBy?: string,
  changeReason?: string,
): Promise<void> {
  const [current] = await db.select().from(gosiConfig).where(eq(gosiConfig.isActive, true)).limit(1);
  const merged = { ...gosiCache, ...patch };
  await db.update(gosiConfig).set({ isActive: false, effectiveTo: new Date() }).where(eq(gosiConfig.isActive, true));
  await db.insert(gosiConfig).values({
    saudiEmployeeRate: merged.saudiEmployeeRate,
    saudiEmployerRate: merged.saudiEmployerRate,
    nonSaudiEmployeeRate: merged.nonSaudiEmployeeRate,
    nonSaudiEmployerRate: merged.nonSaudiEmployerRate,
    maxContributionSalary: String(merged.maxContributionSalary),
    isActive: true,
    changedBy: changedBy || null,
    changeReason: changeReason || null,
  } as any);
  await loadTaxConfig();
}
