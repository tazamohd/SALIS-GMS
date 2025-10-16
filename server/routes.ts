import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { emailService } from "./services/emailService";
import { smsService } from "./services/smsService";
import { z } from "zod";
import { insertNotificationSchema } from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe (Stripe integration - Module 25)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Email notification validation schemas
const appointmentConfirmationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garagePhone: z.string().optional(),
});

const invoiceNotificationSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  totalAmount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
  invoiceLink: z.string().optional(),
});

const jobCompletedSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  vehicleInfo: z.string(),
  completedDate: z.string(),
  garageName: z.string(),
  pickupInstructions: z.string().optional(),
});

const feedbackRequestSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});

const appointmentReminderSchema = z.object({
  customerEmail: z.string().email(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  serviceName: z.string(),
  garageName: z.string(),
  garageAddress: z.string().optional(),
});

// SMS notification validation schemas
const smsAppointmentReminderSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

const smsAppointmentConfirmationSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  garageName: z.string(),
});

const smsJobStatusSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  status: z.string(),
  garageName: z.string(),
});

const smsJobCompletedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  jobCardNumber: z.string(),
  garageName: z.string(),
  totalAmount: z.string().optional(),
});

const smsInvoiceSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  dueDate: z.string(),
  garageName: z.string(),
});

const smsPaymentReceivedSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  invoiceNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

const smsEstimateSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  estimateNumber: z.string(),
  amount: z.string(),
  garageName: z.string(),
});

