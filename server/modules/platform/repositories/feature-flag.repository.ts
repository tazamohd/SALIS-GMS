/**
 * Feature-flag repository (Phase E4). The only data-layer access for the
 * platform/administration feature-flag surface. Owns the direct Drizzle queries
 * that backed `server/routes/feature-flags.ts`; every query is tenant-scoped by
 * `garageId` so a flag from another garage is never read or mutated.
 */

import { db } from '../../../db';
import { and, eq } from 'drizzle-orm';
import { featureFlags } from '@shared/schema';

export interface FeatureFlag {
  id: string;
  garageId: string;
  flagName: string;
  isEnabled: boolean | null;
  source: string | null;
  createdAt: Date | null;
}

export interface CreateFeatureFlagData {
  garageId: string;
  flagName: string;
  isEnabled: boolean;
  source: string | null;
}

export interface IFeatureFlagRepository {
  listByGarage(garageId: string): Promise<FeatureFlag[]>;
  getByIdForGarage(id: string, garageId: string): Promise<FeatureFlag | undefined>;
  create(data: CreateFeatureFlagData): Promise<FeatureFlag>;
  updateEnabledForGarage(
    id: string,
    garageId: string,
    isEnabled: boolean,
  ): Promise<FeatureFlag | undefined>;
  deleteForGarage(id: string, garageId: string): Promise<FeatureFlag | undefined>;
}

export class FeatureFlagRepository implements IFeatureFlagRepository {
  listByGarage(garageId: string): Promise<FeatureFlag[]> {
    return db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.garageId, garageId)) as Promise<FeatureFlag[]>;
  }

  async getByIdForGarage(id: string, garageId: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db
      .select()
      .from(featureFlags)
      .where(and(eq(featureFlags.id, id), eq(featureFlags.garageId, garageId)));
    return flag as FeatureFlag | undefined;
  }

  async create(data: CreateFeatureFlagData): Promise<FeatureFlag> {
    const [flag] = await db
      .insert(featureFlags)
      .values({
        garageId: data.garageId,
        flagName: data.flagName,
        isEnabled: data.isEnabled,
        source: data.source,
      })
      .returning();
    return flag as FeatureFlag;
  }

  async updateEnabledForGarage(
    id: string,
    garageId: string,
    isEnabled: boolean,
  ): Promise<FeatureFlag | undefined> {
    const [flag] = await db
      .update(featureFlags)
      .set({ isEnabled })
      .where(and(eq(featureFlags.id, id), eq(featureFlags.garageId, garageId)))
      .returning();
    return flag as FeatureFlag | undefined;
  }

  async deleteForGarage(id: string, garageId: string): Promise<FeatureFlag | undefined> {
    const [flag] = await db
      .delete(featureFlags)
      .where(and(eq(featureFlags.id, id), eq(featureFlags.garageId, garageId)))
      .returning();
    return flag as FeatureFlag | undefined;
  }
}
