// @ts-nocheck
import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { requireRole } from '../middleware/requireRole';
import { insertIoTSensorSchema, insertIoTSensorReadingSchema } from '@shared/schema';

const router = Router();

function sanitizeZodError(error: any) {
  return { message: 'Validation failed', errors: error.errors?.map((e: any) => ({ path: e.path.join('.'), message: e.message })) };
}

router.get('/iot/sensors', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId, status } = req.query;
    const garageVehicles = await storage.getVehicles(userGarageId);
    const vehicleIds = garageVehicles.map((v: any) => v.id);
    if (vehicleId && !vehicleIds.includes(vehicleId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const sensors = await storage.getIotSensors(vehicleId as string, status as string);
    const filteredSensors = sensors.filter((s: any) => vehicleIds.includes(s.vehicleId));
    res.json(filteredSensors);
  } catch (error: any) {
    console.error("Error fetching IoT sensors:", error);
    res.status(500).json({ message: "Failed to fetch sensors" });
  }
});

router.get('/iot/sensors/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const sensor = await storage.getIotSensor(req.params.id);
    if (!sensor) return res.status(404).json({ message: "Sensor not found" });
    const vehicle = await storage.getVehicle(sensor.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    res.json(sensor);
  } catch (error: any) {
    console.error("Error fetching sensor:", error);
    res.status(500).json({ message: "Failed to fetch sensor" });
  }
});

router.post('/iot/sensors', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validationResult = insertIoTSensorSchema.safeParse(req.body);
    if (!validationResult.success) return res.status(400).json(sanitizeZodError(validationResult.error));
    const vehicle = await storage.getVehicle(validationResult.data.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    const sensor = await storage.createIotSensor(validationResult.data);
    res.status(201).json(sensor);
  } catch (error: any) {
    console.error("Error creating sensor:", error);
    res.status(500).json({ message: "Failed to create sensor" });
  }
});

router.patch('/iot/sensors/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const updateSchema = insertIoTSensorSchema.partial().omit({ vehicleId: true });
    const validationResult = updateSchema.safeParse(req.body);
    if (!validationResult.success) return res.status(400).json(sanitizeZodError(validationResult.error));
    const existingSensor = await storage.getIotSensor(req.params.id);
    if (!existingSensor) return res.status(404).json({ message: "Sensor not found" });
    const vehicle = await storage.getVehicle(existingSensor.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    const sensor = await storage.updateIotSensor(req.params.id, validationResult.data);
    res.json(sensor);
  } catch (error: any) {
    console.error("Error updating sensor:", error);
    res.status(500).json({ message: "Failed to update sensor" });
  }
});

router.delete('/iot/sensors/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existingSensor = await storage.getIotSensor(req.params.id);
    if (!existingSensor) return res.status(404).json({ message: "Sensor not found" });
    const vehicle = await storage.getVehicle(existingSensor.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    await storage.deleteIotSensor(req.params.id);
    res.json({ message: "Sensor deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting sensor:", error);
    res.status(500).json({ message: "Failed to delete sensor" });
  }
});

router.post('/iot/readings', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const validationResult = insertIoTSensorReadingSchema.safeParse(req.body);
    if (!validationResult.success) return res.status(400).json(sanitizeZodError(validationResult.error));
    const sensor = await storage.getIotSensor(validationResult.data.sensorId);
    if (!sensor) return res.status(404).json({ message: "Sensor not found" });
    const reading = await storage.recordSensorReading(validationResult.data);
    res.status(201).json(reading);
  } catch (error: any) {
    console.error("Error recording sensor reading:", error);
    res.status(500).json({ message: "Failed to record reading" });
  }
});

router.get('/iot/sensors/:id/readings', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { startDate, endDate } = req.query;
    const sensor = await storage.getIotSensor(req.params.id);
    if (!sensor) return res.status(404).json({ message: "Sensor not found" });
    const vehicle = await storage.getVehicle(sensor.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    if (startDate) {
      parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) return res.status(400).json({ message: "Invalid startDate format" });
    }
    if (endDate) {
      parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) return res.status(400).json({ message: "Invalid endDate format" });
    }
    const readings = await storage.getSensorReadings(req.params.id, parsedStartDate, parsedEndDate);
    res.json(readings);
  } catch (error: any) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ message: "Failed to fetch readings" });
  }
});

