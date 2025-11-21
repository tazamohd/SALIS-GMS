# SALIS AUTO - User Role to UI Access Matrix

This document maps all **24 professional roles** to the **174 UI pages** they can access based on their permissions and scope.

---

## 🎯 Quick Reference by Role Type

### SYSTEM SCOPE (Full Platform Access)
**System Administrator** - ✅ ALL 174 pages

### GARAGE SCOPE (Garage-Wide Access)
**Business Owner** - ✅ 160+ pages (all except specialized tech features)
**General Manager** - ✅ 145+ pages (excludes sensitive finance settings)
**Garage Manager** - ✅ 130+ pages (operational focus)
**Finance Manager** - ✅ 80+ pages (finance + analytics)
**Accountant** - ✅ 60+ pages (accounting operations)
**HR Manager** - ✅ 70+ pages (HR + staff management)
**Marketing Manager** - ✅ 50+ pages (marketing + customer engagement)
**Warehouse Manager** - ✅ 60+ pages (inventory + logistics)

### BRANCH SCOPE (Location-Specific Access)
**Service Manager** - ✅ 95+ pages (service operations)
**Service Advisor** - ✅ 70+ pages (customer service)
**Parts Manager** - ✅ 55+ pages (parts + inventory)
**Lead Technician** - ✅ 65+ pages (technical + supervisory)
**Technician** - ✅ 45+ pages (assigned jobs + diagnostics)
**Call Center Agent** - ✅ 35+ pages (calls + appointments)
**Customer Service Rep** - ✅ 40+ pages (customer support)
**Receptionist** - ✅ 30+ pages (front desk)
**Quality Control Inspector** - ✅ 45+ pages (QC + compliance)

---

## 📋 Detailed Access Matrix by Category

### 1️⃣ Dashboard & Overview (2 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| KPI Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 2️⃣ Customer Intake & Appointments (5 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Customers | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Appointments | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Calendar | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Appointment Reminders | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Kiosk Check-In | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

### 3️⃣ Vehicle Management (6 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Vehicles | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (view only) | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Vehicle History | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (own jobs) | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| VIN Decoder | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Fleet Management | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Fleet Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Loaner Vehicles | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

### 4️⃣ Inspection & Check-In (4 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Vehicle Inspections | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Digital Vehicle Walkaround | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Security Cameras | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| License Plate Recognition | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

### 5️⃣ Diagnostics & Assessment (6 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Diagnostics & OBD | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Smart Damage Assessment | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Vehicle Health Monitoring | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Predictive Maintenance | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Predictive Diagnostics (AI) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Document OCR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |

### 6️⃣ Service Planning & Scheduling (10 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Job Cards | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (assigned) | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (assigned) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Service Templates | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (view) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| AI Scheduling | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Smart Assignment (AI) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Estimates | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Video Estimates | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Smart Parts Recommendations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AI Parts Recommender | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Intelligent Price Optimizer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 7️⃣ Parts & Inventory (11 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Inventory Management | ✅ | ✅ | ✅ | ✅ | ✅ (view) | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Spare Parts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (view) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tools | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Parts Auto Reorder | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Smart Inventory Forecasting | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Suppliers | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Vendor/Supplier Portal | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Purchase Orders | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Parts Marketplace | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Parts Supply Network | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Barcode Scanner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 8️⃣ Service Execution & Operations (10 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Technician Portal | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Technician Management | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Technician Leaderboards | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Technician Performance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Towing Services | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Towing & Roadside | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Vehicle Storage | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Tire Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Route Optimizer | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Task Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (assigned) | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |

### 9️⃣ Quality & Delivery (5 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Contract Management | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Warranty Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (view) | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Equipment Calibration | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| ISO 9001 QMS | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Knowledge Base | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |

### 🔟 Billing & Payments (7 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Invoices | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Financial Settings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Refund Management | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Accounting Integration | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Expense Tracking | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Payroll Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Payment Processing (Stripe) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

