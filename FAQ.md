# SALIS AUTO - Frequently Asked Questions (FAQ)

## 📋 Table of Contents
- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [Features & Capabilities](#features--capabilities)
- [User Management & Access](#user-management--access)
- [Technical Questions](#technical-questions)
- [Billing & Payments](#billing--payments)
- [Troubleshooting](#troubleshooting)
- [Security & Privacy](#security--privacy)

---

## General Questions

### Q: What is SALIS AUTO?
**A:** SALIS AUTO is a comprehensive cloud-based automotive ERP (Enterprise Resource Planning) platform designed for automotive service centers, garages, and multi-location franchise networks. It manages everything from customer intake to final invoice, including job cards, inventory, diagnostics, and business analytics.

### Q: Who should use SALIS AUTO?
**A:** SALIS AUTO is designed for:
- Independent automotive repair shops
- Multi-location garage chains
- Automotive franchises
- Fleet management companies
- Tire shops and quick lube centers
- Specialty auto services

### Q: How many users can SALIS AUTO support?
**A:** SALIS AUTO supports unlimited users with 24 different professional role types, from System Administrators to Technicians, Parts Managers, and Customer Service staff.

### Q: Is SALIS AUTO cloud-based or on-premise?
**A:** SALIS AUTO is primarily cloud-based, hosted on modern infrastructure. This ensures automatic updates, data backup, and access from anywhere with internet connection.

### Q: What devices can I use to access SALIS AUTO?
**A:** SALIS AUTO works on:
- Desktop computers (Windows, Mac, Linux)
- Tablets (iPad, Android tablets)
- Smartphones (iOS, Android)
- Any device with a modern web browser

---

## Getting Started

### Q: How do I get started with SALIS AUTO?
**A:** Follow these steps:
1. Read the [Quick Start Guide](QUICK-START-GUIDE.md)
2. Login with your provided credentials
3. Complete the initial setup wizard
4. Explore the [User Manual](USER-MANUAL.md)
5. Start with basic tasks (add customer, create job card)

### Q: What are the default login credentials?
**A:** 
- **System Admin**: admin@salisauto.com / password123
- **Staff Accounts**: See [Staff Users Guide](STAFF-USERS-GUIDE.md)
- **Important**: Change all default passwords immediately after first login!

### Q: How do I reset my password?
**A:**
1. Click "Forgot Password?" on login page
2. Enter your email address
3. Check email for reset link
4. Click link and set new password
5. Login with new password

### Q: Can I customize the interface?
**A:** Yes! You can:
- Switch between light and dark themes
- Change language (English, Arabic, and more)
- Customize dashboard widgets
- Set personal preferences
- Save custom report views

---

## Features & Capabilities

### Q: What are the main features of SALIS AUTO?
**A:** SALIS AUTO includes 141+ modules across 13 phases:
- Customer & Vehicle Management
- Appointment Scheduling
- Job Card Management
- Parts & Inventory Control
- Invoicing & Payment Processing
- Business Intelligence & Analytics
- AI-Powered Features (diagnostics, recommendations)
- Multi-location Franchise Management
- And many more! See [Feature Catalog](FEATURE-CATALOG.md)

### Q: Does SALIS AUTO support multiple locations?
**A:** Yes! SALIS AUTO includes comprehensive multi-location and franchise management features:
- Central control dashboard
- Location-specific inventory
- Branch-level user access
- Consolidated reporting
- Inter-branch transfers

### Q: Can customers book appointments online?
**A:** Yes! SALIS AUTO includes a customer portal where customers can:
- Book appointments 24/7
- Track service status in real-time
- View service history
- Download invoices
- Make online payments
- Chat with support

### Q: Does SALIS AUTO integrate with accounting software?
**A:** Yes! SALIS AUTO integrates with popular accounting platforms:
- QuickBooks
- Xero
- Sage
- Or export data in CSV/Excel format

### Q: What AI features does SALIS AUTO offer?
**A:** AI-powered features include:
- Predictive diagnostics (GPT-5)
- Smart technician assignment
- Intelligent parts recommendations
- Price optimization
- Fraud detection
- Customer service chatbot
- Automated scheduling

### Q: Does SALIS AUTO work offline?
**A:** Limited offline functionality is available through PWA (Progressive Web App):
- View cached data
- Take photos for inspections
- Create notes
- Data syncs when connection restored
- Full functionality requires internet

---

## User Management & Access

### Q: How many user roles are available?
**A:** SALIS AUTO includes **24 professional role templates**:
- 1 System Administrator
- 8 Garage-level roles (Owners, Managers, Finance, HR)
- 15 Branch-level roles (Service, Parts, Technicians, Customer Service)

See [RBAC Documentation](RBAC-DOCUMENTATION.md) for complete details.

### Q: Can I create custom roles?
**A:** Yes! While SALIS AUTO provides 24 pre-configured roles, administrators can:
- Clone existing roles
- Modify permissions
- Create entirely new custom roles
- Set permission overrides for specific users

### Q: How do I add a new employee?
**A:** 
1. Navigate to **Settings** → **User Management**
2. Click **"+ Add User"**
3. Fill in employee details
4. Assign appropriate role(s)
5. Select garage/branch assignment
6. Click **"Create User"**
7. System sends welcome email automatically

### Q: Can one user have multiple roles?
**A:** Yes! Users can have:
- Multiple roles at the same branch
- Different roles at different branches
- One "primary role" for default dashboard

### Q: How do I restrict access to financial data?
**A:** Use role-based permissions:
- Only Finance Manager and Accountant roles have full financial access
- Service Advisors can view invoices they create
- Technicians have no financial access
- Custom permission overrides available

---

## Technical Questions

### Q: What technology is SALIS AUTO built with?
**A:** 
**Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
**Backend**: Node.js, Express, TypeScript
**Database**: PostgreSQL with Drizzle ORM
**Infrastructure**: Cloud-hosted with auto-scaling

See [Technology Stack](TECHNOLOGY_STACK.md) for complete details.

### Q: Is there an API for custom integrations?
**A:** Yes! SALIS AUTO provides a comprehensive RESTful API:
- 200+ API endpoints
- Full CRUD operations
- Webhook support
- OAuth 2.0 authentication
- Complete API documentation available

### Q: Can I export my data?
**A:** Yes! Export options include:
- **Format**: CSV, Excel, PDF, JSON
- **Scope**: Single table or full database
- **Frequency**: On-demand or scheduled
- **Compliance**: GDPR-compliant data export

### Q: What browsers are supported?
**A:** Supported browsers:
- ✅ Chrome 90+ (recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

### Q: Does SALIS AUTO have a mobile app?
**A:** SALIS AUTO is a responsive web application that works perfectly on mobile browsers. Dedicated native mobile apps for iOS and Android are in development:
- **Technician App**: For mobile job management
- **Customer App**: For service tracking
- **Manager App**: For on-the-go oversight

---

## Billing & Payments

### Q: How do I generate an invoice?
**A:**
1. Complete the job card
2. Click **"Generate Invoice"**
3. Review charges (labor + parts + tax)
4. Apply discounts if needed
5. Click **"Create Invoice"**
6. Send to customer via email/SMS

### Q: What payment methods are supported?
**A:** SALIS AUTO supports:
- Cash
- Credit/Debit Cards (via Stripe)
- PayPal
- Bank Transfer
- Payment Plans (installments)
- Split payments

### Q: Can customers pay online?
**A:** Yes! Customers can pay via:
- Payment link in invoice email
- Customer portal
- SMS payment link
- Secure payment page

### Q: How are taxes calculated?
**A:** Tax calculation includes:
- Configurable tax rates (VAT, sales tax)
- Tax-exempt items
- Different rates for labor vs. parts
- Country-specific tax rules
- ZATCA E-Invoicing (Saudi Arabia)

### Q: Can I offer payment plans?
**A:** Yes! SALIS AUTO includes payment plan features:
- Split invoice into installments
- Set payment schedule
- Track payment status
- Automated payment reminders
- Late payment notifications

---

## Troubleshooting

### Q: I forgot my password. What should I do?
**A:** 
1. Click "Forgot Password?" on login page
2. Enter your email
3. Check email for reset link (check spam folder)
4. Click link and create new password
5. If you don't receive email, contact your administrator

### Q: Why can't I see certain menu items?
**A:** Menu items are role-based. You only see features your role has access to. If you need additional access:
1. Contact your manager or system administrator
2. Request specific permissions
3. Administrator can grant permission overrides

### Q: The page is loading slowly. How can I fix this?
**A:** Try these steps:
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache
3. Try a different browser
4. Check your internet connection
5. Contact support if issue persists

### Q: I'm getting an error message. What should I do?
**A:** 
1. Take a screenshot of the error
2. Note what you were doing when error occurred
3. Try refreshing the page
4. Check [Troubleshooting Guide](TROUBLESHOOTING-GUIDE.md)
5. Contact support with error details

### Q: How do I report a bug?
**A:**
1. Click **Help** → **Report Issue**
2. Describe the problem
3. Include steps to reproduce
4. Attach screenshots if helpful
5. Submit the report
6. You'll receive a ticket number for tracking

---

## Security & Privacy

### Q: Is my data secure?
**A:** Yes! SALIS AUTO implements enterprise-grade security:
- ✅ Encrypted data transmission (HTTPS/TLS)
- ✅ Encrypted data at rest
- ✅ Regular security audits
- ✅ Role-based access control
- ✅ Audit trails for all actions
- ✅ Regular automated backups

### Q: Is SALIS AUTO GDPR compliant?
**A:** Yes! SALIS AUTO is designed with GDPR compliance:
- Right to access (data export)
- Right to be forgotten (data deletion)
- Data portability
- Consent management
- Audit trails
- Data processing agreements

### Q: How often is data backed up?
**A:** 
- **Database**: Every 6 hours
- **File uploads**: Daily incremental
- **Retention**: 30 days
- **Storage**: Encrypted cloud storage
- **Testing**: Monthly backup restoration tests

### Q: Can I enable two-factor authentication (2FA)?
**A:** Yes! Enable 2FA for extra security:
1. Go to **Profile** → **Security**
2. Click **"Enable 2FA"**
3. Scan QR code with authenticator app (Google Authenticator, Authy)
4. Enter verification code
5. Save backup codes in safe place

### Q: Who can see customer data?
**A:** Access is strictly controlled:
- **System Admin**: Full access
- **Managers**: Garage/branch-level access
- **Service Advisors**: Customer service data
- **Technicians**: Assigned job data only
- **Finance**: Billing data only
- All access is logged in audit trail

### Q: What happens if there's a data breach?
**A:** SALIS AUTO has a comprehensive incident response plan:
1. Immediate threat isolation
2. Affected users notified within 24 hours
3. Security audit and remediation
4. Mandatory password resets
5. Detailed incident report
6. Regulatory compliance notifications

---

## Pricing & Licensing

### Q: How much does SALIS AUTO cost?
**A:** Pricing is customized based on:
- Number of users
- Number of locations
- Features required
- Transaction volume
Contact sales for a custom quote.

### Q: Is there a free trial?
**A:** Yes! We offer:
- 30-day free trial
- Full feature access
- Sample data included
- No credit card required
- Expert onboarding support

### Q: Can I upgrade/downgrade my plan?
**A:** Yes! Plans are flexible:
- Upgrade anytime (immediate access)
- Downgrade at plan renewal
- Pro-rated billing
- No long-term contracts

---

## Support & Training

### Q: What support options are available?
**A:** Support channels:
- **Email**: support@salisauto.com
- **Live Chat**: In-app chat widget
- **Phone**: Business hours support
- **Knowledge Base**: Self-service articles
- **Video Tutorials**: Step-by-step guides

### Q: Is training provided?
**A:** Yes! Training options include:
- Self-paced online courses
- Live webinar training
- On-site training (enterprise)
- Role-specific training materials
- Knowledge base articles

### Q: Where can I find documentation?
**A:** Complete documentation available:
- [Documentation Index](DOCUMENTATION-INDEX.md)
- [Quick Start Guide](QUICK-START-GUIDE.md)
- [User Manual](USER-MANUAL.md)
- [Administrator Guide](ADMINISTRATOR-GUIDE.md)
- [Training Materials](TRAINING-MATERIALS.md)

---

## Still Have Questions?

**Contact Support:**
- 📧 Email: support@salisauto.com
- 💬 Live Chat: Available in-app
- 📞 Phone: See your account details
- 📚 Knowledge Base: [DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md)

**Hours:**
- Monday - Friday: 8:00 AM - 6:00 PM
- Saturday: 9:00 AM - 2:00 PM
- Sunday: Closed (email support available)

---

**We're here to help!** 🚗✨
