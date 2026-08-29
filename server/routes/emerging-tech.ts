import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

// ==========================================
// EMERGING TECHNOLOGIES ROUTES
// ==========================================

// Blockchain Vehicle History
router.get('/emerging-tech/blockchain', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const garageId = (req as any).user?.garageId;
    const records = await storage.getBlockchainRecords(vehicleId, garageId);
    res.json(records);
  } catch (error) {
    console.error("Error fetching blockchain records:", error);
    res.status(500).json({ message: "Failed to fetch blockchain records" });
  }
});

// AR Repair Guides
router.get('/emerging-tech/ar-guides', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const garageId = (req as any).user?.garageId;
    const guides = await storage.getArRepairGuides(garageId);
    res.json(guides);
  } catch (error) {
    console.error("Error fetching AR guides:", error);
    res.status(500).json({ message: "Failed to fetch AR guides" });
  }
});

// IoT Sensors
router.get('/emerging-tech/iot-sensors', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const sensors = await storage.getIotSensors(vehicleId);
    res.json(sensors);
  } catch (error) {
    console.error("Error fetching IoT sensors:", error);
    res.status(500).json({ message: "Failed to fetch IoT sensors" });
  }
});

// IoT Sensor Readings
router.get('/emerging-tech/iot-readings', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const sensorId = req.query.sensorId as string | undefined;
    const vehicleId = req.query.vehicleId as string | undefined;
    const readings = await storage.getIoTSensorReadings(sensorId, vehicleId);
    res.json(readings);
  } catch (error) {
    console.error("Error fetching IoT readings:", error);
    res.status(500).json({ message: "Failed to fetch IoT readings" });
  }
});

// 3D Parts Models
router.get('/emerging-tech/3d-models', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const garageId = (req as any).user?.garageId;
    const models = await storage.getParts3DModels(garageId);
    res.json(models);
  } catch (error) {
    console.error("Error fetching 3D models:", error);
    res.status(500).json({ message: "Failed to fetch 3D models" });
  }
});

// Drone Inspections
router.get('/emerging-tech/drone-inspections', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const garageId = (req as any).user?.garageId;
    const inspections = await storage.getDroneInspections(garageId, vehicleId);
    res.json(inspections);
  } catch (error) {
    console.error("Error fetching drone inspections:", error);
    res.status(500).json({ message: "Failed to fetch drone inspections" });
  }
});

// AI Video Analysis
router.get('/emerging-tech/ai-video', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const customerId = req.query.customerId as string | undefined;
    const vehicleId = req.query.vehicleId as string | undefined;
    const analyses = await storage.getAiVideoAnalyses(customerId, vehicleId);
    res.json(analyses);
  } catch (error) {
    console.error("Error fetching AI video analyses:", error);
    res.status(500).json({ message: "Failed to fetch AI video analyses" });
  }
});

// Digital Twins
router.get('/emerging-tech/digital-twins', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const twins = await storage.getDigitalTwins(vehicleId);
    res.json(twins);
  } catch (error) {
    console.error("Error fetching digital twins:", error);
    res.status(500).json({ message: "Failed to fetch digital twins" });
  }
});

// Fraud Detection
router.get('/emerging-tech/fraud-cases', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const riskLevel = req.query.riskLevel as string | undefined;
    const garageId = (req as any).user?.garageId;
    const cases = await storage.getFraudDetectionCases(garageId, riskLevel);
    res.json(cases);
  } catch (error) {
    console.error("Error fetching fraud cases:", error);
    res.status(500).json({ message: "Failed to fetch fraud cases" });
  }
});

// Biometric Profiles
router.get('/emerging-tech/biometric-profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'default-user';
    const profile = await storage.getBiometricProfile(userId);
    res.json(profile || {});
  } catch (error) {
    console.error("Error fetching biometric profile:", error);
    res.status(500).json({ message: "Failed to fetch biometric profile" });
  }
});

// Collaboration Sessions
router.get('/emerging-tech/collaboration-sessions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const garageId = (req as any).user?.garageId;
    const sessions = await storage.getCollaborationSessions(garageId, status);
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching collaboration sessions:", error);
    res.status(500).json({ message: "Failed to fetch collaboration sessions" });
  }
});

// Edge Devices
router.get('/emerging-tech/edge-devices', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const garageId = (req as any).user?.garageId;
    const devices = await storage.getEdgeDevices(garageId);
    res.json(devices);
  } catch (error) {
    console.error("Error fetching edge devices:", error);
    res.status(500).json({ message: "Failed to fetch edge devices" });
  }
});

