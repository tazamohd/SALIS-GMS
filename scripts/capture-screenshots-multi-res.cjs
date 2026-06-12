const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'GUI PRTSCN');

// Resolution presets with descriptive names
const RESOLUTIONS = {
  'FullHD': { width: 1920, height: 1080, folder: '01-FullHD-1920x1080' },
  'Widescreen': { width: 1440, height: 900, folder: '02-Widescreen-1440x900' },
  'Laptop': { width: 1366, height: 768, folder: '03-Laptop-1366x768' },
  'Standard': { width: 1280, height: 800, folder: '04-Standard-1280x800' },
  'Tablet-Landscape': { width: 1024, height: 768, folder: '05-Tablet-Landscape-1024x768' },
  'Tablet-Portrait': { width: 768, height: 1024, folder: '06-Tablet-Portrait-768x1024' },
  'Mobile-Large': { width: 414, height: 896, folder: '07-Mobile-Large-414x896' },
  'Mobile-Medium': { width: 390, height: 844, folder: '08-Mobile-Medium-390x844' },
  'Mobile-Small': { width: 360, height: 640, folder: '09-Mobile-Small-360x640' },
};

// Main routes to capture (key screens)
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
  { path: '/suppliers', name: '14-Suppliers' },
  { path: '/purchase-orders', name: '15-Purchase-Orders' },
  { path: '/service-bay-dashboard', name: '17-Service-Bay-Dashboard' },
  { path: '/workshop-calendar', name: '18-Workshop-Calendar' },
  { path: '/customer-feedback', name: '23-Customer-Feedback' },
  { path: '/loyalty-program', name: '25-Loyalty-Program' },
  { path: '/reports', name: '26-Reports' },
  { path: '/business-intelligence-dashboard', name: '27-Business-Intelligence' },
  { path: '/hr-management', name: '31-HR-Management' },
  { path: '/staff-directory', name: '32-Staff-Directory' },
  { path: '/technician-portal', name: '37-Technician-Portal' },
  { path: '/ai-chatbot', name: '44-AI-Chatbot' },
  { path: '/ai-automation', name: '45-AI-Automation' },
  { path: '/franchise-command-center', name: '53-Franchise-Command' },
  { path: '/chart-of-accounts', name: '61-Chart-Of-Accounts' },
  { path: '/fleet-management', name: '71-Fleet-Management' },
  { path: '/user-settings', name: '94-User-Settings' },
  { path: '/calendar', name: '98-Calendar' },
];

async function captureScreenshots() {
  console.log('='.repeat(60));
  console.log('SALIS AUTO - Multi-Resolution Screenshot Capture');
  console.log('='.repeat(60));
  console.log(`Routes: ${routes.length} pages`);
  console.log(`Resolutions: ${Object.keys(RESOLUTIONS).length} sizes`);
  console.log(`Total screenshots: ${routes.length * Object.keys(RESOLUTIONS).length}`);
  console.log(`${'='.repeat(60)  }\n`);

  // Create output directories
  for (const res of Object.values(RESOLUTIONS)) {
    const resDir = path.join(OUTPUT_DIR, res.folder);
    if (!fs.existsSync(resDir)) {
      fs.mkdirSync(resDir, { recursive: true });
    }
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  let totalSuccess = 0;
  let totalError = 0;

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const url = `${BASE_URL}${route.path}`;
    
    console.log(`\n[${i + 1}/${routes.length}] ${route.name}`);
    console.log(`URL: ${url}`);
    
    for (const [resName, res] of Object.entries(RESOLUTIONS)) {
      const filename = `${route.name}.png`;
      const resDir = path.join(OUTPUT_DIR, res.folder);
      const filepath = path.join(resDir, filename);

      try {
        // Set viewport with high device scale factor for crisp images
        await page.setViewport({ 
          width: res.width, 
          height: res.height,
          deviceScaleFactor: 2 // 2x for retina-quality screenshots
        });
        
        await page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        
        // Wait for page to fully render
        await new Promise(resolve => setTimeout(resolve, 800));
        
        await page.screenshot({ 
          path: filepath, 
          fullPage: false,
          type: 'png',
          captureBeyondViewport: false
        });
        
        totalSuccess++;
        process.stdout.write(`  ✓ ${resName} `);
      } catch (error) {
        totalError++;
        process.stdout.write(`  ✗ ${resName} `);
      }
    }
    console.log('');
  }

  await browser.close();

  console.log(`\n${  '='.repeat(60)}`);
  console.log('CAPTURE COMPLETE');
  console.log('='.repeat(60));
  console.log(`Success: ${totalSuccess}`);
  console.log(`Errors: ${totalError}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));
  
  // List folders
  console.log('\nResolution Folders:');
  for (const res of Object.values(RESOLUTIONS)) {
    const resDir = path.join(OUTPUT_DIR, res.folder);
    const files = fs.existsSync(resDir) ? fs.readdirSync(resDir).length : 0;
    console.log(`  ${res.folder}: ${files} screenshots`);
  }
}

captureScreenshots().catch(console.error);
