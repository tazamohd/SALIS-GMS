/**
 * SALIS AUTO - Saudi Arabia Labor Law Compliance Service
 * GOSI calculations, End of Service Benefits, Vacation, Saudization (Nitaqat)
 */

/** GOSI contribution rates (as of 2024 regulations) */
const GOSI_RATES = {
  saudi: { employer: 0.12, employee: 0.10 },    // 12% employer, 10% employee
  nonSaudi: { employer: 0.02, employee: 0.00 },  // 2% employer only for non-Saudi
};

export interface GOSIResult {
  baseSalary: number;
  employerContribution: number;
  employeeContribution: number;
  totalContribution: number;
  isSaudi: boolean;
}

/** Calculate GOSI contributions for an employee */
export function calculateGOSI(baseSalary: number, isSaudi: boolean = true): GOSIResult {
  const rates = isSaudi ? GOSI_RATES.saudi : GOSI_RATES.nonSaudi;
  const employerContribution = Math.round(baseSalary * rates.employer * 100) / 100;
  const employeeContribution = Math.round(baseSalary * rates.employee * 100) / 100;

  return {
    baseSalary,
    employerContribution,
    employeeContribution,
    totalContribution: employerContribution + employeeContribution,
    isSaudi,
  };
}

export type TerminationType = 'resignation' | 'termination' | 'expiry' | 'mutual';

export interface EndOfServiceResult {
  yearsOfService: number;
  lastSalary: number;
  terminationType: TerminationType;
  fullBenefit: number;
  payableBenefit: number;
  payablePercentage: number;
}

/**
 * Calculate End of Service Benefit per Saudi Labor Law (Article 84-86).
 * - First 5 years: half month salary per year
 * - After 5 years: full month salary per year
 * - Resignation <2 years: 0%, 2-5 years: 33%, 5-10 years: 66%, 10+: 100%
 * - Termination/expiry/mutual: 100%
 */
export function calculateEndOfService(
  startDate: Date,
  lastSalary: number,
  terminationType: TerminationType = 'termination',
): EndOfServiceResult {
  const now = new Date();
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const yearsOfService = (now.getTime() - startDate.getTime()) / msPerYear;

  // Calculate full benefit
  let fullBenefit = 0;
  if (yearsOfService <= 5) {
    fullBenefit = (lastSalary / 2) * yearsOfService;
  } else {
    fullBenefit = (lastSalary / 2) * 5 + lastSalary * (yearsOfService - 5);
  }
  fullBenefit = Math.round(fullBenefit * 100) / 100;

  // Determine payable percentage based on termination type
  let payablePercentage = 100;
  if (terminationType === 'resignation') {
    if (yearsOfService < 2) payablePercentage = 0;
    else if (yearsOfService < 5) payablePercentage = 33;
    else if (yearsOfService < 10) payablePercentage = 66;
    else payablePercentage = 100;
  }

  const payableBenefit = Math.round(fullBenefit * (payablePercentage / 100) * 100) / 100;

  return {
    yearsOfService: Math.round(yearsOfService * 100) / 100,
    lastSalary,
    terminationType,
    fullBenefit,
    payableBenefit,
    payablePercentage,
  };
}

export interface VacationBalance {
  yearsOfService: number;
  annualEntitlement: number;
  description: string;
}

/**
 * Calculate vacation balance per Saudi Labor Law (Article 109).
 * - First 5 years: 21 days annual leave
 * - After 5 years: 30 days annual leave
 */
export function calculateVacationBalance(startDate: Date): VacationBalance {
  const now = new Date();
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const yearsOfService = (now.getTime() - startDate.getTime()) / msPerYear;

  const annualEntitlement = yearsOfService > 5 ? 30 : 21;

  return {
    yearsOfService: Math.round(yearsOfService * 100) / 100,
    annualEntitlement,
    description: yearsOfService > 5
      ? '30 days (5+ years of service)'
      : '21 days (under 5 years of service)',
  };
}

export type NitaqatBand = 'platinum' | 'green' | 'yellow' | 'red';

export interface NitaqatResult {
  totalEmployees: number;
  saudiEmployees: number;
  ratio: number;
  band: NitaqatBand;
  target: number;
  isCompliant: boolean;
}

/** Check Nitaqat (Saudization) compliance band */
export function checkNitaqat(totalEmployees: number, saudiEmployees: number): NitaqatResult {
  const ratio = totalEmployees > 0 ? Math.round((saudiEmployees / totalEmployees) * 100) : 0;

  let band: NitaqatBand;
  if (ratio >= 40) band = 'platinum';
  else if (ratio >= 30) band = 'green';
  else if (ratio >= 20) band = 'yellow';
  else band = 'red';

  return {
    totalEmployees,
    saudiEmployees,
    ratio,
    band,
    target: 30, // Minimum for green band (auto repair sector)
    isCompliant: ratio >= 30,
  };
}
