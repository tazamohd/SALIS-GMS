/**
 * Stock alert service (Phase E5). Requires an effective garage for listing
 * (400 otherwise) and 404s a missing alert on update. Data access flows through
 * the repository.
 */

import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { IStockAlertRepository } from '../repositories/stock-alert.repository';

export class StockAlertService {
  constructor(private readonly repository: IStockAlertRepository) {}

  list(garageId: string | undefined, status?: string) {
    if (!garageId) throw new ValidationError('garageId is required');
    return this.repository.list(garageId, status);
  }

  create(data: Parameters<IStockAlertRepository['create']>[0]) {
    return this.repository.create(data);
  }

  async update(
    id: string,
    data: Parameters<IStockAlertRepository['update']>[1],
    garageId?: string,
  ) {
    const alert = await this.repository.update(id, data, garageId);
    if (!alert) throw new NotFoundError('Stock alert not found', { context: { id } });
    return alert;
  }

  acknowledge(id: string, userId: string) {
    return this.repository.acknowledge(id, userId);
  }
}
