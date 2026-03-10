# SALIS AUTO — Troubleshooting Guide

**Document Type:** Knowledge Base — Troubleshooting  
**Version:** 14.0.0  
**Last Updated:** March 2026  

---

## How to Use This Guide

This guide covers the most common issues encountered in SALIS AUTO. Each issue includes:
- **Symptoms** — What you observe
- **Likely Cause** — Why it's happening
- **Solution** — How to fix it

If your issue isn't listed here, check the FAQ or contact your system administrator.

---

## Authentication Issues

### Cannot log in
**Symptoms:** "Invalid credentials" error when entering email and password  
**Likely Causes:**
1. Incorrect password
2. Account deactivated
3. Wrong email address

**Solutions:**
1. Verify your email address (check for typos)
2. Try password reset (contact admin if no reset option)
3. Ask system admin to check if your account is active
4. Ensure CAPS LOCK is not on

---

### Logged out automatically
**Symptoms:** Redirected to login page without clicking logout  
**Likely Cause:** Session timeout (inactivity) or session expired  
**Solution:** Log back in. Configure session timeout in System Settings if happening too frequently.

---

### 2FA code not working
**Symptoms:** "Invalid 2FA code" error even though code seems correct  
**Likely Cause:** Time sync issue between your device and server  
**Solutions:**
1. Check your phone's time is accurate (Settings → Date & Time → Auto)
2. Use a backup code (saved when enabling 2FA)
3. Contact admin to disable 2FA for your account

---

## Job Card Issues

### Cannot create job card
**Symptoms:** Error when saving new job card  
**Likely Causes:**
1. Customer not selected
2. Vehicle not selected
3. Required fields missing

**Solutions:**
1. Ensure customer and vehicle are both selected
2. Check for red validation errors on the form
3. Verify your role has job card creation permission

---

### Job card not appearing in list
**Symptoms:** Created a job card but it's not visible in the list  
**Likely Cause:** Active filters hiding the job  
**Solution:**
1. Click "Clear Filters"
2. Check if "Show Completed" is toggled off (completed jobs may be hidden)
3. Verify the job was created for the correct branch

---

### Cannot update job status
**Symptoms:** Status dropdown not working or error on status change  
**Likely Cause:** Role permission restriction  
**Solution:** Check with your manager — only certain roles can change job status at each stage. Example: Only QC Inspector or Service Manager can move to "Quality Check."

---

## Invoice & Payment Issues

### Invoice total not matching expected amount
**Symptoms:** Invoice total seems wrong  
**Likely Causes:**
1. VAT applied at wrong rate
2. Discount applied incorrectly
3. Parts pricing outdated

**Solutions:**
1. Check VAT Settings — confirm rate is 15%
2. Review each line item on the invoice
3. Update parts pricing in Spare Parts catalog

---

### ZATCA submission failed
**Symptoms:** "ZATCA Submission Failed" error on invoice  
**Likely Causes:**
1. Invalid TRN number
2. ZATCA certificate expired
3. Network connectivity issue
4. Invoice data formatting issue

**Solutions:**
1. Verify TRN in ZATCA Settings
2. Renew ZATCA certificate via ZATCA portal
3. Check internet connection and retry
4. Review ZATCA error response in Compliance → ZATCA Settings → Submission Log

---

### Payment not recording
**Symptoms:** Customer paid but invoice still shows as "Unpaid"  
**Likely Cause:** Payment not saved correctly  
**Solutions:**
1. Go to Payments → Record Payment → Select the invoice
2. Ensure you clicked "Save" after entering payment details
3. Refresh the page and check invoice status

---

## Inventory Issues

### Parts not deducting from inventory
**Symptoms:** Parts logged to job card but inventory level unchanged  
**Likely Causes:**
1. Part not linked to branch inventory
2. Inventory module not enabled for branch
3. Wrong branch selected

**Solutions:**
1. Check that the part has inventory records for the current branch
2. Go to Inventory → Add Stock → Create branch record for the part

---

