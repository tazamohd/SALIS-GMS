const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'GUI PRTSCN');

const routes = [
  { path: '/', name: '01-Dashboard' },
  { path: '/welcome', name: '02-Welcome' },
  { path: '/customers', name: '03-Customers' },
  { path: '/vehicles', name: '04-Vehicles' },
  { path: '/appointments', name: '05-Appointments' },
  { path: '/appointment-reminders', name: '06-Appointment-Reminders' },
  { path: '/job-cards', name: '07-Job-Cards' },
  { path: '/estimates', name: '08-Estimates' },
  { path: '/invoices', name: '09-Invoices' },
  { path: '/payments', name: '10-Payments' },
  { path: '/inventory-management', name: '11-Inventory-Management' },
  { path: '/parts-availability', name: '12-Parts-Availability' },
  { path: '/smart-parts-recommender', name: '13-Smart-Parts-Recommender' },
  { path: '/suppliers', name: '14-Suppliers' },
  { path: '/purchase-orders', name: '15-Purchase-Orders' },
  { path: '/service-templates', name: '16-Service-Templates' },
  { path: '/service-bay-dashboard', name: '17-Service-Bay-Dashboard' },
  { path: '/workshop-calendar', name: '18-Workshop-Calendar' },
  { path: '/smart-assignment', name: '19-Smart-Assignment' },
  { path: '/quality-control', name: '20-Quality-Control' },
  { path: '/vehicle-inspections', name: '21-Vehicle-Inspections' },
  { path: '/vehicle-checklist', name: '22-Vehicle-Checklist' },
  { path: '/customer-feedback', name: '23-Customer-Feedback' },
  { path: '/customer-loyalty', name: '24-Customer-Loyalty' },
  { path: '/loyalty-program', name: '25-Loyalty-Program' },
  { path: '/reports', name: '26-Reports' },
  { path: '/business-intelligence-dashboard', name: '27-Business-Intelligence' },
  { path: '/performance-analytics', name: '28-Performance-Analytics' },
  { path: '/profit-margin-analysis', name: '29-Profit-Margin-Analysis' },
  { path: '/custom-reports', name: '30-Custom-Reports' },
  { path: '/hr-management', name: '31-HR-Management' },
  { path: '/staff-directory', name: '32-Staff-Directory' },
  { path: '/staff-scheduling', name: '33-Staff-Scheduling' },
  { path: '/timesheet-management', name: '34-Timesheet-Management' },
  { path: '/leave-requests', name: '35-Leave-Requests' },
  { path: '/payroll-management', name: '36-Payroll-Management' },
  { path: '/technician-portal', name: '37-Technician-Portal' },
  { path: '/technician-leaderboards', name: '38-Technician-Leaderboards' },
  { path: '/technician-performance', name: '39-Technician-Performance' },
  { path: '/training-lms', name: '40-Training-LMS' },
  { path: '/diagnostics-obd-hub', name: '41-Diagnostics-OBD-Hub' },
  { path: '/oem-software-subscriptions', name: '42-OEM-Software' },
  { path: '/predictive-diagnostics', name: '43-Predictive-Diagnostics' },
  { path: '/ai-chatbot', name: '44-AI-Chatbot' },
  { path: '/ai-automation', name: '45-AI-Automation' },
  { path: '/ai-service-advisor', name: '46-AI-Service-Advisor' },
  { path: '/ai-scheduling', name: '47-AI-Scheduling' },
  { path: '/marketing-hub', name: '48-Marketing-Hub' },
  { path: '/marketing-automation', name: '49-Marketing-Automation' },
  { path: '/email-marketing', name: '50-Email-Marketing' },
  { path: '/social-media-integration', name: '51-Social-Media' },
  { path: '/call-center', name: '52-Call-Center' },
  { path: '/franchise-command-center', name: '53-Franchise-Command' },
  { path: '/multi-location-dashboard', name: '54-Multi-Location' },
  { path: '/globalization-layer', name: '55-Globalization' },
  { path: '/compliance-management', name: '56-Compliance' },
  { path: '/zatca-settings', name: '57-ZATCA-Settings' },
  { path: '/vat-settings', name: '58-VAT-Settings' },
  { path: '/zakat-settings', name: '59-Zakat-Settings' },
  { path: '/safety-incidents', name: '60-Safety-Incidents' },
  { path: '/chart-of-accounts', name: '61-Chart-Of-Accounts' },
  { path: '/general-ledger', name: '62-General-Ledger' },
  { path: '/journal-entries', name: '63-Journal-Entries' },
  { path: '/accounts-payable', name: '64-Accounts-Payable' },
  { path: '/accounts-receivable', name: '65-Accounts-Receivable' },
  { path: '/balance-sheet', name: '66-Balance-Sheet' },
  { path: '/income-statement', name: '67-Income-Statement' },
  { path: '/cash-flow-statement', name: '68-Cash-Flow' },
  { path: '/budget-management', name: '69-Budget-Management' },
  { path: '/bank-account-management', name: '70-Bank-Accounts' },
  { path: '/fleet-management', name: '71-Fleet-Management' },
  { path: '/fleet-tracking', name: '72-Fleet-Tracking' },
  { path: '/tire-management', name: '73-Tire-Management' },
  { path: '/loaner-vehicles', name: '74-Loaner-Vehicles' },
  { path: '/towing-assistance', name: '75-Towing-Assistance' },
  { path: '/warranty-management', name: '76-Warranty-Management' },
  { path: '/contract-management', name: '77-Contract-Management' },
  { path: '/ar-repair-guide', name: '78-AR-Repair-Guide' },
  { path: '/ar-overlay', name: '79-AR-Overlay' },
  { path: '/vr-showroom', name: '80-VR-Showroom' },
  { path: '/digital-twin-viewer', name: '81-Digital-Twin' },
  { path: '/blockchain-service-history', name: '82-Blockchain-History' },
  { path: '/smart-contracts', name: '83-Smart-Contracts' },
  { path: '/iot-dashboard', name: '84-IoT-Dashboard' },
  { path: '/edge-computing', name: '85-Edge-Computing' },
  { path: '/neural-network-prediction', name: '86-Neural-Network' },
  { path: '/quantum-computing-optimization', name: '87-Quantum-Computing' },
  { path: '/computer-vision-qc', name: '88-Computer-Vision-QC' },
  { path: '/voice-command-interface', name: '89-Voice-Commands' },
  { path: '/wearable-integration', name: '90-Wearable-Integration' },
  { path: '/drone-inspection', name: '91-Drone-Inspection' },
  { path: '/sustainable-energy-monitoring', name: '92-Sustainable-Energy' },
  { path: '/ml-fraud-detection', name: '93-ML-Fraud-Detection' },
  { path: '/user-settings', name: '94-User-Settings' },
  { path: '/profile', name: '95-Profile' },
  { path: '/integrations', name: '96-Integrations' },
  { path: '/notifications', name: '97-Notifications' },
  { path: '/calendar', name: '98-Calendar' },
  { path: '/tasks', name: '99-Tasks' },
  { path: '/chat', name: '100-Chat' },
  { path: '/document-management', name: '101-Document-Management' },
  { path: '/data-import-export', name: '102-Data-Import-Export' },
  { path: '/knowledge-base', name: '103-Knowledge-Base' },
  { path: '/kiosk-check-in', name: '104-Kiosk-Check-In' },
  { path: '/digital-signage', name: '105-Digital-Signage' },
  { path: '/barcode-scanner', name: '106-Barcode-Scanner' },
  { path: '/security-cameras', name: '107-Security-Cameras' },
  { path: '/purchase-agent', name: '108-Purchase-Agent-Dashboard' },
  { path: '/purchase-agent/tasks', name: '109-Purchase-Agent-Tasks' },
  { path: '/purchase-agent/quotations', name: '110-Purchase-Agent-Quotations' },
  { path: '/purchase-agent/orders', name: '111-Purchase-Agent-Orders' },
  { path: '/purchase-agent/suppliers', name: '112-Purchase-Agent-Suppliers' },
  { path: '/parts-network', name: '113-Parts-Network' },
  { path: '/parts-network/members', name: '114-Parts-Network-Members' },
  { path: '/client', name: '115-Client-Portal-Dashboard' },
  { path: '/client/vehicles', name: '116-Client-Vehicles' },
  { path: '/client/appointments', name: '117-Client-Appointments' },
  { path: '/client/invoices', name: '118-Client-Invoices' },
  { path: '/customer-app', name: '119-Customer-App' },
  { path: '/technician-app', name: '120-Technician-App' },
  { path: '/automated-reordering', name: '121-Automated-Reordering' },
  { path: '/dynamic-pricing', name: '122-Dynamic-Pricing' },
  { path: '/vehicle-tracking', name: '123-Vehicle-Tracking' },
  { path: '/telematics-integration', name: '124-Telematics' },
  { path: '/expense-tracking', name: '125-Expense-Tracking' },
  { path: '/towing-services', name: '126-Towing-Services' },
  { path: '/vehicle-storage', name: '127-Vehicle-Storage' },
  { path: '/google-my-business', name: '128-Google-My-Business' },
  { path: '/social-media-monitoring', name: '129-Social-Media-Monitoring' },
  { path: '/staff-performance-review', name: '130-Staff-Performance-Review' },
  { path: '/task-management', name: '131-Task-Management' },
  { path: '/vehicle-history', name: '132-Vehicle-History' },
  { path: '/vendor-supplier-portal', name: '133-Vendor-Portal' },
  { path: '/vin-decoder', name: '134-VIN-Decoder' },
  { path: '/document-ocr', name: '135-Document-OCR' },
  { path: '/productivity-tracker', name: '136-Productivity-Tracker' },
  { path: '/obd-diagnostic-viewer', name: '137-OBD-Viewer' },
  { path: '/video-consultations', name: '138-Video-Consultations' },
  { path: '/video-estimates', name: '139-Video-Estimates' },
  { path: '/referral-program', name: '140-Referral-Program' },
  { path: '/customer-portal', name: '141-Customer-Portal' },
  { path: '/service-reminders', name: '142-Service-Reminders' },
  { path: '/customer-reviews', name: '143-Customer-Reviews' },
  { path: '/kpi-dashboard', name: '144-KPI-Dashboard' },
  { path: '/business-heat-maps', name: '145-Business-Heat-Maps' },
  { path: '/predictive-maintenance', name: '146-Predictive-Maintenance' },
  { path: '/vehicle-health-monitoring', name: '147-Vehicle-Health' },
  { path: '/parts-auto-reorder', name: '148-Parts-Auto-Reorder' },
  { path: '/smart-inventory-forecasting', name: '149-Smart-Inventory-Forecasting' },
  { path: '/iso-quality-management', name: '150-ISO-Quality' },
  { path: '/equipment-calibration', name: '151-Equipment-Calibration' },
  { path: '/environmental-compliance', name: '152-Environmental-Compliance' },
  { path: '/emerging-technologies', name: '153-Emerging-Technologies' },
  { path: '/next-gen-technologies', name: '154-Next-Gen-Tech' },
  { path: '/mobile-device-management', name: '155-Mobile-Device-Management' },
  { path: '/sms-integration', name: '156-SMS-Integration' },
];

async function captureScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Starting screenshot capture of ${routes.length} pages...`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const url = `${BASE_URL}${route.path}`;
    const filename = `${route.name}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    try {
      console.log(`[${i + 1}/${routes.length}] Capturing: ${route.name}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await page.screenshot({ 
        path: filepath, 
        fullPage: false,
        type: 'png'
      });
      
      successCount++;
      console.log(`  ✓ Saved: ${filename}`);
    } catch (error) {
      errorCount++;
      console.log(`  ✗ Error: ${error.message}`);
    }
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`Screenshot capture complete!`);
  console.log(`Success: ${successCount} | Errors: ${errorCount}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`========================================`);
}

captureScreenshots().catch(console.error);
