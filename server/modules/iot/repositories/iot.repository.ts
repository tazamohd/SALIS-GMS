/**
 * IoT repository (Phase E). The only data-layer access for the IoT domain: the
 * `storage` sensor / reading / alert methods plus the vehicle + job-card reads
 * the tenant-ownership checks depend on. Delegation only.
 */

import { storage } from '../../../storage';

export class IotRepository {
  // Vehicles / job cards (for ownership scoping)
  getVehicles(garageId?: string) {
    return storage.getVehicles(garageId as never);
  }
  getVehicle(id: string) {
    return storage.getVehicle(id);
  }
  getJobCard(id: string) {
    return storage.getJobCard(id);
  }

  // Sensors
  getIotSensors(vehicleId?: string, status?: string) {
    return storage.getIotSensors(vehicleId as never, status as never);
  }
  getIotSensor(id: string) {
    return storage.getIotSensor(id);
  }
  createIotSensor(data: Parameters<typeof storage.createIotSensor>[0]) {
    return storage.createIotSensor(data);
  }
  updateIotSensor(id: string, data: Parameters<typeof storage.updateIotSensor>[1]) {
    return storage.updateIotSensor(id, data);
  }
  deleteIotSensor(id: string) {
    return storage.deleteIotSensor(id);
  }

  // Readings
  recordSensorReading(data: Parameters<typeof storage.recordSensorReading>[0]) {
    return storage.recordSensorReading(data);
  }
  getSensorReadings(sensorId: string, startDate?: Date, endDate?: Date) {
    return storage.getSensorReadings(sensorId, startDate, endDate);
  }
  getRecentAnomalies(vehicleId: string, limit: number) {
    return storage.getRecentAnomalies(vehicleId, limit);
  }

  // Alerts
  getIotAlerts(vehicleId?: string, status?: string, severity?: string) {
    return storage.getIotAlerts(vehicleId as never, status as never, severity as never);
  }
  getIotAlert(id: string) {
    return storage.getIotAlert(id);
  }
  acknowledgeIotAlert(id: string, userId?: string) {
    return storage.acknowledgeIotAlert(id, userId as never);
  }
  resolveIotAlert(id: string, userId: string | undefined, resolution: string, jobCardId?: string) {
    return storage.resolveIotAlert(id, userId as never, resolution as never, jobCardId as never);
  }
}

export type IIotRepository = IotRepository;
