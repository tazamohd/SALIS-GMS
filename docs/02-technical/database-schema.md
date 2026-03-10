# SALIS AUTO — Database Schema Reference

**Document Type:** Database Schema  
**ORM:** Drizzle ORM  
**Database:** PostgreSQL  
**Schema File:** `shared/schema.ts` (~10,681 lines)  
**Total Tables:** 320+  

---

## Overview

The SALIS AUTO database is designed around a **multi-tenant architecture** with `garageId` as the primary tenant discriminator. All operational data is scoped to a garage, with some data further scoped to a `branchId`.

### Primary Key Strategy
- Most tables use `uuid` primary keys generated with `gen_random_uuid()`
- User IDs use `varchar(255)` for compatibility with auth providers
- Junction/mapping tables use composite primary keys

---

## Core System Tables

### `garages`
The root tenant entity.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique garage identifier |
| name | varchar(255) | Garage name |
| email | varchar(255) | Contact email |
| phone | varchar(50) | Contact phone |
| address | text | Physical address |
| city | varchar(100) | City |
| country | varchar(100) | Country |
| currency | varchar(10) | Default currency |
| vatNumber | varchar(50) | VAT registration number |
| trnNumber | varchar(50) | TRN for Saudi compliance |
| createdAt | timestamp | Registration date |

### `branches`
Physical locations belonging to a garage.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Branch identifier |
| garageId | uuid (FK → garages) | Parent garage |
| name | varchar(255) | Branch name |
| address | text | Branch address |
| phone | varchar(50) | Branch phone |
| managerId | varchar (FK → users) | Branch manager |
| isActive | boolean | Active status |

### `users`
Central user table for all platform users.
| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) (PK) | User identifier |
| email | varchar(255) (unique) | Login email |
| password | varchar(255) | bcrypt hashed password |
| name | varchar(255) | Display name |
| role | varchar(100) | Primary role |
| garageId | uuid (FK) | Associated garage |
| isActive | boolean | Account status |
| twoFactorEnabled | boolean | 2FA status |
| preferredLanguage | varchar(10) | 'en' or 'ar' |

### `sessions`
Express session storage.
| Column | Type | Description |
|--------|------|-------------|
| sid | varchar (PK) | Session ID |
| sess | jsonb | Session data |
| expire | timestamp | Expiration time |

---

## RBAC Tables

### `roles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Role identifier |
| name | varchar(100) | Role name (e.g., TECHNICIAN) |
| scope | varchar(50) | System/Garage/Branch/Franchise |
| description | text | Role description |
| garageId | uuid (nullable) | Custom garage role |

### `permissions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Permission identifier |
| resource | varchar(100) | Resource name |
| action | varchar(50) | Action (READ, CREATE, etc.) |

### `role_permissions`
Many-to-many: roles ↔ permissions
| Column | Type | Description |
|--------|------|-------------|
| roleId | uuid (FK → roles) | Role reference |
| permissionId | uuid (FK → permissions) | Permission reference |

### `user_role_branch`
User role assignment with branch scope.
| Column | Type | Description |
|--------|------|-------------|
| userId | varchar (FK → users) | User reference |
| roleId | uuid (FK → roles) | Role reference |
| branchId | uuid (FK → branches) | Branch scope |
| garageId | uuid (FK → garages) | Garage scope |

---

## Operations Tables

### `job_cards`
Core operational entity.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Job card ID |
| jobNumber | varchar(50) | Human-readable number |
| garageId | uuid (FK) | Garage |
| branchId | uuid (FK) | Branch |
| customerId | uuid (FK → customers) | Customer |
| vehicleId | uuid (FK → vehicles) | Vehicle |
| assignedTechId | varchar (FK → users) | Assigned technician |
| status | varchar(50) | pending/in_progress/completed/delivered |
| priority | varchar(20) | low/normal/high/urgent |
| description | text | Service description |
| laborCost | numeric(10,2) | Labor total |
| partsCost | numeric(10,2) | Parts total |
| totalCost | numeric(10,2) | Grand total |
| startDate | timestamp | Work start |
| completionDate | timestamp | Work completed |
| deliveryDate | timestamp | Vehicle delivered |
| trackingToken | varchar(255) | Public tracking URL token |
| notes | text | Internal notes |

