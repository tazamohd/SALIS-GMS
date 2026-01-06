const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'GUI PRTSCN');

const routes = [
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

  console.log(`Batch 3: Capturing ${routes.length} pages...`);
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
  console.log(`Batch 3 complete!`);
  console.log(`Success: ${successCount} | Errors: ${errorCount}`);
  console.log(`========================================`);
}

captureScreenshots().catch(console.error);
