# Screen Documentation — Section 18: Settings & System

**Screens:** 219–235  
**Section:** System & Settings  
**Navigation Group:** System & Settings  

---

## Overview

The Settings & System section provides the configuration backbone for the entire SALIS AUTO platform. Administrators manage everything from document processing to security configuration from this section.

---

## Screen 219 — Document Management (`/document-management`)

### Description
Central repository for all business documents.

### Document Categories
- Vehicle registration documents
- Insurance certificates
- Supplier contracts
- Employee contracts
- Compliance certificates (ZATCA, ISO)
- Customer agreements

### Features
- Folder structure per category
- Version control
- Access permissions per role
- Full-text search
- Expiry tracking (for time-limited certificates)
- Automated renewal reminders

---

## Screen 220 — Document OCR (`/document-ocr`)

### Description
Optical Character Recognition for digitizing paper documents.

### OCR Capabilities
- **Vehicle registration papers** → Auto-extract plate, VIN, owner
- **Insurance documents** → Extract policy number, validity dates
- **Supplier invoices** → Extract invoice number, amount, items
- **ID documents** → Extract customer ID details

### Workflow
```
Upload scanned document (or take photo)
         ↓
OCR processing (Arabic and English)
         ↓
Extracted text reviewed by staff
         ↓
Confirm → Data saved to relevant record
```

---

## Screen 221 — Data Import/Export (`/data-import-export`)

### Description
Bulk data migration and integration tool.

### Import Formats
- CSV
- Excel (.xlsx)
- JSON

### Exportable Modules
| Module | Formats | Audience |
|--------|---------|---------|
| Customer list | CSV, Excel | Marketing, CRM |
| Vehicle records | CSV, Excel | Fleet management |
| Invoices | CSV, Excel, PDF | Accounting |
| Inventory | CSV, Excel | Procurement |
| Staff records | CSV | HR |
| Financial reports | Excel, PDF | Management |

### Import Validation
- Column mapping preview
- Data validation before import
- Error report for invalid rows
- Rollback option if import fails

---

## Screen 222 — Data Backup (`/data-backup`)

### Description
Backup management and disaster recovery.

### Backup Schedule
| Backup Type | Frequency | Retention |
|-------------|-----------|---------|
| Full backup | Daily | 30 days |
| Incremental | Hourly | 7 days |
| Config backup | On change | 90 days |

### Manual Backup
1. Click "Create Backup Now"
2. Select scope: Full / Partial (specific modules)
3. Download as encrypted archive
4. Store offsite

### Restore Process
1. Upload backup archive
2. Select restore point
3. Preview what will be restored
4. Confirm restore (requires admin password)

---

## Screen 223 — Knowledge Base (`/knowledge-base`)

### Description
Internal knowledge management system for procedures, guides, and institutional knowledge.

### Content Categories
- **Service Procedures** — How-to guides for common services
- **Technical Bulletins** — Known vehicle issues and fixes
- **HR Policies** — Company policies and procedures
- **Safety Guides** — Workshop safety procedures
- **Training Materials** — Onboarding content
- **FAQ** — Common questions and answers

### Features
- Rich text editor (markdown support)
- Article categorization and tagging
- Search functionality
- Version history
- Article ratings (helpful/not helpful)

---

## Screen 224 — User Profile (`/profile`)

### Description
Personal profile management for the currently logged-in user.

### Profile Sections
| Section | Editable |
|---------|---------|
| Full name | Yes |
| Email | Admin only |
| Phone | Yes |
| Profile photo | Yes |
| Language preference | Yes (EN/AR) |
| Notification preferences | Yes |
| 2FA setup | Yes |
| Password change | Yes |
| Login history | View only |

### 2FA Setup Flow
```
Profile → Security → Enable 2FA
→ Scan QR code with authenticator app
→ Enter 6-digit code to verify
→ Save backup codes
→ 2FA active
```

---

## Screen 225 — System Settings (`/settings`)

### Description
Global system configuration for the entire platform.

### Settings Categories

**General:**
- Garage name, address, logo
- Default language and currency
- Date format (Gregorian/Hijri)
- Time zone

**Operations:**
- Default service bay count
- Working hours
- Job card number prefix format
- Invoice number prefix

