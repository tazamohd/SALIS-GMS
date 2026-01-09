# SALIS AUTO - Authentication & RBAC Guide

## Overview

SALIS AUTO implements a comprehensive Role-Based Access Control (RBAC) system with 25 professional roles across all modules. This guide covers authentication flows, role definitions, and access control mechanisms.

---

## Authentication Flow

### Login Process
1. User navigates to `/welcome` (landing page)
2. Clicks "Sign In" to go to `/login`
3. Enters email and password
4. System validates credentials via `/api/login`
5. On success, user is redirected to their role-specific portal
6. Session is maintained via passport.js with express-session

### Registration Process
1. User clicks "Register" on welcome or login page
2. Navigates to `/register`
3. Enters email, password, and full name
4. System creates account via `/api/register`
5. User is automatically logged in and redirected

### Logout Process
1. User clicks logout button in the sidebar
2. System calls `/api/logout`
3. Session is destroyed
4. User is redirected to `/welcome`

---

## Role Definitions

### Administrative Roles

| Role | Portal | Primary Functions |
|------|--------|-------------------|
| System Administrator | `/dashboard` | Full system access, user management, settings |
| Business Owner | `/dashboard` | All dashboards, financial reports, franchise |
| General Manager | `/dashboard` | Operations, HR, analytics, compliance |

### Service Operations Roles

| Role | Portal | Primary Functions |
|------|--------|-------------------|
| Service Manager | `/dashboard` | Job cards, scheduling, technician oversight |
| Service Advisor | `/dashboard` | Customer intake, estimates, job creation |
| Lead Technician | `/technician-portal` | Team lead functions, quality review |
| Technician | `/technician-portal` | Job execution, diagnostics, repairs |

### Finance & Accounting Roles

| Role | Portal | Primary Functions |
|------|--------|-------------------|
| Finance Manager | `/accounting-dashboard` | Full financial oversight, reporting |
| Accountant | `/accounting-dashboard` | Invoicing, payments, reconciliation |

### Inventory & Purchasing Roles

| Role | Portal | Primary Functions |
|------|--------|-------------------|
| Parts Manager | `/inventory` | Stock management, reordering |
| Inventory Controller | `/inventory` | Stock tracking, audits |
| Purchase Agent | `/purchase-agent/orders` | Supplier orders, vendor management |

### HR & Administrative Roles

| Role | Portal | Primary Functions |
|------|--------|-------------------|
| HR Manager | `/hr-management` | Staff, payroll, leave, training |
| Receptionist | `/appointments` | Check-in, scheduling |
| Call Center Agent | `/call-center` | Customer calls, support |
| BDC Specialist | `/marketing-automation` | Business development |

### Quality & Compliance Roles

| Role | Portal | Primary Functions |
|------|--------|-------------------|
| Compliance Officer | `/compliance` | ZATCA, VAT, regulatory |
| Quality Control Inspector | `/quality-control` | Inspections, audits |

### Specialized Roles

| Role | Portal | Primary Functions |
|------|--------|-------------------|
| Marketing Manager | `/marketing-automation` | Campaigns, analytics |
| Fleet Manager | `/fleet-management` | Fleet tracking, maintenance |
| Data Analyst | `/bi-dashboard` | Reports, KPIs, forecasting |
| AI Automation Specialist | `/ai-automation` | AI systems, automation |
| Customer Success Manager | `/customer-profiles` | Customer relationships |
| Customer | `/client/dashboard` | Personal portal, appointments |

---

## Demo Credentials

All demo accounts use password: **Password123!**

**Total Seeded Users**: 70+ accounts across all roles

### Quick Access Accounts

| Email | Role | Portal |
|-------|------|--------|
| admin@salisauto.com | System Administrator | Dashboard |
| owner@salisauto.com | Business Owner | Dashboard |
| gm@salisauto.com | General Manager | Dashboard |
| service.manager@salisauto.com | Service Manager | Dashboard |
| tech@salisauto.com | Technician | Technician Portal |
| finance@salisauto.com | Finance Manager | Accounting |
| hr@salisauto.com | HR Manager | HR Management |
| client@salisauto.com | Customer | Client Portal |
| agent@salisauto.com | Purchase Agent | Purchase Agent Portal |
| marketing@salisauto.com | Marketing Manager | Marketing Automation |
| compliance@salisauto.com | Compliance Officer | Compliance |
| ai.specialist@salisauto.com | AI Automation Specialist | AI Automation |

### Staff by Department

- **Workshop**: 12 Technicians (tech1-12@salisauto.com), 2 Lead Technicians
- **Service**: 6 Service Advisors (advisor1-6@salisauto.com)
- **Finance**: 3 Accountants, 1 Finance Manager
- **Customer Service**: 5 CSRs, 5 Call Center Agents
- **Quality**: 3 QC Inspectors
- **Inventory**: 3 Controllers, 3 Purchase Agents
- **Customers**: 10+ demo customers

---

## RBAC Implementation

### Frontend Protection

#### ProtectedRoute Component
Wraps routes to enforce authentication and role-based access:

```tsx
<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}>
  <AdminPage />
</ProtectedRoute>
```

#### RoleGuard Component
Conditionally renders content based on user role:

```tsx
<RoleGuard roles={[USER_ROLES.FINANCE_MANAGER]}>
  <FinancialReports />
</RoleGuard>
```

### Backend Protection

#### Middleware Pattern
```typescript
// Route-level protection
app.get('/api/admin/users', requireAuth, requireRole(['admin']), handler);
```

### Navigation Filtering

The sidebar automatically filters navigation items based on:
1. User's role (`roles` property on nav items)
2. Subscription plan (`minPlan` property)

---

## Role Groups

For convenience, roles are grouped by function:

| Group | Roles |
|-------|-------|
| ADMIN | System Administrator, Business Owner |
| MANAGEMENT | GM, Service Manager, Finance Manager, HR Manager, etc. |
| SERVICE_OPERATIONS | Service Manager, Advisor, Lead Tech, Technician, QC |
| FINANCE | Finance Manager, Accountant, Business Owner |
| HR | HR Manager, General Manager, Business Owner |
| INVENTORY | Parts Manager, Inventory Controller, Purchase Agent |
| CUSTOMER_FACING | Advisor, CSR, Receptionist, Call Center, BDC, CSM |
| ANALYTICS | Data Analyst, Business Owner, General Manager |
| COMPLIANCE | Compliance Officer, QC Inspector, Finance Manager |
| TECHNOLOGY | AI Specialist, Data Analyst, System Administrator |

---

## Session Management

- Sessions stored in PostgreSQL via connect-pg-simple
- Session timeout: 24 hours (configurable)
- Secure cookies in production
- CSRF protection via session tokens

---

## Security Best Practices

1. **Password Requirements**: Minimum 8 characters, mixed case, numbers
2. **Rate Limiting**: Login attempts limited to prevent brute force
3. **Session Security**: HTTP-only cookies, secure flag in production
4. **CORS**: Configured for specific origins
5. **Input Validation**: Zod schemas for all inputs

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login` | POST | Authenticate user |
| `/api/logout` | POST | End session |
| `/api/register` | POST | Create new account |
| `/api/user` | GET | Get current user |
| `/api/auth/user` | GET | Auth status check |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-09 | Initial RBAC implementation with 25 roles |
