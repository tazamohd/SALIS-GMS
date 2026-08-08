/**
 * Telematics repository (Phase E). The only data-layer access for the
 * telematics domain: the `storage` feed / alert methods and the per-vehicle
 * device + readings lookups. Delegation only.
 */

import { storage } from '../../../storage';

export class TelematicsRepository {
  // Integration feeds + alerts
  getTelematicsFeeds(vehicleId?: string, deviceId?: string) {
    return storage.getTelematicsFeeds(vehicleId, deviceId);
  }
  createTelematicsFeed(data: Parameters<typeof storage.createTelematicsFeed>[0]) {
    return storage.createTelematicsFeed(data);
  }
  getTelematicsAlerts(vehicleId?: string, isResolved?: boolean) {
    return storage.getTelematicsAlerts(vehicleId, isResolved);
  }
  createTelematicsAlert(data: Parameters<typeof storage.createTelematicsAlert>[0]) {
    return storage.createTelematicsAlert(data);
  }
  resolveTelematicsAlert(id: string, resolvedBy: string) {
    return storage.resolveTelematicsAlert(id, resolvedBy);
  }

  // Per-vehicle device + readings
  getTelematicsDeviceByVehicle(vehicleId: string) {
    return storage.getTelematicsDeviceByVehicle(vehicleId);
  }
  getTelematicsReadings(vehicleId: string, streamType?: string, hours?: number) {
    return storage.getTelematicsReadings(vehicleId, streamType, hours);
  }
}
