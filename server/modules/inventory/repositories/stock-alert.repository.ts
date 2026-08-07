/**
 * Stock alert repository (Phase E4). The only data-layer access for the stock
 * alerts sub-domain; delegates to the legacy `storage` facade.
 */

import { storage } from '../../../storage';
import type { StockAlert } from '@shared/schema';

export interface IStockAlertRepository {
  list(garageId: string, status?: string): ReturnType<typeof storage.getStockAlerts>;
  create(data: Parameters<typeof storage.createStockAlert>[0]): ReturnType<typeof storage.createStockAlert>;
  update(
    id: string,
    data: Parameters<typeof storage.updateStockAlert>[1],
    garageId?: string,
  ): Promise<StockAlert | undefined>;
  acknowledge(id: string, userId: string): ReturnType<typeof storage.acknowledgeStockAlert>;
}

export class StockAlertRepository implements IStockAlertRepository {
  list(garageId: string, status?: string) {
    return storage.getStockAlerts(garageId, status);
  }

  create(data: Parameters<typeof storage.createStockAlert>[0]) {
    return storage.createStockAlert(data);
  }

  update(id: string, data: Parameters<typeof storage.updateStockAlert>[1], garageId?: string) {
    return storage.updateStockAlert(id, data, garageId) as Promise<StockAlert | undefined>;
  }

  acknowledge(id: string, userId: string) {
    return storage.acknowledgeStockAlert(id, userId);
  }
}
