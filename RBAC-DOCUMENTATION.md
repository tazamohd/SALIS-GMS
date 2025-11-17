# SALIS AUTO - Role-Based Access Control (RBAC) System

## Overview

The SALIS AUTO platform now includes a comprehensive Role-Based Access Control (RBAC) system with **18 standard user role templates**, **141+ permission resources**, and granular access control across all modules.

## Standard Role Templates

### 1. **System Administrator**
- **Scope**: System-wide
- **Access**: Full unrestricted access to all features and settings
- **Best For**: IT administrators and super users who manage the entire platform

### 2. **Business Owner**
- **Scope**: Garage-wide
- **Access**: Full access to all garage operations, financials, analytics, and business intelligence
- **Key Permissions**: Financial management, user management, franchise oversight, complete reporting
- **Best For**: Garage owners and top executives

### 3. **General Manager**
- **Scope**: Garage-wide
- **Access**: Comprehensive management access (excluding sensitive financial settings)
- **Key Permissions**: Service operations, staff management, approvals, reporting
- **Best For**: Day-to-day operations managers

### 4. **Service Manager**
- **Scope**: Branch-level
- **Access**: Complete service operations and quality control
- **Key Permissions**: Job cards, technician assignment, inspections, diagnostics, quality management
- **Best For**: Service department heads

### 5. **Service Advisor**
- **Scope**: Branch-level
- **Access**: Customer-facing service operations
- **Key Permissions**: Customer management, appointments, job cards, estimates, invoicing
- **Best For**: Customer service and service advisors

### 6. **Parts Manager**
- **Scope**: Branch-level
- **Access**: Complete inventory and procurement management
- **Key Permissions**: Inventory control, purchase orders, suppliers, parts forecasting
- **Best For**: Parts department managers

### 7. **Lead Technician**
- **Scope**: Branch-level
- **Access**: Senior technician with additional supervisory capabilities
- **Key Permissions**: Job assignments, quality reviews, all diagnostic tools, training content
- **Best For**: Senior technicians and team leads

### 8. **Technician**
- **Scope**: Branch-level
- **Access**: Assigned job cards and technical operations
- **Key Permissions**: Own job cards, diagnostics, inspections, technician portal, knowledge base
- **Best For**: Service technicians and mechanics

### 9. **Finance Manager**
- **Scope**: Garage-wide
- **Access**: Complete financial operations and reporting
- **Key Permissions**: Invoicing, payments, payroll, accounting integration, profit analysis
- **Best For**: Financial controllers and CFOs

### 10. **Accountant**
- **Scope**: Garage-wide
- **Access**: Day-to-day accounting operations
- **Key Permissions**: Invoicing, payment processing, expense tracking, financial reports
- **Best For**: Accounting staff

### 11. **HR Manager**
- **Scope**: Garage-wide
- **Access**: Complete human resources management
- **Key Permissions**: Staff management, payroll, performance reviews, training, compliance
- **Best For**: Human resources managers

### 12. **Marketing Manager**
- **Scope**: Garage-wide
- **Access**: Marketing campaigns and customer engagement
- **Key Permissions**: Email campaigns, social media, loyalty programs, reviews management
- **Best For**: Marketing and customer experience managers

### 13. **Customer Service Representative**
- **Scope**: Branch-level
- **Access**: Customer interactions and basic service tracking
- **Key Permissions**: Customer management, appointments, service tracking, chat support
- **Best For**: Customer service agents

### 14. **Receptionist**
- **Scope**: Branch-level
- **Access**: Front desk operations
- **Key Permissions**: Appointments, customer check-in, basic vehicle entry
- **Best For**: Front desk and reception staff

### 15. **Quality Control Inspector**
- **Scope**: Branch-level
- **Access**: Quality assurance and inspections
- **Key Permissions**: Vehicle inspections, quality management, job card review, compliance
- **Best For**: QA inspectors and compliance officers

