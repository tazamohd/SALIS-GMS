/**
 * Delivery repository (Phase E4). The only data-layer access for deliveries;
 * delegates to the legacy `storage` facade.
 */

import { storage } from '../../../storage';

export interface IDeliveryRepository {
  list(garageId: string | undefined, status: string | undefined): ReturnType<typeof storage.getDeliveries>;
  getById(id: string, garageId: string | undefined): ReturnType<typeof storage.getDelivery>;
  items(id: string): ReturnType<typeof storage.getDeliveryItems>;
  timeline(id: string): ReturnType<typeof storage.getDeliveryTimeline>;
  liveStatus(id: string): ReturnType<typeof storage.getLiveDeliveryStatus>;
}

export class DeliveryRepository implements IDeliveryRepository {
  list(garageId: string | undefined, status: string | undefined) {
    return storage.getDeliveries(garageId as string, status as string);
  }
  getById(id: string, garageId: string | undefined) {
    return storage.getDelivery(id, garageId as string);
  }
  items(id: string) {
    return storage.getDeliveryItems(id);
  }
  timeline(id: string) {
    return storage.getDeliveryTimeline(id);
  }
  liveStatus(id: string) {
    return storage.getLiveDeliveryStatus(id);
  }
}
