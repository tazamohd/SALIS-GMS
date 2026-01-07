const http = require('http');

const routes = [
  '/', '/welcome', '/dashboard', '/customers', '/customer-feedback', '/customer-loyalty',
  '/customer-reviews-ratings', '/referral-program', '/customer-portal', '/loyalty-program',
  '/customer-ltv-analysis', '/appointments', '/appointment-reminders', '/calendar',
  '/workshop-calendar', '/ai-scheduling', '/smart-assignment', '/routing-optimizer',
  '/vehicles', '/vehicles-list', '/vehicle-inspections', '/vehicle-checklist', '/vehicle-history',
  '/vehicle-health-monitoring', '/vehicle-tracking', '/vehicle-storage', '/vin-decoder',
  '/fleet-management', '/fleet-tracking', '/tire-management', '/loaner-vehicles',
  '/towing-assistance', '/towing-services', '/telematics-integration', '/digital-vehicle-walkaround',
  '/license-plate', '/diagnostics-obd', '/predictive-diagnostics', '/predictive-maintenance',
  '/oem-software', '/job-cards', '/service-templates', '/service-bay-dashboard', '/live-service-tracking',
  '/quality-control', '/computer-vision-qc', '/estimates', '/invoices', '/video-estimates',
  '/video-consultations', '/payments', '/stripe-payment-processing', '/refund-management',
  '/inventory-management', '/parts-availability', '/parts-auto-reorder', '/smart-parts-recommender',
  '/smart-inventory-forecasting', '/automated-reordering', '/spare-parts', '/barcode-scanner',
  '/internal-warehouse', '/interactive-3d-parts', '/parts-marketplace', '/dynamic-pricing',
  '/intelligent-price-optimizer', '/suppliers', '/purchase-orders', '/vendor-supplier-portal',
  '/parts-network', '/parts-supply-network', '/purchase-agent', '/technician-portal',
  '/technician-management', '/technician-leaderboards', '/technician-performance', '/technician-mobile',
  '/technician-app', '/client', '/customer-app', '/portal/dashboard', '/reports',
  '/custom-report-builder', '/business-intelligence', '/business-intelligence-dashboard',
  '/business-heatmaps', '/profit-margin-analysis', '/kpi-dashboard', '/productivity-tracker',
  '/hr-management', '/staff-directory', '/staff-scheduling', '/staff-performance-review',
  '/timesheet-management', '/timeclock-payroll', '/payroll-management', '/leave-requests',
  '/training-lms', '/wearable-integration', '/chart-of-accounts', '/general-ledger',
  '/journal-entries', '/trial-balance', '/balance-sheet', '/income-statement', '/cash-flow-statement',
  '/accounts-receivable', '/accounts-payable', '/bank-account-management', '/budget-management',
  '/capital-management', '/assets-management', '/liabilities-management', '/equity-management',
  '/retained-earnings', '/cost-centers', '/loss-account', '/partners-current-account',
  '/expense-tracking', '/expenses-management', '/sales-management', '/accounting-integration',
  '/financial-settings', '/warranty-management', '/contract-management', '/insurance-claims',
  '/marketing-hub', '/marketing-automation', '/email-marketing-campaigns', '/social-media-integration',
  '/social-media-monitoring', '/google-my-business', '/call-center', '/chat', '/support-chat-dashboard',
  '/notifications', '/compliance-management', '/zatca-settings', '/vat-settings', '/zakat-settings',
  '/safety-incidents', '/environmental-compliance', '/iso-quality-management', '/equipment-calibration',
  '/franchise-management', '/globalization-layer', '/multi-location-dashboard', '/ai-automation',
  '/ai-chatbot', '/ai-chatbot-assistant', '/ai-service-advisor', '/voice-commands',
  '/voice-command-interface', '/smart-damage-assessment', '/ml-fraud-detection',
  '/neural-network-prediction', '/emerging-technologies', '/nextgen-technologies', '/iot-dashboard',
  '/edge-computing-diagnostics', '/digital-twin-viewer', '/drone-inspection', '/ar-repair-guide',
  '/ar-overlay', '/vr-showroom', '/blockchain-service-history', '/smart-contracts',
  '/quantum-computing-optimization', '/sustainable-energy-monitoring', '/digital-signage',
  '/kiosk-checkin', '/security-cameras', '/mobile-device-management', '/document-management',
  '/document-ocr', '/data-import-export', '/data-backup', '/knowledge-base', '/profile',
  '/settings', '/user-settings', '/integrations', '/security', '/role-management', '/tasks',
  '/task-management', '/tools', '/dashboard-widgets', '/sms-integration', '/sales-guide',
  '/client/vehicles', '/client/appointments', '/client/invoices', '/client/profile',
  '/client/service-history', '/client/live-tracking', '/client/reminders', '/client/review-chat',
  '/technician-portal/my-jobs', '/technician-portal/time-clock', '/technician-portal/parts',
  '/technician-portal/documentation', '/technician-portal/profile', '/technician-portal/attendance',
  '/technician-portal/guides', '/technician-portal/software', '/purchase-agent/tasks',
  '/purchase-agent/quotations', '/purchase-agent/payments', '/purchase-agent/delivery',
  '/purchase-agent/orders', '/purchase-agent/suppliers', '/purchase-agent/inventory',
  '/purchase-agent/price-compare', '/purchase-agent/tracking', '/purchase-agent/reports',
  '/parts-network/send-request', '/parts-network/my-requests', '/parts-network/incoming-requests',
  '/parts-network/quotations', '/parts-network/members', '/parts-network/orders',
  '/technician-app/jobs', '/technician-app/clock', '/technician-app/lookup', '/technician-app/profile',
  '/customer-app/booking', '/customer-app/vehicles', '/customer-app/payments', '/customer-app/profile',
  '/portal/appointments', '/portal/invoices', '/portal/vehicles', '/portal/communications',
  '/smart-parts-recommendations'
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000${path}`, (res) => {
      resolve({ path, status: res.statusCode });
    });
    req.on('error', () => resolve({ path, status: 'error' }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ path, status: 'timeout' }); });
  });
}

async function main() {
  console.log('Checking all routes for 404 errors...\n');
  const results = [];
  
  for (let i = 0; i < routes.length; i += 10) {
    const batch = routes.slice(i, i + 10);
    const checks = await Promise.all(batch.map(checkRoute));
    results.push(...checks);
  }
  
  const notFound = results.filter(r => r.status === 404 || r.status === 'error' || r.status === 'timeout');
  
  if (notFound.length === 0) {
    console.log('✓ All routes are working correctly!');
  } else {
    console.log(`Found ${notFound.length} problematic routes:\n`);
    notFound.forEach((r, i) => console.log(`${i+1}. ${r.path} - ${r.status}`));
  }
}

main();
