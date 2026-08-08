/**
 * Emerging-tech service (Phase E — Domain Services).
 *
 * Owns the emerging-technologies rules: the read passthroughs (with the
 * biometric-profile empty-object fallback) and the sample-data seeder — which
 * requires a real vehicle in the garage (else a 400) and hangs ~27 fixture rows
 * off it across the twelve showcase areas, returning the per-area counts. The
 * fixture generator holds the date/random nondeterminism. All data access flows
 * through the repository.
 */

import { ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { EmergingTechRepository } from '../repositories/emerging-tech.repository';

export class EmergingTechService {
  constructor(private readonly repository: EmergingTechRepository) {}

  // ---- Reads ---------------------------------------------------------------
  blockchain(vehicleId: string | undefined, garageId: string | undefined) {
    return this.repository.getBlockchainRecords(vehicleId, garageId);
  }
  arGuides(garageId: string | undefined) {
    return this.repository.getArRepairGuides(garageId);
  }
  iotSensors(vehicleId: string | undefined) {
    return this.repository.getIotSensors(vehicleId);
  }
  iotReadings(sensorId: string | undefined, vehicleId: string | undefined) {
    return this.repository.getIoTSensorReadings(sensorId, vehicleId);
  }
  models3D(garageId: string | undefined) {
    return this.repository.getParts3DModels(garageId);
  }
  droneInspections(garageId: string | undefined, vehicleId: string | undefined) {
    return this.repository.getDroneInspections(garageId, vehicleId);
  }
  aiVideo(customerId: string | undefined, vehicleId: string | undefined) {
    return this.repository.getAiVideoAnalyses(customerId, vehicleId);
  }
  digitalTwins(vehicleId: string | undefined) {
    return this.repository.getDigitalTwins(vehicleId);
  }
  fraudCases(garageId: string | undefined, riskLevel: string | undefined) {
    return this.repository.getFraudDetectionCases(garageId, riskLevel);
  }
  async biometricProfile(userId: string) {
    const profile = await this.repository.getBiometricProfile(userId);
    return profile || {};
  }
  collaborationSessions(garageId: string | undefined, status: string | undefined) {
    return this.repository.getCollaborationSessions(garageId, status);
  }
  edgeDevices(garageId: string | undefined) {
    return this.repository.getEdgeDevices(garageId);
  }
  edgeDiagnostics(deviceId: string | undefined, vehicleId: string | undefined) {
    return this.repository.getEdgeDiagnostics(deviceId, vehicleId);
  }
  pricingOptimizations(garageId: string | undefined, serviceType: string | undefined) {
    return this.repository.getPricingOptimizations(garageId, serviceType);
  }

  // ---- Sample-data seeder --------------------------------------------------
  async seed(garageId: string | undefined, userId: string) {
    // Seeding hangs sample rows off a real vehicle; without one the
    // NOT NULL vehicle_id FKs cannot be satisfied.
    const vehicles = await this.repository.getVehicles(garageId);
    const vehicleId = vehicles[0]?.id;
    if (!vehicleId) {
      throw new ValidationError('Seed requires at least one vehicle in this garage');
    }

    const results = {
      blockchain: 0,
      arGuides: 0,
      iotSensors: 0,
      models3D: 0,
      droneInspections: 0,
      aiVideo: 0,
      digitalTwins: 0,
      fraudCases: 0,
      biometricProfile: 0,
      collaborationSessions: 0,
      edgeDevices: 0,
      pricingOptimizations: 0,
    };

    // Blockchain Records (3)
    for (let i = 0; i < 3; i++) {
      await this.repository.createBlockchainRecord({
        vehicleId,
        garageId,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        blockNumber: 15000000 + i,
        recordType: ['service_completed', 'ownership_transfer', 'warranty_claim'][i % 3],
        recordData: { description: `Sample event ${i + 1}`, amount: 100 + i * 50 },
        timestamp: new Date(),
      } as never);
      results.blockchain++;
    }

    // AR Repair Guides (2)
    for (let i = 0; i < 2; i++) {
      await this.repository.createArRepairGuide({
        garageId,
        title: `${['Engine Repair', 'Brake Service'][i]} AR Guide`,
        vehicleMake: ['Toyota', 'Honda'][i],
        vehicleModel: ['Camry', 'Accord'][i],
        repairCategory: ['engine', 'brakes'][i],
        difficultyLevel: ['intermediate', 'beginner'][i],
        estimatedDuration: [60, 45][i],
        arModelUrl: `https://example.com/ar/model-${i + 1}.glb`,
        steps: [
          { stepNumber: 1, title: 'Preparation', instruction: 'Gather tools and materials' },
          { stepNumber: 2, title: 'Diagnosis', instruction: 'Identify the issue' },
          { stepNumber: 3, title: 'Repair', instruction: 'Perform the repair' },
        ],
        createdBy: userId,
      } as never);
      results.arGuides++;
    }

    // IoT Sensors (4)
    for (let i = 0; i < 4; i++) {
      await this.repository.createIotSensor({
        vehicleId,
        sensorType: ['temperature', 'pressure', 'vibration', 'fuel_level'][i],
        sensorIdentifier: `IOT-${Date.now()}-${i}`,
        manufacturer: 'SensorTech',
        installationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      } as never);
      results.iotSensors++;
    }

    // 3D Parts Models (3)
    for (let i = 0; i < 3; i++) {
      await this.repository.createParts3DModel({
        partName: ['Brake Rotor', 'Oil Filter', 'Air Filter'][i],
        partNumber: `PART-${2000 + i}`,
        manufacturer: 'AutoParts Inc',
        modelFileUrl: `https://example.com/3d/part-${i + 1}.glb`,
        textureFileUrl: `https://example.com/3d/thumb-${i + 1}.jpg`,
        fileSize: 5200 + i * 500,
        polygonCount: 10000 + i * 2000,
        category: 'Brake System',
        uploadedBy: userId,
      } as never);
      results.models3D++;
    }

    // Drone Inspections (2)
    for (let i = 0; i < 2; i++) {
      await this.repository.createDroneInspection({
        garageId,
        vehicleId,
        inspectionType: ['exterior_damage', 'roof_inspection'][i],
        pilotId: userId,
        flightDuration: (15 + i * 5) * 60,
        imageCount: 25 + i * 10,
        damageDetected: i === 0,
        aiAnalysisCompleted: true,
        inspectionStatus: 'completed',
        completedAt: new Date(),
      } as never);
      results.droneInspections++;
    }

    // AI Video Analysis (2)
    for (let i = 0; i < 2; i++) {
      await this.repository.createAiVideoAnalysis({
        vehicleId,
        videoUrl: `https://example.com/videos/analysis-${i + 1}.mp4`,
        triageCategory: ['damage_assessment', 'walkaround'][i],
        aiModel: 'GPT-5-Vision',
        detectedIssues: i === 0 ? ['Minor dent', 'Paint scratch'] : [],
        estimatedCost: i === 0 ? '350.00' : '0',
        confidence: '0.92',
        analysisStatus: 'completed',
      } as never);
      results.aiVideo++;
    }

    // Digital Twins (1)
    await this.repository.createDigitalTwin({
      vehicleId,
      lastSyncedAt: new Date(),
      dataPoints: 1250,
      predictedFailures: ['Brake pad wear in 2 months', 'Oil change due in 3 weeks'],
      performanceMetrics: { healthScore: 85 },
      twinStatus: 'active',
    } as never);
    results.digitalTwins++;

    // Fraud Detection Cases (2)
    for (let i = 0; i < 2; i++) {
      await this.repository.createFraudDetectionCase({
        garageId,
        caseType: ['invoice_manipulation', 'parts_theft'][i],
        detectedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        riskScore: ['75', '60'][i],
        detectionMethod: 'ml_algorithm',
        anomalyIndicators: i === 0 ? ['Unusual pricing', 'Multiple edits'] : ['Inventory mismatch'],
        status: 'investigating',
      } as never);
      results.fraudCases++;
    }

    // Biometric Profile (1)
    await this.repository.createBiometricProfile({
      userId,
      fingerprintHash: `FP-${Math.random().toString(36).substring(7).toUpperCase()}`,
      faceEmbedding: JSON.stringify(Array(128).fill(0).map(() => Math.random())),
      enrollmentDate: new Date(),
      lastVerified: new Date(),
      verificationCount: 42,
      failedAttempts: 2,
      isActive: true,
    } as never);
    results.biometricProfile = 1;

    // Collaboration Sessions (2)
    for (let i = 0; i < 2; i++) {
      await this.repository.createCollaborationSession({
        garageId,
        hostUserId: userId,
        sessionType: ['video_call', 'ar_annotation'][i],
        sessionStatus: 'completed',
        duration: (25 + i * 10) * 60,
        recordingUrl: `https://example.com/recordings/session-${i + 1}.mp4`,
        sharedNotes: i === 1 ? 'Annotation at (100,200): Check here' : undefined,
      } as never);
      results.collaborationSessions++;
    }

    // Edge Devices (3)
    for (let i = 0; i < 3; i++) {
      await this.repository.createEdgeDevice({
        garageId,
        deviceName: `Edge Gateway ${i + 1}`,
        deviceType: 'diagnostic_hub',
        deviceId: `EDGE-${Date.now()}-${i}`,
        ipAddress: `192.168.1.${100 + i}`,
        macAddress: `00:1B:44:11:3A:${(10 + i).toString(16).toUpperCase()}`,
        firmwareVersion: '2.1.0',
        status: 'online',
      } as never);
      results.edgeDevices++;
    }

    // Pricing Optimizations (2)
    for (let i = 0; i < 2; i++) {
      await this.repository.createPricingOptimization({
        garageId,
        optimizationType: 'dynamic_pricing',
        currentPrice: ['45.00', '220.00'][i],
        optimizedPrice: ['49.99', '199.99'][i],
        estimatedRevenueImpact: ['1250.00', '3500.00'][i],
        confidenceScore: '0.88',
        factors: {
          service: ['Oil Change', 'Brake Service'][i],
          drivers: ['Market demand', 'Competition', 'Time of day'],
        },
      } as never);
      results.pricingOptimizations++;
    }

    return results;
  }
}
