const puppeteer = require('puppeteer');
const path = require('path');
const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'GUI PRTSCN');

const routes = [
  { num: 193, path: '/ai-automation', name: 'AI-Automation' },
  { num: 194, path: '/ai-chatbot', name: 'AI-Chatbot' },
  { num: 195, path: '/ai-chatbot-assistant', name: 'AI-Chatbot-Assistant' },
  { num: 196, path: '/ai-service-advisor', name: 'AI-Service-Advisor' },
  { num: 197, path: '/voice-commands', name: 'Voice-Commands' },
  { num: 198, path: '/voice-command-interface', name: 'Voice-Command-Interface' },
  { num: 199, path: '/smart-damage-assessment', name: 'Smart-Damage-Assessment' },
  { num: 200, path: '/ml-fraud-detection', name: 'ML-Fraud-Detection' },
  { num: 201, path: '/neural-network-prediction', name: 'Neural-Network-Prediction' },
  { num: 202, path: '/emerging-technologies', name: 'Emerging-Technologies' },
  { num: 203, path: '/nextgen-technologies', name: 'NextGen-Technologies' },
  { num: 204, path: '/iot-dashboard', name: 'IoT-Dashboard' },
  { num: 205, path: '/edge-computing', name: 'Edge-Computing' },
  { num: 206, path: '/digital-twin-viewer', name: 'Digital-Twin-Viewer' },
  { num: 207, path: '/drone-inspection', name: 'Drone-Inspection' },
  { num: 208, path: '/ar-repair-guide', name: 'AR-Repair-Guide' },
  { num: 209, path: '/ar-overlay', name: 'AR-Overlay' },
  { num: 210, path: '/vr-showroom', name: 'VR-Showroom' },
  { num: 211, path: '/blockchain-service-history', name: 'Blockchain-Service-History' },
  { num: 212, path: '/smart-contracts', name: 'Smart-Contracts' },
  { num: 213, path: '/quantum-computing-optimization', name: 'Quantum-Computing' },
  { num: 214, path: '/sustainable-energy-monitoring', name: 'Sustainable-Energy-Monitoring' },
  { num: 215, path: '/digital-signage', name: 'Digital-Signage' },
  { num: 216, path: '/kiosk-checkin', name: 'Kiosk-Check-In' },
  { num: 217, path: '/security-cameras', name: 'Security-Cameras' },
  { num: 218, path: '/mobile-device-management', name: 'Mobile-Device-Management' },
  { num: 219, path: '/document-management', name: 'Document-Management' },
  { num: 220, path: '/document-ocr', name: 'Document-OCR' },
  { num: 221, path: '/data-import-export', name: 'Data-Import-Export' },
  { num: 222, path: '/data-backup', name: 'Data-Backup' },
  { num: 223, path: '/knowledge-base', name: 'Knowledge-Base' },
  { num: 224, path: '/profile', name: 'User-Profile' },
  { num: 225, path: '/settings', name: 'System-Settings' },
  { num: 226, path: '/user-settings', name: 'User-Settings' },
  { num: 227, path: '/integrations', name: 'Integrations' },
  { num: 228, path: '/security', name: 'Security-Settings' },
  { num: 229, path: '/role-management', name: 'Role-Management' },
  { num: 230, path: '/tasks', name: 'Tasks' },
  { num: 231, path: '/task-management', name: 'Task-Management' },
  { num: 232, path: '/tools', name: 'Tools' },
  { num: 233, path: '/dashboard-widgets', name: 'Dashboard-Widgets' },
  { num: 234, path: '/sms-integration', name: 'SMS-Integration' },
  { num: 235, path: '/sales-guide', name: 'Sales-Guide' },
];

async function captureScreenshots() {
  console.log('Capturing final pages 193-235...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  let s = 0;
  for (const r of routes) {
    const num = String(r.num).padStart(3, '0');
    const filename = `${num}-${r.name}.png`;
    try {
      console.log(`[${num}] ${r.name}`);
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle2', timeout: 25000 });
      await new Promise(res => setTimeout(res, 500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: false, type: 'png' });
      s++;
      console.log(`  ✓ ${filename}`);
    } catch (e) { console.log(`  ✗ Error`); }
  }
  await browser.close();
  console.log(`\nFINAL BATCH complete: ${s}/${routes.length}`);
}
captureScreenshots();
