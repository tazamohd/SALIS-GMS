const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

const screens = [
  // Dashboard & Overview
  { route: '/dashboard', name: '01-dashboard', category: 'dashboard' },
  { route: '/kpi-dashboard', name: '02-kpi-dashboard', category: 'dashboard' },
  
  // Customer Intake & Appointments
  { route: '/customers', name: '03-customers', category: 'customer-intake' },
  { route: '/appointments', name: '04-appointments', category: 'customer-intake' },
  { route: '/calendar', name: '05-calendar', category: 'customer-intake' },
  { route: '/appointment-reminders', name: '06-appointment-reminders', category: 'customer-intake' },
  { route: '/kiosk-checkin', name: '07-kiosk-checkin', category: 'customer-intake' },
  
  // Vehicle Management
  { route: '/vehicles', name: '08-vehicles', category: 'vehicle-management' },
  { route: '/vehicle-history', name: '09-vehicle-history', category: 'vehicle-management' },
  { route: '/vin-decoder', name: '10-vin-decoder', category: 'vehicle-management' },
  { route: '/fleet-management', name: '11-fleet-management', category: 'vehicle-management' },
  { route: '/fleet-tracking', name: '12-fleet-tracking', category: 'vehicle-management' },
  { route: '/loaner-vehicles', name: '13-loaner-vehicles', category: 'vehicle-management' },
  
  // Inspection & Check-In
  { route: '/vehicle-inspections', name: '14-vehicle-inspections', category: 'inspection' },
  { route: '/vehicle-checklist', name: '15-vehicle-checklist', category: 'inspection' },
  { route: '/digital-vehicle-walkaround', name: '16-digital-walkaround', category: 'inspection' },
  { route: '/security-cameras', name: '17-security-cameras', category: 'inspection' },
  { route: '/license-plate', name: '18-license-plate', category: 'inspection' },
  
  // Diagnostics & Assessment
  { route: '/diagnostics-obd', name: '19-diagnostics-obd', category: 'diagnostics' },
  { route: '/smart-damage-assessment', name: '20-smart-damage', category: 'diagnostics' },
  { route: '/vehicle-health-monitoring', name: '21-vehicle-health', category: 'diagnostics' },
  { route: '/predictive-maintenance', name: '22-predictive-maintenance', category: 'diagnostics' },
  { route: '/predictive-diagnostics', name: '23-predictive-diagnostics', category: 'diagnostics' },
  { route: '/document-ocr', name: '24-document-ocr', category: 'diagnostics' },
  
  // Service Planning & Scheduling
  { route: '/job-cards', name: '25-job-cards', category: 'service-planning' },
  { route: '/tasks', name: '26-tasks', category: 'service-planning' },
  { route: '/service-templates', name: '27-service-templates', category: 'service-planning' },
  { route: '/ai-scheduling', name: '28-ai-scheduling', category: 'service-planning' },
  { route: '/smart-assignment', name: '29-smart-assignment', category: 'service-planning' },
  { route: '/estimates', name: '30-estimates', category: 'service-planning' },
  { route: '/video-estimates', name: '31-video-estimates', category: 'service-planning' },
  { route: '/smart-parts-recommendations', name: '32-smart-parts-reco', category: 'service-planning' },
  { route: '/smart-parts-recommender', name: '33-smart-parts-recommender', category: 'service-planning' },
  { route: '/intelligent-price-optimizer', name: '34-price-optimizer', category: 'service-planning' },
  
  // Parts & Inventory
  { route: '/inventory-management', name: '35-inventory', category: 'parts-inventory' },
  { route: '/spare-parts', name: '36-spare-parts', category: 'parts-inventory' },
  { route: '/tools', name: '37-tools', category: 'parts-inventory' },
  { route: '/parts-auto-reorder', name: '38-auto-reorder', category: 'parts-inventory' },
  { route: '/smart-inventory-forecasting', name: '39-inventory-forecast', category: 'parts-inventory' },
  { route: '/suppliers', name: '40-suppliers', category: 'parts-inventory' },
  { route: '/vendor-supplier-portal', name: '41-vendor-portal', category: 'parts-inventory' },
  { route: '/purchase-orders', name: '42-purchase-orders', category: 'parts-inventory' },
  { route: '/parts-marketplace', name: '43-parts-marketplace', category: 'parts-inventory' },
  { route: '/parts-supply-network', name: '44-parts-network', category: 'parts-inventory' },
  { route: '/barcode-scanner', name: '45-barcode-scanner', category: 'parts-inventory' },
  
  // Service Execution & Operations
  { route: '/technician-portal', name: '46-technician-portal', category: 'operations' },
  { route: '/technician-management', name: '47-technician-management', category: 'operations' },
  { route: '/technician-leaderboards', name: '48-leaderboards', category: 'operations' },
  { route: '/technician-performance', name: '49-technician-performance', category: 'operations' },
  { route: '/towing-services', name: '50-towing-services', category: 'operations' },
  { route: '/towing-assistance', name: '51-towing-assistance', category: 'operations' },
  { route: '/vehicle-storage', name: '52-vehicle-storage', category: 'operations' },
  { route: '/tire-management', name: '53-tire-management', category: 'operations' },
  { route: '/routing-optimizer', name: '54-routing-optimizer', category: 'operations' },
  { route: '/task-management', name: '55-task-management', category: 'operations' },
  
  // Quality & Delivery
  { route: '/computer-vision-qc', name: '56-computer-vision-qc', category: 'quality' },
  { route: '/iso-quality-management', name: '57-iso-quality', category: 'quality' },
  { route: '/performance-analytics', name: '58-performance-analytics', category: 'quality' },
  { route: '/staff-performance-review', name: '59-staff-review', category: 'quality' },
  
  // Billing & Payments
  { route: '/invoices', name: '60-invoices', category: 'billing' },
  { route: '/payments', name: '61-payments', category: 'billing' },
  { route: '/stripe-payments', name: '62-stripe-payments', category: 'billing' },
  { route: '/refund-management', name: '63-refund-management', category: 'billing' },
  { route: '/financial-settings', name: '64-financial-settings', category: 'billing' },
  { route: '/expense-tracking', name: '65-expense-tracking', category: 'billing' },
  { route: '/payroll-management', name: '66-payroll', category: 'billing' },
  { route: '/insurance-claims', name: '67-insurance-claims', category: 'billing' },
  
  // Analytics & Business Intelligence
  { route: '/reports', name: '68-reports', category: 'analytics' },
  { route: '/business-intelligence', name: '69-business-intelligence', category: 'analytics' },
  { route: '/business-intelligence-dashboard', name: '70-bi-dashboard', category: 'analytics' },
  { route: '/profit-analysis', name: '71-profit-analysis', category: 'analytics' },
  { route: '/customer-ltv-analysis', name: '72-customer-ltv', category: 'analytics' },
  { route: '/business-heatmaps', name: '73-heatmaps', category: 'analytics' },
  { route: '/custom-report-builder', name: '74-report-builder', category: 'analytics' },
  
  // Customer Experience & Growth
  { route: '/customer-reviews', name: '75-customer-reviews', category: 'customer-experience' },
  { route: '/customer-loyalty', name: '76-customer-loyalty', category: 'customer-experience' },
  { route: '/referral-program', name: '77-referral-program', category: 'customer-experience' },
  { route: '/live-service-tracking', name: '78-live-tracking', category: 'customer-experience' },
  { route: '/video-consultations', name: '79-video-consultations', category: 'customer-experience' },
  { route: '/email-marketing', name: '80-email-marketing', category: 'customer-experience' },
  { route: '/marketing-automation', name: '81-marketing-automation', category: 'customer-experience' },
  { route: '/social-media', name: '82-social-media', category: 'customer-experience' },
  
  // Team & HR Management
  { route: '/hr-management', name: '83-hr-management', category: 'hr' },
  { route: '/time-clock-payroll', name: '84-time-clock', category: 'hr' },
  { route: '/timesheet-management', name: '85-timesheet', category: 'hr' },
  { route: '/productivity-tracker', name: '86-productivity', category: 'hr' },
  { route: '/training-lms', name: '87-training-lms', category: 'hr' },
  { route: '/knowledge-base', name: '88-knowledge-base', category: 'hr' },
  
  // Compliance & Safety
  { route: '/compliance-management', name: '89-compliance', category: 'compliance' },
  { route: '/safety-incidents', name: '90-safety-incidents', category: 'compliance' },
  { route: '/environmental-compliance', name: '91-environmental', category: 'compliance' },
  { route: '/equipment-calibration', name: '92-calibration', category: 'compliance' },
  { route: '/contract-management', name: '93-contracts', category: 'compliance' },
  
  // Enterprise & Franchise
  { route: '/franchise-management', name: '94-franchise', category: 'enterprise' },
  { route: '/globalization-layer', name: '95-globalization', category: 'enterprise' },
  { route: '/oem-software-subscriptions', name: '96-oem-software', category: 'enterprise' },
  { route: '/warranty-management', name: '97-warranty', category: 'enterprise' },
  { route: '/document-management', name: '98-documents', category: 'enterprise' },
  
  // Emerging Technologies
  { route: '/emerging-technologies', name: '99-emerging-tech', category: 'emerging-tech' },
  { route: '/ar-repair-guide', name: '100-ar-repair', category: 'emerging-tech' },
  { route: '/vr-showroom', name: '101-vr-showroom', category: 'emerging-tech' },
  { route: '/digital-twin-viewer', name: '102-digital-twin', category: 'emerging-tech' },
  { route: '/iot-dashboard', name: '103-iot-dashboard', category: 'emerging-tech' },
  { route: '/telematics-integration', name: '104-telematics', category: 'emerging-tech' },
  { route: '/drone-inspection', name: '105-drone', category: 'emerging-tech' },
  { route: '/wearable-integration', name: '106-wearable', category: 'emerging-tech' },
  { route: '/edge-computing-diagnostics', name: '107-edge-computing', category: 'emerging-tech' },
  { route: '/sustainable-energy', name: '108-sustainable-energy', category: 'emerging-tech' },
  { route: '/voice-commands', name: '109-voice-commands', category: 'emerging-tech' },
  { route: '/neural-network-prediction', name: '110-neural-network', category: 'emerging-tech' },
  { route: '/blockchain-service-history', name: '111-blockchain', category: 'emerging-tech' },
  { route: '/smart-contracts', name: '112-smart-contracts', category: 'emerging-tech' },
  { route: '/next-gen-technologies', name: '113-next-gen', category: 'emerging-tech' },
  
  // AI & Automation Hub
  { route: '/ai-automation', name: '114-ai-automation', category: 'ai-automation' },
  { route: '/ai-chatbot', name: '115-ai-chatbot', category: 'ai-automation' },
  { route: '/ai-chatbot-assistant', name: '116-ai-assistant', category: 'ai-automation' },
  { route: '/ai-service-advisor', name: '117-ai-service-advisor', category: 'ai-automation' },
  { route: '/ml-fraud-detection', name: '118-fraud-detection', category: 'ai-automation' },
  { route: '/predictive-demand-forecasting', name: '119-demand-forecast', category: 'ai-automation' },
  
  // System & Settings
  { route: '/settings', name: '120-settings', category: 'system-settings' },
  { route: '/profile', name: '121-profile', category: 'system-settings' },
  { route: '/security', name: '122-security', category: 'system-settings' },
  { route: '/integrations', name: '123-integrations', category: 'system-settings' },
  { route: '/data-import-export', name: '124-data-import', category: 'system-settings' },
  { route: '/notifications', name: '125-notifications', category: 'system-settings' },
  { route: '/call-center', name: '126-call-center', category: 'system-settings' },
  { route: '/chat', name: '127-chat', category: 'system-settings' },
  
  // Customer Portal
  { route: '/client/dashboard', name: '128-client-dashboard', category: 'customer-portal' },
  { route: '/client/appointments', name: '129-client-appointments', category: 'customer-portal' },
  { route: '/client/vehicles', name: '130-client-vehicles', category: 'customer-portal' },
  { route: '/client/invoices', name: '131-client-invoices', category: 'customer-portal' },
  { route: '/client/service-history', name: '132-client-service-history', category: 'customer-portal' },
  { route: '/client/service-reminders', name: '133-client-reminders', category: 'customer-portal' },
  { route: '/client/live-tracking', name: '134-client-tracking', category: 'customer-portal' },
  { route: '/client/review-chat', name: '135-client-review', category: 'customer-portal' },
  { route: '/client/profile', name: '136-client-profile', category: 'customer-portal' },
  
  // Mobile Apps - Customer
  { route: '/mobile/customer', name: '137-mobile-customer-home', category: 'mobile-customer' },
  { route: '/mobile/customer/booking', name: '138-mobile-customer-booking', category: 'mobile-customer' },
  { route: '/mobile/customer/vehicles', name: '139-mobile-customer-vehicles', category: 'mobile-customer' },
  { route: '/mobile/customer/payments', name: '140-mobile-customer-payments', category: 'mobile-customer' },
  { route: '/mobile/customer/profile', name: '141-mobile-customer-profile', category: 'mobile-customer' },
  
  // Mobile Apps - Technician
  { route: '/mobile/technician', name: '142-mobile-tech-home', category: 'mobile-technician' },
  { route: '/mobile/technician/jobs', name: '143-mobile-tech-jobs', category: 'mobile-technician' },
  { route: '/mobile/technician/clock', name: '144-mobile-tech-clock', category: 'mobile-technician' },
  { route: '/mobile/technician/lookup', name: '145-mobile-tech-lookup', category: 'mobile-technician' },
  { route: '/mobile/technician/profile', name: '146-mobile-tech-profile', category: 'mobile-technician' },
  
  // Authentication & Public
  { route: '/', name: '147-landing', category: 'auth' },
  { route: '/login', name: '148-login', category: 'auth' },
  { route: '/register', name: '149-register', category: 'auth' },
  { route: '/login-dashboard', name: '150-login-dashboard', category: 'auth' },
  { route: '/public-tracking', name: '151-public-tracking', category: 'auth' },
  
  // Additional Modules
  { route: '/google-my-business', name: '152-google-my-business', category: 'additional' },
  { route: '/social-media-monitoring', name: '153-social-monitoring', category: 'additional' },
  { route: '/payment-gateway-simulator', name: '154-payment-simulator', category: 'additional' },
  { route: '/digital-signage', name: '155-digital-signage', category: 'additional' },
  { route: '/mobile-device-management', name: '156-mobile-device', category: 'additional' },
  { route: '/obd-diagnostic-viewer', name: '157-obd-viewer', category: 'additional' },
  { route: '/parts-availability', name: '158-parts-availability', category: 'additional' },
  { route: '/vehicles-enhanced', name: '159-vehicles-enhanced', category: 'additional' },
  
  // More screens
  { route: '/home', name: '160-home', category: 'additional' },
  { route: '/customer-portal', name: '161-customer-portal', category: 'additional' },
];

