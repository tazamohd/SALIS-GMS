import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

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
      vehicleId,
      appointmentDate,
      appointmentTime,
      service,
      notes,
    } = req.body;
    const userId = req.user?.id || "default-user";

    if (!customerId || !vehicleId || !appointmentDate) {
      return res
        .status(400)
        .json({
          message: "Customer, vehicle, and appointment date are required",
        });
    }

    const appointment = await storage.createAppointment({
      customerId,
      vehicleId,
      appointmentDate,
      appointmentTime: appointmentTime || "09:00",
      service: service || null,
      notes: notes || null,
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
      appointmentTime,
      service,
      notes,
      status,
    } = req.body;

    const appointment = await storage.updateAppointment(id, {
      appointmentDate: appointmentDate || undefined,
      appointmentTime: appointmentTime || undefined,
      service: service || undefined,
      notes: notes || undefined,
      status: status || undefined,
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
      date as string
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
      startDate as string,
      endDate as string
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
      const { title, startTime, endTime, description, attendees } = req.body;
      const userId = req.user?.id || "default-user";

      if (!title || !startTime || !endTime) {
        return res
          .status(400)
          .json({ message: "Title, start time, and end time are required" });
      }

      const event = await storage.createCalendarEvent({
        title,
        startTime,
        endTime,
        description: description || null,
        attendees: attendees || [],
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
    const { date, duration } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const slots = await storage.getAvailableTimeSlots(
      date as string,
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

export const schedulingRoutes = router;