### `task_assignments`
Tasks within a job card.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Task ID |
| jobCardId | uuid (FK → job_cards) | Parent job card |
| technicianId | varchar (FK → users) | Assigned technician |
| taskName | varchar(255) | Task description |
| estimatedHours | numeric(5,2) | Time estimate |
| actualHours | numeric(5,2) | Actual time |
| status | varchar(50) | pending/in_progress/completed |
| progress | integer | Completion percentage (0-100) |

### `appointments`
Service bookings.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Appointment ID |
| garageId | uuid (FK) | Garage |
| customerId | uuid (FK) | Customer |
| vehicleId | uuid (FK) | Vehicle |
| scheduledAt | timestamp | Appointment date/time |
| duration | integer | Duration in minutes |
| serviceType | varchar(100) | Type of service |
| status | varchar(50) | scheduled/confirmed/completed/cancelled |
| notes | text | Special notes |

---

## Customer & Vehicle Tables

### `customers`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Customer ID |
| garageId | uuid (FK) | Garage |
| name | varchar(255) | Full name |
| email | varchar(255) | Email address |
| phone | varchar(50) | Phone number |
| nationality | varchar(100) | Nationality |
| idType | varchar(50) | ID type (national ID, passport) |
| idNumber | varchar(100) | ID number |
| preferredLanguage | varchar(10) | Language preference |

### `vehicles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Vehicle ID |
| garageId | uuid (FK) | Garage |
| customerId | uuid (FK → customers) | Owner |
| vin | varchar(17) | VIN number |
| plateNumber | varchar(20) | License plate |
| make | varchar(100) | Manufacturer |
| model | varchar(100) | Model name |
| year | integer | Model year |
| color | varchar(50) | Vehicle color |
| engineType | varchar(50) | Engine specification |
| mileage | integer | Current mileage |
| fuelType | varchar(50) | petrol/diesel/electric/hybrid |

### `vehicle_service_history`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record ID |
| vehicleId | uuid (FK → vehicles) | Vehicle |
| jobCardId | uuid (FK → job_cards) | Related job card |
| serviceDate | timestamp | Service date |
| mileageAtService | integer | Mileage reading |
| servicesPerformed | text[] | Array of service names |
| technicianId | varchar (FK) | Technician who performed work |
| totalCost | numeric(10,2) | Total cost |

---

## Inventory Tables

### `spare_parts`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Part ID |
| garageId | uuid (FK) | Garage |
| sku | varchar(100) | Stock keeping unit |
| name | varchar(255) | Part name |
| description | text | Part description |
| category | varchar(100) | Part category |
| brand | varchar(100) | Manufacturer |
| unitCost | numeric(10,2) | Purchase cost |
| sellingPrice | numeric(10,2) | Retail price |
| compatibleMakes | text[] | Compatible vehicle makes |
| compatibleModels | text[] | Compatible models |

### `spare_part_inventories`
Stock levels per branch.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record ID |
| partId | uuid (FK → spare_parts) | Part reference |
| branchId | uuid (FK → branches) | Branch location |
| quantity | integer | Current stock |
| minQuantity | integer | Reorder threshold |
| maxQuantity | integer | Maximum stock level |
| binLocation | varchar(50) | Physical bin/shelf |

---

## Financial Tables

### `invoices`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Invoice ID |
| invoiceNumber | varchar(50) | Human-readable number |
| garageId | uuid (FK) | Garage |
| customerId | uuid (FK) | Customer |
| jobCardId | uuid (FK) | Related job card |
| status | varchar(50) | draft/sent/paid/void |
| subtotal | numeric(10,2) | Before tax |
| vatRate | numeric(5,2) | VAT percentage |
| vatAmount | numeric(10,2) | VAT total |
| total | numeric(10,2) | Grand total |
| dueDate | timestamp | Payment due date |
| paidAt | timestamp | Payment date |
| zatcaSubmitted | boolean | ZATCA submission status |

### `payments`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Payment ID |
| invoiceId | uuid (FK → invoices) | Invoice reference |
| amount | numeric(10,2) | Payment amount |
| method | varchar(50) | cash/card/transfer/stripe/paypal |
| status | varchar(50) | pending/completed/failed/refunded |
| transactionId | varchar(255) | Payment gateway transaction ID |
| paidAt | timestamp | Payment timestamp |

