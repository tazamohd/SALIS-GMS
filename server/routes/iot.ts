import { Router } from 'express';

const router = Router();

// GET /api/iot/sensors - List all IoT sensors with latest readings
router.get('/iot/sensors', async (req, res) => {
  // Return mock sensor data structure that IoTDashboard expects
  const sensors = [
    { id: '1', name: 'Bay 1 - Temperature', type: 'temperature', value: 22.5, unit: '°C', status: 'normal', lastReading: new Date().toISOString() },
    { id: '2', name: 'Bay 1 - Humidity', type: 'humidity', value: 45, unit: '%', status: 'normal', lastReading: new Date().toISOString() },
    { id: '3', name: 'Compressor - Pressure', type: 'pressure', value: 120, unit: 'PSI', status: 'warning', lastReading: new Date().toISOString() },
    { id: '4', name: 'Paint Booth - Air Quality', type: 'air_quality', value: 95, unit: 'AQI', status: 'normal', lastReading: new Date().toISOString() },
    { id: '5', name: 'Lift 1 - Load', type: 'weight', value: 1850, unit: 'kg', status: 'normal', lastReading: new Date().toISOString() },
    { id: '6', name: 'Bay 2 - Temperature', type: 'temperature', value: 28.3, unit: '°C', status: 'warning', lastReading: new Date().toISOString() },
  ];
  res.json({ sensors, summary: { total: sensors.length, online: sensors.length, warnings: 2, critical: 0 } });
});

// GET /api/iot/alerts - List recent IoT alerts
router.get('/iot/alerts', async (req, res) => {
  const alerts = [
    { id: '1', sensorId: '3', sensorName: 'Compressor - Pressure', type: 'warning', message: 'Pressure above normal range', value: 120, threshold: 100, timestamp: new Date().toISOString(), acknowledged: false },
    { id: '2', sensorId: '6', sensorName: 'Bay 2 - Temperature', type: 'warning', message: 'Temperature elevated', value: 28.3, threshold: 26, timestamp: new Date().toISOString(), acknowledged: false },
  ];
  res.json({ alerts, unacknowledged: 2 });
});

// GET /api/iot/summary - Dashboard summary
router.get('/iot/summary', async (req, res) => {
  res.json({ totalSensors: 6, onlineSensors: 6, warnings: 2, criticalAlerts: 0, avgTemperature: 25.4, avgHumidity: 45 });
});

export default router;
