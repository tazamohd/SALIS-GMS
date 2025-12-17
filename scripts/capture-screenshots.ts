import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5000';

const routes = [
  // Dashboard & Overview
  { path: '/dashboard', name: '01-dashboard' },
  { path: '/kpi-dashboard', name: '02-kpi-dashboard' },
  { path: '/service-bay-dashboard', name: '03-service-bay-dashboard' },
  { path: '/automated-reordering', name: '04-automated-reordering' },
  { path: '/loyalty-program', name: '05-loyalty-program' },
  
  // Customer Intake & Appointments
  { path: '/customers', name: '06-customers' },
  { path: '/appointments', name: '07-appointments' },
  { path: '/calendar', name: '08-calendar' },
  { path: '/appointment-reminders', name: '09-appointment-reminders' },
  { path: '/kiosk-checkin', name: '10-kiosk-checkin' },
  
  // Vehicle Management
  { path: '/vehicles', name: '11-vehicles' },
  { path: '/vehicle-history', name: '12-vehicle-history' },
  { path: '/vin-decoder', name: '13-vin-decoder' },
  { path: '/fleet-management', name: '14-fleet-management' },
  { path: '/fleet-tracking', name: '15-fleet-tracking' },
  { path: '/loaner-vehicles', name: '16-loaner-vehicles' },
  
  // Inspection & Check-In
  { path: '/vehicle-inspections', name: '17-vehicle-inspections' },
  { path: '/vehicle-checklist', name: '18-vehicle-checklist' },
  { path: '/digital-vehicle-walkaround', name: '19-digital-vehicle-walkaround' },
  { path: '/security-cameras', name: '20-security-cameras' },
  { path: '/license-plate', name: '21-license-plate' },
  
  // Diagnostics & Assessment
  { path: '/diagnostics-obd', name: '22-diagnostics-obd' },
  { path: '/smart-damage-assessment', name: '23-smart-damage-assessment' },
  { path: '/vehicle-health-monitoring', name: '24-vehicle-health-monitoring' },
  { path: '/predictive-maintenance', name: '25-predictive-maintenance' },
  { path: '/predictive-diagnostics', name: '26-predictive-diagnostics' },
  { path: '/document-ocr', name: '27-document-ocr' },
  
  // Service Planning & Scheduling
  { path: '/job-cards', name: '28-job-cards' },
  { path: '/tasks', name: '29-tasks' },
  { path: '/service-templates', name: '30-service-templates' },
  { path: '/workshop-calendar', name: '31-workshop-calendar' },
  { path: '/ai-scheduling', name: '32-ai-scheduling' },
  { path: '/smart-assignment', name: '33-smart-assignment' },
  { path: '/estimates', name: '34-estimates' },
  { path: '/video-estimates', name: '35-video-estimates' },
  { path: '/smart-parts-recommendations', name: '36-smart-parts-recommendations' },
  
  // Parts & Inventory
  { path: '/inventory-management', name: '37-inventory-management' },
  { path: '/spare-parts', name: '38-spare-parts' },
  { path: '/tools', name: '39-tools' },
  { path: '/parts-auto-reorder', name: '40-parts-auto-reorder' },
  { path: '/smart-inventory-forecasting', name: '41-smart-inventory-forecasting' },
  { path: '/suppliers', name: '42-suppliers' },
  { path: '/vendor-supplier-portal', name: '43-vendor-supplier-portal' },
  { path: '/purchase-orders', name: '44-purchase-orders' },
  { path: '/parts-marketplace', name: '45-parts-marketplace' },
  
  // Service Execution & Operations
  { path: '/technician-management', name: '46-technician-management' },
  { path: '/technician-performance', name: '47-technician-performance' },
  { path: '/towing-services', name: '48-towing-services' },
  { path: '/towing-assistance', name: '49-towing-assistance' },
  { path: '/vehicle-storage', name: '50-vehicle-storage' },
  { path: '/tire-management', name: '51-tire-management' },
  { path: '/routing-optimizer', name: '52-routing-optimizer' },
  { path: '/task-management', name: '53-task-management' },
  
  // Quality & Delivery
  { path: '/contract-management', name: '54-contract-management' },
  { path: '/warranty-management', name: '55-warranty-management' },
  { path: '/equipment-calibration', name: '56-equipment-calibration' },
  { path: '/iso-quality', name: '57-iso-quality' },
  { path: '/knowledge-base', name: '58-knowledge-base' },
  
  // Billing & Payments
  { path: '/invoices', name: '59-invoices' },
  { path: '/financial-settings', name: '60-financial-settings' },
  { path: '/refund-management', name: '61-refund-management' },
  { path: '/accounting-integration', name: '62-accounting-integration' },
  { path: '/expense-tracking', name: '63-expense-tracking' },
  { path: '/payroll-management', name: '64-payroll-management' },
  { path: '/stripe-payment-processing', name: '65-stripe-payment-processing' },
  { path: '/bank-account-management', name: '66-bank-account-management' },
  { path: '/chart-of-accounts', name: '67-chart-of-accounts' },
  { path: '/general-ledger', name: '68-general-ledger' },
  { path: '/journal-entries', name: '69-journal-entries' },
  { path: '/trial-balance', name: '70-trial-balance' },
  
  // Analytics & Business Intelligence
  { path: '/reports', name: '71-reports' },
  { path: '/business-intelligence', name: '72-business-intelligence' },
  { path: '/business-intelligence-dashboard', name: '73-business-intelligence-dashboard' },
  { path: '/profit-analysis', name: '74-profit-analysis' },
  { path: '/customer-ltv-analysis', name: '75-customer-ltv-analysis' },
  { path: '/business-heatmaps', name: '76-business-heatmaps' },
  { path: '/data-import-export', name: '77-data-import-export' },
  
  // Customer Experience & Growth
  { path: '/customer-loyalty', name: '78-customer-loyalty' },
  { path: '/marketing-automation', name: '79-marketing-automation' },
  { path: '/marketing-hub', name: '80-marketing-hub' },
  { path: '/email-marketing', name: '81-email-marketing' },
  { path: '/customer-surveys', name: '82-customer-surveys' },
  { path: '/referral-program', name: '83-referral-program' },
  { path: '/google-my-business', name: '84-google-my-business' },
  
  // Team & HR Management
  { path: '/hr-management', name: '85-hr-management' },
  { path: '/training-lms', name: '86-training-lms' },
  { path: '/call-center', name: '87-call-center' },
  { path: '/notifications', name: '88-notifications' },
  { path: '/document-management', name: '89-document-management' },
  
  // Compliance & Safety
  { path: '/saudi-compliance', name: '90-saudi-compliance' },
  { path: '/e-invoicing-zatca', name: '91-e-invoicing-zatca' },
  { path: '/safety-compliance', name: '92-safety-compliance' },
  { path: '/environmental-compliance', name: '93-environmental-compliance' },
  
  // Enterprise & Franchise
  { path: '/franchise-management', name: '94-franchise-management' },
  { path: '/globalization-layer', name: '95-globalization-layer' },
  { path: '/parts-supply-network', name: '96-parts-supply-network' },
  { path: '/oem-software-subscriptions', name: '97-oem-software-subscriptions' },
  { path: '/multi-location-sync', name: '98-multi-location-sync' },
  { path: '/saas-management', name: '99-saas-management' },
  
  // Emerging Technologies
  { path: '/blockchain-service-history', name: '100-blockchain-service-history' },
  { path: '/smart-contracts', name: '101-smart-contracts' },
  { path: '/iot-sensors', name: '102-iot-sensors' },
  { path: '/telematics-integration', name: '103-telematics-integration' },
  { path: '/ev-management', name: '104-ev-management' },
  { path: '/quantum-computing', name: '105-quantum-computing' },
  { path: '/ar-overlay', name: '106-ar-overlay' },
  { path: '/digital-signage', name: '107-digital-signage' },
  { path: '/barcode-qr-scanner', name: '108-barcode-qr-scanner' },
  
  // AI & Automation Hub
  { path: '/ai-automation', name: '109-ai-automation' },
  { path: '/ai-chatbot', name: '110-ai-chatbot' },
  { path: '/ai-chatbot-assistant', name: '111-ai-chatbot-assistant' },
  { path: '/ai-service-advisor', name: '112-ai-service-advisor' },
  { path: '/voice-commands', name: '113-voice-commands' },
  
  // System & Settings
  { path: '/settings', name: '114-settings' },
  { path: '/security', name: '115-security' },
  { path: '/integrations', name: '116-integrations' },
  { path: '/profile', name: '117-profile' },
  { path: '/chat', name: '118-chat' },
  
  // Special Pages
  { path: '/login', name: '119-login' },
  { path: '/welcome', name: '120-welcome' },
  { path: '/', name: '121-landing' },
];