const smsFeedbackRequestSchema = z.object({
  customerPhone: z.string(),
  recipientId: z.string(),
  garageId: z.string().optional(),
  customerName: z.string(),
  garageName: z.string(),
  feedbackLink: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Garage management routes
  app.get('/api/garages', isAuthenticated, async (req, res) => {
    try {
      const garages = await storage.getGarages();
      res.json(garages);
    } catch (error) {
      console.error("Error fetching garages:", error);
      res.status(500).json({ message: "Failed to fetch garages" });
    }
  });

  app.get('/api/garages/:id/branches', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const branches = await storage.getBranchesByGarageId(id);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.get('/api/roles', isAuthenticated, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get('/api/user/:id/roles', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userRoles = await storage.getUserRoles(id);
      res.json(userRoles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  // Technician routes
  app.get('/api/technicians', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const technicians = await storage.getTechnicians(garage_id as string);
      res.json(technicians);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      res.status(500).json({ message: "Failed to fetch technicians" });
    }
  });

  app.post('/api/technicians', isAuthenticated, async (req, res) => {
    try {
      const technicianData = {
        ...req.body,
        userType: 'technician',
        isActive: true,
      };
      const technician = await storage.createUser(technicianData);
      res.status(201).json(technician);
    } catch (error) {
      console.error("Error creating technician:", error);
      res.status(500).json({ message: "Failed to create technician" });
    }
  });

  app.delete('/api/technicians/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting technician:", error);
      res.status(500).json({ message: "Failed to delete technician" });
    }
  });

  // Technician Profile routes
  app.get('/api/technician-profiles/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getTechnicianProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Technician profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching technician profile:", error);
      res.status(500).json({ message: "Failed to fetch technician profile" });
    }
  });

  app.post('/api/technician-profiles', isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.createTechnicianProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating technician profile:", error);
      res.status(500).json({ message: "Failed to create technician profile" });
    }
  });

  app.patch('/api/technician-profiles/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.updateTechnicianProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating technician profile:", error);
      res.status(500).json({ message: "Failed to update technician profile" });
    }
  });

  // Job Card routes - Module 8: Job Cards & Task Assignment
  app.get('/api/job-cards', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, assigned_to } = req.query;
      const jobCards = await storage.getJobCards(garage_id as string, assigned_to as string);
      res.json(jobCards);
    } catch (error) {
      console.error("Error fetching job cards:", error);
      res.status(500).json({ message: "Failed to fetch job cards" });
    }
  });

  app.get('/api/job-cards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const jobCard = await storage.getJobCard(id);
      if (!jobCard) {
        return res.status(404).json({ message: "Job card not found" });
      }
      res.json(jobCard);
    } catch (error) {
      console.error("Error fetching job card:", error);
      res.status(500).json({ message: "Failed to fetch job card" });
    }
  });

  app.post('/api/job-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobCardData = {
        ...req.body,
        createdBy: userId,
      };
      const jobCard = await storage.createJobCard(jobCardData);
      res.status(201).json(jobCard);
    } catch (error) {
      console.error("Error creating job card:", error);
      res.status(500).json({ message: "Failed to create job card" });
    }
  });

  app.put('/api/job-cards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedJobCard = await storage.updateJobCard(id, req.body);
      res.json(updatedJobCard);
    } catch (error) {
      console.error("Error updating job card:", error);
      res.status(500).json({ message: "Failed to update job card" });
    }
  });

  app.patch('/api/job-cards/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedJobCard = await storage.updateJobCard(id, req.body);
      res.json(updatedJobCard);
    } catch (error) {
      console.error("Error updating job card:", error);
      res.status(500).json({ message: "Failed to update job card" });
    }
  });

  // Task Assignment routes
  app.get('/api/job-cards/:jobCardId/tasks', isAuthenticated, async (req, res) => {
    try {
      const { jobCardId } = req.params;
      const tasks = await storage.getTaskAssignments(jobCardId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching task assignments:", error);
      res.status(500).json({ message: "Failed to fetch task assignments" });
    }
  });

  app.post('/api/job-cards/:jobCardId/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const { jobCardId } = req.params;
      const userId = req.user.claims.sub;
      const taskData = {
        ...req.body,
        jobCardId,
        assignedBy: userId,
      };
      const task = await storage.createTaskAssignment(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task assignment:", error);
      res.status(500).json({ message: "Failed to create task assignment" });
    }
  });

  app.put('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTask = await storage.updateTaskAssignment(id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task assignment:", error);
      res.status(500).json({ message: "Failed to update task assignment" });
    }
  });

  // Service Templates routes
  app.get('/api/service-templates/all', isAuthenticated, async (req, res) => {
    try {
      const allTemplates = await storage.getAllServiceTemplates();
      res.json(allTemplates);
    } catch (error) {
      console.error("Error fetching all service templates:", error);
      res.status(500).json({ message: "Failed to fetch service templates" });
    }
  });

  app.get('/api/service-templates', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      if (!garage_id) {
        return res.status(400).json({ message: "garage_id is required" });
      }
      const templates = await storage.getServiceTemplates(garage_id as string);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching service templates:", error);
      res.status(500).json({ message: "Failed to fetch service templates" });
    }
  });

  app.get('/api/service-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getServiceTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Service template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching service template:", error);
      res.status(500).json({ message: "Failed to fetch service template" });
    }
  });

  app.post('/api/service-templates', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.createServiceTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating service template:", error);
      res.status(500).json({ message: "Failed to create service template" });
    }
  });

  app.put('/api/service-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.updateServiceTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating service template:", error);
      res.status(500).json({ message: "Failed to update service template" });
    }
  });

  app.delete('/api/service-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service template:", error);
      res.status(500).json({ message: "Failed to delete service template" });
    }
  });

  // Tool Management routes - Module 7
  app.get('/api/tools', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, is_global } = req.query;
      const tools = await storage.getTools(
        garage_id as string,
        is_global === 'true'
      );
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get('/api/tools/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const tool = await storage.getTool(id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post('/api/tools', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const toolData = {
        ...req.body,
        createdBy: userId,
      };
      const tool = await storage.createTool(toolData);
      res.status(201).json(tool);
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  app.put('/api/tools/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTool = await storage.updateTool(id, req.body);
      res.json(updatedTool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  // Tool Availability routes
  app.get('/api/tool-availability', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, tool_id } = req.query;
      if (!garage_id) {
        return res.status(400).json({ message: "garage_id is required" });
      }
      const availability = await storage.getToolAvailability(
        garage_id as string,
        tool_id as string
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching tool availability:", error);
      res.status(500).json({ message: "Failed to fetch tool availability" });
    }
  });

  app.post('/api/tool-availability', isAuthenticated, async (req, res) => {
    try {
      const availability = await storage.createToolAvailability(req.body);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating tool availability:", error);
      res.status(500).json({ message: "Failed to create tool availability" });
    }
  });

  app.put('/api/tool-availability/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedAvailability = await storage.updateToolAvailability(id, req.body);
      res.json(updatedAvailability);
    } catch (error) {
      console.error("Error updating tool availability:", error);
      res.status(500).json({ message: "Failed to update tool availability" });
    }
  });

  // Tool Usage routes
  app.get('/api/tools/:toolId/usage', isAuthenticated, async (req, res) => {
    try {
      const { toolId } = req.params;
      const usageLogs = await storage.getToolUsageLogs(toolId);
      res.json(usageLogs);
    } catch (error) {
      console.error("Error fetching tool usage logs:", error);
      res.status(500).json({ message: "Failed to fetch tool usage logs" });
    }
  });

  app.post('/api/tool-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usageData = {
        ...req.body,
        userId,
      };
      const usageLog = await storage.createToolUsageLog(usageData);
      res.status(201).json(usageLog);
    } catch (error) {
      console.error("Error creating tool usage log:", error);
      res.status(500).json({ message: "Failed to create tool usage log" });
    }
  });

  app.put('/api/tool-usage/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedUsageLog = await storage.updateToolUsageLog(id, req.body);
      res.json(updatedUsageLog);
    } catch (error) {
      console.error("Error updating tool usage log:", error);
      res.status(500).json({ message: "Failed to update tool usage log" });
    }
  });

  // Spare Parts Management routes - Module 12: Spare Parts & Inventory
  app.get('/api/spare-parts', isAuthenticated, async (req, res) => {
    try {
      const parts = await storage.getSpareParts();
      res.json(parts);
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      res.status(500).json({ message: "Failed to fetch spare parts" });
    }
  });

  app.get('/api/spare-parts/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const part = await storage.getSparePart(id);
      if (!part) {
        return res.status(404).json({ message: "Spare part not found" });
      }
      res.json(part);
    } catch (error) {
      console.error("Error fetching spare part:", error);
      res.status(500).json({ message: "Failed to fetch spare part" });
    }
  });

  app.post('/api/spare-parts', isAuthenticated, async (req: any, res) => {
    try {
      const { insertSparePartSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;

      const validationResult = insertSparePartSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const partData = {
        ...validationResult.data,
        createdBy: userId,
      };

      const part = await storage.createSparePart(partData);
      res.status(201).json(part);
    } catch (error) {
      console.error("Error creating spare part:", error);
      res.status(500).json({ message: "Failed to create spare part" });
    }
  });

  app.patch('/api/spare-parts/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertSparePartSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertSparePartSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const updatedPart = await storage.updateSparePart(id, validationResult.data);
      res.json(updatedPart);
    } catch (error) {
      console.error("Error updating spare part:", error);
      res.status(500).json({ message: "Failed to update spare part" });
    }
  });

  app.delete('/api/spare-parts/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSparePart(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting spare part:", error);
      res.status(500).json({ message: "Failed to delete spare part" });
    }
  });

  // Spare Part Inventory routes
  app.get('/api/spare-part-inventories', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, spare_part_id } = req.query;
      if (!garage_id) {
        return res.status(400).json({ message: "garage_id is required" });
      }
      const inventories = await storage.getSparePartInventories(
        garage_id as string,
        spare_part_id as string
      );
      res.json(inventories);
    } catch (error) {
      console.error("Error fetching spare part inventories:", error);
      res.status(500).json({ message: "Failed to fetch spare part inventories" });
    }
  });

  app.post('/api/spare-part-inventories', isAuthenticated, async (req, res) => {
    try {
      const { insertSparePartInventorySchema } = await import("@shared/schema");

      const validationResult = insertSparePartInventorySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const inventory = await storage.createSparePartInventory(validationResult.data);
      res.status(201).json(inventory);
    } catch (error) {
      console.error("Error creating spare part inventory:", error);
      res.status(500).json({ message: "Failed to create spare part inventory" });
    }
  });

  app.patch('/api/spare-part-inventories/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertSparePartInventorySchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertSparePartInventorySchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.errors 
        });
      }

      const updatedInventory = await storage.updateSparePartInventory(id, validationResult.data);
      res.json(updatedInventory);
    } catch (error) {
      console.error("Error updating spare part inventory:", error);
      res.status(500).json({ message: "Failed to update spare part inventory" });
    }
  });

  // Appointment Management routes - Module 9: Appointments & Scheduling
  app.get('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status, date_from, date_to } = req.query;
      const appointments = await storage.getAppointments(
        garage_id as string,
        status as string,
        date_from as string,
        date_to as string
      );
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get('/api/appointments/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const { insertAppointmentSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      
      const validationResult = insertAppointmentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const appointmentData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const appointment = await storage.createAppointment(appointmentData as any);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertAppointmentSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertAppointmentSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const updatedAppointment = await storage.updateAppointment(id, validationResult.data);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete('/api/appointments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAppointment(id);
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  app.post('/api/appointments/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const userId = req.user.claims.sub;
      const updatedAppointment = await storage.updateAppointmentStatus(
        id,
        status,
        userId,
        reason
      );
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Customer Management routes - Module 10
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, search } = req.query;
      const customers = await storage.getCustomers(garage_id as string, search as string);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.get('/api/customers/:id/vehicles', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicles = await storage.getCustomerVehicles(id);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res.status(500).json({ message: "Failed to fetch customer vehicles" });
    }
  });

  app.get('/api/vehicles', isAuthenticated, async (req, res) => {
    try {
      const { garageId } = req.query;
      const vehicles = await storage.getVehicles(garageId as string | undefined);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post('/api/vehicles', isAuthenticated, async (req, res) => {
    try {
      const { insertVehicleSchema } = await import("@shared/schema");
      const validationResult = insertVehicleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const vehicle = await storage.createVehicle(validationResult.data);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  app.patch('/api/vehicles/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertVehicleSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertVehicleSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const updatedVehicle = await storage.updateVehicle(id, validationResult.data);
      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete('/api/vehicles/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVehicle(id);
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Vehicle Service History Routes - Module 22 Enhancements
  app.get('/api/vehicles/:id/service-history', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getVehicleServiceHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching service history:", error);
      res.status(500).json({ message: "Failed to fetch service history" });
    }
  });

  app.post('/api/vehicles/:id/service-history', isAuthenticated, async (req: any, res) => {
    try {
      const { insertVehicleServiceHistorySchema } = await import("@shared/schema");
      const { id } = req.params;
      const userId = req.user?.claims?.sub;

      const validationResult = insertVehicleServiceHistorySchema.safeParse({
        ...req.body,
        vehicleId: id,
        performedBy: userId
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
        });
      }

      const history = await storage.createServiceHistory(validationResult.data);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error creating service history:", error);
      res.status(500).json({ message: "Failed to create service history" });
    }
  });

  app.delete('/api/service-history/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceHistory(id);
      res.json({ message: "Service history deleted successfully" });
    } catch (error) {
      console.error("Error deleting service history:", error);
      res.status(500).json({ message: "Failed to delete service history" });
    }
  });

  // Maintenance Schedules Routes - Module 22 Enhancements
  app.get('/api/vehicles/:id/maintenance-schedules', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const schedules = await storage.getMaintenanceSchedules(id);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      res.status(500).json({ message: "Failed to fetch maintenance schedules" });
    }
  });

  app.post('/api/vehicles/:id/maintenance-schedules', isAuthenticated, async (req, res) => {
    try {
      const { insertMaintenanceScheduleSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertMaintenanceScheduleSchema.safeParse({
        ...req.body,
        vehicleId: id
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
        });
      }

      const schedule = await storage.createMaintenanceSchedule(validationResult.data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating maintenance schedule:", error);
      res.status(500).json({ message: "Failed to create maintenance schedule" });
    }
  });

  app.patch('/api/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertMaintenanceScheduleSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertMaintenanceScheduleSchema.partial().safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
        });
      }

      const schedule = await storage.updateMaintenanceSchedule(id, validationResult.data);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating maintenance schedule:", error);
      res.status(500).json({ message: "Failed to update maintenance schedule" });
    }
  });

  app.delete('/api/maintenance-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaintenanceSchedule(id);
      res.json({ message: "Maintenance schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting maintenance schedule:", error);
      res.status(500).json({ message: "Failed to delete maintenance schedule" });
    }
  });

  // Service Reminders Routes - Module 22 Enhancements
  app.get('/api/vehicles/:id/service-reminders', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const reminders = await storage.getServiceReminders(id, status as string | undefined);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching service reminders:", error);
      res.status(500).json({ message: "Failed to fetch service reminders" });
    }
  });

  app.post('/api/vehicles/:id/service-reminders', isAuthenticated, async (req, res) => {
    try {
      const { insertServiceReminderSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertServiceReminderSchema.safeParse({
        ...req.body,
        vehicleId: id
      });

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
        });
      }

      const reminder = await storage.createServiceReminder(validationResult.data);
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating service reminder:", error);
      res.status(500).json({ message: "Failed to create service reminder" });
    }
  });

  app.patch('/api/service-reminders/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertServiceReminderSchema } = await import("@shared/schema");
      const { id } = req.params;

      const validationResult = insertServiceReminderSchema.partial().safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
        });
      }

      const reminder = await storage.updateServiceReminder(id, validationResult.data);
      res.json(reminder);
    } catch (error) {
      console.error("Error updating service reminder:", error);
      res.status(500).json({ message: "Failed to update service reminder" });
    }
  });

  app.delete('/api/service-reminders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteServiceReminder(id);
      res.json({ message: "Service reminder deleted successfully" });
    } catch (error) {
      console.error("Error deleting service reminder:", error);
      res.status(500).json({ message: "Failed to delete service reminder" });
    }
  });

  // VIN Decoder Route - Module 22 Enhancements
  app.get('/api/decode-vin/:vin', isAuthenticated, async (req, res) => {
    try {
      const { vin } = req.params;
      const vinData = await storage.decodeVIN(vin);
      
      if (!vinData) {
        return res.status(404).json({ message: "VIN not found or invalid" });
      }

      res.json(vinData);
    } catch (error) {
      console.error("Error decoding VIN:", error);
      res.status(500).json({ message: "Failed to decode VIN" });
    }
  });

  app.get('/api/customers/:id/notes', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notes = await storage.getCustomerNotes(id);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching customer notes:", error);
      res.status(500).json({ message: "Failed to fetch customer notes" });
    }
  });

  app.post('/api/customers/:id/notes', isAuthenticated, async (req: any, res) => {
    try {
      const { insertCustomerNoteSchema } = await import("@shared/schema");
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const validationResult = insertCustomerNoteSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const noteData = {
        ...validationResult.data,
        customerId: id,
        createdBy: userId,
      };
      
      const note = await storage.createCustomerNote(noteData as any);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating customer note:", error);
      res.status(500).json({ message: "Failed to create customer note" });
    }
  });

  app.delete('/api/customer-notes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomerNote(id);
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Purchase Orders & Supplier Integration - Module 11
  app.get('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const suppliers = await storage.getSuppliers(garage_id as string);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const { insertSupplierSchema } = await import("@shared/schema");
      const validationResult = insertSupplierSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const supplier = await storage.createSupplier(validationResult.data);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.patch('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertSupplierSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertSupplierSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const supplier = await storage.updateSupplier(id, validationResult.data);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSupplier(id);
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  app.get('/api/purchase-orders', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status } = req.query;
      const orders = await storage.getPurchaseOrders(garage_id as string, status as string);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.get('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getPurchaseOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });

  app.post('/api/purchase-orders', isAuthenticated, async (req: any, res) => {
    try {
      const { insertPurchaseOrderSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      
      const validationResult = insertPurchaseOrderSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const orderData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const order = await storage.createPurchaseOrder(orderData as any);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  app.post('/api/purchase-orders/with-items', isAuthenticated, async (req: any, res) => {
    try {
      const { insertPurchaseOrderSchema, insertPurchaseOrderItemSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      const { purchaseOrder, items } = req.body;
      
      if (!purchaseOrder || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: purchaseOrder and items (array) required" 
        });
      }
      
      const poValidation = insertPurchaseOrderSchema.safeParse(purchaseOrder);
      if (!poValidation.success) {
        return res.status(400).json({ 
          message: "Purchase order validation error", 
          errors: poValidation.error.errors 
        });
      }
      
      const itemsValidation = items.map((item: any) => 
        insertPurchaseOrderItemSchema.omit({ purchaseOrderId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json({ 
          message: "Items validation error", 
          errors: invalidItems.flatMap(v => v.success ? [] : v.error.errors)
        });
      }
      
      const orderData = {
        ...poValidation.data,
        createdBy: userId,
      };
      
      const validItems = itemsValidation.map(v => v.success ? v.data : null).filter(Boolean);
      
      const order = await storage.createPurchaseOrderWithItems(orderData as any, validItems as any);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order with items:", error);
      res.status(500).json({ message: "Failed to create purchase order with items" });
    }
  });

  app.patch('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertPurchaseOrderSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertPurchaseOrderSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const order = await storage.updatePurchaseOrder(id, validationResult.data);
      res.json(order);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });

  app.delete('/api/purchase-orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePurchaseOrder(id);
      res.json({ message: "Purchase order deleted successfully" });
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      res.status(500).json({ message: "Failed to delete purchase order" });
    }
  });

  app.get('/api/purchase-orders/:id/items', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getPurchaseOrderItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching purchase order items:", error);
      res.status(500).json({ message: "Failed to fetch purchase order items" });
    }
  });

  app.post('/api/purchase-order-items', isAuthenticated, async (req, res) => {
    try {
      const { insertPurchaseOrderItemSchema } = await import("@shared/schema");
      const validationResult = insertPurchaseOrderItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const item = await storage.createPurchaseOrderItem(validationResult.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating purchase order item:", error);
      res.status(500).json({ message: "Failed to create purchase order item" });
    }
  });

  app.delete('/api/purchase-order-items/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePurchaseOrderItem(id);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Module 12: Invoice & Billing Routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status } = req.query;
      const invoices = await storage.getInvoices(garage_id as string, status as string);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const { insertInvoiceSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      
      const validationResult = insertInvoiceSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const invoiceData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const invoice = await storage.createInvoice(invoiceData as any);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.post('/api/invoices/with-items', isAuthenticated, async (req: any, res) => {
    try {
      const { insertInvoiceSchema, insertInvoiceItemSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      const { invoice, items } = req.body;
      
      if (!invoice || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: invoice and items (array) required" 
        });
      }
      
      const invoiceValidation = insertInvoiceSchema.safeParse(invoice);
      if (!invoiceValidation.success) {
        return res.status(400).json({ 
          message: "Invoice validation error", 
          errors: invoiceValidation.error.errors 
        });
      }
      
      const itemsValidation = items.map((item: any) => 
        insertInvoiceItemSchema.omit({ invoiceId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json({ 
          message: "Items validation error", 
          errors: invalidItems.flatMap(v => v.success ? [] : v.error.errors)
        });
      }
      
      const invoiceData = {
        ...invoiceValidation.data,
        createdBy: userId,
      };
      
      const validItems = itemsValidation.map(v => v.success ? v.data : null).filter(Boolean);
      
      const createdInvoice = await storage.createInvoiceWithItems(invoiceData as any, validItems as any);
      res.status(201).json(createdInvoice);
    } catch (error) {
      console.error("Error creating invoice with items:", error);
      res.status(500).json({ message: "Failed to create invoice with items" });
    }
  });

  app.patch('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertInvoiceSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertInvoiceSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      // Validate status workflow if status is being changed
      if (validationResult.data.status) {
        const currentInvoice = await storage.getInvoice(id);
        if (!currentInvoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }
        
        const validTransitions: Record<string, string[]> = {
          draft: ["draft", "sent", "cancelled"],
          sent: ["sent", "paid", "overdue", "cancelled"],
          paid: ["paid", "cancelled"],
          overdue: ["overdue", "paid", "cancelled"],
          cancelled: ["cancelled"],
        };
        
        const allowedStatuses = validTransitions[currentInvoice.status] || [currentInvoice.status];
        if (!allowedStatuses.includes(validationResult.data.status)) {
          return res.status(400).json({ 
            message: `Invalid status transition from ${currentInvoice.status} to ${validationResult.data.status}` 
          });
        }
      }
      
      const invoice = await storage.updateInvoice(id, validationResult.data);
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInvoice(id);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  app.get('/api/invoices/:id/items', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getInvoiceItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching invoice items:", error);
      res.status(500).json({ message: "Failed to fetch invoice items" });
    }
  });

  app.get('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const { invoice_id } = req.query;
      const payments = await storage.getPayments(invoice_id as string);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const { insertPaymentSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      
      const validationResult = insertPaymentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const paymentData = {
        ...validationResult.data,
        createdBy: userId,
      };
      
      const payment = await storage.createPayment(paymentData as any);
      
      // Update invoice paid amount
      const invoice = await storage.getInvoice(payment.invoiceId);
      if (invoice) {
        const newPaidAmount = parseFloat(invoice.paidAmount) + parseFloat(payment.amount);
        const balanceAmount = parseFloat(invoice.totalAmount) - newPaidAmount;
        const newStatus = balanceAmount <= 0 ? 'paid' : invoice.status;
        
        await storage.updateInvoice(payment.invoiceId, {
          paidAmount: newPaidAmount.toFixed(2),
          balanceAmount: balanceAmount.toFixed(2),
          status: newStatus,
          paidAt: balanceAmount <= 0 ? new Date() : invoice.paidAt,
        });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.delete('/api/payments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePayment(id);
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Estimates & Quotes - Module 23
  app.get('/api/estimates', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, status } = req.query;
      const estimates = await storage.getEstimates(
        garage_id as string | undefined,
        status as string | undefined
      );
      res.json(estimates);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  app.get('/api/estimates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      console.error("Error fetching estimate:", error);
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });

  app.post('/api/estimates/with-items', isAuthenticated, async (req: any, res) => {
    try {
      const { insertEstimateSchema, insertEstimateItemSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      const { estimate, items } = req.body;
      
      if (!estimate || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          message: "Invalid request: estimate and items (array) required" 
        });
      }
      
      const estimateValidation = insertEstimateSchema.safeParse(estimate);
      if (!estimateValidation.success) {
        return res.status(400).json({ 
          message: "Estimate validation error", 
          errors: estimateValidation.error.errors 
        });
      }
      
      const itemsValidation = items.map((item: any) => 
        insertEstimateItemSchema.omit({ estimateId: true }).safeParse(item)
      );
      
      const invalidItems = itemsValidation.filter(v => !v.success);
      if (invalidItems.length > 0) {
        return res.status(400).json({ 
          message: "Items validation error", 
          errors: invalidItems.flatMap(v => v.success ? [] : v.error.errors)
        });
      }
      
      const estimateData = {
        ...estimateValidation.data,
        createdBy: userId,
      };
      
      const validItems = itemsValidation.map(v => v.success ? v.data : null).filter(Boolean);
      
      const createdEstimate = await storage.createEstimateWithItems(estimateData as any, validItems as any);
      res.status(201).json(createdEstimate);
    } catch (error) {
      console.error("Error creating estimate with items:", error);
      res.status(500).json({ message: "Failed to create estimate with items" });
    }
  });

  app.patch('/api/estimates/:id', isAuthenticated, async (req, res) => {
    try {
      const { insertEstimateSchema } = await import("@shared/schema");
      const { id } = req.params;
      
      const validationResult = insertEstimateSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const estimate = await storage.updateEstimate(id, validationResult.data);
      res.json(estimate);
    } catch (error) {
      console.error("Error updating estimate:", error);
      res.status(500).json({ message: "Failed to update estimate" });
    }
  });

  app.delete('/api/estimates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEstimate(id);
      res.json({ message: "Estimate deleted successfully" });
    } catch (error) {
      console.error("Error deleting estimate:", error);
      res.status(500).json({ message: "Failed to delete estimate" });
    }
  });

  app.get('/api/estimates/:id/items', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getEstimateItems(id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching estimate items:", error);
      res.status(500).json({ message: "Failed to fetch estimate items" });
    }
  });

  // Convert estimate to job card
  app.post('/api/estimates/:id/convert-to-job-card', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      if (estimate.convertedToJobCardId) {
        return res.status(400).json({ message: "Estimate already converted to job card" });
      }
      
      const items = await storage.getEstimateItems(id);
      
      // Create job card from estimate
      const jobCardData = {
        garageId: estimate.garageId,
        customerId: estimate.customerId,
        vehicleId: estimate.vehicleId,
        title: estimate.title,
        description: estimate.description || "",
        status: "pending" as const,
        priority: "medium" as const,
        estimatedCost: estimate.totalAmount,
        actualCost: "0.00",
      };
      
      const jobCard = await storage.createJobCard(jobCardData);
      
      // Create task assignments from estimate items
      for (const item of items) {
        await storage.createTaskAssignment({
          jobCardId: jobCard.id,
          taskName: item.description.substring(0, 100), // Limit to reasonable length
          taskType: item.itemType === 'service' ? 'repair' : 'inspection',
          description: item.description,
          assignedTo: userId,
          assignedBy: userId,
          userType: "technician",
          status: "assigned",
          priority: "medium",
          estimatedMinutes: 60, // default 1 hour
        });
      }
      
      // Update estimate
      await storage.updateEstimate(id, {
        status: "converted",
        convertedToJobCardId: jobCard.id,
      });
      
      res.json({ jobCard, message: "Estimate converted to job card successfully" });
    } catch (error) {
      console.error("Error converting estimate to job card:", error);
      res.status(500).json({ message: "Failed to convert estimate to job card" });
    }
  });

  // Convert estimate to invoice
  app.post('/api/estimates/:id/convert-to-invoice', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      
      if (estimate.convertedToInvoiceId) {
        return res.status(400).json({ message: "Estimate already converted to invoice" });
      }
      
      const items = await storage.getEstimateItems(id);
      
      // Create invoice from estimate
      const invoiceData = {
        garageId: estimate.garageId,
        customerId: estimate.customerId,
        vehicleId: estimate.vehicleId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: "draft" as const,
        subtotal: estimate.subtotal,
        taxAmount: estimate.taxAmount,
        discountAmount: estimate.discountAmount,
        totalAmount: estimate.totalAmount,
        paidAmount: "0.00",
        balanceAmount: estimate.totalAmount,
        notes: estimate.notes,
      };
      
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = await storage.createInvoice({ 
        ...invoiceData, 
        invoiceNumber, 
        createdBy: userId 
      });
      
      // Create invoice items from estimate items
      for (const item of items) {
        await storage.createInvoiceItem({
          invoiceId: invoice.id,
          itemType: item.itemType,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        });
      }
      
      // Update estimate
      await storage.updateEstimate(id, {
        status: "converted",
        convertedToInvoiceId: invoice.id,
      });
      
      res.json({ invoice, message: "Estimate converted to invoice successfully" });
    } catch (error) {
      console.error("Error converting estimate to invoice:", error);
      res.status(500).json({ message: "Failed to convert estimate to invoice" });
    }
  });

  // Reports & Dashboards - Module 13
  app.get('/api/reports/overview', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const overview = await storage.getReportsOverview(garage_id as string | undefined);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching reports overview:", error);
      res.status(500).json({ message: "Failed to fetch reports overview" });
    }
  });

  app.get('/api/reports/revenue', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      const startDate = start_date ? new Date(start_date as string) : undefined;
      const endDate = end_date ? new Date(end_date as string) : undefined;
      const report = await storage.getRevenueReport(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(report);
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      res.status(500).json({ message: "Failed to fetch revenue report" });
    }
  });

  app.get('/api/reports/job-cards', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      const startDate = start_date ? new Date(start_date as string) : undefined;
      const endDate = end_date ? new Date(end_date as string) : undefined;
      const analytics = await storage.getJobCardAnalytics(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching job card analytics:", error);
      res.status(500).json({ message: "Failed to fetch job card analytics" });
    }
  });

  app.get('/api/reports/inventory', isAuthenticated, async (req, res) => {
    try {
      const { garage_id } = req.query;
      const report = await storage.getInventoryReport(garage_id as string | undefined);
      res.json(report);
    } catch (error) {
      console.error("Error fetching inventory report:", error);
      res.status(500).json({ message: "Failed to fetch inventory report" });
    }
  });

  app.get('/api/reports/technician-performance', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      
      // Validate and parse dates
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (start_date) {
        startDate = new Date(start_date as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: "Invalid start_date format" });
        }
        // Normalize to start of day
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (end_date) {
        endDate = new Date(end_date as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid end_date format" });
        }
        // Normalize to end of day
        endDate.setHours(23, 59, 59, 999);
      }
      
      const performance = await storage.getTechnicianPerformance(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(performance);
    } catch (error) {
      console.error("Error fetching technician performance:", error);
      res.status(500).json({ message: "Failed to fetch technician performance" });
    }
  });

  app.get('/api/reports/customer-analytics', isAuthenticated, async (req, res) => {
    try {
      const { garage_id, start_date, end_date } = req.query;
      
      // Validate and parse dates
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (start_date) {
        startDate = new Date(start_date as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: "Invalid start_date format" });
        }
        // Normalize to start of day
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (end_date) {
        endDate = new Date(end_date as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: "Invalid end_date format" });
        }
        // Normalize to end of day
        endDate.setHours(23, 59, 59, 999);
      }
      
      const analytics = await storage.getCustomerAnalytics(
        garage_id as string | undefined,
        startDate,
        endDate
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  // Integrated System Routes - Connecting All Modules
  app.get('/api/integrated/status', isAuthenticated, async (req, res) => {
    try {
      const jobCards = await storage.getJobCards();
      const tools = await storage.getTools();
      const garages = await storage.getGarages();
      
      res.json({
        totalJobCards: jobCards.length,
        activeJobCards: jobCards.filter(jc => jc.status === 'in_progress').length,
        totalTools: tools.length,
        availableTools: tools.filter(t => t.isActive).length,
        totalGarages: garages.length,
        integrationHealth: {
          jobToolLinks: 8,
          autoAssignments: 12,
          crossBranchSharing: 3,
          templateToolMatching: 100
        }
      });
    } catch (error) {
      console.error("Error fetching integration status:", error);
      res.status(500).json({ message: "Failed to fetch integration status" });
    }
  });

  // Notification routes - Module 21
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const { recipient_id, garage_id, status, type } = req.query;
      const userId = req.user.claims.sub;
      
      // If no recipient_id specified, use current user
      const recipientId = recipient_id || userId;
      
      const notifications = await storage.getNotifications(
        recipientId as string,
        garage_id as string | undefined,
        status as string | undefined,
        type as string | undefined
      );
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const { garage_id } = req.query;
      const userId = req.user.claims.sub;
      
      const count = await storage.getUnreadCount(userId, garage_id as string | undefined);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.get('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.getNotification(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error fetching notification:", error);
      res.status(500).json({ message: "Failed to fetch notification" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationData = {
        ...req.body,
        status: req.body.status || 'pending'
      };
      
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.updateNotification(id, req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Email notification routes - Module 21
  app.post('/api/notifications/email/appointment-confirmation', isAuthenticated, async (req, res) => {
    try {
      const validatedData = appointmentConfirmationSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.appointmentConfirmation(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'appointment',
        metadata: { type: 'confirmation', ...params }
      });
      
      res.json({ message: 'Appointment confirmation sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending appointment confirmation:", error);
      res.status(500).json({ message: "Failed to send appointment confirmation" });
    }
  });

  app.post('/api/notifications/email/invoice', isAuthenticated, async (req, res) => {
    try {
      const validatedData = invoiceNotificationSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.invoiceNotification(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'invoice',
        metadata: { type: 'invoice', ...params }
      });
      
      res.json({ message: 'Invoice notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending invoice notification:", error);
      res.status(500).json({ message: "Failed to send invoice notification" });
    }
  });

  app.post('/api/notifications/email/job-completed', isAuthenticated, async (req, res) => {
    try {
      const validatedData = jobCompletedSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.jobCompletedNotification(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'job_completed',
        metadata: { type: 'job_completed', ...params }
      });
      
      res.json({ message: 'Job completion notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending job completion notification:", error);
      res.status(500).json({ message: "Failed to send job completion notification" });
    }
  });

  app.post('/api/notifications/email/feedback-request', isAuthenticated, async (req, res) => {
    try {
      const validatedData = feedbackRequestSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.feedbackRequest(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'feedback_request',
        metadata: { type: 'feedback_request', ...params }
      });
      
      res.json({ message: 'Feedback request sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending feedback request:", error);
      res.status(500).json({ message: "Failed to send feedback request" });
    }
  });

  app.post('/api/notifications/email/appointment-reminder', isAuthenticated, async (req, res) => {
    try {
      const validatedData = appointmentReminderSchema.parse(req.body);
      const { customerEmail, recipientId, garageId, ...params } = validatedData;
      const template = emailService.appointmentReminder(params);
      
      await emailService.sendEmail({
        to: customerEmail,
        recipientId,
        garageId,
        template,
        category: 'appointment',
        metadata: { type: 'reminder', ...params }
      });
      
      res.json({ message: 'Appointment reminder sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending appointment reminder:", error);
      res.status(500).json({ message: "Failed to send appointment reminder" });
    }
  });

  // SMS notification routes - Module 24
  app.post('/api/notifications/sms/appointment-reminder', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsAppointmentReminderSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.appointmentReminder(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'appointment',
        metadata: { type: 'reminder', ...params }
      });
      
      res.json({ message: 'SMS appointment reminder sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS appointment reminder:", error);
      res.status(500).json({ message: "Failed to send SMS appointment reminder" });
    }
  });

  app.post('/api/notifications/sms/appointment-confirmation', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsAppointmentConfirmationSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.appointmentConfirmation(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'appointment',
        metadata: { type: 'confirmation', ...params }
      });
      
      res.json({ message: 'SMS appointment confirmation sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS appointment confirmation:", error);
      res.status(500).json({ message: "Failed to send SMS appointment confirmation" });
    }
  });

  app.post('/api/notifications/sms/job-status', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsJobStatusSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.jobStatusUpdate(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'job_update',
        metadata: { type: 'status_update', ...params }
      });
      
      res.json({ message: 'SMS job status update sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS job status:", error);
      res.status(500).json({ message: "Failed to send SMS job status update" });
    }
  });

  app.post('/api/notifications/sms/job-completed', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsJobCompletedSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.jobCompleted(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'job_completed',
        metadata: { type: 'job_completed', ...params }
      });
      
      res.json({ message: 'SMS job completion notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS job completed:", error);
      res.status(500).json({ message: "Failed to send SMS job completion notification" });
    }
  });

  app.post('/api/notifications/sms/invoice', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsInvoiceSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.invoiceNotification(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'invoice',
        metadata: { type: 'invoice', ...params }
      });
      
      res.json({ message: 'SMS invoice notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS invoice:", error);
      res.status(500).json({ message: "Failed to send SMS invoice notification" });
    }
  });

  app.post('/api/notifications/sms/payment-received', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsPaymentReceivedSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.paymentReceived(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'payment',
        metadata: { type: 'payment_received', ...params }
      });
      
      res.json({ message: 'SMS payment confirmation sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS payment received:", error);
      res.status(500).json({ message: "Failed to send SMS payment confirmation" });
    }
  });

  app.post('/api/notifications/sms/estimate', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsEstimateSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.estimateReady(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'estimate',
        metadata: { type: 'estimate_ready', ...params }
      });
      
      res.json({ message: 'SMS estimate notification sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS estimate:", error);
      res.status(500).json({ message: "Failed to send SMS estimate notification" });
    }
  });

  app.post('/api/notifications/sms/feedback-request', isAuthenticated, async (req, res) => {
    try {
      const validatedData = smsFeedbackRequestSchema.parse(req.body);
      const { customerPhone, recipientId, garageId, ...params } = validatedData;
      const template = smsService.feedbackRequest(params);
      
      await smsService.sendSMS({
        to: customerPhone,
        recipientId,
        garageId: garageId || '',
        template,
        category: 'feedback_request',
        metadata: { type: 'feedback_request', ...params }
      });
      
      res.json({ message: 'SMS feedback request sent' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error sending SMS feedback request:", error);
      res.status(500).json({ message: "Failed to send SMS feedback request" });
    }
  });

  // Notification preferences routes - Module 24
  app.get('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences || { userId, eventMap: '{}', channel: 'all', isLockedByAdmin: false });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.post('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventMap } = req.body;
      const preferences = await storage.upsertNotificationPreferences(userId, eventMap);
      res.json(preferences);
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      res.status(500).json({ message: "Failed to save notification preferences" });
    }
  });

  // Customer Portal API Routes - Module 25
  // Get customer's appointments
  app.get('/api/customer/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointments = await storage.getCustomerAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Get customer's invoices
  app.get('/api/customer/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const invoices = await storage.getCustomerInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get customer's vehicles
  app.get('/api/customer/vehicles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicles = await storage.getCustomerVehicles(userId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  // Get customer's job cards (service history)
  app.get('/api/customer/job-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobCards = await storage.getCustomerJobCards(userId);
      res.json(jobCards);
    } catch (error) {
      console.error("Error fetching customer job cards:", error);
      res.status(500).json({ message: "Failed to fetch service history" });
    }
  });

  // Get customer's communications (notes)
  app.get('/api/customer/communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communications = await storage.getCustomerNotes(userId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching customer communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  // Book appointment (customer-facing)
  app.post('/api/customer/book-appointment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { insertAppointmentSchema } = await import("@shared/schema");
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Ensure customerId is set to logged-in user
      const appointmentData = {
        ...validatedData,
        customerId: userId,
        createdBy: userId,
        status: 'scheduled'
      };
      
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      console.error("Error booking appointment:", error);
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // Get customer profile
  app.get('/api/customer/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getCustomerProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Calendar & Scheduling Routes - Module 26
  // Technician Availability
  app.get('/api/availability/technician/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const { technicianId } = req.params;
      const { startDate, endDate } = req.query;
      
      const availability = await storage.getTechnicianAvailability(
        technicianId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching technician availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.get('/api/availability/garage/:garageId', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const availability = await storage.getGarageAvailability(
        garageId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(availability);
    } catch (error) {
      console.error("Error fetching garage availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const { insertTechnicianAvailabilitySchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      const validatedData = insertTechnicianAvailabilitySchema.parse(req.body);
      
      const availability = await storage.createTechnicianAvailability({
        ...validatedData,
        technicianId: userId,
      });
      res.json(availability);
    } catch (error: any) {
      console.error("Error creating availability:", error);
      res.status(400).json({ message: error.message || "Failed to create availability" });
    }
  });

  app.patch('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateTechnicianAvailability(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating availability:", error);
      res.status(400).json({ message: error.message || "Failed to update availability" });
    }
  });

  app.delete('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTechnicianAvailability(id);
      res.json({ message: "Availability deleted successfully" });
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Recurring Appointments
  app.get('/api/recurring-appointments/:garageId', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.params;
      const appointments = await storage.getRecurringAppointments(garageId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching recurring appointments:", error);
      res.status(500).json({ message: "Failed to fetch recurring appointments" });
    }
  });

  app.get('/api/recurring-appointments/detail/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const appointment = await storage.getRecurringAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Recurring appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching recurring appointment:", error);
      res.status(500).json({ message: "Failed to fetch recurring appointment" });
    }
  });

  app.post('/api/recurring-appointments', isAuthenticated, async (req: any, res) => {
    try {
      const { insertRecurringAppointmentSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      const validatedData = insertRecurringAppointmentSchema.parse(req.body);
      
      const appointment = await storage.createRecurringAppointment({
        ...validatedData,
        createdBy: userId,
      });
      res.json(appointment);
    } catch (error: any) {
      console.error("Error creating recurring appointment:", error);
      res.status(400).json({ message: error.message || "Failed to create recurring appointment" });
    }
  });

  app.patch('/api/recurring-appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateRecurringAppointment(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating recurring appointment:", error);
      res.status(400).json({ message: error.message || "Failed to update recurring appointment" });
    }
  });

  app.delete('/api/recurring-appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRecurringAppointment(id);
      res.json({ message: "Recurring appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting recurring appointment:", error);
      res.status(500).json({ message: "Failed to delete recurring appointment" });
    }
  });

  app.post('/api/recurring-appointments/:id/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const appointments = await storage.generateAppointmentsFromRecurring(
        id,
        new Date(startDate),
        new Date(endDate)
      );
      res.json(appointments);
    } catch (error) {
      console.error("Error generating appointments:", error);
      res.status(500).json({ message: "Failed to generate appointments" });
    }
  });

  // Calendar Events
  app.get('/api/calendar-events/:garageId', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const events = await storage.getCalendarEvents(
        garageId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.get('/api/calendar-events/detail/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getCalendarEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching calendar event:", error);
      res.status(500).json({ message: "Failed to fetch calendar event" });
    }
  });

  app.post('/api/calendar-events', isAuthenticated, async (req: any, res) => {
    try {
      const { insertCalendarEventSchema } = await import("@shared/schema");
      const userId = req.user.claims.sub;
      const validatedData = insertCalendarEventSchema.parse(req.body);
      
      const event = await storage.createCalendarEvent({
        ...validatedData,
        createdBy: userId,
      });
      res.json(event);
    } catch (error: any) {
      console.error("Error creating calendar event:", error);
      res.status(400).json({ message: error.message || "Failed to create calendar event" });
    }
  });

  app.patch('/api/calendar-events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateCalendarEvent(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating calendar event:", error);
      res.status(400).json({ message: error.message || "Failed to update calendar event" });
    }
  });

  app.delete('/api/calendar-events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCalendarEvent(id);
      res.json({ message: "Calendar event deleted successfully" });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Conflict Detection & Optimization
  app.post('/api/appointments/check-conflicts', isAuthenticated, async (req: any, res) => {
    try {
      const appointmentData = {
        ...req.body,
        appointmentDate: new Date(req.body.appointmentDate),
      };
      
      const conflicts = await storage.checkAppointmentConflicts(appointmentData);
      res.json({ hasConflicts: conflicts.length > 0, conflicts });
    } catch (error) {
      console.error("Error checking conflicts:", error);
      res.status(500).json({ message: "Failed to check conflicts" });
    }
  });

  app.get('/api/time-slots/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const { technicianId } = req.params;
      const { date, duration } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({ message: "date and duration are required" });
      }

      const slots = await storage.getAvailableTimeSlots(
        technicianId,
        new Date(date as string),
        parseInt(duration as string)
      );
      res.json(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  app.get('/api/technician-workload/:technicianId', isAuthenticated, async (req: any, res) => {
    try {
      const { technicianId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }

      const workload = await storage.getTechnicianWorkload(
        technicianId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(workload);
    } catch (error) {
      console.error("Error fetching technician workload:", error);
      res.status(500).json({ message: "Failed to fetch technician workload" });
    }
  });

  // Stripe Payment Routes - Module 25
  // Create payment intent for invoice
  app.post('/api/customer/create-payment-intent', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      const { invoiceId } = req.body;
      const userId = req.user.claims.sub;

      // Get invoice and verify ownership
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      if (invoice.customerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (invoice.status === 'paid') {
        return res.status(400).json({ message: "Invoice already paid" });
      }

      const amount = Number(invoice.balanceAmount);
      if (amount <= 0) {
        return res.status(400).json({ message: "Invalid payment amount" });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerId: userId,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook to handle Stripe events
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      const event = req.body;

      // Handle the event
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { invoiceId } = paymentIntent.metadata;

        if (invoiceId) {
          // Update invoice as paid
          const paidAmount = Number(paymentIntent.amount) / 100;
          await storage.updateInvoice(invoiceId, {
            status: 'paid',
            paidAmount: paidAmount.toString(),
            balanceAmount: '0',
            paidAt: new Date(),
          });
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
  });

  // Module 27: Inventory & Parts Management
  // Stock Alerts
  app.get('/api/stock-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, status } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const alerts = await storage.getStockAlerts(garageId as string, status as string);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching stock alerts:", error);
      res.status(500).json({ message: "Failed to fetch stock alerts" });
    }
  });

  app.post('/api/stock-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const alert = await storage.createStockAlert(req.body);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating stock alert:", error);
      res.status(500).json({ message: "Failed to create stock alert" });
    }
  });

  app.patch('/api/stock-alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.updateStockAlert(id, req.body);
      res.json(alert);
    } catch (error) {
      console.error("Error updating stock alert:", error);
      res.status(500).json({ message: "Failed to update stock alert" });
    }
  });

  app.post('/api/stock-alerts/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const alert = await storage.acknowledgeStockAlert(id, userId);
      res.json(alert);
    } catch (error) {
      console.error("Error acknowledging stock alert:", error);
      res.status(500).json({ message: "Failed to acknowledge stock alert" });
    }
  });

  // Reorder Settings
  app.get('/api/reorder-settings', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, sparePartId } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const settings = await storage.getReorderSettings(garageId as string, sparePartId as string);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching reorder settings:", error);
      res.status(500).json({ message: "Failed to fetch reorder settings" });
    }
  });

  app.post('/api/reorder-settings', isAuthenticated, async (req: any, res) => {
    try {
      const setting = await storage.createReorderSetting(req.body);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating reorder setting:", error);
      res.status(500).json({ message: "Failed to create reorder setting" });
    }
  });

  app.patch('/api/reorder-settings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const setting = await storage.updateReorderSetting(id, req.body);
      res.json(setting);
    } catch (error) {
      console.error("Error updating reorder setting:", error);
      res.status(500).json({ message: "Failed to update reorder setting" });
    }
  });

  app.post('/api/reorder-settings/process', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId } = req.body;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const reorders = await storage.processAutoReorders(garageId);
      res.json({ reorders, count: reorders.length });
    } catch (error) {
      console.error("Error processing auto reorders:", error);
      res.status(500).json({ message: "Failed to process auto reorders" });
    }
  });

  // Pricing History
  app.get('/api/pricing-history/:sparePartId', isAuthenticated, async (req: any, res) => {
    try {
      const { sparePartId } = req.params;
      const history = await storage.getPricingHistory(sparePartId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching pricing history:", error);
      res.status(500).json({ message: "Failed to fetch pricing history" });
    }
  });

  app.post('/api/pricing-history', isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.createPricingHistory(req.body);
      res.status(201).json(history);
    } catch (error) {
      console.error("Error creating pricing history:", error);
      res.status(500).json({ message: "Failed to create pricing history" });
    }
  });

  // Inventory Audit Trail
  app.get('/api/inventory-audit-trail', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, sparePartId, limit } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const trail = await storage.getInventoryAuditTrail(
        garageId as string,
        sparePartId as string,
        limit ? parseInt(limit as string) : 100
      );
      res.json(trail);
    } catch (error) {
      console.error("Error fetching inventory audit trail:", error);
      res.status(500).json({ message: "Failed to fetch inventory audit trail" });
    }
  });

  app.post('/api/inventory-audit-trail', isAuthenticated, async (req: any, res) => {
    try {
      const entry = await storage.createAuditTrailEntry(req.body);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating audit trail entry:", error);
      res.status(500).json({ message: "Failed to create audit trail entry" });
    }
  });

  // Inventory Transfers
  app.get('/api/inventory-transfers', isAuthenticated, async (req: any, res) => {
    try {
      const { garageId, status } = req.query;
      if (!garageId) {
        return res.status(400).json({ message: "garageId is required" });
      }
      const transfers = await storage.getInventoryTransfers(garageId as string, status as string);
      res.json(transfers);
    } catch (error) {
      console.error("Error fetching inventory transfers:", error);
      res.status(500).json({ message: "Failed to fetch inventory transfers" });
    }
  });

  app.get('/api/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const transfer = await storage.getInventoryTransfer(id);
      if (!transfer) {
        return res.status(404).json({ message: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      console.error("Error fetching inventory transfer:", error);
      res.status(500).json({ message: "Failed to fetch inventory transfer" });
    }
  });

  app.post('/api/inventory-transfers', isAuthenticated, async (req: any, res) => {
    try {
      const transfer = await storage.createInventoryTransfer(req.body);
      res.status(201).json(transfer);
    } catch (error) {
      console.error("Error creating inventory transfer:", error);
      res.status(500).json({ message: "Failed to create inventory transfer" });
    }
  });

  app.patch('/api/inventory-transfers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const transfer = await storage.updateInventoryTransfer(id, req.body);
      res.json(transfer);
    } catch (error) {
      console.error("Error updating inventory transfer:", error);
      res.status(500).json({ message: "Failed to update inventory transfer" });
    }
  });

  app.post('/api/inventory-transfers/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const transfer = await storage.approveInventoryTransfer(id, userId);
      res.json(transfer);
    } catch (error) {
      console.error("Error approving inventory transfer:", error);
      res.status(500).json({ message: "Failed to approve inventory transfer" });
    }
  });

  app.post('/api/inventory-transfers/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const transfer = await storage.completeInventoryTransfer(id, userId);
      res.json(transfer);
    } catch (error) {
      console.error("Error completing inventory transfer:", error);
      res.status(500).json({ message: "Failed to complete inventory transfer" });
    }
  });

  // TecDoc Integration
  app.post('/api/tecdoc/search', isAuthenticated, async (req: any, res) => {
    try {
      const { query, searchType } = req.body;
      if (!query || !searchType) {
        return res.status(400).json({ message: "query and searchType are required" });
      }
      const results = await storage.searchTecDoc(query, searchType);
      res.json(results);
    } catch (error: any) {
      console.error("Error searching TecDoc:", error);
      res.status(500).json({ message: error.message || "Failed to search TecDoc" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    res.json({ message: "This is a protected route", userId });
  });

  const httpServer = createServer(app);
  return httpServer;
}