**Communications:**
- SMS provider configuration (Twilio)
- Email provider configuration (Gmail)
- WhatsApp Business API (if configured)
- Notification templates (Arabic/English)

**Integrations:**
- OpenAI API status
- Google Calendar sync
- Stripe payment configuration
- PayPal configuration

---

## Screen 226 — User Settings (`/user-settings`)

### Description
User-specific platform preferences and workspace customization.

### Customizable Settings
- Dashboard widget layout
- Default date range for reports
- Notification preferences per module
- Table column visibility
- Language toggle (instant switch)

---

## Screen 227 — Integrations (`/integrations`)

### Description
Third-party integration management hub.

### Configured Integrations
| Integration | Status | Purpose |
|------------|--------|---------|
| OpenAI | Connected | AI features |
| Twilio | Connected | SMS |
| Google Calendar | Connected | Scheduling |
| Google Gmail | Connected | Email |
| Stripe | Configurable | Payments |
| PayPal | Configurable | Payments |
| ZATCA | Configurable | E-invoicing |

### Adding New Integrations
1. Browse integration catalog
2. Click "Connect"
3. Follow OAuth flow or enter API keys
4. Test connection
5. Configure sync settings

---

## Screen 228 — Security Settings (`/security`)

### Description
Platform security configuration and monitoring.

### Security Features
| Feature | Description |
|---------|-------------|
| Session timeout | Auto-logout after inactivity |
| Password policy | Minimum length, complexity |
| 2FA enforcement | Required for certain roles |
| IP whitelisting | Restrict access to known IPs |
| Failed login lockout | Lock after N failed attempts |
| API key management | Generate/revoke API keys |
| Audit log | All security events |

### Security Audit Log
Every security event is logged:
- Login (success/failure)
- Role changes
- Permission grants/revocations
- Data exports
- Config changes

---

## Screen 229 — Role Management (`/role-management`)

### Description
User and role administration interface.

### Capabilities
- View all users with their roles
- Create new user accounts
- Assign/change roles
- Configure custom role permissions
- Deactivate users
- Transfer role permissions between users

### Role Assignment Workflow
```
Select User → Manage Roles
→ Add Role (select from list)
→ Set Scope (garage-level or branch-level)
→ Select Branch (if branch-level)
→ Save → User permissions updated immediately
```

---

## Screens 230–235 — Additional Settings

### Screen 230 — Tasks (`/tasks`)
Personal task management for all users.

**Features:**
- Create personal tasks
- Set due dates and priorities
- Assign to colleagues
- Track completion
- Integration with job cards

### Screen 231 — Task Management (`/task-management`)
Department-level task management for managers.

**Team View:**
- All team tasks on a kanban board
- Assign tasks to team members
- Track department workload

### Screen 232 — Tools (`/tools`)
Workshop tools and equipment registry.

**Tool Records:**
- Tool name and description
- Serial number
- Calibration due date
- Assigned location
- Current checkout status

### Screen 233 — Dashboard Widgets (`/dashboard-widgets`)
Customize the main dashboard with drag-and-drop widgets.

**Available Widgets:**
- Revenue chart
- Active jobs counter
- Bay status
- Technician activity
- Low stock alert
- Upcoming appointments
- Customer satisfaction score
- Cash flow indicator

### Screen 234 — SMS Integration (`/sms-integration`)
Twilio SMS configuration and message templates.

**Configuration:**
- Twilio account credentials
- Phone number selection
- Message templates (Arabic/English)
- Delivery reports
- Cost tracking

### Screen 235 — Sales Guide (`/sales-guide`)
Internal sales guide for service advisors.

**Content:**
- Service descriptions in customer-friendly language
- Pricing reference guide
- Upsell conversation scripts
- Objection handling
- Competitor comparison guide

---

## System Configuration Flow

```
Initial Platform Setup
         │
         ▼
System Settings → Garage Info + Compliance Config
         │
         ▼
Role Management → Create Users + Assign Roles
         │
         ▼
Integrations → Connect SMS, Email, AI, Payments
         │
         ▼
Financial Settings → Chart of Accounts + VAT Config
         │
         ▼
Inventory Setup → Import Parts Catalog + Set Reorder Rules
         │
         ▼
Service Templates → Create Common Service Packages
         │
         ▼
LIVE — Platform Ready for Operations
```

---

*Screen Documentation 18 — Settings & System*
