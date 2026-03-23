import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { optimizeSchedule, generateScheduleReport } from "../services/scheduling-optimizer";

const router = Router();

/**
 * Scheduling & Appointments Routes
 * - GET /api/appointments - List appointments
 * - POST /api/appointments - Create appointment
 * - GET /api/appointments/:id - Get appointment details
 * - PATCH /api/appointments/:id - Update appointment
 * - DELETE /api/appointments/:id - Delete appointment
 * - POST /api/appointments/:id/status - Update appointment status
 * - GET /api/availability - Get technician availability
 * - GET /api/calendar-appointments - Get calendar appointments
 * - POST /api/calendar-appointments - Create calendar event
 * - GET /api/time-slots - Get available time slots
 * - POST /api/recurring-appointments - Create recurring appointment
 */

// Get all appointments
router.get("/appointments", isAuthenticated, async (req, res) => {
  try {
    const { garageId, status, date } = req.query;
    const appointments = await storage.getAppointments(
      garageId as string,
      status as string,
      date as string
    );
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// Create appointment
router.post("/appointments", isAuthenticated, async (req: any, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      vehicleInfo,
      serviceType,
      appointmentDate,
      garageId,
      description,
      notes,
      duration,
    } = req.body;
    const userId = req.user?.id || "default-user";

    if (!customerName || !vehicleInfo || !appointmentDate || !garageId || !serviceType) {
      return res
        .status(400)
        .json({
          message: "Customer name, vehicle info, service type, garage ID, and appointment date are required",
        });
    }

    const appointment = await storage.createAppointment({
      garageId,
      customerId: customerId || null,
      customerName,
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || null,
      vehicleInfo,
      serviceType,
      appointmentDate: new Date(appointmentDate),
      description: description || null,
      notes: notes || null,
      duration: duration || 60,
      status: "scheduled",
      createdBy: userId,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Failed to create appointment" });
  }
});

// Get appointment by ID
router.get("/appointments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await storage.getAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
});

// Update appointment
router.patch("/appointments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appointmentDate,
      serviceType,
      description,
      notes,
      status,
      duration,
    } = req.body;

    const appointment = await storage.updateAppointment(id, {
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
      serviceType: serviceType || undefined,
      description: description || undefined,
      notes: notes || undefined,
      status: status || undefined,
      duration: duration || undefined,
    });

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Failed to update appointment" });
  }
});

// Delete appointment
router.delete("/appointments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteAppointment(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Failed to delete appointment" });
  }
});

// Update appointment status
router.post(
  "/appointments/:id/status",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const appointment = await storage.updateAppointment(id, {
        status,
      });

      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res
        .status(500)
        .json({ message: "Failed to update appointment status" });
    }
  }
);

