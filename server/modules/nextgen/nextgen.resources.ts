/**
 * Next-gen resource catalogue (Phase E). The thirty `/api/nextgen/*` showcase
 * resources are structurally identical — a garage-scoped list (GET) and a
 * Zod-validated create (POST) — so they are described once here as data and the
 * controller/repository generate the handlers + storage dispatch from this
 * table. Each entry keeps the resource's exact path, storage method names, Zod
 * insert schema, and the verbatim legacy `{ error }` 500 strings.
 */

import {
  insertNeuralDiagnosticSchema,
  insertNeuralTrainingSessionSchema,
  insertVisionQualityCheckSchema,
  insertVisionDefectSchema,
  insertNLPServiceRequestSchema,
  insertNLPTrainingDataSchema,
  insertRLPartsOptimizationSchema,
  insertRLLearningEpisodeSchema,
  insertMetaverseShowroomSchema,
  insertMetaverseVisitSchema,
  insertHolographicGuideSchema,
  insertHolographicSessionSchema,
  insertSpatialWorkstationSchema,
  insertSpatialDiagnosticSessionSchema,
  insertAutonomousRobotSchema,
  insertRobotTaskSchema,
  insertDroneFleetSchema,
  insertDroneMissionSchema,
  insertSmartContractSchema,
  insertContractEventSchema,
  insertCarbonCreditSchema,
  insertCarbonEmissionSchema,
  insertGreenEnergyAssetSchema,
  insertEVChargingStationSchema,
  insertRecycledPartSchema,
  insertSustainabilityMetricSchema,
  insertSatelliteConnectionSchema,
  insertSatelliteUsageLogSchema,
  insertQuantumEncryptionKeySchema,
  insertQuantumSecureMessageSchema,
} from '@shared/schema';
import type { ZodTypeAny } from 'zod';

export interface NextGenResource {
  path: string;
  get: string;
  create: string;
  schema: ZodTypeAny;
  fetchErr: string;
  createErr: string;
}

