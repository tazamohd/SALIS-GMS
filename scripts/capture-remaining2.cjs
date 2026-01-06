const puppeteer = require('puppeteer');
const path = require('path');
const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '..', 'GUI PRTSCN');

const routes = [
  { num: 135, path: '/hr-management', name: 'HR-Management' },
  { num: 136, path: '/staff-directory', name: 'Staff-Directory' },
  { num: 137, path: '/staff-scheduling', name: 'Staff-Scheduling' },
  { num: 138, path: '/staff-performance-review', name: 'Staff-Performance-Review' },
  { num: 139, path: '/timesheet-management', name: 'Timesheet-Management' },
  { num: 140, path: '/timeclock-payroll', name: 'Timeclock-Payroll' },
  { num: 141, path: '/payroll-management', name: 'Payroll-Management' },
  { num: 142, path: '/leave-requests', name: 'Leave-Requests' },
  { num: 143, path: '/training-lms', name: 'Training-LMS' },
  { num: 144, path: '/wearable-integration', name: 'Wearable-Integration' },
  { num: 145, path: '/chart-of-accounts', name: 'Chart-Of-Accounts' },
  { num: 146, path: '/general-ledger', name: 'General-Ledger' },
  { num: 147, path: '/journal-entries', name: 'Journal-Entries' },
  { num: 148, path: '/trial-balance', name: 'Trial-Balance' },
  { num: 149, path: '/balance-sheet', name: 'Balance-Sheet' },
  { num: 150, path: '/income-statement', name: 'Income-Statement' },
  { num: 151, path: '/cash-flow-statement', name: 'Cash-Flow-Statement' },
  { num: 152, path: '/accounts-receivable', name: 'Accounts-Receivable' },
  { num: 153, path: '/accounts-payable', name: 'Accounts-Payable' },
  { num: 154, path: '/bank-account-management', name: 'Bank-Account-Management' },
  { num: 155, path: '/budget-management', name: 'Budget-Management' },
  { num: 156, path: '/capital-management', name: 'Capital-Management' },
  { num: 157, path: '/assets-management', name: 'Assets-Management' },
  { num: 158, path: '/liabilities-management', name: 'Liabilities-Management' },
  { num: 159, path: '/equity-management', name: 'Equity-Management' },
  { num: 160, path: '/retained-earnings', name: 'Retained-Earnings' },
  { num: 161, path: '/cost-centers', name: 'Cost-Centers' },
  { num: 162, path: '/loss-account', name: 'Loss-Account' },
  { num: 163, path: '/partners-current-account', name: 'Partners-Current-Account' },
  { num: 164, path: '/expense-tracking', name: 'Expense-Tracking' },
  { num: 165, path: '/expenses-management', name: 'Expenses-Management' },
  { num: 166, path: '/sales-management', name: 'Sales-Management' },
  { num: 167, path: '/accounting-integration', name: 'Accounting-Integration' },
  { num: 168, path: '/financial-settings', name: 'Financial-Settings' },
  { num: 169, path: '/warranty-management', name: 'Warranty-Management' },
  { num: 170, path: '/contract-management', name: 'Contract-Management' },
  { num: 171, path: '/insurance-claims', name: 'Insurance-Claims' },
  { num: 172, path: '/marketing-hub', name: 'Marketing-Hub' },
  { num: 173, path: '/marketing-automation', name: 'Marketing-Automation' },
  { num: 174, path: '/email-marketing-campaigns', name: 'Email-Marketing-Campaigns' },
  { num: 175, path: '/social-media-integration', name: 'Social-Media-Integration' },
  { num: 176, path: '/social-media-monitoring', name: 'Social-Media-Monitoring' },
  { num: 177, path: '/google-my-business', name: 'Google-My-Business' },
  { num: 178, path: '/call-center', name: 'Call-Center' },
  { num: 179, path: '/chat', name: 'Chat' },
  { num: 180, path: '/support-chat-dashboard', name: 'Support-Chat-Dashboard' },
  { num: 181, path: '/notifications', name: 'Notifications' },
  { num: 182, path: '/compliance-management', name: 'Compliance-Management' },
  { num: 183, path: '/zatca-settings', name: 'ZATCA-Settings' },
  { num: 184, path: '/vat-settings', name: 'VAT-Settings' },
  { num: 185, path: '/zakat-settings', name: 'Zakat-Settings' },
  { num: 186, path: '/safety-incidents', name: 'Safety-Incidents' },
  { num: 187, path: '/environmental-compliance', name: 'Environmental-Compliance' },
  { num: 188, path: '/iso-quality', name: 'ISO-Quality-Management' },
  { num: 189, path: '/equipment-calibration', name: 'Equipment-Calibration' },
  { num: 190, path: '/franchise-management', name: 'Franchise-Management' },
  { num: 191, path: '/globalization', name: 'Globalization-Layer' },
  { num: 192, path: '/multi-location-dashboard', name: 'Multi-Location-Dashboard' },
];

async function captureScreenshots() {
  console.log('Capturing pages 135-192...\n');
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
  console.log(`\nBatch complete: ${s}/${routes.length}`);
}
captureScreenshots();
