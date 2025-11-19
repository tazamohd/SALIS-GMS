# SALIS AUTO - Custom Domain Setup Guide

**Custom Domain**: salisauto.net  
**Last Updated**: January 19, 2025

---

## Overview

This guide will help you configure **salisauto.net** as your custom domain for the SALIS AUTO platform, replacing the long Replit development URL.

**Before**: `https://75f50fe7-b855-4cec-8019-0238316c216a-00-3fui5fd1001m9.kirk.replit.dev`  
**After**: `https://salisauto.net`

---

## Prerequisites

✅ You own the domain **salisauto.net** (purchased from domain registrar)  
✅ You have access to your domain registrar's DNS settings (GoDaddy, Namecheap, etc.)  
✅ Your SALIS AUTO application is ready to deploy on Replit

---

## Step-by-Step Setup

### Step 1: Publish Your Replit Application

1. **Click the "Publish" button** in Replit (top right corner)
2. Wait for the deployment to complete
3. Your app will be published and running

### Step 2: Access Deployment Settings

1. In Replit, click on the **"Deployments"** tab (left sidebar)
2. Click on the **"Settings"** tab
3. Look for **"Link a domain"** or **"Manually connect from another registrar"**
4. Click it

### Step 3: Add Custom Domain

1. Enter your domain: **`salisauto.net`**
2. Click **"Add domain"** or **"Continue"**
3. Replit will generate DNS records for you

### Step 4: Copy DNS Records

Replit will show you two types of records:

**A Record** (for root domain):
```
Type: A
Hostname: @ (or salisauto.net)
Value: [IP Address provided by Replit]
TTL: 3600 (or Auto)
```

**TXT Record** (for verification):
```
Type: TXT
Hostname: @ (or salisauto.net)
Value: [Verification code provided by Replit]
TTL: 3600 (or Auto)
```

**IMPORTANT**: Copy these exact values! You'll need them in the next step.

### Step 5: Configure DNS at Your Domain Registrar

#### For GoDaddy:
1. Login to GoDaddy
2. Go to **"My Products"** → **"Domains"**
3. Click **"DNS"** next to salisauto.net
4. Click **"Add"** to add new records
5. Add the **A Record**:
   - Type: `A`
   - Name: `@`
   - Value: `[IP from Replit]`
   - TTL: `1 Hour`
6. Add the **TXT Record**:
   - Type: `TXT`
   - Name: `@`
   - Value: `[Verification code from Replit]`
   - TTL: `1 Hour`
7. Click **"Save"**

#### For Namecheap:
1. Login to Namecheap
2. Go to **"Domain List"** → Click **"Manage"** next to salisauto.net
3. Go to **"Advanced DNS"** tab
4. Click **"Add New Record"**
5. Add the **A Record**:
   - Type: `A Record`
   - Host: `@`
   - Value: `[IP from Replit]`
   - TTL: `Automatic`
6. Add the **TXT Record**:
   - Type: `TXT Record`
   - Host: `@`
   - Value: `[Verification code from Replit]`
   - TTL: `Automatic`
7. Click **"Save All Changes"**

#### For Cloudflare:
1. Login to Cloudflare
2. Select **salisauto.net**
3. Go to **"DNS"** → **"Records"**
4. Click **"Add record"**
5. Add the **A Record**:
   - Type: `A`
   - Name: `@`
   - IPv4 address: `[IP from Replit]`
   - Proxy status: `DNS only` (gray cloud)
   - TTL: `Auto`
6. Add the **TXT Record**:
   - Type: `TXT`
   - Name: `@`
   - Content: `[Verification code from Replit]`
   - TTL: `Auto`
7. Click **"Save"**

#### For Other Registrars:
The process is similar - find DNS management, add A and TXT records with the values from Replit.

### Step 6: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate worldwide
- Usually completes within **15-30 minutes**
- You can check status at: https://dnschecker.org

**Check Progress**:
1. Go to https://dnschecker.org
2. Enter: `salisauto.net`
3. Select: `A` record type
4. Click **"Search"**
5. Wait until most locations show your Replit IP

### Step 7: Verify Domain in Replit

1. Go back to Replit **Deployments** → **Settings**
2. Check the status of **salisauto.net**
3. It should show **"Verified"** ✅ (after DNS propagation)
4. If not verified yet, wait longer and refresh

### Step 8: Test Your Custom Domain

Once verified, test all portals:

```
✅ https://salisauto.net
✅ https://salisauto.net/login
✅ https://salisauto.net/dashboard
✅ https://salisauto.net/portal/dashboard
```

---

## Adding Subdomains (Optional)

You can also set up subdomains for different portals:

### Example Subdomain Configuration:

**Customer Portal**: `customers.salisauto.net`  
**Technician Portal**: `tech.salisauto.net`  
**Admin Dashboard**: `admin.salisauto.net`  
**Mobile App**: `app.salisauto.net`

### How to Add Subdomain:

1. In Replit, add subdomain: `customers.salisauto.net`
2. Replit gives you an IP address
3. In your DNS settings, add:
   ```
   Type: A
   Hostname: customers
   Value: [Same IP as main domain]
   TTL: 3600
   ```
4. Repeat for each subdomain

---

## SSL/HTTPS Certificate

**Good News**: Replit automatically provides **free SSL certificates** for your custom domain!

- ✅ Your site will automatically use HTTPS
- ✅ Certificate auto-renews
- ✅ No configuration needed
- ✅ All data encrypted

After DNS verification, Replit will:
1. Automatically issue SSL certificate
2. Enable HTTPS for `salisauto.net`
3. Redirect HTTP → HTTPS automatically

---

## All Portal URLs (After Setup)

