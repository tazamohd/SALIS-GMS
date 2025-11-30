# SALIS AUTO - Portal Access Guide

**Version**: 1.0  
**Last Updated**: January 19, 2025

---

## Overview

SALIS AUTO provides **multiple specialized portals** for different types of users. Each portal is designed for a specific user role with customized features and access levels.

---

## Available Portals

### 1. 🏢 **Main Dashboard** (Staff Portal)
**Who**: Garage staff, managers, administrators  
**URL**: `/dashboard` or `/login-dashboard`  
**Features**: Full ERP access - all 141+ modules

### 2. 👤 **Customer Portal**
**Who**: Registered customers  
**URL**: `/portal/dashboard`  
**Features**: View vehicles, book appointments, pay invoices, chat support

### 3. 💼 **Client Portal** (Premium Customers)
**Who**: VIP/Business customers  
**URL**: `/client`  
**Features**: Enhanced self-service, live tracking, service history, e-signature

### 4. 🔧 **Technician Portal** (Desktop)
**Who**: Technicians on workshop computers  
**URL**: `/technician-portal`  
**Features**: My jobs, time clock, parts lookup, job documentation

### 5. 📱 **Customer Mobile App**
**Who**: Customers on mobile devices  
**URL**: `/customer-app`  
**Features**: Mobile-optimized booking, vehicles, payments

### 6. 📱 **Technician Mobile App**
**Who**: Technicians on mobile devices  
**URL**: `/technician-app`  
**Features**: Mobile-optimized job management, clock in/out

### 7. 🏪 **Vendor/Supplier Portal**
**Who**: Parts suppliers and vendors  
**URL**: `/vendor-supplier-portal`  
**Features**: Price lists, orders, performance tracking

---

## How to Access Each Portal

### 🔐 Method 1: After Registration/Login

When you register or login, you'll see the **Login Dashboard** which shows portal options based on your account type:

```
1. Register at: /register
2. Enter: Name, Email, Password, Phone
3. Click "Create Account"
4. You'll be redirected to: /login-dashboard
5. Choose your portal from the dashboard
```

### 🔐 Method 2: Direct URLs

Once logged in, you can bookmark and access portals directly:

| Portal | Direct URL | Shortcut |
|--------|-----------|----------|
| **Main Dashboard** | `https://your-domain.replit.app/dashboard` | Staff entrance |
| **Login Dashboard** | `https://your-domain.replit.app/login-dashboard` | Portal selector |
| **Customer Portal** | `https://your-domain.replit.app/portal/dashboard` | Customer entrance |
| **Client Portal** | `https://your-domain.replit.app/client` | VIP entrance |
| **Technician Portal** | `https://your-domain.replit.app/technician-portal` | Tech entrance |
| **Customer Mobile** | `https://your-domain.replit.app/customer-app` | Mobile web |
| **Technician Mobile** | `https://your-domain.replit.app/technician-app` | Mobile web |
| **Vendor Portal** | `https://your-domain.replit.app/vendor-supplier-portal` | Supplier entrance |

### 🔐 Method 3: QR Codes (Recommended for Mobile)

Generate QR codes for easy mobile access:

**Customer Portal QR**:
```
https://your-domain.replit.app/customer-app
```

**Technician Clock-In QR**:
```
https://your-domain.replit.app/technician-app/clock
```

Print and post these QR codes in your workshop for quick access!

---

## Portal Access Matrix

### Customer Portal (`/portal/*`)

**Available Pages**:
- ✅ `/portal/dashboard` - Overview, upcoming appointments, recent invoices
- ✅ `/portal/appointments` - Book and manage appointments
- ✅ `/portal/invoices` - View and pay invoices online
- ✅ `/portal/vehicles` - My vehicles and service history
- ✅ `/portal/communications` - Messages and notifications

**Login Credentials** (Test Accounts):
```
Email: customer1@example.com
Password: password123

Email: customer2@example.com  
Password: password123
```

**Features**:
- View service history
- Book appointments online
- Pay invoices (Stripe/PayPal)
- Upload vehicle photos
- Chat with support
- Get service reminders

---

### Client Portal (`/client/*`) - Premium

**Available Pages**:
- ✅ `/client` - Premium dashboard
- ✅ `/client/vehicles` - Vehicles with detailed history
- ✅ `/client/appointments` - Advanced booking
- ✅ `/client/invoices` - Invoice management
- ✅ `/client/profile` - Account settings
- ✅ `/client/service-history` - Complete service records
- ✅ `/client/live-tracking` - Real-time service tracking
- ✅ `/client/reminders` - Service reminders
- ✅ `/client/review-chat` - Reviews and live chat

