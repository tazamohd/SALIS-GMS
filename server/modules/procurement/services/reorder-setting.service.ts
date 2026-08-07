/**
 * Reorder-setting service (Phase E5). Requires an effective garage for listing
 * and processing (400 otherwise) and 404s a missing setting on update.
 */

import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { IReorderSettingRepository } from '../repositories/reorder-setting.repository';

export class ReorderSettingService {
  constructor(private readonly repository: IReorderSettingRepository) {}

  list(garageId: string | undefined, sparePartId?: string) {
    if (!garageId) throw new ValidationError('garageId is required');
    return this.repository.list(garageId, sparePartId);
  }

  create(data: Parameters<IReorderSettingRepository['create']>[0]) {
    return this.repository.create(data);
  }

  async update(id: string, data: Parameters<IReorderSettingRepository['update']>[1], garageId?: string) {
    const setting = await this.repository.update(id, data, garageId);
    if (!setting) throw new NotFoundError('Reorder setting not found', { context: { id } });
    return setting;
  }

  async process(garageId: string | undefined) {
    if (!garageId) throw new ValidationError('garageId is required');
    const reorders = await this.repository.processAutoReorders(garageId);
    return { reorders, count: reorders.length };
  }
}
