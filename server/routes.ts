import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

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

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    res.json({ message: "This is a protected route", userId });
  });

  const httpServer = createServer(app);
  return httpServer;
}
