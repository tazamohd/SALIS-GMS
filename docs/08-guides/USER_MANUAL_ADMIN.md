# SALIS AUTO - Administrator User Manual

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Role:** System Administrator

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Management](#user-management)
3. [System Settings](#system-settings)
4. [Franchise Management](#franchise-management)
5. [Reports & Analytics](#reports--analytics)
6. [Security & Compliance](#security--compliance)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Login

1. Navigate to your SALIS AUTO URL
2. Click **Login** in the top right
3. Enter your admin credentials
4. You'll be redirected to the Dashboard

### Dashboard Overview

The admin dashboard provides:
- **System Health:** Server status, database connections
- **User Activity:** Active users, recent logins
- **Quick Stats:** Total customers, vehicles, jobs, revenue
- **Alerts:** System alerts, security warnings

---

## User Management

### Creating Users

1. Navigate to **Users** from sidebar
2. Click **+ Add User** button
3. Fill in user details:
   - Name
   - Email
   - Phone
   - Role (Admin, Manager, Technician, Customer)
4. Set initial password
5. Click **Create User**

### Managing Roles

**Available Roles:**
- **Admin:** Full system access
- **Manager:** Manage operations, view reports
- **Technician:** Job cards, time tracking
- **Customer:** Self-service portal

**Assigning Permissions:**
1. Go to **Users** → Select user
2. Click **Edit**
3. Change **Role** dropdown
4. Click **Save Changes**

### Deactivating Users

1. Navigate to **Users**
2. Find user in list
3. Click **Actions** → **Deactivate**
4. Confirm deactivation
5. User cannot login but data is preserved

---

## System Settings

### General Settings

**Navigate:** Settings → General

- **Business Name:** SALIS AUTO
- **Email:** Contact email for notifications
- **Phone:** Business phone number
- **Address:** Business address
- **Time Zone:** Default time zone
- **Currency:** Default currency
- **Language:** Default language

### Tax Configuration

**Navigate:** Settings → Tax

- **Tax Name:** VAT (or Sales Tax)
- **Tax Rate:** 15% (Saudi Arabia) or your rate
- **TRN:** Tax Registration Number
- **Enable ZATCA:** For Saudi e-invoicing
- **Zakat Rate:** 2.5% (optional)

### Email Templates

**Navigate:** Settings → Email Templates

1. Select template type:
   - Appointment confirmation
   - Invoice sent
   - Payment received
   - Service completed
2. Edit template content
3. Use variables: `{{customerName}}`, `{{appointmentDate}}`
4. Preview template
5. Save changes

### SMS Templates

**Navigate:** Settings → SMS Templates

Similar to email templates, configure SMS notifications for:
- Appointment reminders
- Service updates
- Payment reminders

---

## Franchise Management

### Adding Franchise Locations

1. Navigate to **Franchises**
2. Click **+ Add Location**
3. Enter details:
   - Location Name
   - Address
   - Manager
   - Phone
   - Operating Hours
4. Click **Create**

### Managing Inventory Per Location

1. Go to **Inventory**
2. Filter by **Location**
3. View stock levels per location
4. Transfer parts between locations if needed

### Cross-Location Reporting

1. Navigate to **Reports** → **Franchise Performance**
2. Select date range
3. Compare locations by:
   - Revenue
   - Jobs completed
   - Customer satisfaction
   - Technician utilization

---

## Reports & Analytics

### Business Intelligence Dashboard

**Navigate:** Analytics → Business Intelligence

**Key Metrics:**
- Total Revenue (month/year)
- Active Job Cards
- Customer Count
- Top Services
- Payment Collection Rate

**Filters:**
- Date range
- Location
- Service type

### Profit Margin Analysis

**Navigate:** Analytics → Profit Margin

View profitability by:
- Service type
- Technician
- Customer
- Time period

**Export Options:**
- PDF Report
- Excel Spreadsheet
- Email scheduled reports

### Customer Lifetime Value

**Navigate:** Analytics → Customer LTV

**Segments:**
- High Value (CLV > $5000)
- Medium Value ($1000-$5000)
- Low Value (< $1000)

**Churn Risk:**
- High risk customers (no visit in 6+ months)
- Retention campaigns

---

## Security & Compliance

### Security Audit Log

**Navigate:** Settings → Security → Audit Log

**View:**
- User logins/logouts
- Permission changes
- Data modifications
- Failed login attempts
- API access

**Export:**
- Download audit log (CSV)
- Filter by user, date, action

### Data Backup

**Navigate:** Settings → Backup

**Automated Backups:**
- Daily database backups
- 30-day retention
- Automatic restore points

**Manual Backup:**
1. Click **Create Backup Now**
2. Download backup file
3. Store securely offsite

### Compliance Reports

**Environmental Compliance:**
- Navigate to **Compliance** → **Environmental**
- View waste tracking
- Generate EPA reports

**ISO 9001 Quality:**
- Navigate to **Compliance** → **Quality**
- View checklists
- Track non-conformances

**Safety Incidents:**
- Navigate to **Compliance** → **Safety**
- OSHA reporting
- Incident investigations

---

## Troubleshooting

### Common Issues

**Users Can't Login:**
1. Verify account is active
2. Reset password: Users → Select User → Reset Password
3. Check email verification status

**Reports Not Loading:**
1. Check date range (large ranges slow down)
2. Clear browser cache
3. Try different browser
4. Contact support if persistent

**Payment Integration Issues:**
1. Verify Stripe/PayPal API keys in Settings
2. Test payment in test mode
3. Check webhook configuration
4. Review error logs

### Getting Help

**Internal Support:**
- Help Center: Navigate to **Help** → **Support**
- Live Chat: Click chat icon (bottom right)
- Knowledge Base: **Help** → **Documentation**

**Contact Support:**
- Email: support@salis-auto.com
- Phone: [Support Number]
- Priority Support (paid plans): 24/7 access

---

## Best Practices

### User Security

1. **Strong Passwords:**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols
   - Change every 90 days

2. **Two-Factor Authentication:**
   - Enable for all admin accounts
   - Navigate to Profile → Security

3. **Regular Audits:**
   - Review active users monthly
   - Deactivate unused accounts
   - Review permissions quarterly

### Data Management

1. **Regular Backups:**
   - Verify automatic backups running
   - Test restore procedure quarterly
   - Store backups offsite

2. **Data Cleanup:**
   - Archive old job cards (1+ year)
   - Delete test data before production
   - Maintain customer data accuracy

3. **Performance:**
   - Monitor database size
   - Archive old records
   - Optimize slow queries

---

## Keyboard Shortcuts

- `Ctrl + K` - Quick search
- `Ctrl + S` - Save (in forms)
- `Ctrl + /` - Help menu
- `Esc` - Close modal
- `Ctrl + Shift + N` - New customer/job (context-aware)

---

## Appendix

### API Access

Admins can generate API keys for integrations:
1. Navigate to **Settings** → **API**
2. Click **Generate API Key**
3. Copy key (shown once)
4. Use in external integrations

### Webhooks

Configure webhooks for external systems:
1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Enter URL and select events
4. Test webhook
5. Save

### Custom Fields

Add custom fields to entities:
1. Navigate to **Settings** → **Custom Fields**
2. Select entity (Customer, Vehicle, Job Card)
3. Click **Add Field**
4. Configure field type and options
5. Save

---

**Need Help?** Contact support@salis-auto.com or visit help.salis-auto.com
