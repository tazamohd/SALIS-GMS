/**
 * Dynamic-pricing service (Phase E — Domain Services).
 *
 * Owns the dynamic-pricing domain rules: the garage-required 400 on the
 * suggestions list, the not-found 404 on a single suggestion, the accept
 * transition (stamping `acceptedBy`/`acceptedAt`), the service-type-required
 * 400 on calculate, and the static service-type / vehicle-class catalogues.
 * Zod-free (the monolith did no body validation here); all data access flows
 * through the repository.
 */

import { ValidationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { DynamicPricingRepository } from '../repositories/dynamic-pricing.repository';

const SERVICE_TYPES = [
  { value: 'oil_change', label: 'Oil Change', category: 'maintenance' },
  { value: 'brake_service', label: 'Brake Service', category: 'maintenance' },
  { value: 'tire_rotation', label: 'Tire Rotation', category: 'maintenance' },
  { value: 'battery_replacement', label: 'Battery Replacement', category: 'maintenance' },
  { value: 'ac_service', label: 'A/C Service', category: 'maintenance' },
  { value: 'engine_repair', label: 'Engine Repair', category: 'repair' },
  { value: 'transmission_repair', label: 'Transmission Repair', category: 'repair' },
  { value: 'suspension_repair', label: 'Suspension Repair', category: 'repair' },
  { value: 'electrical_repair', label: 'Electrical Repair', category: 'repair' },
  { value: 'full_diagnostic', label: 'Full Diagnostic', category: 'diagnostic' },
  { value: 'obd_scan', label: 'OBD Scan', category: 'diagnostic' },
  { value: 'body_work', label: 'Body Work', category: 'body_work' },
  { value: 'paint_job', label: 'Paint Job', category: 'body_work' },
  { value: 'dent_removal', label: 'Dent Removal', category: 'body_work' },
] as const;

const VEHICLE_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'standard', label: 'Standard' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
] as const;

export class DynamicPricingService {
  constructor(private readonly repository: DynamicPricingRepository) {}

  // ---- Market pricing data -------------------------------------------------
  listMarketData(garageId: string | undefined, filters: { region?: string; serviceType?: string; vehicleClass?: string }) {
    return this.repository.getMarketPricingData(garageId, filters);
  }
  createMarketData(body: Parameters<DynamicPricingRepository['createMarketPricingData']>[0]) {
    return this.repository.createMarketPricingData(body);
  }
  updateMarketData(id: string, body: Parameters<DynamicPricingRepository['updateMarketPricingData']>[1]) {
    return this.repository.updateMarketPricingData(id, body);
  }
  async deleteMarketData(id: string) {
    await this.repository.deleteMarketPricingData(id);
    return { success: true };
  }

  // ---- Vehicle pricing factors --------------------------------------------
  listVehicleFactors(garageId: string | undefined, vehicleMake?: string) {
    return this.repository.getVehiclePricingFactors(garageId, vehicleMake);
  }
  createVehicleFactor(body: Parameters<DynamicPricingRepository['createVehiclePricingFactor']>[0]) {
    return this.repository.createVehiclePricingFactor(body);
  }
  updateVehicleFactor(id: string, body: Parameters<DynamicPricingRepository['updateVehiclePricingFactor']>[1]) {
    return this.repository.updateVehiclePricingFactor(id, body);
  }
  async deleteVehicleFactor(id: string) {
    await this.repository.deleteVehiclePricingFactor(id);
    return { success: true };
  }

  // ---- Pricing suggestions -------------------------------------------------
  async listSuggestions(garageId: string | undefined, filters: { vehicleId?: string; status?: string }) {
    if (!garageId) throw new ValidationError('Garage ID is required');
    return this.repository.getDynamicPricingSuggestions(garageId, filters);
  }
  async getSuggestion(id: string) {
    const data = await this.repository.getDynamicPricingSuggestion(id);
    if (!data) throw new NotFoundError('Pricing suggestion not found');
    return data;
  }
  createSuggestion(garageId: string | undefined, body: Record<string, unknown>) {
    return this.repository.createDynamicPricingSuggestion({ ...body, garageId } as never);
  }
  updateSuggestion(id: string, userId: string | undefined, body: Record<string, unknown>) {
    const updateData: Record<string, unknown> = { ...body };
    if (body.status === 'accepted') {
      updateData.acceptedBy = userId;
      updateData.acceptedAt = new Date();
    }
    return this.repository.updateDynamicPricingSuggestion(id, updateData as never);
  }
  async deleteSuggestion(id: string) {
    await this.repository.deleteDynamicPricingSuggestion(id);
    return { success: true };
  }

  // ---- Calculation + catalogues -------------------------------------------
  async calculate(body: {
    serviceType?: string;
    vehicleMake?: string;
    vehicleYear?: unknown;
    vehicleClass?: string;
    region?: string;
  }) {
    if (!body.serviceType) throw new ValidationError('Service type is required');
    return this.repository.calculateDynamicPrice({
      serviceType: body.serviceType,
      vehicleMake: body.vehicleMake,
      vehicleYear: body.vehicleYear,
      vehicleClass: body.vehicleClass,
      region: body.region,
    } as never);
  }
  serviceTypes() {
    return SERVICE_TYPES;
  }
  vehicleClasses() {
    return VEHICLE_CLASSES;
  }
}
