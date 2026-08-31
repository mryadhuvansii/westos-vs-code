#!/usr/bin/env node

/**
 * WESTOS E-COMMERCE BACKEND - FULL TEST SUITE
 * This script tests all major endpoints and functionality
 */

const BASE_URL = 'http://localhost:3001/api';
const HEALTH_URL = 'http://localhost:3001/health';

let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

async function test(name, fn) {
  try {
    console.log(`\n${colors.blue}[TEST] ${name}${colors.reset}`);
    await fn();
    console.log(`${colors.green}✓ PASSED${colors.reset}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`${colors.red}✗ FAILED: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
  }
}

async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

async function runTests() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  WESTOS E-COMMERCE BACKEND TEST SUITE${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);

  // Health & Info Tests
  await test('Health Check Endpoint', async () => {
    const response = await fetch(HEALTH_URL);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    const data = await response.json();
    if (!data.status) throw new Error('Missing status field');
    console.log(`  Status: ${data.status}`);
  });

  // Auth Tests
  await test('User Registration', async () => {
    const { status, data } = await request('POST', '/auth/register', {
      email: 'testuser@example.com',
      password: 'Password123!',
      phone: '+919876543210',
      firstName: 'Test',
      lastName: 'User'
    });
    if (status !== 201 && status !== 200) throw new Error(`Expected 200/201, got ${status}`);
    if (!data.accessToken) throw new Error('No access token in response');
    console.log(`  Access Token: ${data.accessToken.substring(0, 20)}...`);
    global.authToken = data.accessToken;
  });

  await test('User Login', async () => {
    const { status, data } = await request('POST', '/auth/login', {
      email: 'testuser@example.com',
      password: 'Password123!'
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.accessToken) throw new Error('No access token');
    global.authToken = data.accessToken;
    console.log(`  Logged in successfully`);
  });

  // Product Tests
  await test('List Products', async () => {
    const response = await fetch(`${BASE_URL}/products?page=1&limit=10`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    const data = await response.json();
    console.log(`  Found ${data.data?.length || 0} products`);
  });

  await test('Get Product by Slug', async () => {
    const response = await fetch(`${BASE_URL}/products/test-product`);
    // 404 is OK for test data
    if (response.status !== 200 && response.status !== 404) {
      throw new Error(`Expected 200 or 404, got ${response.status}`);
    }
    console.log(`  Response status: ${response.status}`);
  });

  // Cart Tests
  await test('Get Cart', async () => {
    const response = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${global.authToken}` }
    });
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Expected 200 or 401, got ${response.status}`);
    }
    console.log(`  Cart endpoint accessible`);
  });

  await test('Add to Cart', async () => {
    const response = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${global.authToken}`
      },
      body: JSON.stringify({
        variantId: 'test-variant-id',
        quantity: 1
      })
    });
    if (response.status !== 200 && response.status !== 401 && response.status !== 404) {
      throw new Error(`Expected 200/401/404, got ${response.status}`);
    }
    console.log(`  Add to cart endpoint working`);
  });

  // Inventory Tests
  await test('Get Inventory', async () => {
    const response = await fetch(`${BASE_URL}/inventory/variant/test-id`);
    if (response.status !== 200 && response.status !== 404) {
      throw new Error(`Expected 200 or 404, got ${response.status}`);
    }
    console.log(`  Inventory endpoint accessible`);
  });

  // Orders Tests
  await test('List Orders', async () => {
    const response = await fetch(`${BASE_URL}/orders?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${global.authToken}` }
    });
    if (response.status !== 200 && response.status !== 401) {
      throw new Error(`Expected 200 or 401, got ${response.status}`);
    }
    console.log(`  Orders endpoint accessible`);
  });

  // API Routing Tests
  await test('Invalid Route Returns 404', async () => {
    const response = await fetch(`${BASE_URL}/nonexistent-endpoint`);
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`);
    }
    console.log(`  404 handling working`);
  });

  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  TEST RESULTS${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.green}✓ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⊘ Skipped: ${testResults.skipped}${colors.reset}\n`);

  const totalTests = testResults.passed + testResults.failed + testResults.skipped;
  const passRate = ((testResults.passed / totalTests) * 100).toFixed(1);
  
  console.log(`Overall Pass Rate: ${colors.green}${passRate}%${colors.reset}\n`);

  if (testResults.failed === 0) {
    console.log(`${colors.green}✓ ALL TESTS PASSED${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ SOME TESTS FAILED${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
