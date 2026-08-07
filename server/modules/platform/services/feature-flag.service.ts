/**
 * Feature-flag service (Phase E5 — business layer). Owns the tenant scoping and
 * the existence/validation rules for the platform/administration feature-flag
 * surface. Missing flags surface as `NotFoundError` (→ 404) and a missing
 * `flagName` as `ValidationError` (→ 400), each carrying the legacy message the
 * controller renders verbatim. No HTTP, no data-layer access.
 */

import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import type {
  FeatureFlag,
  IFeatureFlagRepository,
} from '../repositories/feature-flag.repository';

export interface CreateFeatureFlagInput {
  flagName?: unknown;
  isEnabled?: unknown;
  source?: unknown;
}

const NOT_FOUND = 'Feature flag not found';

export class FeatureFlagService {
  constructor(private readonly repo: IFeatureFlagRepository) {}

  list(garageId: string): Promise<FeatureFlag[]> {
    return this.repo.listByGarage(garageId);
  }

  async get(id: string, garageId: string): Promise<FeatureFlag> {
    const flag = await this.repo.getByIdForGarage(id, garageId);
    if (!flag) throw new NotFoundError(NOT_FOUND);
    return flag;
  }

  async create(garageId: string, input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    if (!input.flagName) throw new ValidationError('flagName is required');
    return this.repo.create({
      garageId,
      flagName: String(input.flagName),
      isEnabled: (input.isEnabled as boolean | undefined) ?? false,
      source: (input.source as string | undefined) ?? null,
    });
  }

  async setEnabled(id: string, garageId: string, isEnabled: boolean): Promise<FeatureFlag> {
    const flag = await this.repo.updateEnabledForGarage(id, garageId, isEnabled);
    if (!flag) throw new NotFoundError(NOT_FOUND);
    return flag;
  }

  async remove(id: string, garageId: string): Promise<FeatureFlag> {
    const flag = await this.repo.deleteForGarage(id, garageId);
    if (!flag) throw new NotFoundError(NOT_FOUND);
    return flag;
  }
}
