import { db } from '../db';
import { sql } from 'drizzle-orm';

interface ServicePrediction {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  predictions: {
    serviceType: string;
    predictedDate: string;
    confidence: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    basedOn: string;
    estimatedCost: number;
  }[];
}

// Standard service intervals in km
const SERVICE_INTERVALS: Record<string, { km: number; months: number; avgCost: number }> = {
  'Oil Change': { km: 5000, months: 6, avgCost: 150 },
  'Brake Inspection': { km: 20000, months: 12, avgCost: 300 },
  'Tire Rotation': { km: 10000, months: 8, avgCost: 100 },
  'Air Filter': { km: 15000, months: 12, avgCost: 80 },
  'Transmission Service': { km: 50000, months: 24, avgCost: 500 },
  'Coolant Flush': { km: 40000, months: 24, avgCost: 200 },
  'Battery Check': { km: 30000, months: 18, avgCost: 250 },
  'AC Service': { km: 20000, months: 12, avgCost: 350 },
};

export async function predictMaintenance(garageId: string): Promise<ServicePrediction[]> {
  // Get vehicles with their service history
  const vehicles = await db.execute(sql`
    SELECT v.id, v.make, v.model, v.year, v."licensePlate", v."currentMileage",
      json_agg(json_build_object(
        'description', j.description, 'completedAt', j."completedAt", 'totalCost', j."totalCost"
      ) ORDER BY j."completedAt" DESC) as "serviceHistory"
    FROM vehicles v
    LEFT JOIN job_cards j ON j."vehicleId" = v.id AND j.status = 'completed'
    WHERE v."garageId" = ${garageId}
    GROUP BY v.id
    LIMIT 50
  `);

  const predictions: ServicePrediction[] = [];

  for (const vehicle of (vehicles.rows || []) as any[]) {
    const vehiclePredictions: ServicePrediction['predictions'] = [];
    const mileage = Number(vehicle.currentMileage || 0);
    const history = vehicle.serviceHistory || [];

    for (const [serviceType, interval] of Object.entries(SERVICE_INTERVALS)) {
      // Find last time this service was done
      const lastService = history.find((h: any) =>
        h.description && h.description.toLowerCase().includes(serviceType.toLowerCase())
      );

      const now = new Date();
      let predictedDate: Date;
      let confidence = 0.7;
      let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';

      if (lastService?.completedAt) {
        const lastDate = new Date(lastService.completedAt);
        const monthsSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        const monthsUntilDue = interval.months - monthsSince;

        predictedDate = new Date(now.getTime() + monthsUntilDue * 30 * 24 * 60 * 60 * 1000);
        confidence = 0.85;

        if (monthsUntilDue <= 0) { urgency = 'critical'; }
        else if (monthsUntilDue <= 1) { urgency = 'high'; }
        else if (monthsUntilDue <= 3) { urgency = 'medium'; }
      } else {
        // No history - predict based on mileage
        const kmUntilDue = interval.km - (mileage % interval.km);
        const monthsEstimate = kmUntilDue / (mileage > 0 ? mileage / 12 : 1500);
        predictedDate = new Date(now.getTime() + Math.max(monthsEstimate, 0.5) * 30 * 24 * 60 * 60 * 1000);
        confidence = 0.5;
        if (mileage % interval.km > interval.km * 0.9) urgency = 'high';
        else if (mileage % interval.km > interval.km * 0.7) urgency = 'medium';
      }

      vehiclePredictions.push({
        serviceType,
        predictedDate: predictedDate.toISOString().split('T')[0],
        confidence: Math.round(confidence * 100) / 100,
        urgency,
        basedOn: lastService ? 'Service history + mileage analysis' : 'Mileage-based estimation',
        estimatedCost: interval.avgCost,
      });
    }

    // Sort by urgency
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    vehiclePredictions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    predictions.push({
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      licensePlate: vehicle.licensePlate || '',
      predictions: vehiclePredictions,
    });
  }

  return predictions;
}

export async function getMaintenanceStats(garageId: string) {
  const predictions = await predictMaintenance(garageId);
  let critical = 0, high = 0, medium = 0, low = 0, totalCost = 0;

  for (const v of predictions) {
    for (const p of v.predictions) {
      if (p.urgency === 'critical') critical++;
      else if (p.urgency === 'high') high++;
      else if (p.urgency === 'medium') medium++;
      else low++;
      if (p.urgency === 'critical' || p.urgency === 'high') totalCost += p.estimatedCost;
    }
  }

  return { vehicleCount: predictions.length, critical, high, medium, low, estimatedRevenue: totalCost };
}
