# SALIS AUTO — Frequently Asked Questions (FAQ)

**Document Type:** Knowledge Base — FAQ  
**Audience:** All users  
**Last Updated:** March 2026  

---

## General Questions

**Q: What is SALIS AUTO?**  
A: SALIS AUTO is a comprehensive automotive ERP (Enterprise Resource Planning) platform that manages every aspect of a professional garage or automotive service center — from customer management and job cards to invoicing, inventory, HR, and compliance.

**Q: What languages does SALIS AUTO support?**  
A: SALIS AUTO fully supports English and Arabic (with RTL layout). You can toggle between languages using the language button in the top navigation bar.

**Q: Can I access SALIS AUTO on my mobile phone?**  
A: Yes. SALIS AUTO includes dedicated mobile-optimized applications for technicians (`/technician-app`), customers (`/customer-app`), and a mobile-responsive design for all other users.

**Q: What are the default login credentials?**  
A: For demonstration/development:
- Admin: admin@salisauto.com / admin123
- Technician: tech@salisauto.com / tech123
- Customer: client@salisauto.com / client123
- Purchase Agent: agent@salisauto.com / agent123

**Q: How do I switch between English and Arabic?**  
A: Click the language toggle button (EN/AR) in the top navigation bar.

---

## Customer Management

**Q: How do I add a new customer?**  
A: Go to Customers → click "Add Customer" → fill in the required fields (name, email, phone) → click Save.

**Q: Can one customer have multiple vehicles?**  
A: Yes. Each customer can have unlimited vehicles registered. Go to the customer's profile to view and add vehicles.

**Q: How does the loyalty program work?**  
A: Customers earn points for every SAR spent. Points accumulate through tiers: Bronze → Silver → Gold → Platinum. Higher tiers receive increasing discounts and benefits. Manage this in the Loyalty Program module.

**Q: Can customers track their vehicle service status?**  
A: Yes. Each job card generates a unique tracking URL (e.g., `/track/abc123`) that can be shared with the customer for real-time status updates without requiring a login.

---

## Job Cards & Service

**Q: What are the job card statuses?**  
A: Job cards move through: **Pending** → **In Progress** → **Completed** → **Delivered**. Additional statuses: On Hold, Cancelled.

**Q: Can I assign multiple technicians to one job?**  
A: Yes. While a job card has a primary assigned technician, individual tasks within the job can be assigned to different technicians.

**Q: How do I create a job card from an appointment?**  
A: When an appointment is checked in, click "Convert to Job Card" on the appointment page. The customer and vehicle information transfers automatically.

**Q: What is a Service Template?**  
A: Service Templates are predefined sets of tasks and parts for common services (e.g., "Oil Change", "Brake Service"). When creating a job card, you can apply a template to automatically add standard tasks and parts.

---

## Invoices & Payments

**Q: How is VAT calculated on invoices?**  
A: VAT is automatically calculated at the rate configured in VAT Settings (default 15% for Saudi Arabia). It applies to both labor and parts line items.

**Q: Can I send invoices to ZATCA?**  
A: Yes. SALIS AUTO is ZATCA-certified. After finalizing an invoice, click "Submit to ZATCA" to send the e-invoice to the Saudi tax authority.

**Q: What payment methods are supported?**  
A: Cash, bank transfer, Stripe (credit/debit cards), and PayPal. Configure payment methods in Financial Settings.

**Q: Can I create credit notes or refunds?**  
A: Yes. Go to Payments → Refund Management to process refunds. Credit notes can be issued against specific invoices.

---

## Inventory & Parts

**Q: How does the auto-reorder system work?**  
A: Set minimum stock levels for each part. When inventory falls below the threshold, the system automatically generates a purchase order (if auto-reorder is enabled) or sends an alert to the parts manager.

**Q: What is the B2B Parts Network?**  
A: The Parts Network allows garages to request parts from other network members in real time. When a part is out of stock, you can broadcast a request to the network and receive competitive quotations.

**Q: How do I track parts used in a job?**  
A: Open a job card → Parts tab → Add parts as they are used. The system automatically deducts from inventory and adds the cost to the job.

---

## Appointments & Scheduling

**Q: Can customers book appointments online?**  
A: Yes. Customers can book appointments through the Customer Portal (`/customer-app/booking`) without requiring staff intervention.

**Q: What is the Workshop Calendar?**  
A: The Workshop Calendar (`/workshop-calendar`) provides a visual, drag-and-drop interface for scheduling jobs to specific technicians and bays.

**Q: How does AI Scheduling work?**  
A: The AI Scheduling module analyzes technician availability, skill requirements, and current workload to suggest optimal appointment times and technician assignments.

---

## HR & Payroll

**Q: How do technicians clock in and out?**  
A: Technicians use the Time Clock page in their portal (`/technician-portal/time-clock`) or the mobile app to record their work hours.

**Q: How are leave requests handled?**  
A: Staff submit leave requests through the Leave Requests module. Requests are routed to the HR Manager for approval/rejection with automated status notifications.

**Q: How is payroll calculated?**  
A: Payroll is calculated based on employee profiles (salary or hourly rate), timesheet data, approved overtime, and deductions. Run payroll from HR Management → Payroll.

---

## Compliance & Saudi Arabia

**Q: What is ZATCA compliance?**  
A: ZATCA (Zakat, Tax and Customs Authority) requires all Saudi businesses above a threshold to submit invoices electronically in Phase 1 (QR code) and Phase 2 (real-time integration). SALIS AUTO handles both phases.

**Q: How do I set up VAT?**  
A: Go to Compliance → VAT Settings. Enter your VAT registration number and confirm the rate. The system will apply VAT to all invoices automatically.

**Q: What is the Hijri calendar feature?**  
A: SALIS AUTO can display dates in both Gregorian and Hijri (Islamic) calendar formats. Configure this in System Settings → Localization.

---

## AI & Advanced Features

**Q: How does the AI Chatbot work?**  
A: The AI Chatbot (powered by OpenAI GPT-4o) is available at `/ai-chatbot`. Customers can ask service questions and get intelligent responses. Staff can also use it for internal queries.

**Q: What does Predictive Maintenance do?**  
A: Based on vehicle service history, mileage, and model data, the system predicts when a vehicle is likely to need service and sends proactive reminders to customers.

**Q: What is the Digital Twin?**  
A: The Digital Twin Viewer creates a 3D virtual representation of a vehicle that mirrors its real-world condition, allowing remote monitoring and diagnosis.

---

## Technical Questions

**Q: Is the platform available offline?**  
A: SALIS AUTO is a Progressive Web App (PWA). A service worker caches critical pages for offline viewing, but real-time data requires connectivity.

**Q: Can I export data?**  
A: Yes. Most modules have export buttons for CSV, Excel, and PDF. For bulk export, use Data Import/Export module.

**Q: How do I add more users?**  
A: Go to Settings → Role Management to create new user accounts and assign roles. User permissions are controlled by their assigned role.

**Q: What browsers are supported?**  
A: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. Internet Explorer is not supported.

---

*SALIS AUTO FAQ — March 2026*
