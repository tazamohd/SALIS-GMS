# SALIS AUTO — System Administrator Manual

**Document Type:** Training Manual  
**Audience:** System Administrators, Garage Owners  
**Level:** Advanced  
**Version:** 14.0.0  

---

## Introduction

This manual covers the complete setup and administration of the SALIS AUTO platform. System Administrators have full access to all modules and are responsible for initial configuration, user management, and ongoing platform health.

**Login:** admin@salisauto.com (or your admin email)  
**Start page:** `/dashboard` → then `/welcome` → redirects to Admin Dashboard

---

## Chapter 1: Initial Platform Setup

### 1.1 Garage Configuration
After first login, configure your garage profile:

1. Go to **Settings** → **System Settings**
2. Fill in:
   - Garage name, address, city, country
   - VAT number (for Saudi compliance)
   - TRN (Tax Registration Number)
   - Default currency (SAR for Saudi Arabia)
   - Default language (Arabic or English)
3. Upload your company logo
4. Click **Save Settings**

### 1.2 Branch Setup
For multi-location operations:

1. Go to **Enterprise → Franchise Management**
2. Click **Add Branch**
3. Configure each branch with:
   - Name, address, phone
   - Branch manager assignment
   - Service bay count

### 1.3 Saudi Compliance Configuration

**VAT Setup:**
1. Go to **Compliance → VAT Settings**
2. Enter VAT registration number
3. Set VAT rate (15% standard)
4. Enable auto-calculation on invoices

**ZATCA Setup:**
1. Go to **Compliance → ZATCA Settings**
2. Enter ZATCA certificate details
3. Configure Phase 1 (QR code) and Phase 2 (API integration)
4. Test submission with a sample invoice

**Zakat Setup:**
1. Go to **Compliance → Zakat Settings**
2. Enter business assets and liabilities
3. System calculates annual Zakat obligation

---

## Chapter 2: User Management

### 2.1 Creating Users
1. Go to **Settings → Role Management**
2. Click **Add User**
3. Fill in:
   - Full name
   - Email address
   - Assign role (see roles below)
   - Assign branch (if branch-level role)
4. User receives login credentials via email

### 2.2 Available Roles
| Role | Access Level |
|------|-------------|
| SYSTEM_ADMIN | Full system access |
| OWNER | Full garage access |
| GENERAL_MANAGER | Operations management |
| SERVICE_MANAGER | Branch service operations |
| SERVICE_ADVISOR | Customer interaction |
| TECHNICIAN | Assigned jobs only |
| FINANCE_MANAGER | Financial oversight |
| HR_MANAGER | Staff management |
| PARTS_MANAGER | Inventory and supply |
| PURCHASE_AGENT | Procurement |
| MARKETING_MANAGER | CRM and campaigns |
| ACCOUNTANT | Bookkeeping |
| CALL_CENTER_AGENT | Phone support |
| QC_INSPECTOR | Quality control |
| ANALYST | Read-only reporting |

### 2.3 Assigning Roles
- Each user can have multiple role assignments
- Branch-level roles must specify which branch
- Role permissions can be customized via permission overrides

### 2.4 Deactivating Users
1. Go to Settings → Role Management
2. Find the user
3. Toggle "Active" status to Off
4. User can no longer log in (sessions are invalidated)

---

## Chapter 3: Financial Configuration

### 3.1 Chart of Accounts Setup
1. Go to **Accounting → Chart of Accounts**
2. Review default accounts (pre-configured for Saudi businesses)
3. Add custom accounts as needed:
   - Assets (1xxx)
   - Liabilities (2xxx)
   - Equity (3xxx)
   - Income (4xxx)
   - Expenses (5xxx)

### 3.2 Payment Gateway Setup

**Stripe:**
1. Go to **Settings → Integrations**
2. Enter Stripe Secret Key and Publishable Key
3. Configure webhook endpoint
4. Test with a sandbox transaction

**PayPal:**
1. Enter PayPal Client ID and Secret
2. Set environment (sandbox/production)

### 3.3 Financial Year Setup
1. Go to **Accounting → Financial Settings**
2. Set fiscal year start/end dates
3. Configure tax year (Hijri or Gregorian)

---

## Chapter 4: Inventory Setup

### 4.1 Importing Parts Catalog
1. Go to **Data Import/Export**
2. Download parts import template
3. Fill in your parts data
4. Upload the file
5. Review and confirm import

### 4.2 Setting Reorder Rules
1. Go to **Inventory → Parts Auto-Reorder**
2. Set minimum quantity thresholds per part per branch
3. Enable auto-order or notification-only mode
4. Assign default supplier per part category

### 4.3 Joining the B2B Parts Network
1. Go to **Parts Supply Network**
2. Create network member profile
3. Set your inventory visibility preferences
4. Start sending and receiving parts requests

---

## Chapter 5: AI & Automation Configuration

### 5.1 OpenAI Configuration
The AI features are pre-configured via Replit's AI Integration:
- API key automatically mapped from `AI_INTEGRATIONS_OPENAI_API_KEY`
- No manual key entry required

### 5.2 Configuring AI Chatbot
1. Go to **AI & Automation → AI Chatbot**
2. Configure welcome message
3. Set supported topics
4. Enable/disable on customer portal

### 5.3 Predictive Maintenance Settings
1. Go to **AI → Predictive Maintenance**
2. Set prediction sensitivity
3. Configure maintenance reminder triggers
4. Link to appointment booking

---

## Chapter 6: System Monitoring

### 6.1 Dashboard KPIs to Monitor Daily
- Revenue vs. target
- Open job cards count
- Bay utilization percentage
- Inventory below minimum threshold
- Outstanding invoices

### 6.2 User Activity Audit
All sensitive operations are logged. Review via:
- **Compliance → Compliance Management** for audit trails
- Invoice void/modification logs
- User role change history

### 6.3 Database Backup
1. Go to **Settings → Data Backup**
2. Configure automatic backup schedule
3. Download on-demand backup
4. Store offsite copies for ZATCA records (10-year retention)

---

## Chapter 7: Troubleshooting Common Admin Issues

| Issue | Solution |
|-------|----------|
| User cannot log in | Check if account is active; reset password |
| Missing data after login | Check `garageId` assignment on user account |
| ZATCA submission fails | Verify TRN and certificate configuration |
| Parts not deducting from inventory | Check branch assignment on inventory records |
| Payroll calculation incorrect | Verify employee salary and timesheet records |
| AI features not working | Check AI Integration connection in Settings |

---

## Chapter 8: Security Best Practices

1. **Never share admin credentials** — create individual accounts for each person
2. **Review role assignments quarterly** — remove access for departed staff
3. **Enable 2FA** for admin and finance accounts
4. **Monitor failed login attempts** in security logs
5. **Rotate session secrets** on a regular schedule in production
6. **Keep `AUTH_BYPASS=false`** in production environments

---

*SALIS AUTO Administrator Manual — Version 14.0.0*