### Auto-reorder not triggering
**Symptoms:** Stock below minimum but no purchase order created  
**Likely Causes:**
1. Auto-reorder rule not enabled for that part
2. "Auto-Order" toggle is off (manual approval required)
3. Preferred supplier not set

**Solutions:**
1. Go to Parts Auto-Reorder → Find the part → Check "Auto-Order" is enabled
2. Ensure a preferred supplier is assigned to the reorder rule

---

## Performance Issues

### Page loading very slowly
**Symptoms:** Pages take more than 5 seconds to load  
**Likely Causes:**
1. Large data sets without pagination
2. Network connectivity issue
3. Browser cache issue

**Solutions:**
1. Use filters to narrow data sets
2. Check internet connection speed
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try a different browser

---

### Dashboard charts not loading
**Symptoms:** Charts show "Loading..." indefinitely  
**Likely Cause:** API timeout or data query taking too long  
**Solutions:**
1. Refresh the page
2. Select a shorter date range
3. Check if the server is running (contact admin)

---

## Notification & Communication Issues

### SMS not sending
**Symptoms:** Customers not receiving SMS notifications  
**Likely Causes:**
1. Twilio credentials not configured
2. SMS balance depleted on Twilio account
3. Phone number in wrong format

**Solutions:**
1. Go to Settings → Integrations → Twilio → Test connection
2. Check Twilio account balance at console.twilio.com
3. Ensure phone numbers use international format (+966XXXXXXXXX for Saudi)

---

### Email not sending
**Symptoms:** Customers not receiving email notifications  
**Likely Causes:**
1. Gmail integration not connected
2. Gmail API quota exceeded
3. Customer email address invalid

**Solutions:**
1. Go to Settings → Integrations → Google Mail → Reconnect
2. Check Google API quota in Google Cloud Console
3. Verify customer email address in their profile

---

## Arabic Language Issues

### Arabic text displaying incorrectly (LTR instead of RTL)
**Symptoms:** Arabic text appears left-to-right  
**Solution:**
1. Click the language toggle (EN/AR) to switch to Arabic
2. Browser should automatically switch to RTL layout
3. If still incorrect, clear browser cache and toggle again

---

### Translation showing English instead of Arabic
**Symptoms:** Arabic mode selected but some text still in English  
**Likely Cause:** Translation key not yet added for that section  
**Solution:** This is a known gap for some newer features. The English fallback is intentional until Arabic translation is added.

---

## Technician Portal Issues

### Jobs not appearing in technician portal
**Symptoms:** Technician opens portal but sees no assigned jobs  
**Likely Causes:**
1. Jobs not assigned to that technician
2. Technician linked to wrong branch
3. Filter showing only specific date range

**Solutions:**
1. Ask service advisor to confirm job assignment
2. Check technician's branch assignment in HR → Staff Directory
3. Clear filters and select "All" date range

---

### Time clock not accepting clock-in
**Symptoms:** Error or nothing happens when clicking Clock In  
**Likely Cause:** Already clocked in (forgot to clock out from yesterday)  
**Solutions:**
1. Ask HR Manager to manually correct the previous clock-out time
2. System will then allow new clock-in

---

## Data & Export Issues

### Export file is empty or corrupted
**Symptoms:** Downloaded CSV/Excel opens with no data  
**Likely Causes:**
1. No data in selected date range
2. All records filtered out
3. Browser download blocked

**Solutions:**
1. Widen the date range and try again
2. Clear all active filters before exporting
3. Check browser download settings

---

## Getting Help

If your issue isn't resolved by this guide:

1. **Contact System Admin** — For permission and access issues
2. **Contact IT Support** — For technical errors and bugs
3. **Check Knowledge Base** — `/knowledge-base` for procedures and guides
4. **Screenshot the error** — Helps IT diagnose the problem faster

When reporting issues, always provide:
- What you were trying to do
- What error message appeared (screenshot if possible)
- Your user email and role
- Time when the issue occurred

---

*SALIS AUTO Troubleshooting Guide — Version 14.0.0*