### 16. **Warehouse Manager**
- **Scope**: Garage-wide
- **Access**: Warehouse and logistics operations
- **Key Permissions**: Inventory management, vehicle storage, parts logistics
- **Best For**: Warehouse and logistics managers

### 17. **Franchise Manager**
- **Scope**: Franchise-wide (multi-branch)
- **Access**: Multi-branch oversight and enterprise features
- **Key Permissions**: Franchise management, multi-branch reporting, enterprise settings
- **Best For**: Franchise operators and regional managers

### 18. **Business Analyst**
- **Scope**: Garage-wide
- **Access**: Read-only access to all data and reports
- **Key Permissions**: View all reports, analytics, and business intelligence (no edit/delete)
- **Best For**: Data analysts and consultants

### 19. **Call Center Agent**
- **Scope**: Branch-level
- **Access**: Customer call handling and appointment scheduling
- **Key Permissions**: Call center operations, appointments, customer info, service status
- **Best For**: Call center and phone support staff

### 20. **Apprentice Technician**
- **Scope**: Branch-level
- **Access**: Limited technician access for learning
- **Key Permissions**: View assigned jobs, read-only diagnostics, training materials
- **Best For**: Entry-level and trainee technicians

## Permission Categories

The system organizes permissions into **24 categories**:

1. **Dashboard & Overview** - Dashboard and KPI access
2. **Customer Management** - Customer profiles and relationships
3. **Appointments & Scheduling** - Appointment booking and calendar
4. **Vehicle Management** - Vehicle records and fleet operations
5. **Fleet Management** - Multi-vehicle fleet operations
6. **Job Cards & Service** - Service work orders and tasks
7. **Inspections & Quality** - Vehicle inspections and QA
8. **Diagnostics & OBD** - Diagnostic tools and OBD systems
9. **Parts & Inventory** - Parts and inventory control
10. **Suppliers & Procurement** - Supplier and vendor management
11. **Purchase Orders** - PO creation and approval
12. **Invoicing & Billing** - Invoice generation and management
13. **Payments & Transactions** - Payment processing and refunds
14. **Payroll & Expenses** - Payroll and expense tracking
15. **Accounting & Finance** - Financial management and accounting
16. **Reports & Analytics** - Standard reporting
17. **Business Intelligence** - Advanced analytics and BI
18. **Staff & HR Management** - Employee management
19. **Technician Management** - Technician-specific operations
20. **Performance Management** - Performance reviews and metrics
21. **Training & Certification** - Training programs and LMS
22. **Marketing & Campaigns** - Marketing automation
23. **Customer Loyalty** - Loyalty programs and referrals
24. **Reviews & Feedback** - Customer reviews and ratings
25. **Franchise Management** - Multi-location franchise ops
26. **Enterprise Features** - Advanced enterprise tools
27. **Compliance & Regulations** - Regulatory compliance
28. **Safety & Incidents** - Safety management
29. **Quality Management** - ISO and quality systems
30. **AI & Automation** - AI-powered features
31. **AI Chatbot & Assistant** - AI customer service
32. **Blockchain & Smart Contracts** - Blockchain features
33. **AR/VR & Emerging Tech** - Augmented/virtual reality
34. **IoT & Telematics** - IoT devices and fleet telematics
35. **System Administration** - System-wide settings
36. **Security & Access Control** - User and role management
37. **Integrations & APIs** - Third-party integrations
38. **Settings & Configuration** - General configuration

## Permission Actions

Each resource supports the following actions (where applicable):

- **create** - Create new records
- **read** - View and read records
- **update** - Modify existing records
- **delete** - Remove records
- **approve** - Approve requests or transactions
- **reject** - Reject requests
- **export** - Export data to files
- **import** - Import data from files
- **assign** - Assign tasks or resources
- **manage** - Full management access
- **view_all** - View all records (not just own)
- **view_own** - View only own records
- **edit_all** - Edit all records
- **edit_own** - Edit only own records
- **cancel** - Cancel operations
- **refund** - Process refunds
- **void** - Void transactions
- **print** - Print documents

