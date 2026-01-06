const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'GUI PRTSCN');

const routes = [
  { num: 67, path: '/intelligent-price-optimizer', name: 'Intelligent-Price-Optimizer' },
  { num: 68, path: '/suppliers', name: 'Suppliers' },
  { num: 69, path: '/purchase-orders', name: 'Purchase-Orders' },
  { num: 70, path: '/vendor-supplier-portal', name: 'Vendor-Supplier-Portal' },
  { num: 71, path: '/parts-network', name: 'Parts-Network-Dashboard' },
  { num: 72, path: '/parts-network/send-request', name: 'Parts-Network-Send-Request' },
  { num: 73, path: '/parts-network/my-requests', name: 'Parts-Network-My-Requests' },
  { num: 74, path: '/parts-network/incoming-requests', name: 'Parts-Network-Incoming-Requests' },
  { num: 75, path: '/parts-network/quotations', name: 'Parts-Network-Quotations' },
  { num: 76, path: '/parts-network/members', name: 'Parts-Network-Members' },
  { num: 77, path: '/parts-network/orders', name: 'Parts-Network-Orders' },
  { num: 78, path: '/parts-supply-network', name: 'Parts-Supply-Network' },
  { num: 79, path: '/purchase-agent', name: 'Purchase-Agent-Dashboard' },
  { num: 80, path: '/purchase-agent/tasks', name: 'Purchase-Agent-Tasks' },
  { num: 81, path: '/purchase-agent/quotations', name: 'Purchase-Agent-Quotations' },
  { num: 82, path: '/purchase-agent/payments', name: 'Purchase-Agent-Payments' },
  { num: 83, path: '/purchase-agent/delivery', name: 'Purchase-Agent-Delivery' },
  { num: 84, path: '/purchase-agent/orders', name: 'Purchase-Agent-Orders' },
  { num: 85, path: '/purchase-agent/suppliers', name: 'Purchase-Agent-Suppliers' },
  { num: 86, path: '/purchase-agent/inventory', name: 'Purchase-Agent-Inventory' },
  { num: 87, path: '/purchase-agent/price-compare', name: 'Purchase-Agent-Price-Compare' },
  { num: 88, path: '/purchase-agent/tracking', name: 'Purchase-Agent-Tracking' },
  { num: 89, path: '/purchase-agent/reports', name: 'Purchase-Agent-Reports' },
  { num: 90, path: '/technician-portal', name: 'Technician-Portal-Dashboard' },
  { num: 91, path: '/technician-portal/my-jobs', name: 'Technician-Portal-My-Jobs' },
  { num: 92, path: '/technician-portal/time-clock', name: 'Technician-Portal-Time-Clock' },
  { num: 93, path: '/technician-portal/parts', name: 'Technician-Portal-Parts' },
  { num: 94, path: '/technician-portal/documentation', name: 'Technician-Portal-Documentation' },
  { num: 95, path: '/technician-portal/profile', name: 'Technician-Portal-Profile' },
  { num: 96, path: '/technician-portal/attendance', name: 'Technician-Portal-Attendance' },
  { num: 97, path: '/technician-portal/guides', name: 'Technician-Portal-Guides' },
  { num: 98, path: '/technician-portal/software', name: 'Technician-Portal-Software' },
  { num: 99, path: '/technician-management', name: 'Technician-Management' },
  { num: 100, path: '/technician-leaderboards', name: 'Technician-Leaderboards' },
  { num: 101, path: '/technician-performance', name: 'Technician-Performance' },
  { num: 102, path: '/technician-mobile', name: 'Technician-Mobile' },
  { num: 103, path: '/technician-app', name: 'Technician-App-Home' },
  { num: 104, path: '/technician-app/jobs', name: 'Technician-App-Jobs' },
  { num: 105, path: '/technician-app/clock', name: 'Technician-App-Clock' },
  { num: 106, path: '/technician-app/lookup', name: 'Technician-App-Lookup' },
  { num: 107, path: '/technician-app/profile', name: 'Technician-App-Profile' },
  { num: 108, path: '/client', name: 'Client-Portal-Dashboard' },
  { num: 109, path: '/client/vehicles', name: 'Client-Portal-Vehicles' },
  { num: 110, path: '/client/appointments', name: 'Client-Portal-Appointments' },
  { num: 111, path: '/client/invoices', name: 'Client-Portal-Invoices' },
  { num: 112, path: '/client/profile', name: 'Client-Portal-Profile' },
  { num: 113, path: '/client/service-history', name: 'Client-Portal-Service-History' },
  { num: 114, path: '/client/live-tracking', name: 'Client-Portal-Live-Tracking' },
  { num: 115, path: '/client/reminders', name: 'Client-Portal-Reminders' },
  { num: 116, path: '/client/review-chat', name: 'Client-Portal-Review-Chat' },
  { num: 117, path: '/customer-app', name: 'Customer-App-Home' },
  { num: 118, path: '/customer-app/booking', name: 'Customer-App-Booking' },
  { num: 119, path: '/customer-app/vehicles', name: 'Customer-App-Vehicles' },
  { num: 120, path: '/customer-app/payments', name: 'Customer-App-Payments' },
  { num: 121, path: '/customer-app/profile', name: 'Customer-App-Profile' },
  { num: 122, path: '/portal/dashboard', name: 'Portal-Dashboard' },
  { num: 123, path: '/portal/appointments', name: 'Portal-Appointments' },
  { num: 124, path: '/portal/invoices', name: 'Portal-Invoices' },
  { num: 125, path: '/portal/vehicles', name: 'Portal-Vehicles' },
  { num: 126, path: '/portal/communications', name: 'Portal-Communications' },
  { num: 127, path: '/reports', name: 'Reports' },
  { num: 128, path: '/custom-reports', name: 'Custom-Reports' },
  { num: 129, path: '/business-intelligence', name: 'Business-Intelligence' },
  { num: 130, path: '/business-intelligence-dashboard', name: 'Business-Intelligence-Dashboard' },
  { num: 131, path: '/business-heatmaps', name: 'Business-Heatmaps' },
  { num: 132, path: '/profit-analysis', name: 'Profit-Analysis' },
  { num: 133, path: '/kpi-dashboard', name: 'KPI-Dashboard' },
  { num: 134, path: '/productivity-tracker', name: 'Productivity-Tracker' },
];

async function captureScreenshots() {
  console.log('Continuing capture from page 67...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  let successCount = 0;
  for (const route of routes) {
    const url = `${BASE_URL}${route.path}`;
    const num = String(route.num).padStart(3, '0');
    const filename = `${num}-${route.name}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    try {
      console.log(`[${num}] ${route.name}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.screenshot({ path: filepath, fullPage: false, type: 'png' });
      successCount++;
      console.log(`  ✓ ${filename}`);
    } catch (error) {
      console.log(`  ✗ Error`);
    }
  }
  await browser.close();
  console.log(`\nBatch complete: ${successCount}/${routes.length} captured`);
}
captureScreenshots().catch(console.error);
