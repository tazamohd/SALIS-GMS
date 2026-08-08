import { describe, it, expect, vi } from 'vitest';
import { EmergingTechService } from '../services/emerging-tech.service';
import { ValidationError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  const creates = [
    'createBlockchainRecord', 'createArRepairGuide', 'createIotSensor', 'createParts3DModel',
    'createDroneInspection', 'createAiVideoAnalysis', 'createDigitalTwin', 'createFraudDetectionCase',
    'createBiometricProfile', 'createCollaborationSession', 'createEdgeDevice', 'createPricingOptimization',
  ];
  const base: Record<string, unknown> = {
    getVehicles: vi.fn(async () => [{ id: 'v1' }]),
    getBlockchainRecords: vi.fn(async () => [{ id: 'b1' }]),
    getArRepairGuides: vi.fn(async () => [{ id: 'g1' }]),
    getIotSensors: vi.fn(async () => [{ id: 's1' }]),
    getIoTSensorReadings: vi.fn(async () => [{ id: 'r1' }]),
    getParts3DModels: vi.fn(async () => [{ id: 'm1' }]),
    getDroneInspections: vi.fn(async () => [{ id: 'd1' }]),
    getAiVideoAnalyses: vi.fn(async () => [{ id: 'a1' }]),
    getDigitalTwins: vi.fn(async () => [{ id: 't1' }]),
    getFraudDetectionCases: vi.fn(async () => [{ id: 'f1' }]),
    getBiometricProfile: vi.fn(async () => ({ id: 'p1' })),
    getCollaborationSessions: vi.fn(async () => [{ id: 'c1' }]),
    getEdgeDevices: vi.fn(async () => [{ id: 'e1' }]),
    getEdgeDiagnostics: vi.fn(async () => [{ id: 'ed1' }]),
    getPricingOptimizations: vi.fn(async () => [{ id: 'po1' }]),
  };
  for (const m of creates) base[m] = vi.fn(async () => ({ id: 'x' }));
  return { ...base, ...o };
}

describe('EmergingTechService — reads', () => {
  it('passes the blockchain vehicleId + garageId through', async () => {
    const r = repo();
    await new EmergingTechService(r as never).blockchain('v9', 'g1');
    expect(r.getBlockchainRecords).toHaveBeenCalledWith('v9', 'g1');
  });
  it('falls back to an empty object for an absent biometric profile', async () => {
    const r = repo({ getBiometricProfile: vi.fn(async () => null) });
    expect(await new EmergingTechService(r as never).biometricProfile('u1')).toEqual({});
  });
  it('returns the biometric profile when present', async () => {
    expect(await new EmergingTechService(repo() as never).biometricProfile('u1')).toEqual({ id: 'p1' });
  });
});

describe('EmergingTechService — seed', () => {
  it('400s when the garage has no vehicle', async () => {
    const r = repo({ getVehicles: vi.fn(async () => []) });
    await expect(new EmergingTechService(r as never).seed('g1', 'u1')).rejects.toBeInstanceOf(ValidationError);
  });
  it('seeds every showcase area off the first vehicle and returns the counts', async () => {
    const r = repo();
    const results = await new EmergingTechService(r as never).seed('g1', 'u1');
    expect(results).toEqual({
      blockchain: 3,
      arGuides: 2,
      iotSensors: 4,
      models3D: 3,
      droneInspections: 2,
      aiVideo: 2,
      digitalTwins: 1,
      fraudCases: 2,
      biometricProfile: 1,
      collaborationSessions: 2,
      edgeDevices: 3,
      pricingOptimizations: 2,
    });
    expect(r.createBlockchainRecord).toHaveBeenCalledTimes(3);
    expect(r.createIotSensor).toHaveBeenCalledTimes(4);
    expect(r.createDigitalTwin).toHaveBeenCalledTimes(1);
    // fixtures hang off the resolved vehicle
    const firstBlock = (r.createBlockchainRecord as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(firstBlock.vehicleId).toBe('v1');
  });
});