router.get('/iot/vehicles/:vehicleId/anomalies', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const vehicle = await storage.getVehicle(req.params.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    const { limit } = req.query;
    const anomalies = await storage.getRecentAnomalies(req.params.vehicleId, limit ? parseInt(limit as string) : 10);
    res.json(anomalies);
  } catch (error: any) {
    console.error("Error fetching anomalies:", error);
    res.status(500).json({ message: "Failed to fetch anomalies" });
  }
});

router.get('/iot/alerts', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { vehicleId, status, severity } = req.query;
    if (vehicleId) {
      const vehicle = await storage.getVehicle(vehicleId as string);
      if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    }
    const garageVehicles = await storage.getVehicles(userGarageId);
    const vehicleIds = garageVehicles.map((v: any) => v.id);
    const alerts = await storage.getIotAlerts(vehicleId as string, status as string, severity as string);
    const filteredAlerts = alerts.filter((a: any) => vehicleIds.includes(a.vehicleId));
    res.json(filteredAlerts);
  } catch (error: any) {
    console.error("Error fetching IoT alerts:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

router.get('/iot/alerts/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const alert = await storage.getIotAlert(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    const vehicle = await storage.getVehicle(alert.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    res.json(alert);
  } catch (error: any) {
    console.error("Error fetching alert:", error);
    res.status(500).json({ message: "Failed to fetch alert" });
  }
});

router.post('/iot/alerts/:id/acknowledge', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const alert = await storage.getIotAlert(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    const vehicle = await storage.getVehicle(alert.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    const updatedAlert = await storage.acknowledgeIotAlert(req.params.id, req.user?.id);
    res.json(updatedAlert);
  } catch (error: any) {
    console.error("Error acknowledging alert:", error);
    res.status(500).json({ message: "Failed to acknowledge alert" });
  }
});

router.get('/iot/dashboard/summary', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const garageVehicles = await storage.getVehicles(userGarageId);
    const vehicleIds = garageVehicles.map((v: any) => v.id);
    const allSensors = await storage.getIotSensors();
    const sensors = allSensors.filter((s: any) => vehicleIds.includes(s.vehicleId));
    const allAlerts = await storage.getIotAlerts();
    const alerts = allAlerts.filter((a: any) => vehicleIds.includes(a.vehicleId));
    const activeSensors = sensors.filter((s: any) => s.status === 'active').length;
    const activeAlerts = alerts.filter((a: any) => a.status === 'active').length;
    const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical' && a.status === 'active').length;
    res.json({
      totalSensors: sensors.length,
      activeSensors,
      inactiveSensors: sensors.length - activeSensors,
      totalAlerts: alerts.length,
      activeAlerts,
      criticalAlerts,
      acknowledgedAlerts: alerts.filter((a: any) => a.status === 'acknowledged').length,
      resolvedAlerts: alerts.filter((a: any) => a.status === 'resolved').length,
    });
  } catch (error: any) {
    console.error("Error fetching IoT dashboard summary:", error);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
});

router.get('/iot/vehicles/:vehicleId/latest-readings', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const vehicle = await storage.getVehicle(req.params.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    const sensors = await storage.getIotSensors(req.params.vehicleId);
    const latestReadings: any = {};
    for (const sensor of sensors) {
      const readings = await storage.getSensorReadings(sensor.id);
      if (readings.length > 0) {
        latestReadings[sensor.sensorType] = readings[0];
      }
    }
    res.json(latestReadings);
  } catch (error: any) {
    console.error("Error fetching latest readings:", error);
    res.status(500).json({ message: "Failed to fetch latest readings" });
  }
});

router.post('/iot/alerts/:id/resolve', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'TECHNICIAN']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { resolution, jobCardId } = req.body;
    if (!resolution || typeof resolution !== 'string') return res.status(400).json({ message: "Resolution text is required" });
    const alert = await storage.getIotAlert(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    const vehicle = await storage.getVehicle(alert.vehicleId);
    if (!vehicle || vehicle.garageId !== userGarageId) return res.status(403).json({ message: "Access denied" });
    if (jobCardId) {
      const jobCard = await storage.getJobCard(jobCardId);
      if (!jobCard || jobCard.garageId !== userGarageId) return res.status(403).json({ message: "Invalid job card" });
    }
    const updatedAlert = await storage.resolveIotAlert(req.params.id, req.user?.id, resolution, jobCardId);
    res.json(updatedAlert);
  } catch (error: any) {
    console.error("Error resolving alert:", error);
    res.status(500).json({ message: "Failed to resolve alert" });
  }
});

export default router;
