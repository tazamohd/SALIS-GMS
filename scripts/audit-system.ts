import fs from "fs";
import path from "path";

console.log("\n🔍 STARTING SYSTEM AUDIT FOR SALIS AUTO...\n");

// 1. فحص المجلدات الأساسية
const requiredDirs = [
  "client", "server", "shared", "server/routes", 
  "migrations", "attached_assets"
];

console.log("Checking Directory Structure...");
let dirErrors = 0;
requiredDirs.forEach(dir => {
  if (!fs.existsSync(path.resolve(process.cwd(), dir))) {
    console.log(`❌ Missing Directory: ${dir}`);
    dirErrors++;
  } else {
    console.log(`✅ Found: ${dir}`);
  }
});

// 2. فحص المتغيرات البيئية (بدون عرض القيم الحقيقية للأمان)
const requiredEnvVars = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "TWILIO_ACCOUNT_SID"
];

console.log("\nChecking Environment Variables...");
let envErrors = 0;
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    console.log(`⚠️  Missing Config: ${key} (Features relying on this will fail)`);
    envErrors++;
  } else {
    console.log(`✅ Configured: ${key}`);
  }
});

// 3. فحص ملف المسارات العملاق
const routesPath = path.resolve(process.cwd(), "server/routes.ts");
if (fs.existsSync(routesPath)) {
  const stats = fs.statSync(routesPath);
  const sizeInMB = stats.size / (1024 * 1024);
  console.log(`\n⚠️  WARNING: Monolithic routes.ts found! Size: ${sizeInMB.toFixed(2)} MB`);
  console.log("   -> This is a critical architectural risk.");
}

console.log("\n---------------------------------------------------");
console.log(`📊 AUDIT SUMMARY: ${dirErrors} Directory Errors, ${envErrors} Config Warnings.`);
console.log("---------------------------------------------------\n");
