import { describe, it, expect } from 'vitest';
import { calculateGOSI, calculateEndOfService, calculateVacationBalance, checkNitaqat } from '../server/services/saudi-compliance';

describe('GOSI Calculations', () => {
  it('calculates Saudi employee contributions correctly', () => {
    // 2024+ standard GOSI rates: 11.75% employer + 9.75% employee (the audit
    // flagged the old hard-coded rates as wrong). Rates are now DB-driven via
    // gosi_config; this asserts the seeded default.
    const result = calculateGOSI(10000, true);
    expect(result.employerContribution).toBe(1175); // 11.75%
    expect(result.employeeContribution).toBe(975);  // 9.75%
    expect(result.totalContribution).toBe(2150);
  });

  it('calculates non-Saudi employee contributions correctly', () => {
    const result = calculateGOSI(10000, false);
    expect(result.employerContribution).toBe(200); // 2%
    expect(result.employeeContribution).toBe(0);
    expect(result.totalContribution).toBe(200);
  });
});

describe('End of Service Benefit', () => {
  it('calculates benefit for termination after 3 years', () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);
    const result = calculateEndOfService(startDate, 10000, 'termination');
    expect(result.payablePercentage).toBe(100);
    // 3 years * half month = 15000
    expect(result.fullBenefit).toBeCloseTo(15000, -2);
  });

  it('gives 0% for resignation under 2 years', () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const result = calculateEndOfService(startDate, 10000, 'resignation');
    expect(result.payablePercentage).toBe(0);
  });
});

describe('Vacation Balance', () => {
  it('gives 21 days for under 5 years service', () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);
    const result = calculateVacationBalance(startDate);
    expect(result.annualEntitlement).toBe(21);
  });

  it('gives 30 days for over 5 years service', () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 7);
    const result = calculateVacationBalance(startDate);
    expect(result.annualEntitlement).toBe(30);
  });
});

describe('Nitaqat Compliance', () => {
  it('returns green band for 35% Saudization', () => {
    const result = checkNitaqat(100, 35);
    expect(result.band).toBe('green');
    expect(result.isCompliant).toBe(true);
  });

  it('returns red band for 10% Saudization', () => {
    const result = checkNitaqat(100, 10);
    expect(result.band).toBe('red');
    expect(result.isCompliant).toBe(false);
  });
});
