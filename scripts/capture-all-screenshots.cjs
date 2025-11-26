const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

const allRoutes = [
  { route: '/dashboard', name: '01-dashboard', category: 'dashboard' },
  { route: '/kpi-dashboard', name: '02-kpi-dashboard', category: 'dashboard' },
  { route: '/dashboard-widgets', name: '03-dashboard-widgets', category: 'dashboard' },
  { route: '/customers', name: '04-customers', category: 'customer-intake' },
  { route: '/appointments', name: '05-appointments', category: 'customer-intake' },
  { route: '/calendar', name: '06-calendar', category: 'customer-intake' },
  { route: '/appointment-reminders', name: '07-appointment-reminders', category: 'customer-intake' },
  { route: '/kiosk-checkin', name: '08-kiosk-checkin', category: 'customer-intake' },
  { route: '/call-center', name: '09-call-center', category: 'customer-intake' },
  { route: '/vehicles', name: '10-vehicles', category: 'vehicle-management' },
  { route: '/vehicle-history', name: '11-vehicle-history', category: 'vehicle-management' },
  { route: '/vin-decoder', name: '12-vin-decoder', category: 'vehicle-management' },
  { route: '/fleet-management', name: '13-fleet-management', category: 'vehicle-management' },
  { route: '/fleet-tracking', name: '14-fleet-tracking', category: 'vehicle-management' },
  { route: '/loaner-vehicles', name: '15-loaner-vehicles', category: 'vehicle-management' },
  { route: '/vehicle-inspections', name: '16-vehicle-inspections', category: 'inspection' },
  { route: '/vehicle-checklist', name: '17-vehicle-checklist', category: 'inspection' },
  { route: '/digital-vehicle-walkaround', name: '18-digital-walkaround', category: 'inspection' },
  { route: '/security-cameras', name: '19-security-cameras', category: 'inspection' },
  { route: '/license-plate', name: '20-license-plate', category: 'inspection' },
  { route: '/diagnostics-obd', name: '21-diagnostics-obd', category: 'diagnostics' },
  { route: '/smart-damage-assessment', name: '22-smart-damage', category: 'diagnostics' },
  { route: '/vehicle-health-monitoring', name: '23-vehicle-health', category: 'diagnostics' },
  { route: '/predictive-maintenance', name: '24-predictive-maintenance', category: 'diagnostics' },
  { route: '/predictive-diagnostics', name: '25-predictive-diagnostics', category: 'diagnostics' },
  { route: '/document-ocr', name: '26-document-ocr', category: 'diagnostics' },
  { route: '/job-cards', name: '27-job-cards', category: 'service-planning' },
  { route: '/tasks', name: '28-tasks', category: 'service-planning' },
  { route: '/task-management', name: '29-task-management', category: 'service-planning' },
  { route: '/service-templates', name: '30-service-templates', category: 'service-planning' },
  { route: '/ai-scheduling', name: '31-ai-scheduling', category: 'service-planning' },
  { route: '/smart-assignment', name: '32-smart-assignment', category: 'service-planning' },
  { route: '/estimates', name: '33-estimates', category: 'service-planning' },
  { route: '/video-estimates', name: '34-video-estimates', category: 'service-planning' },
  { route: '/smart-parts-recommendations', name: '35-smart-parts-reco', category: 'service-planning' },
  { route: '/smart-parts-recommender', name: '36-smart-parts-recommender', category: 'service-planning' },
  { route: '/intelligent-price-optimizer', name: '37-price-optimizer', category: 'service-planning' },
  { route: '/inventory-management', name: '38-inventory', category: 'parts-inventory' },
  { route: '/spare-parts', name: '39-spare-parts', category: 'parts-inventory' },
  { route: '/tools', name: '40-tools', category: 'parts-inventory' },
  { route: '/parts-auto-reorder', name: '41-auto-reorder', category: 'parts-inventory' },
  { route: '/smart-inventory-forecasting', name: '42-inventory-forecast', category: 'parts-inventory' },
  { route: '/suppliers', name: '43-suppliers', category: 'parts-inventory' },
  { route: '/vendor-supplier-portal', name: '44-vendor-portal', category: 'parts-inventory' },
  { route: '/purchase-orders', name: '45-purchase-orders', category: 'parts-inventory' },
  { route: '/parts-marketplace', name: '46-parts-marketplace', category: 'parts-inventory' },
  { route: '/parts-supply-network', name: '47-parts-network', category: 'parts-inventory' },
  { route: '/parts-availability', name: '48-parts-availability', category: 'parts-inventory' },
  { route: '/barcode-scanner', name: '49-barcode-scanner', category: 'parts-inventory' },
  { route: '/technician-portal', name: '50-technician-portal', category: 'operations' },
  { route: '/technician-management', name: '51-technician-management', category: 'operations' },
  { route: '/technician-leaderboards', name: '52-leaderboards', category: 'operations' },
  { route: '/technician-performance', name: '53-technician-performance', category: 'operations' },
  { route: '/towing-services', name: '54-towing-services', category: 'operations' },
  { route: '/towing-assistance', name: '55-towing-assistance', category: 'operations' },
  { route: '/vehicle-storage', name: '56-vehicle-storage', category: 'operations' },
  { route: '/tire-management', name: '57-tire-management', category: 'operations' },
  { route: '/routing-optimizer', name: '58-routing-optimizer', category: 'operations' },
  { route: '/computer-vision-qc', name: '59-computer-vision-qc', category: 'quality' },
  { route: '/iso-quality', name: '60-iso-quality', category: 'quality' },
  { route: '/staff-performance-review', name: '61-staff-review', category: 'quality' },
  { route: '/invoices', name: '62-invoices', category: 'billing' },
  { route: '/stripe-payment-processing', name: '63-stripe-payments', category: 'billing' },
  { route: '/refund-management', name: '64-refund-management', category: 'billing' },
  { route: '/financial-settings', name: '65-financial-settings', category: 'billing' },
  { route: '/expense-tracking', name: '66-expense-tracking', category: 'billing' },
  { route: '/payroll-management', name: '67-payroll', category: 'billing' },
  { route: '/timeclock-payroll', name: '68-timeclock-payroll', category: 'billing' },
  { route: '/insurance-claims', name: '69-insurance-claims', category: 'billing' },
  { route: '/accounting-integration', name: '70-accounting', category: 'billing' },
  { route: '/reports', name: '71-reports', category: 'analytics' },
  { route: '/custom-reports', name: '72-custom-reports', category: 'analytics' },
  { route: '/business-intelligence', name: '73-business-intelligence', category: 'analytics' },
  { route: '/business-intelligence-dashboard', name: '74-bi-dashboard', category: 'analytics' },
  { route: '/profit-analysis', name: '75-profit-analysis', category: 'analytics' },
  { route: '/customer-ltv-analysis', name: '76-customer-ltv', category: 'analytics' },
  { route: '/business-heatmaps', name: '77-heatmaps', category: 'analytics' },
  { route: '/customer-reviews-ratings', name: '78-customer-reviews', category: 'customer-experience' },
  { route: '/customer-feedback', name: '79-customer-feedback', category: 'customer-experience' },
  { route: '/customer-loyalty', name: '80-customer-loyalty', category: 'customer-experience' },
  { route: '/referral-program', name: '81-referral-program', category: 'customer-experience' },
  { route: '/live-service-tracking', name: '82-live-tracking', category: 'customer-experience' },
  { route: '/video-consultations', name: '83-video-consultations', category: 'customer-experience' },
  { route: '/email-marketing-campaigns', name: '84-email-marketing', category: 'customer-experience' },
  { route: '/marketing-automation', name: '85-marketing-automation', category: 'customer-experience' },
  { route: '/social-media-integration', name: '86-social-media', category: 'customer-experience' },
  { route: '/social-media-monitoring', name: '87-social-monitoring', category: 'customer-experience' },
  { route: '/google-my-business', name: '88-google-business', category: 'customer-experience' },
  { route: '/hr-management', name: '89-hr-management', category: 'hr' },
  { route: '/timesheet-management', name: '90-timesheet', category: 'hr' },
  { route: '/training-lms', name: '91-training-lms', category: 'hr' },
  { route: '/knowledge-base', name: '92-knowledge-base', category: 'hr' },
  { route: '/compliance-management', name: '93-compliance', category: 'compliance' },
  { route: '/safety-incidents', name: '94-safety-incidents', category: 'compliance' },
  { route: '/environmental-compliance', name: '95-environmental', category: 'compliance' },
  { route: '/equipment-calibration', name: '96-calibration', category: 'compliance' },
  { route: '/contract-management', name: '97-contracts', category: 'compliance' },
  { route: '/franchise-management', name: '98-franchise', category: 'enterprise' },
  { route: '/globalization', name: '99-globalization', category: 'enterprise' },
  { route: '/oem-software', name: '100-oem-software', category: 'enterprise' },
  { route: '/warranty-management', name: '101-warranty', category: 'enterprise' },
  { route: '/document-management', name: '102-documents', category: 'enterprise' },
  { route: '/emerging-technologies', name: '103-emerging-tech', category: 'emerging-tech' },
  { route: '/nextgen-technologies', name: '104-next-gen', category: 'emerging-tech' },
  { route: '/ar-repair-guide', name: '105-ar-repair', category: 'emerging-tech' },
  { route: '/vr-showroom', name: '106-vr-showroom', category: 'emerging-tech' },
  { route: '/digital-twin-viewer', name: '107-digital-twin', category: 'emerging-tech' },
  { route: '/iot-dashboard', name: '108-iot-dashboard', category: 'emerging-tech' },
  { route: '/telematics-integration', name: '109-telematics', category: 'emerging-tech' },
  { route: '/drone-inspection', name: '110-drone', category: 'emerging-tech' },
  { route: '/wearable-integration', name: '111-wearable', category: 'emerging-tech' },
  { route: '/edge-computing', name: '112-edge-computing', category: 'emerging-tech' },
  { route: '/sustainable-energy-monitoring', name: '113-sustainable-energy', category: 'emerging-tech' },
  { route: '/voice-commands', name: '114-voice-commands', category: 'emerging-tech' },
  { route: '/blockchain-service-history', name: '115-blockchain', category: 'emerging-tech' },
  { route: '/smart-contracts', name: '116-smart-contracts', category: 'emerging-tech' },
  { route: '/ai-automation', name: '117-ai-automation', category: 'ai-automation' },
  { route: '/ai-chatbot', name: '118-ai-chatbot', category: 'ai-automation' },
  { route: '/ai-chatbot-assistant', name: '119-ai-assistant', category: 'ai-automation' },
  { route: '/ai-service-advisor', name: '120-ai-service-advisor', category: 'ai-automation' },
  { route: '/ml-fraud-detection', name: '121-fraud-detection', category: 'ai-automation' },
  { route: '/settings', name: '122-settings', category: 'system-settings' },
  { route: '/profile', name: '123-profile', category: 'system-settings' },
  { route: '/security', name: '124-security', category: 'system-settings' },
  { route: '/integrations', name: '125-integrations', category: 'system-settings' },
  { route: '/data-import-export', name: '126-data-import', category: 'system-settings' },
  { route: '/data-backup', name: '127-data-backup', category: 'system-settings' },
  { route: '/notifications', name: '128-notifications', category: 'system-settings' },
  { route: '/chat', name: '129-chat', category: 'system-settings' },
  { route: '/technician-portal/my-jobs', name: '130-tech-my-jobs', category: 'technician-portal' },
  { route: '/technician-portal/time-clock', name: '131-tech-time-clock', category: 'technician-portal' },
  { route: '/technician-portal/parts', name: '132-tech-parts', category: 'technician-portal' },
  { route: '/technician-portal/documentation', name: '133-tech-docs', category: 'technician-portal' },
  { route: '/technician-portal/profile', name: '134-tech-profile', category: 'technician-portal' },
  { route: '/client', name: '135-client-dashboard', category: 'client-portal' },
  { route: '/client/vehicles', name: '136-client-vehicles', category: 'client-portal' },
  { route: '/client/appointments', name: '137-client-appointments', category: 'client-portal' },
  { route: '/client/invoices', name: '138-client-invoices', category: 'client-portal' },
  { route: '/client/profile', name: '139-client-profile', category: 'client-portal' },
  { route: '/client/service-history', name: '140-client-service-history', category: 'client-portal' },
  { route: '/client/live-tracking', name: '141-client-tracking', category: 'client-portal' },
  { route: '/client/reminders', name: '142-client-reminders', category: 'client-portal' },
  { route: '/client/review-chat', name: '143-client-review-chat', category: 'client-portal' },
  { route: '/customer-app', name: '144-customer-app', category: 'mobile-customer' },
  { route: '/customer-app/booking', name: '145-customer-booking', category: 'mobile-customer' },
  { route: '/customer-app/vehicles', name: '146-customer-vehicles', category: 'mobile-customer' },
  { route: '/customer-app/payments', name: '147-customer-payments', category: 'mobile-customer' },
  { route: '/customer-app/profile', name: '148-customer-profile', category: 'mobile-customer' },
  { route: '/technician-app', name: '149-technician-app', category: 'mobile-technician' },
  { route: '/technician-app/jobs', name: '150-tech-app-jobs', category: 'mobile-technician' },
  { route: '/technician-app/clock', name: '151-tech-app-clock', category: 'mobile-technician' },
  { route: '/technician-app/lookup', name: '152-tech-app-lookup', category: 'mobile-technician' },
  { route: '/technician-app/profile', name: '153-tech-app-profile', category: 'mobile-technician' },
  { route: '/portal/dashboard', name: '154-portal-dashboard', category: 'portal' },
  { route: '/portal/appointments', name: '155-portal-appointments', category: 'portal' },
  { route: '/portal/invoices', name: '156-portal-invoices', category: 'portal' },
  { route: '/portal/vehicles', name: '157-portal-vehicles', category: 'portal' },
  { route: '/portal/communications', name: '158-portal-communications', category: 'portal' },
  { route: '/login', name: '159-login', category: 'auth' },
  { route: '/register', name: '160-register', category: 'auth' },
  { route: '/customer-portal', name: '161-customer-portal', category: 'auth' },
];