// Get technician availability
router.get("/availability", isAuthenticated, async (req, res) => {
  try {
    const { technicianId, date } = req.query;

    if (!technicianId || !date) {
      return res
        .status(400)
        .json({ message: "Technician ID and date are required" });
    }

    const availability = await storage.getTechnicianAvailability(
      technicianId as string,
      new Date(date as string)
    );

    res.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

// Get calendar appointments
router.get("/calendar-appointments", isAuthenticated, async (req, res) => {
  try {
    const { garageId, startDate, endDate } = req.query;

    if (!garageId || !startDate || !endDate) {
      return res
        .status(400)
        .json({
          message: "Garage ID, start date, and end date are required",
        });
    }

    const appointments = await storage.getCalendarAppointments(
      garageId as string,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching calendar appointments:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch calendar appointments" });
  }
});

// Create calendar event
router.post(
  "/calendar-appointments",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { title, startTime, endTime, description, garageId, eventType } = req.body;
      const userId = req.user?.id || "default-user";

      if (!title || !startTime || !endTime || !garageId || !eventType) {
        return res
          .status(400)
          .json({ message: "Title, start time, end time, garage ID, and event type are required" });
      }

      const event = await storage.createCalendarEvent({
        garageId,
        title,
        eventType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description: description || null,
        createdBy: userId,
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  }
);

// Get available time slots
router.get("/time-slots", isAuthenticated, async (req, res) => {
  try {
    const { technicianId, date, duration } = req.query;

    if (!technicianId || !date) {
      return res.status(400).json({ message: "Technician ID and date are required" });
    }

    const slots = await storage.getAvailableTimeSlots(
      technicianId as string,
      new Date(date as string),
      parseInt((duration as string) || "60")
    );

    res.json(slots);
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ message: "Failed to fetch time slots" });
  }
});

// TODO: Implement recurring appointments
// - POST /api/recurring-appointments
// - GET /api/recurring-appointments

// ─── AI Scheduling Optimization Routes ───────────────────────────────

// In-memory store for optimization history and rules
const optimizationHistory: any[] = [];

const defaultSchedulingRules = [
  { id: '1', ruleName: 'Skill-Based Assignment', description: 'Match technicians to jobs based on skill compatibility', priority: 1, isActive: true },
  { id: '2', ruleName: 'Load Balancing', description: 'Distribute work evenly across available technicians', priority: 2, isActive: true },
  { id: '3', ruleName: 'Priority Escalation', description: 'Assign urgent jobs first to the best available technician', priority: 3, isActive: true },
  { id: '4', ruleName: 'Efficiency Preference', description: 'Prefer technicians with higher historical efficiency ratings', priority: 4, isActive: false },
];

// POST /api/scheduling/optimize - Run AI schedule optimization
router.post("/scheduling/optimize", isAuthenticated, async (req: any, res) => {
  try {
    const { technicians: inputTechs, jobs: inputJobs } = req.body;

    // Use provided data or generate demo data from storage
    let technicians = inputTechs;
    let jobs = inputJobs;

    if (!technicians || !Array.isArray(technicians) || technicians.length === 0) {
      // Generate sample technicians for demo
      technicians = [
        { id: 't1', name: 'Ahmed Al-Rashid', skills: ['engine', 'transmission', 'diagnostics'], currentLoad: 2, maxLoad: 5, availability: true, efficiency: 0.92 },
        { id: 't2', name: 'Mohammed Khalil', skills: ['electrical', 'ac', 'diagnostics'], currentLoad: 1, maxLoad: 5, availability: true, efficiency: 0.85 },
        { id: 't3', name: 'Omar Farouk', skills: ['bodywork', 'paint', 'detailing'], currentLoad: 3, maxLoad: 5, availability: true, efficiency: 0.78 },
        { id: 't4', name: 'Khalid Nasser', skills: ['brakes', 'suspension', 'alignment'], currentLoad: 0, maxLoad: 5, availability: true, efficiency: 0.95 },
        { id: 't5', name: 'Yusuf Ibrahim', skills: ['engine', 'oil-change', 'tire'], currentLoad: 4, maxLoad: 5, availability: true, efficiency: 0.88 },
      ];
    }

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      // Generate sample jobs for demo
      jobs = [
        { id: 'j1', type: 'Engine Repair', requiredSkills: ['engine', 'diagnostics'], estimatedHours: 4, priority: 'urgent', vehicleInfo: 'Toyota Camry 2022' },
        { id: 'j2', type: 'AC Service', requiredSkills: ['ac', 'electrical'], estimatedHours: 2, priority: 'high', vehicleInfo: 'Honda Accord 2023' },
        { id: 'j3', type: 'Brake Replacement', requiredSkills: ['brakes'], estimatedHours: 3, priority: 'medium', vehicleInfo: 'Nissan Altima 2021' },
        { id: 'j4', type: 'Full Detailing', requiredSkills: ['detailing', 'paint'], estimatedHours: 5, priority: 'low', vehicleInfo: 'BMW X5 2023' },
        { id: 'j5', type: 'Transmission Check', requiredSkills: ['transmission', 'diagnostics'], estimatedHours: 3, priority: 'high', vehicleInfo: 'Ford F-150 2022' },
        { id: 'j6', type: 'Wheel Alignment', requiredSkills: ['alignment', 'suspension'], estimatedHours: 1, priority: 'medium', vehicleInfo: 'Hyundai Sonata 2023' },
      ];
    }

    // Run AI optimization
    const assignments = optimizeSchedule(technicians, jobs);
    const report = generateScheduleReport(technicians, assignments);

    // Generate AI suggestions
    const suggestions: string[] = [];
    if (report.averageScore < 60) {
      suggestions.push('Consider cross-training technicians to improve skill coverage and assignment scores.');
    }
    const overloaded = report.technicianUtilization.filter(t => t.utilization > 90);
    if (overloaded.length > 0) {
      suggestions.push(`${overloaded.map(t => t.name).join(', ')} ${overloaded.length === 1 ? 'is' : 'are'} near full capacity. Consider redistributing workload or hiring additional staff.`);
    }
    const underutilized = report.technicianUtilization.filter(t => t.utilization < 30);
    if (underutilized.length > 0) {
      suggestions.push(`${underutilized.map(t => t.name).join(', ')} ${underutilized.length === 1 ? 'has' : 'have'} low utilization. Consider assigning more tasks or cross-department support.`);
    }
    if (assignments.length > 0) {
      suggestions.push(`Successfully optimized ${assignments.length} job assignments with an average match score of ${report.averageScore}%.`);
    }

    // Build utilization map for history
    const utilizationMap: Record<string, string> = {};
    report.technicianUtilization.forEach(t => {
      utilizationMap[t.name] = String(t.utilization);
    });

    // Store in history
    const historyEntry = {
      id: `opt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      appointmentsOptimized: assignments.length,
      efficiencyGain: report.averageScore > 0 ? ((report.averageScore / 100) * 25).toFixed(1) : '0',
      technicianUtilization: utilizationMap,
      suggestions,
      assignments,
      report,
    };
    optimizationHistory.unshift(historyEntry);
    // Keep only last 20 entries
    if (optimizationHistory.length > 20) optimizationHistory.length = 20;

    res.json(historyEntry);
  } catch (error) {
    console.error("Error running scheduling optimization:", error);
    res.status(500).json({ message: "Failed to run scheduling optimization" });
  }
});

// GET /api/scheduling/rules - Get scheduling rules
router.get("/scheduling/rules", isAuthenticated, async (_req, res) => {
  try {
    res.json(defaultSchedulingRules);
  } catch (error) {
    console.error("Error fetching scheduling rules:", error);
    res.status(500).json({ message: "Failed to fetch scheduling rules" });
  }
});

// GET /api/scheduling/history - Get optimization history
router.get("/scheduling/history", isAuthenticated, async (_req, res) => {
  try {
    res.json(optimizationHistory);
  } catch (error) {
    console.error("Error fetching optimization history:", error);
    res.status(500).json({ message: "Failed to fetch optimization history" });
  }
});

export const schedulingRoutes = router;
