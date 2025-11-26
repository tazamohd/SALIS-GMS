const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const routes = JSON.parse(process.argv[2] || '[]');

async function capture() {
  if (routes.length === 0) return;
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  for (const { route, name, category } of routes) {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1920, height: 1080 });
      
      // First login
      await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle2', timeout: 10000 });
      await new Promise(r => setTimeout(r, 1000));
      try {
        await page.type('input[type="email"]', 'admin@salisauto.com');
        await page.type('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
      } catch(e) {}
      
      // Navigate to target
      await page.goto(BASE_URL + route, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1500));
      
      const dir = path.join('screenshots', category);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      await page.screenshot({ 
        path: path.join(dir, name + '.png'),
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });
      console.log('OK: ' + route);
    } catch (e) {
      console.log('FAIL: ' + route + ' - ' + e.message.substring(0, 40));
    } finally {
      await page.close();
    }
  }
  
  await browser.close();
}

capture().catch(e => console.error(e));