async function captureScreenshots() {
  const outputDir = path.join(process.cwd(), 'ui-screens');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Login first
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('[data-testid="input-email"]', { timeout: 10000 }).catch(() => {});
  
  const emailInput = await page.$('[data-testid="input-email"]');
  const passwordInput = await page.$('[data-testid="input-password"]');
  
  if (emailInput && passwordInput) {
    await emailInput.type('admin@salisauto.com');
    await passwordInput.type('admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  }

  // Filter out already captured screenshots
  const pendingRoutes = routes.filter(route => {
    const screenshotPath = path.join(outputDir, `${route.name}.png`);
    return !fs.existsSync(screenshotPath);
  });
  
  console.log(`Capturing ${pendingRoutes.length} remaining screenshots (${routes.length - pendingRoutes.length} already exist)...`);
  
  for (const route of pendingRoutes) {
    try {
      console.log(`Capturing: ${route.name}`);
      await page.goto(`${BASE_URL}${route.path}`, { 
        waitUntil: 'domcontentloaded', 
        timeout: 10000 
      }).catch(() => {});
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const screenshotPath = path.join(outputDir, `${route.name}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false 
      });
      
      console.log(`✓ Saved: ${route.name}.png`);
    } catch (error: any) {
      console.error(`✗ Failed: ${route.name} - ${error.message || error}`);
      // Try to recover by creating a new page
      try {
        await page.close().catch(() => {});
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
      } catch (e) {
        console.error('Could not recover page');
      }
    }
  }

  await browser.close();
  console.log(`\nDone! Screenshots saved to: ${outputDir}`);
}

captureScreenshots().catch(console.error);