**Who Gets This**:
- VIP customers
- Fleet customers
- Business accounts
- High-value customers

**Extra Features vs Standard Portal**:
- Live service tracking with real-time updates
- E-signature for approvals
- Priority chat support
- Detailed service history with blockchain verification
- Advanced reporting
- API access (for fleet integration)

---

### Technician Portal (`/technician-portal/*`)

**Available Pages**:
- ✅ `/technician-portal` - My dashboard
- ✅ `/technician-portal/my-jobs` - Assigned jobs
- ✅ `/technician-portal/time-clock` - Clock in/out
- ✅ `/technician-portal/parts` - Parts lookup
- ✅ `/technician-portal/documentation` - Job documentation
- ✅ `/technician-portal/profile` - My profile

**Login Credentials** (Test Accounts):
```
Email: freddie.boyle70@gmail.com
Password: password123
Name: Lillian Pouros (Technician)

Email: tech2@salisauto.com
Password: password123
```

**Features**:
- View assigned jobs
- Clock in/out for time tracking
- Look up parts information
- Document completed work
- Upload photos/videos
- Update job status
- View service manuals

**Access Control**:
- Can only see assigned jobs
- Can update job progress
- Cannot delete jobs
- Cannot see financial data
- Cannot access admin settings

---

### Customer Mobile App (`/customer-app/*`)

**Available Pages**:
- ✅ `/customer-app` - Mobile home
- ✅ `/customer-app/booking` - Quick appointment booking
- ✅ `/customer-app/vehicles` - My vehicles
- ✅ `/customer-app/payments` - Pay invoices
- ✅ `/customer-app/profile` - My account

**Optimized For**:
- Mobile phones (iOS/Android browsers)
- Tablet devices
- Touch-first interface
- Large buttons for easy tapping
- Responsive design

**Best Use**:
- Customers booking from home
- On-the-go invoice payments
- Quick vehicle history check
- Mobile-friendly experience

---

### Technician Mobile App (`/technician-app/*`)

**Available Pages**:
- ✅ `/technician-app` - Mobile home
- ✅ `/technician-app/jobs` - My jobs list
- ✅ `/technician-app/clock` - Clock in/out
- ✅ `/technician-app/lookup` - Quick parts lookup
- ✅ `/technician-app/profile` - My profile