Once **salisauto.net** is configured, here are your new URLs:

### 🔐 Authentication
```
Login: https://salisauto.net/login
Register: https://salisauto.net/register
Portal Selector: https://salisauto.net/login-dashboard
Landing Page: https://salisauto.net/
```

### 🏢 Staff Portal
```
Main Dashboard: https://salisauto.net/dashboard
```

### 👥 Customer Portal
```
Customer Dashboard: https://salisauto.net/portal/dashboard
My Appointments: https://salisauto.net/portal/appointments
My Invoices: https://salisauto.net/portal/invoices
My Vehicles: https://salisauto.net/portal/vehicles
Communications: https://salisauto.net/portal/communications
```

### 💼 Client Portal (VIP)
```
Client Dashboard: https://salisauto.net/client
Vehicles: https://salisauto.net/client/vehicles
Appointments: https://salisauto.net/client/appointments
Invoices: https://salisauto.net/client/invoices
Profile: https://salisauto.net/client/profile
Service History: https://salisauto.net/client/service-history
Live Tracking: https://salisauto.net/client/live-tracking
Service Reminders: https://salisauto.net/client/reminders
Review & Chat: https://salisauto.net/client/review-chat
```

### 🔧 Technician Portal
```
Tech Dashboard: https://salisauto.net/technician-portal
My Jobs: https://salisauto.net/technician-portal/my-jobs
Time Clock: https://salisauto.net/technician-portal/time-clock
Parts Lookup: https://salisauto.net/technician-portal/parts
Documentation: https://salisauto.net/technician-portal/documentation
Profile: https://salisauto.net/technician-portal/profile
```

### 📱 Mobile Apps
```
Customer Mobile: https://salisauto.net/customer-app
Customer Booking: https://salisauto.net/customer-app/booking
Customer Vehicles: https://salisauto.net/customer-app/vehicles
Customer Payments: https://salisauto.net/customer-app/payments
Customer Profile: https://salisauto.net/customer-app/profile

Technician Mobile: https://salisauto.net/technician-app
Tech Jobs: https://salisauto.net/technician-app/jobs
Tech Clock: https://salisauto.net/technician-app/clock
Tech Lookup: https://salisauto.net/technician-app/lookup
Tech Profile: https://salisauto.net/technician-app/profile
```

### 🏪 Other Portals
```
Vendor Portal: https://salisauto.net/vendor-supplier-portal
Public Tracking: https://salisauto.net/track/:token
```

---

## Troubleshooting

### Problem: Domain not verifying in Replit

**Solution**:
1. Double-check DNS records are correct
2. Make sure you used `@` for hostname (or full domain)
3. Wait longer - DNS can take up to 48 hours
4. Clear your browser cache
5. Check https://dnschecker.org to verify DNS propagation

### Problem: "This site can't be reached" error

**Solution**:
1. DNS hasn't propagated yet - wait longer
2. Check DNS records are correct at registrar
3. Make sure Replit deployment is still running
4. Try accessing with `www.salisauto.net` instead

### Problem: SSL certificate not working

**Solution**:
1. Wait 15-30 minutes after DNS verification
2. Replit auto-issues certificates - be patient
3. Hard refresh browser (Ctrl+Shift+R)
4. Try in incognito/private browsing

### Problem: Some pages work, others don't

**Solution**:
1. This is normal - it's a single-page application
2. All routes work through the main domain
3. Try hard refresh or clear cache
4. Check Replit deployment is running

---

## After Custom Domain Setup

### Update Marketing Materials:
- ✅ Business cards: `salisauto.net`
- ✅ Website: `www.salisauto.net`
- ✅ Email signatures: `Visit salisauto.net`
- ✅ Social media: Link to `salisauto.net`

### Print Materials:
- ✅ QR codes with new URLs
- ✅ Customer receipts with portal link
- ✅ Workshop signs with mobile app URLs

### Configure Email:
Consider setting up professional emails:
- ✅ support@salisauto.net
- ✅ admin@salisauto.net
- ✅ info@salisauto.net

---

## Cost

**Custom Domain Setup**: FREE on Replit!

**Domain Registration Cost** (you pay separately):
- salisauto.net: ~$10-15/year (from registrar)
- SSL Certificate: FREE (included by Replit)
- DNS Management: FREE

---

## Quick Reference

### DNS Records Needed:

| Type | Hostname | Value | Purpose |
|------|----------|-------|---------|
| A | @ | [Replit IP] | Points domain to Replit |
| TXT | @ | [Verification code] | Verifies ownership |

### Timeline:

| Step | Time Required |
|------|---------------|
| Add DNS records | 5 minutes |
| DNS propagation | 15 mins - 48 hours (usually 30 mins) |
| Domain verification | Automatic after DNS propagates |
| SSL certificate | Automatic (15-30 mins after verification) |
| **Total** | **1-48 hours** |

---

## Support

**Need Help?**
1. Check Replit Docs: https://docs.replit.com
2. DNS Checker: https://dnschecker.org
3. Contact your domain registrar support
4. Check Replit Status: https://status.replit.com

---

## Summary

1. ✅ Publish app on Replit
2. ✅ Add `salisauto.net` in Deployments → Settings
3. ✅ Copy A and TXT records
4. ✅ Add records to your domain registrar DNS
5. ✅ Wait for DNS propagation (15-30 mins)
6. ✅ Verify domain in Replit
7. ✅ Test: https://salisauto.net
8. ✅ SSL certificate auto-issued
9. ✅ Share new URLs with customers!

**Your platform will be accessible at**: `https://salisauto.net` 🎉

---

**Document Version**: 1.0  
**Last Updated**: January 19, 2025  
**Platform**: SALIS AUTO ERP
