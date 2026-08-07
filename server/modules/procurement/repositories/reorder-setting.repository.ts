/**
 * Reorder-setting repository (Phase E4). The only data-layer access for reorder
 * settings; delegates to the legacy `storage` facade.
 */

import { storage } from '../../../storage';

export interface IReorderSettingRepository {
  list(garageId: string, sparePartId?: string): ReturnType<typeof storage.getReorderSettings>;
  create(data: Parameters<typeof storage.createReorderSetting>[0]): ReturnType<typeof storage.createReorderSetting>;
  update(
    id: string,
    data: Parameters<typeof storage.updateReorderSetting>[1],
    garageId?: string,
  ): ReturnType<typeof storage.updateReorderSetting>;
  processAutoReorders(garageId: string): ReturnType<typeof storage.processAutoReorders>;
}

export class ReorderSettingRepository implements IReorderSettingRepository {
  list(garageId: string, sparePartId?: string) {
    return storage.getReorderSettings(garageId, sparePartId as string);
  }
  create(data: Parameters<typeof storage.createReorderSetting>[0]) {
    return storage.createReorderSetting(data);
  }
  update(id: string, data: Parameters<typeof storage.updateReorderSetting>[1], garageId?: string) {
    return storage.updateReorderSetting(id, data, garageId);
  }
  processAutoReorders(garageId: string) {
    return storage.processAutoReorders(garageId);
  }
}
