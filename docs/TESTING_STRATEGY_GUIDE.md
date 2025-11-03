# SALIS AUTO - Testing Strategy & Guide

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Framework Ready

---

## Testing Overview

### Testing Pyramid

```
                 /\
                /  \
               / E2E \
              /-------\
             /  Inte-  \
            / gration   \
           /-------------\
          /     Unit      \
         /-----------------\
```

- **Unit Tests:** 60% - Test individual functions
- **Integration Tests:** 30% - Test API endpoints and database
- **E2E Tests:** 10% - Test full user workflows

---

## Unit Testing

### Framework Setup

**Jest + TypeScript:**
```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
```

**Configuration:** `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/shared'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'server/**/*.ts',
    'shared/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Example Unit Tests

**Utility Functions:**
```typescript
// shared/__tests__/vatUtils.test.ts
import { calculateVAT, calculateTotal, validateTRN } from '../vatUtils';

describe('VAT Utilities', () => {
  describe('calculateVAT', () => {
    it('should calculate 15% VAT correctly', () => {
      expect(calculateVAT(100, 0.15)).toBe(15);
    });

    it('should handle decimal amounts', () => {
      expect(calculateVAT(99.99, 0.15)).toBeCloseTo(15.00, 2);
    });

    it('should return 0 for zero amount', () => {
      expect(calculateVAT(0, 0.15)).toBe(0);
    });
  });

  describe('validateTRN', () => {
    it('should validate correct 15-digit TRN', () => {
      expect(validateTRN('123456789012345')).toBe(true);
    });

    it('should reject TRN with wrong length', () => {
      expect(validateTRN('12345')).toBe(false);
    });

    it('should reject non-numeric TRN', () => {
      expect(validateTRN('ABC123456789012')).toBe(false);
    });
  });
});
```

**Business Logic:**
```typescript
// server/__tests__/storage.test.ts
import { PgStorage } from '../storage';
import { db } from '../db';

describe('PgStorage', () => {
  let storage: PgStorage;

  beforeAll(() => {
    storage = new PgStorage(db);
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const customer = await storage.createCustomer({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+966501234567',
      });

      expect(customer.id).toBeDefined();
      expect(customer.name).toBe('Test Customer');
    });

    it('should throw error for duplicate email', async () => {
      await expect(
        storage.createCustomer({
          name: 'Duplicate',
          email: 'test@example.com',
        })
      ).rejects.toThrow();
    });
  });
});
```

---

## Integration Testing

### API Endpoint Testing

**Supertest Setup:**
```bash
npm install --save-dev supertest @types/supertest
```

**Example Tests:**
```typescript
// server/__tests__/routes.test.ts
import request from 'supertest';
import app from '../index';

describe('Customer API', () => {
  let authCookie: string;

  beforeAll(async () => {
    // Login to get session
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    authCookie = res.headers['set-cookie'];
  });

  describe('GET /api/customers', () => {
    it('should return list of customers', async () => {
      const res = await request(app)
        .get('/api/customers')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Cookie', authCookie)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+966501234567',
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('John Doe');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Cookie', authCookie)
        .send({ name: 'Invalid' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });
});
```

### Database Integration

```typescript
// server/__tests__/database.test.ts
import { db } from '../db';
import { customers, vehicles } from '../../shared/schema';
import { eq } from 'drizzle-orm';

describe('Database Operations', () => {
  let testCustomerId: string;

  afterAll(async () => {
    // Cleanup
    await db.delete(vehicles).where(eq(vehicles.customerId, testCustomerId));
    await db.delete(customers).where(eq(customers.id, testCustomerId));
  });

  it('should insert customer', async () => {
    const [customer] = await db.insert(customers).values({
      name: 'Test Customer',
      email: 'test@db.com',
    }).returning();

    testCustomerId = customer.id;
    expect(customer.id).toBeDefined();
  });

  it('should query customer with vehicles', async () => {
    // Insert vehicle
    await db.insert(vehicles).values({
      customerId: testCustomerId,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
    });

    // Query with join
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, testCustomerId))
      .leftJoin(vehicles, eq(vehicles.customerId, customers.id));

    expect(result.length).toBeGreaterThan(0);
  });
});
```

---

## End-to-End Testing

### Playwright Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Configuration:** `playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
});
```

### Example E2E Tests

**User Login Flow:**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('input-email').fill('admin@test.com');
    await page.getByTestId('input-password').fill('password');
    await page.getByTestId('button-login').click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('text-username')).toContainText('Admin');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('input-email').fill('wrong@test.com');
    await page.getByTestId('input-password').fill('wrong');
    await page.getByTestId('button-login').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
  });
});
```

