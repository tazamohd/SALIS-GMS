import { db } from '../db';
import { sql } from 'drizzle-orm';

interface PartRecommendation {
  partName: string;
  partNumber: string;
  category: string;
  confidence: number;
  reason: string;
  estimatedPrice: number;
  inStock: boolean;
  stockQuantity: number;
  alternatives: { name: string; partNumber: string; price: number }[];
}

// Common parts by service type
const SERVICE_PARTS_MAP: Record<string, { parts: string[]; category: string }> = {
  'oil change': { parts: ['Oil Filter', 'Engine Oil 5W-30', 'Drain Plug Gasket'], category: 'Engine' },
  'brake service': { parts: ['Brake Pads Front', 'Brake Pads Rear', 'Brake Disc Rotor', 'Brake Fluid DOT4'], category: 'Brakes' },
  'ac service': { parts: ['AC Compressor', 'Refrigerant R134a', 'Cabin Air Filter', 'AC Condenser'], category: 'Climate' },
  'tire service': { parts: ['Tire 205/55R16', 'Valve Stem', 'Wheel Alignment Kit'], category: 'Tires' },
  'engine diagnostic': { parts: ['Spark Plug', 'Ignition Coil', 'Air Filter', 'Fuel Filter'], category: 'Engine' },
  'transmission': { parts: ['Transmission Fluid ATF', 'Transmission Filter', 'Gasket Set'], category: 'Drivetrain' },
  'battery': { parts: ['Car Battery 12V', 'Battery Terminal Clamp', 'Battery Hold Down'], category: 'Electrical' },
  'suspension': { parts: ['Shock Absorber', 'Strut Assembly', 'Control Arm Bushing', 'Sway Bar Link'], category: 'Suspension' },
};

export async function recommendParts(garageId: string, params: {
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  serviceType?: string;
  description?: string;
}): Promise<PartRecommendation[]> {
  const { serviceType, description, vehicleMake, vehicleModel } = params;
  const searchTerm = (serviceType || description || '').toLowerCase();

  // Find matching service type
  let matchedParts: string[] = [];
  let category = 'General';

  for (const [key, value] of Object.entries(SERVICE_PARTS_MAP)) {
    if (searchTerm.includes(key) || key.includes(searchTerm)) {
      matchedParts = value.parts;
      category = value.category;
      break;
    }
  }

  if (matchedParts.length === 0) {
    matchedParts = ['Oil Filter', 'Air Filter', 'Spark Plug'];
    category = 'General Maintenance';
  }

  // Check inventory for these parts
  const recommendations: PartRecommendation[] = [];

  for (const partName of matchedParts) {
    const inventory = await db.execute(sql`
      SELECT sp.id, sp.name, sp."partNumber", sp.category,
        spi."stockQuantity", spi."sellingPrice", spi."costPrice"
      FROM spare_parts sp
      LEFT JOIN spare_part_inventories spi ON spi."sparePartId" = sp.id AND spi."garageId" = ${garageId}
      WHERE LOWER(sp.name) LIKE ${`%${partName.toLowerCase()}%`}
      LIMIT 3
    `);

    const rows = inventory.rows || [];
    const mainPart = rows[0] as any;

    recommendations.push({
      partName: mainPart?.name || partName,
      partNumber: mainPart?.partNumber || `PN-${partName.replace(/\s/g, '-').toUpperCase()}`,
      category,
      confidence: mainPart ? 0.9 : 0.7,
      reason: vehicleMake
        ? `Recommended for ${vehicleMake} ${vehicleModel || ''} ${serviceType || 'service'}`
        : `Standard part for ${serviceType || 'general maintenance'}`,
      estimatedPrice: mainPart ? Number(mainPart.sellingPrice || 0) : Math.round(Math.random() * 200 + 50),
      inStock: mainPart ? Number(mainPart.stockQuantity || 0) > 0 : false,
      stockQuantity: mainPart ? Number(mainPart.stockQuantity || 0) : 0,
      alternatives: rows.slice(1).map((r: any) => ({
        name: r.name,
        partNumber: r.partNumber || '',
        price: Number(r.sellingPrice || 0),
      })),
    });
  }

  return recommendations;
}