async function captureScreenshots() {
  console.log('Starting screenshot capture for ' + allRoutes.length + ' pages...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  
  const categories = [...new Set(allRoutes.map(r => r.category))];
  for (const cat of categories) {
    const dir = require('path').join('screenshots', cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Login
  console.log('Logging in...');
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.type('input[type="email"], input[name="email"]', 'admin@salisauto.com');
    await page.type('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    console.log('Logged in');
  } catch (e) {
    console.log('Login skipped');
  }
  
  let captured = 0, failed = 0;
  
  for (const { route, name, category } of allRoutes) {
    try {
      console.log('Capturing ' + route + '...');
      await page.goto(BASE_URL + route, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1500));
      const screenshotPath = path.join('screenshots', category, name + '.png');
      await page.screenshot({ path: screenshotPath, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      captured++;
      console.log('  OK (' + captured + '/' + allRoutes.length + ')');
    } catch (error) {
      failed++;
      console.log('  FAIL: ' + error.message.substring(0, 50));
    }
  }
  
  await browser.close();
  console.log('Done! Captured: ' + captured + ', Failed: ' + failed);
  
  // Generate gallery
  const html = generateGallery(allRoutes, categories);
  fs.writeFileSync('screenshots/gallery.html', html);
  console.log('Gallery updated');
}

function generateGallery(routes, categories) {
  const catData = {};
  categories.forEach(c => { catData[c] = { title: c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), screens: routes.filter(r => r.category === c) }; });
  
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SALIS AUTO Screenshots</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:#0f0f0f;color:#fff;padding:20px}h1{text-align:center;font-size:2rem;margin-bottom:30px}.cat{margin-bottom:40px}.cat-title{font-size:1.2rem;padding:10px 15px;background:#1a1a1a;border-radius:8px;margin-bottom:15px;border-left:3px solid #555}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:15px}.card{background:#1a1a1a;border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .2s}.card:hover{transform:translateY(-3px)}.card img{width:100%;height:170px;object-fit:cover;object-position:top}.info{padding:10px}.name{font-weight:600;font-size:.9rem}.route{color:#666;font-size:.75rem;font-family:monospace}.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:1000;justify-content:center;align-items:center}.modal.active{display:flex}.modal img{max-width:95%;max-height:95%}.close{position:absolute;top:20px;right:30px;font-size:2rem;color:#fff;cursor:pointer}</style></head><body><h1>SALIS AUTO - ' + routes.length + ' Screenshots</h1>' + 
  categories.map(c => '<div class="cat"><div class="cat-title">' + catData[c].title + ' (' + catData[c].screens.length + ')</div><div class="grid">' + 
    catData[c].screens.map(s => '<div class="card" onclick="openModal(\'' + c + '/' + s.name + '.png\')"><img src="' + c + '/' + s.name + '.png" loading="lazy" onerror="this.style.background=\'#222\'"><div class="info"><div class="name">' + s.name.replace(/-/g,' ').replace(/^\d+\s*/,'') + '</div><div class="route">' + s.route + '</div></div></div>').join('') + 
  '</div></div>').join('') +
  '<div class="modal" id="modal"><span class="close" onclick="closeModal()">&times;</span><img id="modal-img"></div><script>function openModal(s){document.getElementById("modal-img").src=s;document.getElementById("modal").classList.add("active")}function closeModal(){document.getElementById("modal").classList.remove("active")}document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};document.onkeydown=e=>{if(e.key==="Escape")closeModal()}</script></body></html>';
}

captureScreenshots().catch(console.error);
