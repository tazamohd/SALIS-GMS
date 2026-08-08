/**
 * IoT service (Phase E — Domain Services).
 *
 * Owns the IoT domain rules: the repeated vehicle-ownership check (a resource is
 * only visible if its vehicle belongs to the caller's garage — a 403 "Access
 * denied"), the not-found 404s, the date-format 400s, the resolve pre-checks,
 * and the dashboard aggregation. Zod body validation stays at the controller
 * boundary. All data access flows through the repository.
 */

import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';
import type { IotRepository } from '../repositories/iot.repository';

export class IotService {
  constructor(private readonly repository: IotRepository) {}

  /** A resource's vehicle must belong to the caller's garage, else 403. */
  private async assertVehicleOwned(vehicleId: string, garageId: string | undefined) {
    const vehicle = await this.repository.getVehicle(vehicleId);
    if (!vehicle || vehicle.garageId !== garageId) throw new AuthorizationError('Access denied');
    return vehicle;
  }

  private async garageVehicleIds(garageId: string | undefined): Promise<string[]> {
    const vehicles = await this.repository.getVehicles(garageId);
    return vehicles.map((v: { id: string }) => v.id);
  }

  // ---- Sensors -------------------------------------------------------------
  async listSensors(garageId: string | undefined, vehicleId?: string, status?: string) {
    const vehicleIds = await this.garageVehicleIds(garageId);
    if (vehicleId && !vehicleIds.includes(vehicleId)) throw new AuthorizationError('Access denied');
    const sensors = await this.repository.getIotSensors(vehicleId, status);
    return sensors.filter((s: { vehicleId: string }) => vehicleIds.includes(s.vehicleId));
  }
  async getSensor(id: string, garageId: string | undefined) {
    const sensor = await this.repository.getIotSensor(id);
    if (!sensor) throw new NotFoundError('Sensor not found');
    await this.assertVehicleOwned(sensor.vehicleId, garageId);
    return sensor;
  }
  async createSensor(garageId: string | undefined, data: { vehicleId: string } & Record<string, unknown>) {
    await this.assertVehicleOwned(data.vehicleId, garageId);
    return this.repository.createIotSensor(data as never);
  }
  async updateSensor(id: string, garageId: string | undefined, data: Record<string, unknown>) {
    const existing = await this.repository.getIotSensor(id);
    if (!existing) throw new NotFoundError('Sensor not found');
    await this.assertVehicleOwned(existing.vehicleId, garageId);
    return this.repository.updateIotSensor(id, data as never);
  }
  async deleteSensor(id: string, garageId: string | undefined) {
    const existing = await this.repository.getIotSensor(id);
    if (!existing) throw new NotFoundError('Sensor not found');
    await this.assertVehicleOwned(existing.vehicleId, garageId);
    await this.repository.deleteIotSensor(id);
    return { message: 'Sensor deleted successfully' };
  }

  // ---- Readings ------------------------------------------------------------
  async recordReading(data: { sensorId: string } & Record<string, unknown>) {
    const sensor = await this.repository.getIotSensor(data.sensorId);
    if (!sensor) throw new NotFoundError('Sensor not found');
    return this.repository.recordSensorReading(data as never);
  }
  async getReadings(id: string, garageId: string | undefined, startDate?: string, endDate?: string) {
    const sensor = await this.repository.getIotSensor(id);
    if (!sensor) throw new NotFoundError('Sensor not found');
    await this.assertVehicleOwned(sensor.vehicleId, garageId);
    let start: Date | undefined;
    let end: Date | undefined;
    if (startDate) {
      start = new Date(startDate);
      if (Number.isNaN(start.getTime())) throw new ValidationError('Invalid startDate format');
    }
    if (endDate) {
      end = new Date(endDate);
      if (Number.isNaN(end.getTime())) throw new ValidationError('Invalid endDate format');
    }
    return this.repository.getSensorReadings(id, start, end);
  }
  async vehicleAnomalies(vehicleId: string, garageId: string | undefined, limit?: number) {
    await this.assertVehicleOwned(vehicleId, garageId);
    return this.repository.getRecentAnomalies(vehicleId, limit && limit > 0 ? limit : 10);
  }
  async latestReadings(vehicleId: string, garageId: string | undefined) {
    await this.assertVehicleOwned(vehicleId, garageId);
    const sensors = await this.repository.getIotSensors(vehicleId);
    const latest: Record<string, unknown> = {};
    for (const sensor of sensors as Array<{ id: string; sensorType: string }>) {
      const readings = await this.repository.getSensorReadings(sensor.id);
      if (readings.length > 0) latest[sensor.sensorType] = readings[0];
    }
    return latest;
  }

  // ---- Alerts --------------------------------------------------------------
  async listAlerts(garageId: string | undefined, vehicleId?: string, status?: string, severity?: string) {
    if (vehicleId) await this.assertVehicleOwned(vehicleId, garageId);
    const vehicleIds = await this.garageVehicleIds(garageId);
    const alerts = await this.repository.getIotAlerts(vehicleId, status, severity);
    return alerts.filter((a: { vehicleId: string }) => vehicleIds.includes(a.vehicleId));
  }
  async getAlert(id: string, garageId: string | undefined) {
    const alert = await this.repository.getIotAlert(id);
    if (!alert) throw new NotFoundError('Alert not found');
    await this.assertVehicleOwned(alert.vehicleId, garageId);
    return alert;
  }
  async acknowledgeAlert(id: string, garageId: string | undefined, userId?: string) {
    const alert = await this.repository.getIotAlert(id);
    if (!alert) throw new NotFoundError('Alert not found');
    await this.assertVehicleOwned(alert.vehicleId, garageId);
    return this.repository.acknowledgeIotAlert(id, userId);
  }
  async resolveAlert(id: string, garageId: string | undefined, userId: string | undefined, body: { resolution?: unknown; jobCardId?: unknown }) {
    const { resolution, jobCardId } = body ?? {};
    if (!resolution || typeof resolution !== 'string') throw new ValidationError('Resolution text is required');
    const alert = await this.repository.getIotAlert(id);
    if (!alert) throw new NotFoundError('Alert not found');
    await this.assertVehicleOwned(alert.vehicleId, garageId);
    if (jobCardId) {
      const jobCard = await this.repository.getJobCard(jobCardId as string);
      if (!jobCard || jobCard.garageId !== garageId) throw new AuthorizationError('Invalid job card');
    }
    return this.repository.resolveIotAlert(id, userId, resolution, jobCardId as string | undefined);
  }

  // ---- Dashboard -----------------------------------------------------------
  async dashboardSummary(garageId: string | undefined) {
    const vehicleIds = await this.garageVehicleIds(garageId);
    const allSensors = await this.repository.getIotSensors();
    const sensors = (allSensors as Array<{ vehicleId: string; status: string }>).filter((s) => vehicleIds.includes(s.vehicleId));
    const allAlerts = await this.repository.getIotAlerts();
    const alerts = (allAlerts as Array<{ vehicleId: string; status: string; severity: string }>).filter((a) => vehicleIds.includes(a.vehicleId));

    const activeSensors = sensors.filter((s) => s.status === 'active').length;
    const activeAlerts = alerts.filter((a) => a.status === 'active').length;
    const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
    return {
      totalSensors: sensors.length,
      activeSensors,
      inactiveSensors: sensors.length - activeSensors,
      totalAlerts: alerts.length,
      activeAlerts,
      criticalAlerts,
      acknowledgedAlerts: alerts.filter((a) => a.status === 'acknowledged').length,
      resolvedAlerts: alerts.filter((a) => a.status === 'resolved').length,
    };
  }
}
