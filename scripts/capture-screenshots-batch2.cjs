const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'GUI PRTSCN');

const routes = [
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
];

async function captureScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Batch 2: Capturing ${routes.length} pages...`);
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
  console.log(`Batch 2 complete!`);
  console.log(`Success: ${successCount} | Errors: ${errorCount}`);
  console.log(`========================================`);
}

captureScreenshots().catch(console.error);
