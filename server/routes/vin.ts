import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

router.get('/vin-decode/:vin', isAuthenticated, async (req, res) => {
  try {
    const { vin } = req.params;

    if (!vin || vin.length !== 17) {
      return res.status(400).json({ message: 'Invalid VIN. VIN must be exactly 17 characters.' });
    }

    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);

    if (!response.ok) {
      throw new Error('Failed to decode VIN from NHTSA');
    }

    const data = await response.json();
    const results = data.Results || [];

    const getValueByName = (name: string) => {
      const item = results.find((result: any) => result.Variable === name);
      return item?.Value || null;
    };

    const decodedVehicle = {
      vin,
      make: getValueByName('Make') || '',
      model: getValueByName('Model') || '',
      year: parseInt(getValueByName('Model Year') || '0') || null,
      bodyClass: getValueByName('Body Class') || '',
      vehicleType: getValueByName('Vehicle Type') || '',
      engineCylinders: getValueByName('Engine Number of Cylinders') || '',
      engineDisplacement: getValueByName('Displacement (L)') || '',
      engineConfiguration: getValueByName('Engine Configuration') || '',
      fuelType: getValueByName('Fuel Type - Primary') || '',
      transmissionStyle: getValueByName('Transmission Style') || '',
      driveType: getValueByName('Drive Type') || '',
      doors: getValueByName('Doors') || '',
      manufacturer: getValueByName('Manufacturer Name') || '',
      plantCountry: getValueByName('Plant Country') || '',
      plantCity: getValueByName('Plant City') || '',
      series: getValueByName('Series') || '',
      trim: getValueByName('Trim') || '',
      gvwr: getValueByName('Gross Vehicle Weight Rating From') || '',
      errorCode: getValueByName('Error Code') || '0',
      errorText: getValueByName('Error Text') || '',
      engineType: mapFuelType(getValueByName('Fuel Type - Primary')),
      transmissionType: mapTransmission(getValueByName('Transmission Style')),
      color: '',
    };

    res.json(decodedVehicle);
  } catch (error) {
    console.error('Error decoding VIN:', error);
    res.status(500).json({ message: 'Failed to decode VIN' });
  }
});

router.get('/decode-vin/:vin', isAuthenticated, async (req, res) => {
  try {
    const { vin } = req.params;
    const vinData = await storage.decodeVIN(vin);

    if (!vinData) {
      return res.status(404).json({ message: 'VIN not found or invalid' });
    }

    res.json(vinData);
  } catch (error) {
    console.error('Error decoding VIN:', error);
    res.status(500).json({ message: 'Failed to decode VIN' });
  }
});

function mapFuelType(fuelType: string | null): string {
  if (!fuelType) return '';
  const lower = fuelType.toLowerCase();
  if (lower.includes('gasoline') || lower.includes('petrol')) return 'gasoline';
  if (lower.includes('diesel')) return 'diesel';
  if (lower.includes('electric')) return 'electric';
  if (lower.includes('hybrid')) return 'hybrid';
  if (lower.includes('natural gas')) return 'natural_gas';
  if (lower.includes('hydrogen')) return 'hydrogen';
  return 'gasoline';
}

function mapTransmission(transmission: string | null): string {
  if (!transmission) return '';
  const lower = transmission.toLowerCase();
  if (lower.includes('automatic')) return 'automatic';
  if (lower.includes('manual')) return 'manual';
  if (lower.includes('cvt')) return 'cvt';
  if (lower.includes('dual') || lower.includes('dct')) return 'dct';
  return 'automatic';
}

export default router;
