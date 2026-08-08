/**
 * Emerging-tech repository (Phase E). The only data-layer access for the
 * emerging-technologies domain: the `storage` read methods for each showcase
 * area plus the create methods the sample-data seeder uses, and the vehicle
 * lookup the seeder depends on. Delegation only.
 */

import { storage } from '../../../storage';

export class EmergingTechRepository {
  // Vehicles (the seeder hangs sample rows off a real vehicle)
  getVehicles(garageId?: string) {
    return storage.getVehicles(garageId as never);
  }

  // Reads
  getBlockchainRecords(vehicleId?: string, garageId?: string) {
    return storage.getBlockchainRecords(vehicleId as never, garageId as never);
  }
  getArRepairGuides(garageId?: string) {
    return storage.getArRepairGuides(garageId as never);
  }
  getIotSensors(vehicleId?: string) {
    return storage.getIotSensors(vehicleId as never);
  }
  getIoTSensorReadings(sensorId?: string, vehicleId?: string) {
    return storage.getIoTSensorReadings(sensorId as never, vehicleId as never);
  }
  getParts3DModels(garageId?: string) {
    return storage.getParts3DModels(garageId as never);
  }
  getDroneInspections(garageId?: string, vehicleId?: string) {
    return storage.getDroneInspections(garageId as never, vehicleId as never);
  }
  getAiVideoAnalyses(customerId?: string, vehicleId?: string) {
    return storage.getAiVideoAnalyses(customerId as never, vehicleId as never);
  }
  getDigitalTwins(vehicleId?: string) {
    return storage.getDigitalTwins(vehicleId as never);
  }
  getFraudDetectionCases(garageId?: string, riskLevel?: string) {
    return storage.getFraudDetectionCases(garageId as never, riskLevel as never);
  }
  getBiometricProfile(userId: string) {
    return storage.getBiometricProfile(userId);
  }
  getCollaborationSessions(garageId?: string, status?: string) {
    return storage.getCollaborationSessions(garageId as never, status as never);
  }
  getEdgeDevices(garageId?: string) {
    return storage.getEdgeDevices(garageId as never);
  }
  getEdgeDiagnostics(deviceId?: string, vehicleId?: string) {
    return storage.getEdgeDiagnostics(deviceId as never, vehicleId as never);
  }
  getPricingOptimizations(garageId?: string, serviceType?: string) {
    return storage.getPricingOptimizations(garageId as never, serviceType as never);
  }

  // Creates (sample-data seeder)
  createBlockchainRecord(data: Parameters<typeof storage.createBlockchainRecord>[0]) {
    return storage.createBlockchainRecord(data);
  }
  createArRepairGuide(data: Parameters<typeof storage.createArRepairGuide>[0]) {
    return storage.createArRepairGuide(data);
  }
  createIotSensor(data: Parameters<typeof storage.createIotSensor>[0]) {
    return storage.createIotSensor(data);
  }
  createParts3DModel(data: Parameters<typeof storage.createParts3DModel>[0]) {
    return storage.createParts3DModel(data);
  }
  createDroneInspection(data: Parameters<typeof storage.createDroneInspection>[0]) {
    return storage.createDroneInspection(data);
  }
  createAiVideoAnalysis(data: Parameters<typeof storage.createAiVideoAnalysis>[0]) {
    return storage.createAiVideoAnalysis(data);
  }
  createDigitalTwin(data: Parameters<typeof storage.createDigitalTwin>[0]) {
    return storage.createDigitalTwin(data);
  }
  createFraudDetectionCase(data: Parameters<typeof storage.createFraudDetectionCase>[0]) {
    return storage.createFraudDetectionCase(data);
  }
  createBiometricProfile(data: Parameters<typeof storage.createBiometricProfile>[0]) {
    return storage.createBiometricProfile(data);
  }
  createCollaborationSession(data: Parameters<typeof storage.createCollaborationSession>[0]) {
    return storage.createCollaborationSession(data);
  }
  createEdgeDevice(data: Parameters<typeof storage.createEdgeDevice>[0]) {
    return storage.createEdgeDevice(data);
  }
  createPricingOptimization(data: Parameters<typeof storage.createPricingOptimization>[0]) {
    return storage.createPricingOptimization(data);
  }
}