**Customer Creation Workflow:**
```typescript
// e2e/customers.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByTestId('input-email').fill('admin@test.com');
    await page.getByTestId('input-password').fill('password');
    await page.getByTestId('button-login').click();
  });

  test('should create new customer', async ({ page }) => {
    await page.goto('/customers');
    await page.getByTestId('button-add-customer').click();

    // Fill form
    await page.getByTestId('input-name').fill('John Doe');
    await page.getByTestId('input-email').fill('john@example.com');
    await page.getByTestId('input-phone').fill('+966501234567');
    await page.getByTestId('button-submit').click();

    // Verify success
    await expect(page.getByTestId('toast-success')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
  });
});
```

---

## Test Coverage

### Coverage Reports

**Generate Coverage:**
```bash
npm run test:coverage
```

**Coverage Goals:**
- Overall: 70%+
- Critical paths: 90%+
- Utility functions: 80%+
- API routes: 75%+

**View Reports:**
```bash
# Generate HTML report
npm run test:coverage -- --coverage-reporter=html

# Open report
open coverage/index.html
```

---

## Performance Testing

### Load Testing with k6

```bash
npm install --save-dev k6
```

**Example Test:**
```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function() {
  // Login
  let loginRes = http.post('http://localhost:5000/api/auth/login', {
    email: 'test@example.com',
    password: 'password',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  // Get customers
  let customersRes = http.get('http://localhost:5000/api/customers');
  
  check(customersRes, {
    'customers loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run Load Test:**
```bash
k6 run tests/load/api-load-test.js
```

---

## Test Data Management

### Test Database

**Setup Test DB:**
```typescript
// server/__tests__/setup.ts
import { db } from '../db';

beforeAll(async () => {
  // Run migrations
  await db.migrate();
  
  // Seed test data
  await seedTestData();
});

afterAll(async () => {
  // Cleanup
  await cleanupTestData();
});

async function seedTestData() {
  // Create test users, customers, vehicles, etc.
}
```

### Fixtures

```typescript
// tests/fixtures/customers.ts
export const testCustomers = [
  {
    name: 'Test Customer 1',
    email: 'test1@example.com',
    phone: '+966501111111',
  },
  {
    name: 'Test Customer 2',
    email: 'test2@example.com',
    phone: '+966502222222',
  },
];

export const testVehicles = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1HGBH41JXMN109186',
  },
];
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
```

---

## Test Scripts

**package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:load": "k6 run tests/load/api-load-test.js"
  }
}
```

---

## Best Practices

### DO:
✅ Write tests before fixing bugs (TDD)  
✅ Test happy path and edge cases  
✅ Use descriptive test names  
✅ Mock external services  
✅ Keep tests independent  
✅ Use data-testid for E2E tests  
✅ Measure and improve coverage  

### DON'T:
❌ Test implementation details  
❌ Write flaky tests  
❌ Share state between tests  
❌ Hardcode test data  
❌ Skip error cases  
❌ Ignore failing tests  
❌ Test framework code  

---

## Testing Checklist

### Before Deployment

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E critical paths tested
- [ ] Coverage above threshold (70%)
- [ ] Load tests show acceptable performance
- [ ] No console errors in E2E tests
- [ ] Manual smoke testing complete

### After Deployment

- [ ] Production health check passing
- [ ] No error spikes in logs
- [ ] Performance metrics normal
- [ ] User workflows verified
- [ ] Critical business functions tested

---

## Next Steps

### Phase 1: Unit Tests
- [ ] Set up Jest + TypeScript
- [ ] Write tests for utility functions
- [ ] Write tests for business logic
- [ ] Achieve 70% coverage

### Phase 2: Integration Tests
- [ ] Set up Supertest
- [ ] Test API endpoints
- [ ] Test database operations
- [ ] Test authentication flows

### Phase 3: E2E Tests
- [ ] Set up Playwright
- [ ] Test critical user workflows
- [ ] Test across browsers
- [ ] Screenshot/video on failures

### Phase 4: CI/CD
- [ ] Configure GitHub Actions
- [ ] Run tests on every push
- [ ] Block merge on test failures
- [ ] Coverage reporting

---

**Document Owner:** QA Team  
**Next Review:** Monthly