**Best Use**:
- Workshop floor (technicians don't need computer)
- Quick job status updates
- Mobile clock in/out
- Parts scanning with phone camera
- Photo capture of work

**Benefits**:
- No need for desktop computer in workshop
- Update jobs from phone
- Clock in/out anywhere in garage
- Scan QR codes on parts
- Take photos of repairs

---

### Vendor/Supplier Portal (`/vendor-supplier-portal`)

**Who**: Parts suppliers, vendors, distributors

**Features**:
- View purchase orders from garage
- Update order status
- Submit invoices
- Track payments
- Update price lists
- Performance metrics

**Access**: Suppliers receive login credentials when added to system

---

## Staff Dashboard Access (`/dashboard`)

### Who Can Access:
- ✅ Service Managers
- ✅ Service Advisors
- ✅ Receptionists
- ✅ Parts Managers
- ✅ Accountants
- ✅ HR Managers
- ✅ Marketing Managers
- ✅ Quality Control
- ✅ Call Center Agents
- ✅ System Administrators
- ✅ Business Owners
- ✅ General Managers

### Login Credentials (Staff Test Accounts):

**System Administrator** (Full Access):
```
Email: admin@salisauto.com
Password: password123
Access: Everything
```

**Service Manager**:
```
Email: isaias.schumm@salisauto.com
Password: password123
Access: Service operations, job cards, technicians, reports
```

**Service Advisor**:
```
Email: sasha.emard@salisauto.com
Password: password123
Access: Customers, appointments, job cards, invoices
```

**Parts Manager**:
```
Email: fannie.deckow-howell@salisauto.com
Password: password123
Access: Inventory, purchase orders, suppliers, parts
```

**Accountant**:
```
Email: edgar.heaney@salisauto.com
Password: password123
Access: Invoices, payments, financial reports, accounting
```

**Call Center Agent**:
```
Email: ethelyn.leffler@salisauto.com
Password: password123
Access: Call center, appointments, customers, chat
```

**See STAFF-USERS-GUIDE.md for all 70 staff accounts**

---

## Portal Navigation Flow

### Scenario 1: New Customer Registration

```
Step 1: Customer visits your website
        ↓
Step 2: Clicks "Register" → /register
        ↓
Step 3: Fills form (name, email, password, phone)
        ↓
Step 4: Submits form
        ↓
Step 5: Redirected to /login-dashboard
        ↓
Step 6: Sees portal options
        ↓
Step 7: Clicks "Customer Portal"
        ↓
Step 8: Now at /portal/dashboard
```

### Scenario 2: Staff Member Login

```
Step 1: Staff opens browser
        ↓
Step 2: Goes to /login
        ↓
Step 3: Enters staff email + password
        ↓
Step 4: System checks user type = "staff"
        ↓
Step 5: Auto-redirected to /login-dashboard
        ↓
Step 6: Clicks "Dashboard" (main portal)
        ↓
Step 7: Now at /dashboard
        ↓
Step 8: Sees sidebar with all modules
```

### Scenario 3: Technician Mobile Access

```
Step 1: Technician arrives at workshop
        ↓
Step 2: Scans QR code on wall
        ↓
Step 3: Opens /technician-app/clock
        ↓
Step 4: Taps "Clock In"
        ↓
Step 5: Browses to "My Jobs"
        ↓
Step 6: Sees assigned jobs for the day
        ↓
Step 7: Taps job to see details
        ↓
Step 8: Updates status, adds photos
```

---

## How Portal Access is Determined

### Automatic User Type Detection

The system automatically determines which portal to show based on:

1. **User Type Field** in database:
   - `user_type = 'customer'` → Customer Portal
   - `user_type = 'staff'` → Main Dashboard
   - `user_type = 'technician'` → Technician Portal
   - `user_type = 'vendor'` → Vendor Portal

2. **Role Assignment**:
   - Users with role "Customer" → Customer portals
   - Users with role "Technician" → Technician portals
   - Users with other roles → Main Dashboard

3. **Manual Portal Selection**:
   - Login Dashboard (`/login-dashboard`) lets users choose
   - Useful for users with multiple roles
   - Example: Manager who is also a customer

---

## Portal Comparison Chart

| Feature | Customer Portal | Client Portal | Technician Portal | Staff Dashboard |
|---------|----------------|---------------|-------------------|-----------------|
| **Book Appointments** | ✅ Basic | ✅ Advanced | ❌ | ✅ Full |
| **View Invoices** | ✅ | ✅ | ❌ | ✅ |
| **Pay Online** | ✅ | ✅ | ❌ | ✅ |
| **Live Tracking** | ❌ | ✅ | ❌ | ✅ |
| **E-Signature** | ❌ | ✅ | ❌ | ✅ |
| **Service History** | ✅ Basic | ✅ Blockchain | ❌ | ✅ Full |
| **Chat Support** | ✅ | ✅ Priority | ❌ | ✅ Agent |
| **Job Management** | ❌ | ❌ | ✅ | ✅ |
| **Time Tracking** | ❌ | ❌ | ✅ | ✅ |
| **Parts Lookup** | ❌ | ❌ | ✅ | ✅ |
| **Inventory** | ❌ | ❌ | ❌ | ✅ |
| **Reports** | ❌ | ✅ Basic | ❌ | ✅ Full |
| **Admin Settings** | ❌ | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ✅ Fleet | ❌ | ✅ |
| **Mobile Optimized** | ✅ | ✅ | ✅ | ⚠️ Desktop |

---

## Setting Up Portal Access

### For Garage Owners/Admins:

#### 1. Enable Customer Portal
```
✅ Already enabled by default
✅ Customers auto-registered on first signup
✅ Share URL: https://your-domain.replit.app/portal/dashboard
```

#### 2. Upgrade Customer to Client Portal
```
Step 1: Go to Dashboard → Customers
Step 2: Find customer
Step 3: Edit customer
Step 4: Change "Account Type" to "VIP" or "Fleet"
Step 5: Save
Step 6: Customer now has access to /client portal
Step 7: Send them the new link
```

#### 3. Give Staff Access to Dashboard
```
Step 1: Go to Dashboard → HR Management
Step 2: Click "Add Employee"
Step 3: Enter details + email
Step 4: Set user_type = "staff"
Step 5: Assign role (Service Advisor, etc.)
Step 6: Send credentials
Step 7: They login and access /dashboard
```

#### 4. Create Technician Account
```
Step 1: Go to Dashboard → Technician Management
Step 2: Click "Add Technician"
Step 3: Enter name, email, password
Step 4: Set user_type = "technician"
Step 5: Assign role = "Technician"
Step 6: Share portal link: /technician-portal
Step 7: Print QR code for mobile: /technician-app
```

#### 5. Add Vendor/Supplier
```
Step 1: Go to Dashboard → Vendors/Suppliers
Step 2: Click "Add Supplier"
Step 3: Fill company details
Step 4: Create user account for supplier
Step 5: Set user_type = "vendor"
Step 6: Send login: /vendor-supplier-portal
```

---

## Mobile Access Best Practices

### 📱 For Customers:

**Recommended**: Bookmark on phone home screen
```
1. Open https://your-domain.replit.app/customer-app
2. Tap browser menu (3 dots)
3. Select "Add to Home Screen"
4. Name it "SALIS AUTO"
5. Now it works like a mobile app!
```

### 📱 For Technicians:

**Recommended**: Use QR code system
```
1. Admin generates QR code for /technician-app/clock
2. Print and laminate QR code
3. Post near workshop entrance
4. Technicians scan to clock in
5. Scan again to access jobs
```

### 🖥️ For Desktop Users (Staff):

**Recommended**: Browser bookmark
```
1. Login to https://your-domain.replit.app/dashboard
2. Bookmark the page
3. Keep browser logged in
4. Quick access every day
```

---

## Security & Access Control

### Portal Security Features:

✅ **Session-based authentication** - Secure cookies  
✅ **Password encryption** - bcrypt hashing  
✅ **Role-based access control** - 24 roles with granular permissions  
✅ **Automatic session timeout** - Logout after inactivity  
✅ **HTTPS enforcement** - Encrypted data transmission  
✅ **Two-factor authentication** - Optional 2FA for staff  

### Access Restrictions:

- ❌ Customers cannot access staff dashboard
- ❌ Technicians cannot see financial data
- ❌ Service Advisors cannot access payroll
- ❌ Regular staff cannot access admin settings
- ✅ Each role sees only what they need

---

## Troubleshooting Portal Access

### Problem 1: "404 Page Not Found" after login

**Solution**:
- You're being redirected to wrong portal
- Check your user_type in database
- Contact admin to verify account type

### Problem 2: Can't see any menu items after login

**Solution**:
- Your role has no permissions assigned
- Contact admin to assign proper role
- Check role-permission mappings

### Problem 3: Portal shows wrong language

**Solution**:
- Go to Profile → Settings
- Change language preference
- Or use browser language detection

### Problem 4: Mobile portal doesn't load

**Solution**:
- Clear browser cache
- Update to latest browser version
- Try different browser (Chrome recommended)
- Check internet connection

### Problem 5: Keep getting logged out

**Solution**:
- Session timeout is set to 30 minutes
- Don't use incognito/private browsing
- Check browser doesn't block cookies
- Contact admin to extend timeout

---

## Portal URLs Quick Reference

Copy and save these URLs for your garage:

```
🏠 MAIN LOGIN
https://your-domain.replit.app/login

📋 PORTAL SELECTOR (after login)
https://your-domain.replit.app/login-dashboard

👥 CUSTOMER PORTAL
https://your-domain.replit.app/portal/dashboard

💼 CLIENT PORTAL (VIP)
https://your-domain.replit.app/client

🔧 TECHNICIAN PORTAL (Desktop)
https://your-domain.replit.app/technician-portal

📱 CUSTOMER MOBILE APP
https://your-domain.replit.app/customer-app

📱 TECHNICIAN MOBILE APP
https://your-domain.replit.app/technician-app

🏪 VENDOR PORTAL
https://your-domain.replit.app/vendor-supplier-portal

⚙️ STAFF DASHBOARD
https://your-domain.replit.app/dashboard
```

---

## Next Steps

### For Garage Owners:
1. ✅ Share customer portal URL with customers
2. ✅ Print QR codes for mobile access
3. ✅ Train staff on which portal to use
4. ✅ Set up customer accounts
5. ✅ Test each portal yourself

### For Staff:
1. ✅ Bookmark your dashboard
2. ✅ Learn your portal features
3. ✅ Help customers access their portal
4. ✅ Report any access issues

### For Customers:
1. ✅ Register at /register
2. ✅ Bookmark portal on phone
3. ✅ Download as "app" on home screen
4. ✅ Enable notifications

---

## Support

**Need Help?**
- Check Knowledge Base: `/knowledge-base`
- Contact admin through: `/chat`
- Email: support@salisauto.com
- See full guide: `PLATFORM-NAVIGATION-GUIDE.md`

---

**Document Version**: 1.0  
**Last Updated**: January 19, 2025  
**Platform**: SALIS AUTO ERP v1.0