// Edge Diagnostics
router.get('/emerging-tech/edge-diagnostics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const deviceId = req.query.deviceId as string | undefined;
    const vehicleId = req.query.vehicleId as string | undefined;
    const diagnostics = await storage.getEdgeDiagnostics(deviceId, vehicleId);
    res.json(diagnostics);
  } catch (error) {
    console.error("Error fetching edge diagnostics:", error);
    res.status(500).json({ message: "Failed to fetch edge diagnostics" });
  }
});

// Pricing Optimization
router.get('/emerging-tech/pricing-optimization', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const serviceType = req.query.serviceType as string | undefined;
    const garageId = (req as any).user?.garageId;
    const optimizations = await storage.getPricingOptimizations(garageId, serviceType);
    res.json(optimizations);
  } catch (error) {
    console.error("Error fetching pricing optimizations:", error);
    res.status(500).json({ message: "Failed to fetch pricing optimizations" });
  }
});

// Seed sample data for Emerging Technologies
router.post('/emerging-tech/seed', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const garageId = (req as any).user?.garageId;
    const userId = (req as any).user?.id || 'default-user';

    // Get first vehicle for testing (or use a sample vehicle ID)
    const vehicles = await storage.getVehicles(garageId);
    const vehicleId = vehicles[0]?.id || 'sample-vehicle-id';

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
      pricingOptimizations: 0
    };

    // Seed Blockchain Records (3 records)
    for (let i = 0; i < 3; i++) {
      await storage.createBlockchainRecord({
        vehicleId,
        garageId,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        blockNumber: 15000000 + i,
        eventType: ['service_completed', 'ownership_transfer', 'warranty_claim'][i % 3],
        eventData: { description: `Sample event ${i + 1}`, amount: 100 + i * 50 },
        verified: true,
      } as any);
      results.blockchain++;
    }

    // Seed AR Repair Guides (2 guides)
    for (let i = 0; i < 2; i++) {
      await storage.createArRepairGuide({
        garageId,
        guideName: `${['Engine Repair', 'Brake Service'][i]} AR Guide`,
        description: `Step-by-step AR instructions for ${['engine repair', 'brake service'][i]}`,
        targetVehicleModels: ['Toyota Camry', 'Honda Accord'],
        difficultyLevel: ['intermediate', 'beginner'][i],
        estimatedDuration: [60, 45][i],
        arModelUrl: `https://example.com/ar/model-${i + 1}.glb`,
        steps: [
          { stepNumber: 1, title: 'Preparation', instruction: 'Gather tools and materials' },
          { stepNumber: 2, title: 'Diagnosis', instruction: 'Identify the issue' },
          { stepNumber: 3, title: 'Repair', instruction: 'Perform the repair' }
        ],
        createdBy: userId,
      } as any);
      results.arGuides++;
    }

    // Seed IoT Sensors (4 sensors)
    for (let i = 0; i < 4; i++) {
      await storage.createIotSensor({
        vehicleId,
        sensorType: ['temperature', 'pressure', 'vibration', 'fuel_level'][i],
        sensorId: `IOT-${1000 + i}`,
        manufacturer: 'SensorTech',
        installDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        calibrationDate: new Date().toISOString(),
        status: 'active',
      } as any);
      results.iotSensors++;
    }

    // Seed 3D Parts Models (3 models)
    for (let i = 0; i < 3; i++) {
      await storage.createParts3DModel({
        garageId,
        partName: ['Brake Rotor', 'Oil Filter', 'Air Filter'][i],
        partNumber: `PART-${2000 + i}`,
        manufacturer: 'AutoParts Inc',
        modelUrl: `https://example.com/3d/part-${i + 1}.glb`,
        thumbnailUrl: `https://example.com/3d/thumb-${i + 1}.jpg`,
        fileSize: 5.2 + i * 0.5,
        polygonCount: 10000 + i * 2000,
        category: 'Brake System',
      } as any);
      results.models3D++;
    }

    // Seed Drone Inspections (2 inspections)
    for (let i = 0; i < 2; i++) {
      await storage.createDroneInspection({
        garageId,
        vehicleId,
        inspectionType: ['exterior_damage', 'roof_inspection'][i],
        pilotName: 'John Pilot',
        flightDuration: 15 + i * 5,
        capturedImages: 25 + i * 10,
        aiAnalysisResults: { damageDetected: i === 0, confidence: 0.95, issues: i === 0 ? ['Dent on hood', 'Scratch on door'] : [] },
        status: 'completed',
      } as any);
      results.droneInspections++;
    }

    // Seed AI Video Analysis (2 analyses)
    for (let i = 0; i < 2; i++) {
      await storage.createAiVideoAnalysis({
        customerId: userId,
        vehicleId,
        videoUrl: `https://example.com/videos/analysis-${i + 1}.mp4`,
        analysisType: ['damage_assessment', 'walkaround'][i],
        aiModel: 'GPT-5-Vision',
        detectedIssues: i === 0 ? ['Minor dent', 'Paint scratch'] : [],
        estimatedCost: i === 0 ? 350.00 : 0,
        confidence: 0.92,
        status: 'completed',
      } as any);
      results.aiVideo++;
    }

    // Seed Digital Twins (1 twin)
    await storage.createDigitalTwin({
      vehicleId,
      twinName: `Digital Twin - ${vehicleId.substring(0, 8)}`,
      lastSyncTime: new Date().toISOString(),
      sensorDataPoints: 1250,
      predictedIssues: ['Brake pad wear in 2 months', 'Oil change due in 3 weeks'],
      healthScore: 85,
      status: 'active',
    } as any);
    results.digitalTwins++;

    // Seed Fraud Detection Cases (2 cases)
    for (let i = 0; i < 2; i++) {
      await storage.createFraudDetectionCase({
        garageId,
        caseType: ['invoice_manipulation', 'parts_theft'][i],
        detectedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        riskScore: [75, 60][i],
        mlModel: 'FraudDetector-v2',
        indicators: i === 0 ? ['Unusual pricing', 'Multiple edits'] : ['Inventory mismatch'],
        status: 'investigating',
      } as any);
      results.fraudCases++;
    }

    // Seed Biometric Profile (1 profile)
    await storage.createBiometricProfile({
      userId,
      fingerprintHash: `FP-${Math.random().toString(36).substring(7).toUpperCase()}`,
      faceEmbedding: Array(128).fill(0).map(() => Math.random()),
      enrolledAt: new Date().toISOString(),
      lastAuthAt: new Date().toISOString(),
      authSuccessCount: 42,
      authFailureCount: 2,
      status: 'active',
    } as any);
    results.biometricProfile = 1;

    // Seed Collaboration Sessions (2 sessions)
    for (let i = 0; i < 2; i++) {
      await storage.createCollaborationSession({
        garageId,
        jobCardId: 'sample-job-' + i,
        technicianId: userId,
        sessionType: ['video_call', 'ar_annotation'][i],
        duration: 25 + i * 10,
        recordingUrl: `https://example.com/recordings/session-${i + 1}.mp4`,
        annotations: i === 1 ? [{ x: 100, y: 200, note: 'Check here' }] : [],
      } as any);
      results.collaborationSessions++;
    }

    // Seed Edge Devices (3 devices)
    for (let i = 0; i < 3; i++) {
      await storage.createEdgeDevice({
        garageId,
        deviceName: `Edge Gateway ${i + 1}`,
        deviceType: 'diagnostic_hub',
        ipAddress: `192.168.1.${100 + i}`,
        macAddress: `00:1B:44:11:3A:${(10 + i).toString(16).toUpperCase()}`,
        firmwareVersion: '2.1.0',
        status: 'online',
      } as any);
      results.edgeDevices++;
    }

    // Seed Pricing Optimizations (2 optimizations)
    for (let i = 0; i < 2; i++) {
      await storage.createPricingOptimization({
        garageId,
        optimizationType: 'dynamic_pricing',
        targetService: ['Oil Change', 'Brake Service'][i],
        currentPrice: [45.00, 220.00][i],
        optimizedPrice: [49.99, 199.99][i],
        expectedRevenue: [1250.00, 3500.00][i],
        confidence: 0.88,
        factors: ['Market demand', 'Competition', 'Time of day'],
      } as any);
      results.pricingOptimizations++;
    }

    res.json({
      message: 'Sample data seeded successfully!',
      results
    });
  } catch (error) {
    console.error("Error seeding emerging tech data:", error);
    res.status(500).json({ message: "Failed to seed data", error: String(error) });
  }
});

export const emergingTechRoutes = router;
