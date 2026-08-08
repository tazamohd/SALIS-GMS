/**
 * Telematics service (Phase E — Domain Services).
 *
 * Owns the telematics domain rules: the feed/alert passthroughs, the
 * alert-resolve transition, the per-vehicle device **not-found 404**, and the
 * readings default window (24h). Zod body validation stays at the controller
 * boundary; all data access flows through the repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { TelematicsRepository } from '../repositories/telematics.repository';

export class TelematicsService {
  constructor(private readonly repository: TelematicsRepository) {}

  // ---- Integration feeds + alerts -----------------------------------------
  listFeeds(vehicleId?: string, deviceId?: string) {
    return this.repository.getTelematicsFeeds(vehicleId, deviceId);
  }
  createFeed(validated: Parameters<TelematicsRepository['createTelematicsFeed']>[0]) {
    return this.repository.createTelematicsFeed(validated);
  }
  listAlerts(vehicleId?: string, isResolved?: boolean) {
    return this.repository.getTelematicsAlerts(vehicleId, isResolved);
  }
  createAlert(validated: Parameters<TelematicsRepository['createTelematicsAlert']>[0]) {
    return this.repository.createTelematicsAlert(validated);
  }
  resolveAlert(id: string, resolvedBy: string) {
    return this.repository.resolveTelematicsAlert(id, resolvedBy);
  }

  // ---- Per-vehicle device + readings --------------------------------------
  async getDevice(vehicleId: string) {
    const device = await this.repository.getTelematicsDeviceByVehicle(vehicleId);
    if (!device) throw new NotFoundError('No telematics device found');
    return device;
  }
  getReadings(vehicleId: string, streamType?: string, hours = 24) {
    return this.repository.getTelematicsReadings(vehicleId, streamType, hours);
  }
}
