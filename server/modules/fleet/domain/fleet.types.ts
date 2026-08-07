/**
 * Fleet domain types + shared shaping helpers (Phase E1).
 *
 * The account/vehicle view mappers and the deterministic cost-trend fixture are
 * lifted verbatim from the legacy `server/routes/fleet.ts` so the migrated
 * module returns byte-for-byte identical JSON.
 */

/** Shape a fleet-account row + computed counts into the JSON the UI expects. */
export function enrichAccount(account: any, vehicles: any[]) {
  const own = vehicles.filter((v: any) => v.fleetAccountId === account.id);
  const activeJobs = own.filter(
    (v: any) => v.status === 'in_service' || v.status === 'scheduled',
  ).length;
  return {
    id: account.id,
    companyName: account.companyName,
    contactPerson: account.contactPerson,
    contactEmail: account.contactEmail,
    contactPhone: account.contactPhone,
    contractStatus: account.contractStatus,
    contractStart: account.contractStart,
    contractEnd: account.contractEnd,
    monthlySpend: Number(account.monthlySpend) || 0,
    totalSpend: Number(account.totalSpend) || 0,
    discountPercentage: account.discountPercentage,
    paymentTerms: account.paymentTerms,
    notes: account.notes,
    createdAt:
      account.createdAt instanceof Date ? account.createdAt.toISOString() : account.createdAt,
    vehicleCount: own.length,
    activeJobs,
  };
}

export function viewVehicle(v: any, account?: any) {
  return {
    id: v.id,
    fleetAccountId: v.fleetAccountId,
    plateNumber: v.plateNumber,
    make: v.make,
    model: v.model,
    year: v.year,
    vin: v.vin,
    status: v.status,
    mileage: v.mileage,
    lastServiceDate: v.lastServiceDate,
    lastServiceType: v.lastServiceType,
    nextServiceDue: v.nextServiceDue,
    nextServiceType: v.nextServiceType,
    avgMonthlyCost: Number(v.avgMonthlyCost) || 0,
    totalSpend: Number(v.totalSpend) || 0,
    companyName: account?.companyName || 'Unknown',
  };
}

/** Deterministic 6-month cost trend (kept index-driven, no Date/random). */
export function buildCostTrend() {
  const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
  return months.map((month, i) => ({
    month,
    totalCost: Math.round(18000 + i * 1500),
    vehiclesServiced: 4 + i,
  }));
}