### 1️⃣1️⃣ Analytics & Business Intelligence (8 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ (limited) | ✅ (limited) | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Custom Reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Business Intelligence | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| BI Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Profit Analysis | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Customer LTV | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Business Heat Maps | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Fraud Detection (ML) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 1️⃣2️⃣ Customer Experience & Growth (16 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Marketing Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|---------------|-------------|-----|--------------|--------------|
| Marketing Automation | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Email Marketing | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Customer Loyalty | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Referral Program | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reviews & Ratings | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Live Service Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Video Consultations | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Social Media Integration | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Social Media Monitoring | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Google My Business | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| AI Chatbot | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| AI Assistant | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| AI Service Advisor | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Voice Commands | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Voice Interface | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

### 1️⃣3️⃣ Team & HR Management (5 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| HR Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Time & Payroll | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (own) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Timesheet Management | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Performance Review | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Training & Certifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 1️⃣4️⃣ Compliance & Safety (4 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Environmental Compliance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Safety Incidents | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (report) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Insurance Claims | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Compliance Management | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |

### 1️⃣5️⃣ Enterprise & Franchise (6 pages)
| Page | System Admin | Owner | General Mgr | Franchise Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr |
|------|--------------|-------|-------------|---------------|-------------|-----------------|-----------|------------|-------------|------------|--------|
| Franchise Management | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| OEM Software | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Globalization | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Telematics Integration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Blockchain Service History | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ (view) | ❌ | ❌ | ❌ |
| Smart Contracts | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

### 1️⃣6️⃣ Emerging Technologies (10 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| AR Repair Guide | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| VR Showroom | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Drone Inspection | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Wearable Integration | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Digital Twin Viewer | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Computer Vision QC | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| IoT Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edge Computing | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| NextGen Technologies | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Energy Monitoring | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 1️⃣7️⃣ AI & Automation Hub (3 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| AI & Automation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Call Center | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Parts Availability | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |

### 1️⃣8️⃣ System & Settings (8 pages)
| Page | System Admin | Owner | General Mgr | Service Mgr | Service Advisor | Parts Mgr | Technician | Finance Mgr | Accountant | HR Mgr | Call Center | CSR | Receptionist | QC Inspector |
|------|--------------|-------|-------------|-------------|-----------------|-----------|------------|-------------|------------|--------|-------------|-----|--------------|--------------|
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Security | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Document Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (view) | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Data Import/Export | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Integrations | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Digital Signage | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 🎓 Sample Login Credentials by Role

### Executive & Management
- **System Admin**: admin@salisauto.com / password123
- **Business Owner**: raphaelle.boyle@salisauto.com / password123
- **General Manager**: elmira.frami@salisauto.com / password123
- **Garage Manager**: boyd85@gmail.com / password123

### Service Operations
- **Service Manager**: isaias.schumm@salisauto.com / password123
- **Service Advisor**: sasha.emard@salisauto.com / password123
- **Technician**: freddie.boyle70@gmail.com / password123

### Parts & Inventory
- **Parts Manager**: fannie.deckow-howell@salisauto.com / password123
- **Warehouse Manager**: xavier.pollich-bahringer@salisauto.com / password123

### Finance
- **Finance Manager**: leila.senger@salisauto.com / password123
- **Accountant**: edgar.heaney@salisauto.com / password123

### Customer Service
- **Call Center Agent**: ethelyn.leffler@salisauto.com / password123
- **CSR**: chelsey.dicki-little@salisauto.com / password123
- **Receptionist**: jason.jacobson@salisauto.com / password123

### Other Departments
- **HR Manager**: hugh.rohan@salisauto.com / password123
- **Marketing Manager**: samson.franecki@salisauto.com / password123
- **QC Inspector**: evalyn.shanahan@salisauto.com / password123

---

## 🔐 Security Notes

- All role-based access is enforced at both frontend and backend levels
- Permission checks happen on every API request
- Users can only see navigation items for pages they have access to
- Data returned is filtered based on user scope (system/garage/branch)
- Audit trails track all permission-based actions

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Total Users**: 70 staff across 24 roles  
**Total UI Pages**: 174 pages with granular access control