---

## HR Tables

### `hr_employee_profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Profile ID |
| userId | varchar (FK → users) | User reference |
| garageId | uuid (FK) | Garage |
| employeeNumber | varchar(50) | Employee ID |
| department | varchar(100) | Department |
| position | varchar(100) | Job title |
| salary | numeric(10,2) | Monthly salary |
| hireDate | date | Start date |
| contractType | varchar(50) | full_time/part_time/contract |

### `hr_leave_requests`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Request ID |
| employeeId | uuid (FK) | Employee |
| leaveType | varchar(50) | annual/sick/emergency/hajj |
| startDate | date | Leave start |
| endDate | date | Leave end |
| status | varchar(50) | pending/approved/rejected |
| reason | text | Leave reason |
| approvedBy | varchar (FK) | Manager who approved |

---

## AI & Emerging Tech Tables

### `ai_job_estimations`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Estimation ID |
| jobCardId | uuid (FK) | Job card |
| estimatedCost | numeric(10,2) | AI cost estimate |
| estimatedHours | numeric(5,2) | AI time estimate |
| confidence | numeric(3,2) | Confidence score (0-1) |
| modelVersion | varchar(50) | AI model used |

### `iot_sensors`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Sensor ID |
| branchId | uuid (FK) | Branch location |
| sensorType | varchar(100) | Type of sensor |
| location | varchar(255) | Physical location |
| status | varchar(50) | active/offline/maintenance |
| lastReading | jsonb | Latest sensor data |
| lastReadingAt | timestamp | Reading timestamp |

### `blockchain_records`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record ID |
| vehicleId | uuid (FK) | Vehicle |
| recordType | varchar(100) | service/inspection/accident |
| blockHash | varchar(255) | Blockchain hash |
| transactionId | varchar(255) | Chain transaction ID |
| data | jsonb | Immutable record data |
| verifiedAt | timestamp | Verification timestamp |

---

## Phase 14 Tables (Latest)

### `serviceBays`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Bay ID |
| branchId | uuid (FK) | Branch |
| bayNumber | varchar(20) | Bay identifier |
| status | varchar(50) | available/occupied/maintenance |
| currentJobId | uuid (FK → job_cards) | Current job |
| currentTechId | varchar (FK → users) | Current technician |

### `loyaltyPrograms`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Program ID |
| garageId | uuid (FK) | Garage |
| name | varchar(255) | Program name |
| pointsPerSar | numeric(5,2) | Points earned per SAR |
| isActive | boolean | Active status |

### `loyaltyTiers`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Tier ID |
| programId | uuid (FK → loyaltyPrograms) | Program |
| name | varchar(100) | Bronze/Silver/Gold/Platinum |
| minPoints | integer | Minimum points for tier |
| discountPercentage | numeric(5,2) | Tier discount |
| benefits | jsonb | Array of benefits |

### `workshopCalendarEvents`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Event ID |
| branchId | uuid (FK) | Branch |
| title | varchar(255) | Event title |
| start | timestamp | Start time |
| end | timestamp | End time |
| technicianId | varchar (FK) | Assigned technician |
| bayId | uuid (FK → serviceBays) | Bay assignment |
| jobCardId | uuid (FK) | Related job card |
| color | varchar(20) | Calendar color |

---

## Entity Relationship Diagram (Simplified)

```
Garage (1) ──────────────── (many) Branch
  │                                  │
  │                           ┌──────┤
  │                           │      │
  ├── (many) Customer         │   User ─── UserRoleBranch ─── Role
  │     │                     │      │
  │     └── (many) Vehicle    │   Technician Profile
  │           │               │
  │           └── JobCard ────┘
  │                 │
  │          ┌──────┴──────┐
  │          │             │
  │     TaskAssignment  Invoice
  │          │             │
  │     Technician      Payment
  │
  ├── (many) SparePart ── SparePartInventory (per branch)
  │
  ├── (many) Employee ── LeaveRequest, Payroll
  │
  └── (many) Campaign, LoyaltyProgram, IoTSensor...
```

---

*SALIS AUTO Database Schema Reference — Version 14.0.0*