export const NEXTGEN_RESOURCES: NextGenResource[] = [
  { path: 'neural-diagnostics', get: 'getNeuralDiagnostics', create: 'createNeuralDiagnostic', schema: insertNeuralDiagnosticSchema, fetchErr: 'Failed to fetch neural diagnostics', createErr: 'Failed to create neural diagnostic' },
  { path: 'neural-training-sessions', get: 'getNeuralTrainingSessions', create: 'createNeuralTrainingSession', schema: insertNeuralTrainingSessionSchema, fetchErr: 'Failed to fetch neural training sessions', createErr: 'Failed to create neural training session' },
  { path: 'vision-quality-checks', get: 'getVisionQualityChecks', create: 'createVisionQualityCheck', schema: insertVisionQualityCheckSchema, fetchErr: 'Failed to fetch vision quality checks', createErr: 'Failed to create vision quality check' },
  { path: 'vision-defects', get: 'getVisionDefects', create: 'createVisionDefect', schema: insertVisionDefectSchema, fetchErr: 'Failed to fetch vision defects', createErr: 'Failed to create vision defect' },
  { path: 'nlp-service-requests', get: 'getNLPServiceRequests', create: 'createNLPServiceRequest', schema: insertNLPServiceRequestSchema, fetchErr: 'Failed to fetch NLP service requests', createErr: 'Failed to create NLP service request' },
  { path: 'nlp-training-data', get: 'getNLPTrainingData', create: 'createNLPTrainingData', schema: insertNLPTrainingDataSchema, fetchErr: 'Failed to fetch NLP training data', createErr: 'Failed to create NLP training data' },
  { path: 'rl-parts-optimizations', get: 'getRLPartsOptimizations', create: 'createRLPartsOptimization', schema: insertRLPartsOptimizationSchema, fetchErr: 'Failed to fetch RL parts optimizations', createErr: 'Failed to create RL parts optimization' },
  { path: 'rl-learning-episodes', get: 'getRLLearningEpisodes', create: 'createRLLearningEpisode', schema: insertRLLearningEpisodeSchema, fetchErr: 'Failed to fetch RL learning episodes', createErr: 'Failed to create RL learning episode' },
  { path: 'metaverse-showrooms', get: 'getMetaverseShowrooms', create: 'createMetaverseShowroom', schema: insertMetaverseShowroomSchema, fetchErr: 'Failed to fetch metaverse showrooms', createErr: 'Failed to create metaverse showroom' },
  { path: 'metaverse-visits', get: 'getMetaverseVisits', create: 'createMetaverseVisit', schema: insertMetaverseVisitSchema, fetchErr: 'Failed to fetch metaverse visits', createErr: 'Failed to create metaverse visit' },
  { path: 'holographic-guides', get: 'getHolographicGuides', create: 'createHolographicGuide', schema: insertHolographicGuideSchema, fetchErr: 'Failed to fetch holographic guides', createErr: 'Failed to create holographic guide' },
  { path: 'holographic-sessions', get: 'getHolographicSessions', create: 'createHolographicSession', schema: insertHolographicSessionSchema, fetchErr: 'Failed to fetch holographic sessions', createErr: 'Failed to create holographic session' },
  { path: 'spatial-workstations', get: 'getSpatialWorkstations', create: 'createSpatialWorkstation', schema: insertSpatialWorkstationSchema, fetchErr: 'Failed to fetch spatial workstations', createErr: 'Failed to create spatial workstation' },
  { path: 'spatial-diagnostic-sessions', get: 'getSpatialDiagnosticSessions', create: 'createSpatialDiagnosticSession', schema: insertSpatialDiagnosticSessionSchema, fetchErr: 'Failed to fetch spatial diagnostic sessions', createErr: 'Failed to create spatial diagnostic session' },
  { path: 'autonomous-robots', get: 'getAutonomousRobots', create: 'createAutonomousRobot', schema: insertAutonomousRobotSchema, fetchErr: 'Failed to fetch autonomous robots', createErr: 'Failed to create autonomous robot' },
  { path: 'robot-tasks', get: 'getRobotTasks', create: 'createRobotTask', schema: insertRobotTaskSchema, fetchErr: 'Failed to fetch robot tasks', createErr: 'Failed to create robot task' },
  { path: 'drone-fleets', get: 'getDroneFleets', create: 'createDroneFleet', schema: insertDroneFleetSchema, fetchErr: 'Failed to fetch drone fleets', createErr: 'Failed to create drone fleet' },
  { path: 'drone-missions', get: 'getDroneMissions', create: 'createDroneMission', schema: insertDroneMissionSchema, fetchErr: 'Failed to fetch drone missions', createErr: 'Failed to create drone mission' },
  { path: 'smart-contracts', get: 'getSmartContracts', create: 'createSmartContract', schema: insertSmartContractSchema, fetchErr: 'Failed to fetch smart contracts', createErr: 'Failed to create smart contract' },
  { path: 'contract-events', get: 'getContractEvents', create: 'createContractEvent', schema: insertContractEventSchema, fetchErr: 'Failed to fetch contract events', createErr: 'Failed to create contract event' },
  { path: 'carbon-credits', get: 'getCarbonCredits', create: 'createCarbonCredit', schema: insertCarbonCreditSchema, fetchErr: 'Failed to fetch carbon credits', createErr: 'Failed to create carbon credit' },
  { path: 'carbon-emissions', get: 'getCarbonEmissions', create: 'createCarbonEmission', schema: insertCarbonEmissionSchema, fetchErr: 'Failed to fetch carbon emissions', createErr: 'Failed to create carbon emission' },
  { path: 'green-energy-assets', get: 'getGreenEnergyAssets', create: 'createGreenEnergyAsset', schema: insertGreenEnergyAssetSchema, fetchErr: 'Failed to fetch green energy assets', createErr: 'Failed to create green energy asset' },
  { path: 'ev-charging-stations', get: 'getEVChargingStations', create: 'createEVChargingStation', schema: insertEVChargingStationSchema, fetchErr: 'Failed to fetch EV charging stations', createErr: 'Failed to create EV charging station' },
  { path: 'recycled-parts', get: 'getRecycledParts', create: 'createRecycledPart', schema: insertRecycledPartSchema, fetchErr: 'Failed to fetch recycled parts', createErr: 'Failed to create recycled part' },
  { path: 'sustainability-metrics', get: 'getSustainabilityMetrics', create: 'createSustainabilityMetric', schema: insertSustainabilityMetricSchema, fetchErr: 'Failed to fetch sustainability metrics', createErr: 'Failed to create sustainability metric' },
  { path: 'satellite-connections', get: 'getSatelliteConnections', create: 'createSatelliteConnection', schema: insertSatelliteConnectionSchema, fetchErr: 'Failed to fetch satellite connections', createErr: 'Failed to create satellite connection' },
  { path: 'satellite-usage-logs', get: 'getSatelliteUsageLogs', create: 'createSatelliteUsageLog', schema: insertSatelliteUsageLogSchema, fetchErr: 'Failed to fetch satellite usage logs', createErr: 'Failed to create satellite usage log' },
  { path: 'quantum-encryption-keys', get: 'getQuantumEncryptionKeys', create: 'createQuantumEncryptionKey', schema: insertQuantumEncryptionKeySchema, fetchErr: 'Failed to fetch quantum encryption keys', createErr: 'Failed to create quantum encryption key' },
  { path: 'quantum-secure-messages', get: 'getQuantumSecureMessages', create: 'createQuantumSecureMessage', schema: insertQuantumSecureMessageSchema, fetchErr: 'Failed to fetch quantum secure messages', createErr: 'Failed to create quantum secure message' },
];
