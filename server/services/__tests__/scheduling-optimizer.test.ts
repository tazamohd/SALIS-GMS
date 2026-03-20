import { describe, it, expect } from 'vitest';
import { optimizeSchedule, generateScheduleReport } from '../scheduling-optimizer';

describe('Scheduling Optimizer', () => {
  const technicians = [
    { id: '1', name: 'Ahmed', skills: ['oil_change', 'brakes'], currentLoad: 1, maxLoad: 5, availability: true, efficiency: 0.9 },
    { id: '2', name: 'Mohammed', skills: ['engine', 'transmission'], currentLoad: 3, maxLoad: 5, availability: true, efficiency: 0.7 },
    { id: '3', name: 'Ali', skills: ['oil_change', 'ac'], currentLoad: 0, maxLoad: 5, availability: false, efficiency: 0.85 },
  ];

  const jobs = [
    { id: 'j1', type: 'Oil Change', requiredSkills: ['oil_change'], estimatedHours: 1, priority: 'high' as const, vehicleInfo: 'Toyota' },
    { id: 'j2', type: 'Engine Repair', requiredSkills: ['engine'], estimatedHours: 4, priority: 'urgent' as const, vehicleInfo: 'BMW' },
    { id: 'j3', type: 'Brake Service', requiredSkills: ['brakes'], estimatedHours: 2, priority: 'medium' as const, vehicleInfo: 'Honda' },
  ];

  it('should assign all jobs to available technicians', () => {
    const assignments = optimizeSchedule(technicians, jobs);
    expect(assignments.length).toBe(3);
  });

  it('should not assign to unavailable technicians', () => {
    const assignments = optimizeSchedule(technicians, jobs);
    const aliAssigned = assignments.find(a => a.technicianId === '3');
    expect(aliAssigned).toBeUndefined();
  });

  it('should process urgent jobs first', () => {
    const assignments = optimizeSchedule(technicians, jobs);
    expect(assignments[0].jobId).toBe('j2'); // urgent first
  });

  it('should prefer skill-matched technicians', () => {
    const assignments = optimizeSchedule(technicians, jobs);
    const engineJob = assignments.find(a => a.jobId === 'j2');
    expect(engineJob?.technicianId).toBe('2'); // Mohammed has engine skill
  });

  it('should include score and reasons', () => {
    const assignments = optimizeSchedule(technicians, jobs);
    assignments.forEach(a => {
      expect(a.score).toBeGreaterThan(0);
      expect(a.reasons.length).toBeGreaterThan(0);
    });
  });

  it('should generate valid report', () => {
    const assignments = optimizeSchedule(technicians, jobs);
    const report = generateScheduleReport(technicians, assignments);
    expect(report.totalJobs).toBe(3);
    expect(report.averageScore).toBeGreaterThan(0);
    expect(report.technicianUtilization.length).toBe(3);
  });

  it('should handle empty jobs list', () => {
    const assignments = optimizeSchedule(technicians, []);
    expect(assignments.length).toBe(0);
  });

  it('should handle all technicians unavailable', () => {
    const unavailable = technicians.map(t => ({ ...t, availability: false }));
    const assignments = optimizeSchedule(unavailable, jobs);
    expect(assignments.length).toBe(0);
  });
});
