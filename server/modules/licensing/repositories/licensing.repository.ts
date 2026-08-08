/**
 * Licensing repository (Phase D.1). The only data-layer / infra access for the
 * license subsystem: the Drizzle `licenses` + `license_activations` queries plus
 * the signing seam (reads the signing secret from the environment and delegates
 * to the pure `license-key` util) and id minting (the nondeterminism lives
 * here). No business rules.
 */

import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../../../db';
import { licenses, licenseActivations, type InsertLicense } from '@shared/schema';
import {
  signLicenseKey,
  verifyLicenseKey,
  type LicensePayload,
  type VerifyResult,
} from '../../../services/licensing/license-key';

export interface LicenseFilter {
  status?: string;
  boundGarageId?: string;
}

function signingSecret(): string {
  return process.env.LICENSE_SIGNING_SECRET || process.env.SESSION_SECRET || '';
}

export interface ILicensingRepository {
  newId(): string;
  sign(payload: LicensePayload): string;
  verify(key: string): VerifyResult;
  create(row: InsertLicense): Promise<typeof licenses.$inferSelect>;
  getById(id: string): Promise<typeof licenses.$inferSelect | undefined>;
  getByKey(licenseKey: string): Promise<typeof licenses.$inferSelect | undefined>;
  list(filter: LicenseFilter): Promise<Array<typeof licenses.$inferSelect>>;
  update(id: string, patch: Partial<InsertLicense>): Promise<typeof licenses.$inferSelect | undefined>;
  recordActivation(row: typeof licenseActivations.$inferInsert): Promise<void>;
  listActivations(licenseId: string): Promise<Array<typeof licenseActivations.$inferSelect>>;
}

export class LicensingRepository implements ILicensingRepository {
  newId(): string {
    return randomUUID();
  }
  sign(payload: LicensePayload): string {
    return signLicenseKey(payload, signingSecret());
  }
  verify(key: string): VerifyResult {
    return verifyLicenseKey(key, signingSecret());
  }

  async create(row: InsertLicense) {
    const [created] = await db.insert(licenses).values(row).returning();
    return created;
  }
  async getById(id: string) {
    const [row] = await db.select().from(licenses).where(eq(licenses.id, id)).limit(1);
    return row;
  }
  async getByKey(licenseKey: string) {
    const [row] = await db.select().from(licenses).where(eq(licenses.licenseKey, licenseKey)).limit(1);
    return row;
  }
  async list(filter: LicenseFilter) {
    const conds = [
      filter.status ? eq(licenses.status, filter.status) : undefined,
      filter.boundGarageId ? eq(licenses.boundGarageId, filter.boundGarageId) : undefined,
    ].filter(Boolean);
    const where = conds.length ? and(...(conds as [ReturnType<typeof eq>])) : undefined;
    return db.select().from(licenses).where(where).orderBy(desc(licenses.createdAt)).limit(200);
  }
  async update(id: string, patch: Partial<InsertLicense>) {
    const [row] = await db
      .update(licenses)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(licenses.id, id))
      .returning();
    return row;
  }

  async recordActivation(row: typeof licenseActivations.$inferInsert) {
    await db.insert(licenseActivations).values(row);
  }
  async listActivations(licenseId: string) {
    return db
      .select()
      .from(licenseActivations)
      .where(eq(licenseActivations.licenseId, licenseId))
      .orderBy(desc(licenseActivations.createdAt))
      .limit(200);
  }
}