## Key Features

### ✅ Granular Permissions
- **141+ resources** covering all system modules
- **18+ actions** for fine-grained control
- **2,500+ unique permissions** total

### ✅ Hierarchical Roles
- System-level, garage-level, branch-level, and user-level scopes
- Roles inherit permissions based on business hierarchy
- Permission overrides for specific users

### ✅ Multi-Branch Support
- Assign roles per branch
- Users can have different roles at different branches
- Franchise-wide role management

### ✅ Permission Overrides
- Grant or deny specific permissions to individual users
- Temporary permission grants with expiration dates
- Audit trail of all permission changes

## Usage

### Assigning Roles to Users

Users are assigned roles at the branch level through the `user_role_branch` table:

```typescript
// Assign role to user at a branch
{
  userId: "user-123",
  roleId: "technician-role-id",
  branchId: "branch-456",
  isPrimaryRole: true
}
```

### Checking Permissions

The system includes a helper function to check if a user has permission:

```typescript
import { hasPermission } from './rbac-config';

const userPermissions = [
  { resource: 'job_cards', action: 'read' },
  { resource: 'job_cards', action: 'update' },
];

// Check if user can update job cards
const canUpdate = hasPermission(userPermissions, 'job_cards', 'update'); // true

// Check if user can delete job cards
const canDelete = hasPermission(userPermissions, 'job_cards', 'delete'); // false
```

### Permission Overrides

Grant temporary or permanent permission overrides:

```typescript
// Grant temporary access to financial reports
{
  userId: "user-123",
  resource: "profit_analysis",
  action: "read",
  allowed: true,
  reason: "Q4 review access",
  expiresAt: "2025-12-31"
}
```

## Database Schema

### Tables

1. **permissions** - Defines all available permissions
   - id, resource, action, description, category

2. **roles** - Defines all roles
   - id, name, scope, isSystemRole

3. **role_permissions** - Maps permissions to roles
   - id, roleId, permissionId, granted

4. **user_role_branch** - Assigns roles to users at branches
   - id, userId, roleId, branchId, isPrimaryRole

5. **permission_overrides** - User-specific permission overrides
   - id, userId, resource, action, allowed, expiresAt

## Seeding the Database

To populate the database with all standard roles and permissions:

```bash
# Run the RBAC seed script
tsx server/seed-rbac.ts
```

This will create:
- **2,500+ permissions** (all resource-action combinations)
- **18 standard roles**
- **Complete role-permission mappings** based on the permission matrix

## Security Best Practices

1. **Principle of Least Privilege**: Assign users the minimum permissions needed
2. **Regular Audits**: Review user roles and permissions quarterly
3. **Permission Overrides**: Use sparingly and with expiration dates
4. **System Roles**: Protect system administrator access carefully
5. **Branch Isolation**: Ensure users only access data from authorized branches

## Customization

### Adding New Roles

1. Define the role in `server/rbac-config.ts`:
```typescript
CUSTOM_ROLE: {
  name: 'Custom Role Name',
  scope: 'branch',
  isSystemRole: false,
  description: 'Role description',
}
```

2. Define permissions in `ROLE_PERMISSIONS`:
```typescript
CUSTOM_ROLE: {
  resources: {
    job_cards: [ACTIONS.READ, ACTIONS.UPDATE],
    inventory: [ACTIONS.READ],
    // ... more permissions
  },
}
```

3. Run the seed script to populate the database

### Adding New Resources

1. Add to `RESOURCES` in `rbac-config.ts`:
```typescript
new_feature: { 
  category: PERMISSION_CATEGORIES.ENTERPRISE, 
  label: 'New Feature' 
}
```

2. Update relevant role permissions
3. Re-run the seed script

## Support

For questions or issues with the RBAC system:
- Refer to `server/rbac-config.ts` for complete permission matrix
- Check `server/seed-rbac.ts` for seeding implementation
- Review database schema in `shared/schema.ts`

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Total Permissions**: 2,500+  
**Total Roles**: 18
