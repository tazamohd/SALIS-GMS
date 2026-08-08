/**
 * Quota repository (Phase D.1 / LIC-2). The only data-layer access for
 * entitlement quota checks: the active-license + subscription lookups that
 * determine effective limits, and the live usage counts. Reads the `licenses`
 * and `subscriptions` tables directly (they are tables, not another module's
 * repository) so the quota surface stays self-contained.
 */

import { and, count, desc, eq, gte } from 'drizzle-orm';
import { db } from '../../../db';
import { licenses, subscriptions, users, vehicles, jobCards } from '@shared/schema';

export interface UsageCounts {
  users: number;
  vehicles: number;
  jobsPerMonth: number;
}

export interface IQuotaRepository {
  activeLicense(garageId: string): Promise<typeof licenses.$inferSelect | undefined>;
  subscription(garageId: string): Promise<typeof subscriptions.$inferSelect | undefined>;
  usage(garageId: string, monthStart: Date): Promise<UsageCounts>;
}

export class QuotaRepository implements IQuotaRepository {
  async activeLicense(garageId: string) {
    const [row] = await db
      .select()
      .from(licenses)
      .where(and(eq(licenses.boundGarageId, garageId), eq(licenses.status, 'active')))
      .orderBy(desc(licenses.createdAt))
      .limit(1);
    return row;
  }

  async subscription(garageId: string) {
    const [row] = await db.select().from(subscriptions).where(eq(subscriptions.garageId, garageId)).limit(1);
    return row;
  }

  async usage(garageId: string, monthStart: Date): Promise<UsageCounts> {
    const [u, v, j] = await Promise.all([
      db.select({ c: count() }).from(users).where(eq(users.garageId, garageId)),
      db.select({ c: count() }).from(vehicles).where(eq(vehicles.garageId, garageId)),
      db
        .select({ c: count() })
        .from(jobCards)
        .where(and(eq(jobCards.garageId, garageId), gte(jobCards.createdAt, monthStart))),
    ]);
    return {
      users: Number(u[0]?.c ?? 0),
      vehicles: Number(v[0]?.c ?? 0),
      jobsPerMonth: Number(j[0]?.c ?? 0),
    };
  }
}
