const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'UIUX DARKMOOD');

const routes = [
  { path: '/', name: 'Dashboard-Home' },
  { path: '/welcome', name: 'Welcome-Page' },
  { path: '/dashboard', name: 'Dashboard-Main' },
  { path: '/customers', name: 'Customers-List' },
  { path: '/customer-feedback', name: 'Customer-Feedback' },
  { path: '/customer-loyalty', name: 'Customer-Loyalty' },
  { path: '/customer-reviews-ratings', name: 'Customer-Reviews-Ratings' },
  { path: '/referral-program', name: 'Referral-Program' },
  { path: '/customer-portal', name: 'Customer-Portal' },
  { path: '/loyalty-program', name: 'Loyalty-Program' },
  { path: '/customer-ltv-analysis', name: 'Customer-LTV-Analysis' },
  { path: '/appointments', name: 'Appointments' },
  { path: '/appointment-reminders', name: 'Appointment-Reminders' },
  { path: '/calendar', name: 'Calendar' },
  { path: '/workshop-calendar', name: 'Workshop-Calendar' },
  { path: '/ai-scheduling', name: 'AI-Scheduling' },
  { path: '/smart-assignment', name: 'Smart-Assignment' },
  { path: '/routing-optimizer', name: 'Routing-Optimizer' },
  { path: '/vehicles', name: 'Vehicles' },
  { path: '/vehicles-list', name: 'Vehicles-List' },
  { path: '/vehicle-inspections', name: 'Vehicle-Inspections' },
  { path: '/vehicle-checklist', name: 'Vehicle-Checklist' },
  { path: '/vehicle-history', name: 'Vehicle-History' },
  { path: '/vehicle-health-monitoring', name: 'Vehicle-Health-Monitoring' },
  { path: '/vehicle-tracking', name: 'Vehicle-Tracking' },
  { path: '/vehicle-storage', name: 'Vehicle-Storage' },
  { path: '/vin-decoder', name: 'VIN-Decoder' },
  { path: '/fleet-management', name: 'Fleet-Management' },
  { path: '/fleet-tracking', name: 'Fleet-Tracking' },
  { path: '/tire-management', name: 'Tire-Management' },
  { path: '/loaner-vehicles', name: 'Loaner-Vehicles' },
  { path: '/towing-assistance', name: 'Towing-Assistance' },
  { path: '/towing-services', name: 'Towing-Services' },
  { path: '/telematics-integration', name: 'Telematics-Integration' },
  { path: '/digital-vehicle-walkaround', name: 'Digital-Vehicle-Walkaround' },
  { path: '/license-plate', name: 'License-Plate-Recognition' },
  { path: '/diagnostics-obd', name: 'Diagnostics-OBD-Hub' },
  { path: '/predictive-diagnostics', name: 'Predictive-Diagnostics' },
  { path: '/predictive-maintenance', name: 'Predictive-Maintenance' },
  { path: '/oem-software', name: 'OEM-Software-Subscriptions' },
  { path: '/job-cards', name: 'Job-Cards' },
  { path: '/service-templates', name: 'Service-Templates' },
  { path: '/service-bay-dashboard', name: 'Service-Bay-Dashboard' },
  { path: '/live-service-tracking', name: 'Live-Service-Tracking' },
  { path: '/quality-control', name: 'Quality-Control' },
  { path: '/computer-vision-qc', name: 'Computer-Vision-QC' },
  { path: '/estimates', name: 'Estimates' },
  { path: '/invoices', name: 'Invoices' },
  { path: '/video-estimates', name: 'Video-Estimates' },
  { path: '/video-consultations', name: 'Video-Consultations' },
  { path: '/payments', name: 'Payments' },
  { path: '/stripe-payment-processing', name: 'Stripe-Payment-Processing' },
  { path: '/refund-management', name: 'Refund-Management' },
  { path: '/inventory-management', name: 'Inventory-Management' },
  { path: '/parts-availability', name: 'Parts-Availability' },
  { path: '/parts-auto-reorder', name: 'Parts-Auto-Reorder' },
  { path: '/smart-parts-recommender', name: 'Smart-Parts-Recommender' },
  { path: '/smart-parts-recommendations', name: 'Smart-Parts-Recommendations' },
  { path: '/smart-inventory-forecasting', name: 'Smart-Inventory-Forecasting' },
  { path: '/automated-reordering', name: 'Automated-Reordering' },
  { path: '/spare-parts', name: 'Spare-Parts' },
  { path: '/barcode-scanner', name: 'Barcode-Scanner' },
  { path: '/internal-warehouse', name: 'Internal-Warehouse' },
  { path: '/interactive-3d-parts', name: 'Interactive-3D-Parts' },
  { path: '/parts-marketplace', name: 'Parts-Marketplace' },
  { path: '/dynamic-pricing', name: 'Dynamic-Pricing' },
  { path: '/intelligent-price-optimizer', name: 'Intelligent-Price-Optimizer' },
  { path: '/suppliers', name: 'Suppliers' },
  { path: '/purchase-orders', name: 'Purchase-Orders' },
  { path: '/vendor-supplier-portal', name: 'Vendor-Supplier-Portal' },
  { path: '/parts-network', name: 'Parts-Network-Dashboard' },
  { path: '/parts-network/send-request', name: 'Parts-Network-Send-Request' },
  { path: '/parts-network/my-requests', name: 'Parts-Network-My-Requests' },
  { path: '/parts-network/incoming-requests', name: 'Parts-Network-Incoming-Requests' },
  { path: '/parts-network/quotations', name: 'Parts-Network-Quotations' },
  { path: '/parts-network/members', name: 'Parts-Network-Members' },
  { path: '/parts-network/orders', name: 'Parts-Network-Orders' },
  { path: '/parts-supply-network', name: 'Parts-Supply-Network' },
  { path: '/purchase-agent', name: 'Purchase-Agent-Dashboard' },
  { path: '/purchase-agent/tasks', name: 'Purchase-Agent-Tasks' },
  { path: '/purchase-agent/quotations', name: 'Purchase-Agent-Quotations' },
  { path: '/purchase-agent/payments', name: 'Purchase-Agent-Payments' },
  { path: '/purchase-agent/delivery', name: 'Purchase-Agent-Delivery' },
  { path: '/purchase-agent/orders', name: 'Purchase-Agent-Orders' },
  { path: '/purchase-agent/suppliers', name: 'Purchase-Agent-Suppliers' },
  { path: '/purchase-agent/inventory', name: 'Purchase-Agent-Inventory' },
  { path: '/purchase-agent/price-compare', name: 'Purchase-Agent-Price-Compare' },
  { path: '/purchase-agent/tracking', name: 'Purchase-Agent-Tracking' },
  { path: '/purchase-agent/reports', name: 'Purchase-Agent-Reports' },
  { path: '/technician-portal', name: 'Technician-Portal-Dashboard' },
  { path: '/technician-portal/my-jobs', name: 'Technician-Portal-My-Jobs' },
  { path: '/technician-portal/time-clock', name: 'Technician-Portal-Time-Clock' },
  { path: '/technician-portal/parts', name: 'Technician-Portal-Parts' },
  { path: '/technician-portal/documentation', name: 'Technician-Portal-Documentation' },
  { path: '/technician-portal/profile', name: 'Technician-Portal-Profile' },
  { path: '/technician-portal/attendance', name: 'Technician-Portal-Attendance' },
  { path: '/technician-portal/guides', name: 'Technician-Portal-Guides' },
  { path: '/technician-portal/software', name: 'Technician-Portal-Software' },
  { path: '/technician-management', name: 'Technician-Management' },
  { path: '/technician-leaderboards', name: 'Technician-Leaderboards' },
  { path: '/technician-performance', name: 'Technician-Performance' },
  { path: '/technician-mobile', name: 'Technician-Mobile' },
  { path: '/technician-app', name: 'Technician-App-Home' },
  { path: '/technician-app/jobs', name: 'Technician-App-Jobs' },
  { path: '/technician-app/clock', name: 'Technician-App-Clock' },
  { path: '/technician-app/lookup', name: 'Technician-App-Lookup' },
  { path: '/technician-app/profile', name: 'Technician-App-Profile' },
  { path: '/client', name: 'Client-Portal-Dashboard' },
  { path: '/client/vehicles', name: 'Client-Portal-Vehicles' },
  { path: '/client/appointments', name: 'Client-Portal-Appointments' },
  { path: '/client/invoices', name: 'Client-Portal-Invoices' },
  { path: '/client/profile', name: 'Client-Portal-Profile' },
  { path: '/client/service-history', name: 'Client-Portal-Service-History' },
  { path: '/client/live-tracking', name: 'Client-Portal-Live-Tracking' },
  { path: '/client/reminders', name: 'Client-Portal-Reminders' },
  { path: '/client/review-chat', name: 'Client-Portal-Review-Chat' },
  { path: '/customer-app', name: 'Customer-App-Home' },
  { path: '/customer-app/booking', name: 'Customer-App-Booking' },
  { path: '/customer-app/vehicles', name: 'Customer-App-Vehicles' },
  { path: '/customer-app/payments', name: 'Customer-App-Payments' },
  { path: '/customer-app/profile', name: 'Customer-App-Profile' },
  { path: '/portal/dashboard', name: 'Portal-Dashboard' },
  { path: '/portal/appointments', name: 'Portal-Appointments' },
  { path: '/portal/invoices', name: 'Portal-Invoices' },
  { path: '/portal/vehicles', name: 'Portal-Vehicles' },
  { path: '/portal/communications', name: 'Portal-Communications' },
  { path: '/reports', name: 'Reports' },
  { path: '/custom-report-builder', name: 'Custom-Reports' },
  { path: '/business-intelligence', name: 'Business-Intelligence' },
  { path: '/business-intelligence-dashboard', name: 'Business-Intelligence-Dashboard' },
  { path: '/business-heatmaps', name: 'Business-Heatmaps' },
  { path: '/profit-margin-analysis', name: 'Profit-Analysis' },
  { path: '/kpi-dashboard', name: 'KPI-Dashboard' },
  { path: '/productivity-tracker', name: 'Productivity-Tracker' },
  { path: '/hr-management', name: 'HR-Management' },
  { path: '/staff-directory', name: 'Staff-Directory' },
  { path: '/staff-scheduling', name: 'Staff-Scheduling' },
  { path: '/staff-performance-review', name: 'Staff-Performance-Review' },
  { path: '/timesheet-management', name: 'Timesheet-Management' },
  { path: '/timeclock-payroll', name: 'Timeclock-Payroll' },
  { path: '/payroll-management', name: 'Payroll-Management' },
  { path: '/leave-requests', name: 'Leave-Requests' },
  { path: '/training-lms', name: 'Training-LMS' },
  { path: '/wearable-integration', name: 'Wearable-Integration' },
  { path: '/chart-of-accounts', name: 'Chart-Of-Accounts' },
  { path: '/general-ledger', name: 'General-Ledger' },
  { path: '/journal-entries', name: 'Journal-Entries' },
  { path: '/trial-balance', name: 'Trial-Balance' },
  { path: '/balance-sheet', name: 'Balance-Sheet' },
  { path: '/income-statement', name: 'Income-Statement' },
  { path: '/cash-flow-statement', name: 'Cash-Flow-Statement' },
  { path: '/accounts-receivable', name: 'Accounts-Receivable' },
  { path: '/accounts-payable', name: 'Accounts-Payable' },
  { path: '/bank-account-management', name: 'Bank-Account-Management' },
  { path: '/budget-management', name: 'Budget-Management' },
  { path: '/capital-management', name: 'Capital-Management' },
  { path: '/assets-management', name: 'Assets-Management' },
  { path: '/liabilities-management', name: 'Liabilities-Management' },
  { path: '/equity-management', name: 'Equity-Management' },
  { path: '/retained-earnings', name: 'Retained-Earnings' },
  { path: '/cost-centers', name: 'Cost-Centers' },
  { path: '/loss-account', name: 'Loss-Account' },
  { path: '/partners-current-account', name: 'Partners-Current-Account' },
  { path: '/expense-tracking', name: 'Expense-Tracking' },
  { path: '/expenses-management', name: 'Expenses-Management' },
  { path: '/sales-management', name: 'Sales-Management' },
  { path: '/accounting-integration', name: 'Accounting-Integration' },
  { path: '/financial-settings', name: 'Financial-Settings' },
  { path: '/warranty-management', name: 'Warranty-Management' },
  { path: '/contract-management', name: 'Contract-Management' },
  { path: '/insurance-claims', name: 'Insurance-Claims' },
  { path: '/marketing-hub', name: 'Marketing-Hub' },
  { path: '/marketing-automation', name: 'Marketing-Automation' },
  { path: '/email-marketing-campaigns', name: 'Email-Marketing-Campaigns' },
  { path: '/social-media-integration', name: 'Social-Media-Integration' },
  { path: '/social-media-monitoring', name: 'Social-Media-Monitoring' },
  { path: '/google-my-business', name: 'Google-My-Business' },
  { path: '/call-center', name: 'Call-Center' },
  { path: '/chat', name: 'Chat' },
  { path: '/support-chat-dashboard', name: 'Support-Chat-Dashboard' },
  { path: '/notifications', name: 'Notifications' },
  { path: '/compliance-management', name: 'Compliance-Management' },
  { path: '/zatca-settings', name: 'ZATCA-Settings' },
  { path: '/vat-settings', name: 'VAT-Settings' },
  { path: '/zakat-settings', name: 'Zakat-Settings' },
  { path: '/safety-incidents', name: 'Safety-Incidents' },
  { path: '/environmental-compliance', name: 'Environmental-Compliance' },
  { path: '/iso-quality-management', name: 'ISO-Quality-Management' },
  { path: '/equipment-calibration', name: 'Equipment-Calibration' },
  { path: '/franchise-management', name: 'Franchise-Management' },
  { path: '/globalization-layer', name: 'Globalization-Layer' },
  { path: '/multi-location-dashboard', name: 'Multi-Location-Dashboard' },
  { path: '/ai-automation', name: 'AI-Automation' },
  { path: '/ai-chatbot', name: 'AI-Chatbot' },
  { path: '/ai-chatbot-assistant', name: 'AI-Chatbot-Assistant' },
  { path: '/ai-service-advisor', name: 'AI-Service-Advisor' },
  { path: '/voice-commands', name: 'Voice-Commands' },
  { path: '/voice-command-interface', name: 'Voice-Command-Interface' },
  { path: '/smart-damage-assessment', name: 'Smart-Damage-Assessment' },
  { path: '/ml-fraud-detection', name: 'ML-Fraud-Detection' },
  { path: '/neural-network-prediction', name: 'Neural-Network-Prediction' },
  { path: '/emerging-technologies', name: 'Emerging-Technologies' },
  { path: '/nextgen-technologies', name: 'NextGen-Technologies' },
  { path: '/iot-dashboard', name: 'IoT-Dashboard' },
  { path: '/edge-computing-diagnostics', name: 'Edge-Computing' },
  { path: '/digital-twin-viewer', name: 'Digital-Twin-Viewer' },
  { path: '/drone-inspection', name: 'Drone-Inspection' },
  { path: '/ar-repair-guide', name: 'AR-Repair-Guide' },
  { path: '/ar-overlay', name: 'AR-Overlay' },
  { path: '/vr-showroom', name: 'VR-Showroom' },
  { path: '/blockchain-service-history', name: 'Blockchain-Service-History' },
  { path: '/smart-contracts', name: 'Smart-Contracts' },
  { path: '/quantum-computing-optimization', name: 'Quantum-Computing' },
  { path: '/sustainable-energy-monitoring', name: 'Sustainable-Energy-Monitoring' },
  { path: '/digital-signage', name: 'Digital-Signage' },
  { path: '/kiosk-checkin', name: 'Kiosk-Check-In' },
  { path: '/security-cameras', name: 'Security-Cameras' },
  { path: '/mobile-device-management', name: 'Mobile-Device-Management' },
  { path: '/document-management', name: 'Document-Management' },
  { path: '/document-ocr', name: 'Document-OCR' },
  { path: '/data-import-export', name: 'Data-Import-Export' },
  { path: '/data-backup', name: 'Data-Backup' },
  { path: '/knowledge-base', name: 'Knowledge-Base' },
  { path: '/profile', name: 'User-Profile' },
  { path: '/settings', name: 'System-Settings' },
  { path: '/user-settings', name: 'User-Settings' },
  { path: '/integrations', name: 'Integrations' },
  { path: '/security', name: 'Security-Settings' },
  { path: '/role-management', name: 'Role-Management' },
  { path: '/tasks', name: 'Tasks' },
  { path: '/task-management', name: 'Task-Management' },
  { path: '/tools', name: 'Tools' },
  { path: '/dashboard-widgets', name: 'Dashboard-Widgets' },
  { path: '/sms-integration', name: 'SMS-Integration' },
  { path: '/sales-guide', name: 'Sales-Guide' },
];

async function enableDarkMode(page) {
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
}

async function captureScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  
  console.log(`Starting dark mode capture of ${routes.length} pages...`);
  let captured = 0;
  let failed = 0;

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const num = String(i + 1).padStart(3, '0');
    const filename = `${num}-${route.name}-Dark.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    try {
      await page.goto(`${BASE_URL}${route.path}`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      await enableDarkMode(page);
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: filepath, fullPage: false });
      captured++;
      console.log(`[${num}/${routes.length}] ✓ ${route.name}`);
    } catch (error) {
      failed++;
      console.log(`[${num}/${routes.length}] ✗ ${route.name}: ${error.message}`);
    }
  }

  await browser.close();
  
  console.log(`\n=== DARK MODE CAPTURE COMPLETE ===`);
  console.log(`Captured: ${captured}/${routes.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

captureScreenshots().catch(console.error);