async function captureScreenshots() {
  console.log('Starting screenshot capture for', screens.length, 'screens...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  let capturedCount = 0;
  let failedCount = 0;
  const failed = [];
  
  for (const screen of screens) {
    const screenshotPath = path.join('screenshots', screen.category, `${screen.name}.png`);
    
    try {
      console.log(`[${capturedCount + 1}/${screens.length}] Capturing: ${screen.route}`);
      
      await page.goto(`${BASE_URL}${screen.route}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await page.screenshot({
        path: screenshotPath,
        fullPage: false
      });
      
      capturedCount++;
      console.log(`  ✓ Saved: ${screenshotPath}`);
      
    } catch (error) {
      failedCount++;
      failed.push({ route: screen.route, error: error.message });
      console.log(`  ✗ Failed: ${screen.route} - ${error.message}`);
    }
  }
  
  await browser.close();
  
  console.log('\n========================================');
  console.log('Screenshot Capture Complete!');
  console.log(`✓ Captured: ${capturedCount}`);
  console.log(`✗ Failed: ${failedCount}`);
  console.log('========================================\n');
  
  if (failed.length > 0) {
    console.log('Failed screens:');
    failed.forEach(f => console.log(`  - ${f.route}: ${f.error}`));
  }
  
  fs.writeFileSync('screenshots/capture-report.json', JSON.stringify({
    total: screens.length,
    captured: capturedCount,
    failed: failedCount,
    failedScreens: failed,
    timestamp: new Date().toISOString()
  }, null, 2));
}

captureScreenshots().catch(console.error);
