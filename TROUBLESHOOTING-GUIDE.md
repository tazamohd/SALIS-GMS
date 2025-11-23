# SALIS AUTO - Troubleshooting Guide

## 📋 Table of Contents
- [Login Issues](#login-issues)
- [Performance Issues](#performance-issues)
- [Feature-Specific Issues](#feature-specific-issues)
- [Integration Issues](#integration-issues)
- [Payment Processing Issues](#payment-processing-issues)
- [Database Issues](#database-issues)
- [Common Error Messages](#common-error-messages)
- [Browser Issues](#browser-issues)
- [Mobile Issues](#mobile-issues)

---

## Login Issues

### Problem: Can't Login - Incorrect Password

**Symptoms:**
- "Invalid email or password" error
- Password not accepted

**Solutions:**
1. **Reset Password:**
   ```
   1. Click "Forgot Password?" on login page
   2. Enter your email address
   3. Check email for reset link (check spam folder)
   4. Click link and create new password
   5. Try logging in again
   ```

2. **Check Caps Lock:**
   - Ensure Caps Lock is OFF
   - Password is case-sensitive

3. **Clear Browser Cache:**
   ```
   Chrome: Ctrl+Shift+Delete → Clear browsing data
   Firefox: Ctrl+Shift+Delete → Clear recent history
   Safari: Cmd+Option+E → Empty caches
   ```

4. **Try Different Browser:**
   - Use Chrome, Firefox, or Edge
   - Avoid Internet Explorer

### Problem: Account Locked After Multiple Failed Attempts

**Symptoms:**
- "Account temporarily locked" message
- Can't login even with correct password

**Solutions:**
1. **Wait 15 Minutes:**
   - Account auto-unlocks after 15 minutes
   - Security feature after 5 failed attempts

2. **Contact Administrator:**
   - Ask admin to manually unlock account
   - Admin can reset attempts counter

3. **Use Password Reset:**
   - Reset password to unlock immediately

### Problem: Session Expired

**Symptoms:**
- "Session expired, please login again"
- Logged out unexpectedly

**Solutions:**
1. **Re-login:**
   - Simply login again
   - Sessions timeout after 30 minutes of inactivity

2. **Enable "Remember Me":**
   - Check "Remember Me" when logging in
   - Extends session to 30 days

3. **Check for Multiple Tabs:**
   - Logging out in one tab logs out all tabs
   - Max 3 sessions per user

---

## Performance Issues

### Problem: Slow Page Loading

**Symptoms:**
- Pages take >5 seconds to load
- Spinner shows for extended time
- Timeout errors

**Solutions:**

1. **Check Internet Connection:**
   ```bash
   # Test connection speed
   - Visit speedtest.net
   - Minimum required: 1 Mbps
   - Recommended: 10+ Mbps
   ```

2. **Clear Browser Cache:**
   ```
   Chrome: 
   1. Ctrl+Shift+Delete
   2. Select "Cached images and files"
   3. Select "All time"
   4. Click "Clear data"
   ```

3. **Disable Browser Extensions:**
   - Ad blockers can slow down pages
   - Try in Incognito/Private mode
   - Disable extensions one by one

4. **Check System Resources:**
   ```
   Windows: Ctrl+Shift+Esc (Task Manager)
   Mac: Cmd+Space → "Activity Monitor"
   
   Close unnecessary apps if:
   - CPU > 80%
   - Memory > 90%
   ```

5. **Optimize Data Range:**
   - When viewing reports, use shorter date ranges
   - Filter results to reduce data load
   - Export large datasets instead of viewing

### Problem: Database Queries Timing Out

**Symptoms:**
- "Request timeout" error
- Loading spinner never stops
- "504 Gateway Timeout"

**Solutions:**

1. **Reduce Query Scope:**
   - Use filters to narrow results
   - Select shorter date ranges
   - Paginate large result sets

2. **Clear Database Cache:**
   ```bash
   # For administrators
   npm run cache:clear
   ```

3. **Report to Administrator:**
   - May need database optimization
   - Indexes may need rebuilding
   - Contact support for persistent issues

---

## Feature-Specific Issues

### Problem: Can't Create Job Card

**Symptoms:**
- Error when clicking "Create Job Card"
- Form doesn't submit
- Missing required fields error

**Solutions:**

1. **Check Required Fields:**
   ```
   Required fields:
   ✓ Customer (must be selected)
   ✓ Vehicle (must be selected)
   ✓ Service Type
   ✓ Description
   ```

2. **Verify Customer Has Vehicle:**
   - Go to Customers → Select customer → Vehicles tab
   - Add vehicle if missing
   - Then create job card

3. **Check Browser Console:**
   ```
   F12 → Console tab
   Look for red error messages
   Take screenshot and report to support
   ```

4. **Try Different Browser:**
   - Sometimes browser-specific issues
   - Try Chrome or Firefox

### Problem: Invoice Won't Generate

**Symptoms:**
- "Error generating invoice" message
- Invoice creation fails
- Tax calculation errors

**Solutions:**

1. **Complete Job Card First:**
   ```
   Job card must be marked as:
   ✓ "Completed" or "Quality Check" status
   ✓ Has at least one service item or part
   ✓ Has valid pricing
   ```

2. **Check Tax Configuration:**
   - Navigate to Financial Settings → Tax
   - Ensure tax rates are configured
   - Verify tax categories assigned

3. **Verify Customer Details:**
   ```
   Customer must have:
   ✓ Valid email address
   ✓ Billing address (if required)
   ✓ Tax ID (if business customer)
   ```

4. **Check for Negative Amounts:**
   - Parts prices must be > 0
   - Labor rates must be > 0
   - Discounts can't exceed total

### Problem: Parts Not Showing in Inventory

**Symptoms:**
- Parts list is empty
- "No parts found" message
- Search returns no results

**Solutions:**

1. **Check Filter Settings:**
   - Clear all filters
   - Reset search
   - Check "Show Inactive" toggle

2. **Verify Garage/Branch:**
   - Parts are location-specific
   - Ensure correct garage selected
   - Check branch filter

3. **Seed Sample Data:**
   ```bash
   # For testing/demo only
   npm run seed
   ```

4. **Check Permissions:**
   - Your role may not have parts viewing access
   - Contact administrator for permissions

---

## Integration Issues

### Problem: Stripe Payments Failing

**Symptoms:**
- "Payment failed" error
- Card declined messages
- Payment doesn't process

**Solutions:**

1. **Check Stripe Configuration:**
   ```
   Settings → Integrations → Stripe
   ✓ API keys are set correctly
   ✓ Keys are for correct mode (test vs. live)
   ✓ Webhook is configured
   ```

2. **Test Mode vs. Live Mode:**
   ```
   Test Mode: Use test card 4242 4242 4242 4242
   Live Mode: Use real cards only
   
   Verify you're in correct mode!
   ```

3. **Check Card Details:**
   - Card number correct (no spaces)
   - Expiry date in future
   - CVC/CVV correct
   - ZIP code matches card

4. **Stripe Dashboard:**
   - Login to Stripe dashboard
   - Check for API errors
   - Review webhook logs

### Problem: SMS Not Sending (Twilio)

**Symptoms:**
- SMS notifications not received
- "Failed to send SMS" error
- Customers not getting reminders

**Solutions:**

1. **Verify Twilio Configuration:**
   ```
   Settings → Integrations → Twilio
   ✓ Account SID correct
   ✓ Auth Token correct
   ✓ Phone Number verified
   ```

2. **Check Phone Number Format:**
   ```
   Correct: +1234567890 (international format)
   Wrong: 123-456-7890
   Wrong: (123) 456-7890
   ```

3. **Verify Phone Number:**
   - In test mode, only verified numbers work
   - Add number to verified list in Twilio
   - Or switch to live mode

4. **Check Twilio Balance:**
   - Login to Twilio dashboard
   - Ensure account has credits
   - Review message logs

### Problem: AI Features Not Working

**Symptoms:**
- AI chatbot not responding
- Predictive diagnostics fails
- "AI service unavailable" error

**Solutions:**

1. **Check OpenAI API Key:**
   ```
   Verify in Secrets:
   AI_INTEGRATIONS_OPENAI_API_KEY is set
   Key starts with "sk-"
   ```

2. **Test API Connection:**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. **Check API Quota:**
   - Login to OpenAI dashboard
   - Check usage and limits
   - Ensure billing is active

4. **Review Error Messages:**
   - Rate limit exceeded → Wait or upgrade
   - Invalid API key → Update secret
   - Model not available → Check model name

---

## Payment Processing Issues

### Problem: Payment Processed But Not Showing

**Symptoms:**
- Customer paid but invoice still shows unpaid
- Payment made but no receipt
- Money deducted but status not updated

**Solutions:**

1. **Check Payment Gateway:**
   - Login to Stripe/PayPal dashboard
   - Verify payment was successful
   - Check settlement status

2. **Check Webhook Delivery:**
   ```
   Settings → Integrations → Webhooks
   - Check webhook logs
   - Verify webhook URL is correct
   - Resend webhook if failed
   ```

3. **Manual Payment Recording:**
   ```
   If webhook failed:
   1. Go to Invoice
   2. Click "Record Payment"
   3. Enter payment details manually
   4. Add reference: Stripe payment ID
   5. Save
   ```

4. **Contact Support:**
   - Provide invoice number
   - Provide payment reference
   - Include screenshots

### Problem: Refund Failed

**Symptoms:**
- "Refund failed" error
- Can't process refund
- Partial refund not working

**Solutions:**

1. **Check Original Payment:**
   - Refund only possible if payment was successful
   - Check payment gateway for original transaction
   - Ensure payment hasn't been refunded already

2. **Check Refund Amount:**
   ```
   ✓ Amount <= original payment
   ✓ Amount > 0
   ✓ Partial refunds supported (check gateway)
   ```

3. **Check Payment Age:**
   - Some gateways limit refund window
   - Stripe: 120 days
   - PayPal: 180 days

4. **Manual Refund:**
   ```
   If automatic fails:
   1. Process refund in payment gateway directly
   2. Record refund in SALIS AUTO manually
   3. Update invoice status
   ```

---

## Database Issues

### Problem: "Database Connection Failed"

**Symptoms:**
- Can't access application
- "Could not connect to database" error
- All pages showing errors

**Solutions:**

1. **For Administrators:**
   ```bash
   # Check database URL
   echo $DATABASE_URL
   
   # Test connection
   npm run db:push
   ```

2. **Verify Database Status:**
   - Check database hosting provider
   - Ensure database is running
   - Check for maintenance windows

3. **Check Connection Limits:**
   - May have hit max connections
   - Close unnecessary connections
   - Restart application

4. **Contact Support:**
   - Database issues require admin intervention
   - Provide error message
   - Include timestamp

### Problem: Data Not Saving

**Symptoms:**
- Changes not persisting
- Data reverts after page refresh
- "Save failed" errors

**Solutions:**

1. **Check Form Validation:**
   - All required fields filled
   - Data format correct (dates, numbers)
   - No validation errors shown

2. **Check Browser Console:**
   ```
   F12 → Console
   Look for network errors (red)
   Check for 400/500 errors
   ```

3. **Try Different Browser:**
   - Rule out browser-specific issues
   - Clear cache and try again

4. **Check Permissions:**
   - Your role may not have edit access
   - Contact admin for permissions

---

## Common Error Messages

### Error: "403 Forbidden - Access Denied"

**Meaning:** You don't have permission to access this feature.

**Solutions:**
1. Check your assigned role
2. Contact administrator for access
3. Request permission override if needed

### Error: "404 Not Found"

**Meaning:** The page or resource doesn't exist.

**Solutions:**
1. Check URL spelling
2. Resource may have been deleted
3. Refresh the page
4. Navigate from menu instead of direct link

### Error: "500 Internal Server Error"

**Meaning:** Server encountered an unexpected error.

**Solutions:**
1. Refresh the page
2. Try again in a few minutes
3. Report to administrator if persists
4. Include what you were doing when error occurred

### Error: "Network Error - Request Failed"

**Meaning:** Connection to server failed.

**Solutions:**
1. Check internet connection
2. Check firewall/VPN
3. Try different network
4. Contact IT if internal network issue

---

## Browser Issues

### Problem: Page Displays Incorrectly

**Symptoms:**
- Layout broken
- Buttons missing
- Text overlapping

**Solutions:**

1. **Hard Refresh:**
   ```
   Windows: Ctrl+Shift+R
   Mac: Cmd+Shift+R
   ```

2. **Clear Cache:**
   - See clearing cache instructions above
   - Important after system updates

3. **Check Browser Version:**
   ```
   Minimum versions:
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+
   ```

4. **Disable Extensions:**
   - Test in Incognito/Private mode
   - Disable ad blockers
   - Disable script blockers

### Problem: Download Doesn't Start

**Symptoms:**
- Export/Download button does nothing
- File doesn't download
- Pop-up blocked

**Solutions:**

1. **Allow Pop-ups:**
   ```
   Chrome: Click icon in address bar → Allow
   Firefox: Settings → Permissions → Pop-ups
   ```

2. **Check Downloads Folder:**
   - File may have downloaded silently
   - Check default downloads location

3. **Try Different Format:**
   - If PDF fails, try CSV
   - If Excel fails, try PDF

---

## Mobile Issues

### Problem: Mobile Layout Issues

**Symptoms:**
- Content too small
- Buttons not clickable
- Text cut off

**Solutions:**

1. **Use Landscape Mode:**
   - Rotate device for tables/reports
   - Better for data-heavy pages

2. **Zoom In/Out:**
   - Pinch to zoom
   - Double-tap to auto-fit

3. **Use Desktop View:**
   ```
   Mobile browser settings:
   "Request Desktop Site"
   Better for complex forms
   ```

### Problem: Can't Upload Photos

**Symptoms:**
- Camera button doesn't work
- Upload fails
- Photos don't attach

**Solutions:**

1. **Check Permissions:**
   ```
   Mobile settings:
   - Allow camera access for browser
   - Allow photo library access
   ```

2. **Check File Size:**
   - Max 10MB per photo
   - Compress large images
   - Use "Reduce file size" option

3. **Use Alternative:**
   - Take photo with camera app
   - Then upload from gallery
   - Or email photo and attach later

---

## Getting Additional Help

### When to Contact Support

Contact support if:
- Issue persists after troubleshooting
- Data loss or corruption
- Security concerns
- System-wide problems
- Payment/billing issues

### What to Include When Reporting Issues

**Essential Information:**
1. **User Details:**
   - Your email/username
   - Your role
   - Garage/branch

2. **Issue Description:**
   - What were you trying to do?
   - What happened instead?
   - When did it start?

3. **Technical Details:**
   - Browser and version
   - Device (desktop/mobile)
   - Operating system
   - Screenshots (if applicable)

4. **Steps to Reproduce:**
   ```
   Example:
   1. Navigate to Job Cards
   2. Click "New Job Card"
   3. Fill in customer and vehicle
   4. Click "Create"
   5. Error appears: [error message]
   ```

5. **Error Messages:**
   - Exact error text
   - Error code (if shown)
   - Timestamp

### Contact Information

- **Email**: support@salisauto.com
- **Live Chat**: In-app chat widget
- **Phone**: See your account details
- **Knowledge Base**: [FAQ](FAQ.md)

---

**Still stuck? We're here to help!** 🔧✨
