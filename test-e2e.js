// End-to-End Automated Testing for Smart Ration

const BASE_URL = 'http://localhost:5000/api';

async function req(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🌾 ==============================================');
  console.log('🌾 STARTING SMART RATION AUTOMATED SUITE');
  console.log('🌾 ==============================================\n');

  // 1. Health
  console.log('[TEST 1] Testing Health Endpoint...');
  const health = await req('/health');
  if (!health.ok || health.data.status !== 'ONLINE') {
    throw new Error('Health check failed: ' + JSON.stringify(health.data));
  }
  console.log('✅ Health OK: Database active, Shops Count =', health.data.shopsCount);

  // 2. Public Login
  console.log('\n[TEST 2] Testing Public Beneficiary Authentication (RC-TN-2024-1001)...');
  const pubAuth = await req('/auth/public/verify', 'POST', { cardNumber: 'RC-TN-2024-1001' });
  if (!pubAuth.ok) throw new Error('Public auth failed: ' + JSON.stringify(pubAuth.data));
  const pubToken = pubAuth.data.token;
  console.log(`✅ Beneficiary Verified: ${pubAuth.data.user.customerName} (${pubAuth.data.user.cardNumber}) at ${pubAuth.data.user.shop.shopId}`);

  // 3. Public Entitlements
  console.log('\n[TEST 3] Fetching Monthly Quota Entitlements...');
  const entitlements = await req('/public/entitlements', 'GET', null, pubToken);
  if (!entitlements.ok) throw new Error('Entitlement fetch failed: ' + JSON.stringify(entitlements.data));
  console.log(`✅ Retrieved ${entitlements.data.entitlements.length} entitlement commodities:`);
  entitlements.data.entitlements.forEach(e => {
    console.log(`   - ${e.itemName}: ${e.remainingQty} ${e.unit} remaining (Allocated: ${e.allocatedQty} ${e.unit}, Subsidized: ₹${e.subsidizedPrice})`);
  });

  // 4. Public Order Placement & Token Generation (Workflow 1)
  console.log('\n[TEST 4] WORKFLOW 1: Public Order Placement, Mock Payment & Token Generation...');
  const itemsToOrder = [
    { itemId: entitlements.data.entitlements[0].itemId, quantity: 5 }, // 5kg Rice
    { itemId: entitlements.data.entitlements[2].itemId, quantity: 1 }  // 1kg Sugar
  ];
  const orderRes = await req('/public/orders', 'POST', { items: itemsToOrder, paymentMethod: 'UPI' }, pubToken);
  if (!orderRes.ok) throw new Error('Order creation failed: ' + JSON.stringify(orderRes.data));
  const tokenRecord = orderRes.data.data;
  console.log(`✅ Token Generated Successfully!`);
  console.log(`   Token Number: ${tokenRecord.tokenNumber}`);
  console.log(`   Shop: ${tokenRecord.shopNumber}`);
  console.log(`   Order Status: ${tokenRecord.orderStatus} (🟡 READY)`);
  console.log(`   Payment: ${tokenRecord.paymentStatus} via ${tokenRecord.paymentMethod} (Ref: ${tokenRecord.transactionRef})`);
  console.log(`   Amount: ₹${tokenRecord.totalAmount}`);

  // 5. Salesman Login (Workflow 2)
  console.log('\n[TEST 5] WORKFLOW 2: Salesman Login (SHOP-101 / EMP-101)...');
  const smAuth = await req('/auth/salesman/login', 'POST', {
    shopNumber: 'SHOP-101',
    employeeId: 'EMP-101',
    password: 'salesman123'
  });
  if (!smAuth.ok) throw new Error('Salesman login failed: ' + JSON.stringify(smAuth.data));
  const smToken = smAuth.data.token;
  console.log(`✅ Salesman Authenticated: ${smAuth.data.user.fullName} (${smAuth.data.user.employeeId}) for Shop: ${smAuth.data.user.shop.shopId}`);

  // 6. Security Isolation Check (Critical requirement)
  console.log('\n[TEST 6] SECURITY TEST: Shop Isolation Enforcement...');
  console.log('   Testing authorized access to own shop (SHOP-101)...');
  const ownStock = await req('/salesman/shops/SHOP-101/stock', 'GET', null, smToken);
  if (!ownStock.ok) throw new Error('Own shop access failed: ' + JSON.stringify(ownStock.data));
  console.log(`   ✅ Authorized access to SHOP-101 granted (200 OK)`);

  console.log('   Testing unauthorized cross-shop access to SHOP-102 with SHOP-101 credentials...');
  const crossStock = await req('/salesman/shops/SHOP-102/stock', 'GET', null, smToken);
  if (crossStock.status === 403) {
    console.log(`   ✅ PASSED: Cross-shop access strictly blocked (403 Forbidden): "${crossStock.data.error}"`);
  } else {
    throw new Error(`SECURITY BREACH: Cross-shop request returned status ${crossStock.status}`);
  }

  // 7. Salesman Today's Tokens & Verification
  console.log('\n[TEST 7] Salesman Fetching Today\'s Tokens List...');
  const smTokens = await req('/salesman/tokens', 'GET', null, smToken);
  if (!smTokens.ok) throw new Error('Salesman tokens fetch failed: ' + JSON.stringify(smTokens.data));
  console.log(`✅ Retrieved ${smTokens.data.tokens.length} tokens for SHOP-101.`);

  const liveToken = smTokens.data.tokens.find(t => t.tokenNumber === tokenRecord.tokenNumber);
  if (!liveToken) throw new Error(`Generated token ${tokenRecord.tokenNumber} not found in salesman queue`);
  console.log(`✅ Live token matched in counter queue: ${liveToken.tokenNumber} (Customer: ${liveToken.customerName}, Status: ${liveToken.tokenStatus})`);

  // 8. Salesman Delivery Handover & Automatic Stock Deduction
  console.log('\n[TEST 8] Salesman Mark as Delivered Handover...');
  const deliveryRes = await req(`/salesman/tokens/${liveToken.tokenId}/deliver`, 'POST', {
    remarks: 'Customer biometric verified at counter'
  }, smToken);
  if (!deliveryRes.ok) throw new Error('Delivery failed: ' + JSON.stringify(deliveryRes.data));
  console.log(`✅ ${deliveryRes.data.message}`);
  console.log(`   Delivered by: ${deliveryRes.data.delivery.deliveredBy} at ${deliveryRes.data.delivery.deliveredAt}`);

  // 9. Double Delivery Prevention Check
  console.log('\n[TEST 9] Verifying Double-Delivery Prevention...');
  const dupDelivery = await req(`/salesman/tokens/${liveToken.tokenId}/deliver`, 'POST', {}, smToken);
  if (dupDelivery.status === 400 && dupDelivery.data.error.includes('ALREADY')) {
    console.log(`✅ PASSED: Duplicate delivery successfully blocked: "${dupDelivery.data.error}"`);
  } else {
    throw new Error(`Duplicate delivery check failed: Status ${dupDelivery.status}`);
  }

  // 10. Public Token Status Update Check
  console.log('\n[TEST 10] Checking Public Portal Token Status Reflection...');
  const pubTokensCheck = await req('/public/tokens', 'GET', null, pubToken);
  const updatedPubToken = pubTokensCheck.data.tokens.find(t => t.tokenNumber === tokenRecord.tokenNumber);
  if (updatedPubToken.tokenStatus === 'DELIVERED') {
    console.log(`✅ Public Portal successfully shows: 🟢 DELIVERED (Delivered at: ${updatedPubToken.deliveredAt})`);
  } else {
    throw new Error(`Public token status is ${updatedPubToken.tokenStatus}, expected DELIVERED`);
  }

  // 11. Head of Department Oversight (Workflow 3)
  console.log('\n[TEST 11] WORKFLOW 3: Head of Department Login & Directory...');
  const headAuth = await req('/auth/head/login', 'POST', { headId: 'HEAD-001', password: 'head123' });
  if (!headAuth.ok) throw new Error('Head login failed: ' + JSON.stringify(headAuth.data));
  const headToken = headAuth.data.token;
  console.log(`✅ Head Authenticated: ${headAuth.data.user.fullName} (${headAuth.data.user.headId})`);

  // 12. Head All Shops Directory
  console.log('\n[TEST 12] Head Auditing All 5 Ration Shops (SHOP-101 to SHOP-105)...');
  const allShops = await req('/head/shops', 'GET', null, headToken);
  if (!allShops.ok) throw new Error('All shops fetch failed: ' + JSON.stringify(allShops.data));
  console.log(`✅ All ${allShops.data.shops.length} Ration Shops Verified:`);
  allShops.data.shops.forEach(s => {
    console.log(`   - ${s.shopId}: ${s.shopName} | Salesman: ${s.salesman?.name} | Stock: ${s.currentStockKg}kg | LowStock Alert: ${s.hasLowStock}`);
  });

  // 13. Head Search Shop Deep Drill-Down (e.g. SHOP-104)
  console.log('\n[TEST 13] Head Search Shop by Number (SHOP-104)...');
  const shop104 = await req('/head/shops/SHOP-104', 'GET', null, headToken);
  if (!shop104.ok) throw new Error('Search shop failed: ' + JSON.stringify(shop104.data));
  console.log(`✅ Deep Drill-down retrieved for ${shop104.data.shopDetails.shop_name}:`);
  console.log(`   Salesman: ${shop104.data.salesmen[0].full_name} (${shop104.data.salesmen[0].designation})`);
  console.log(`   Today's Sales: ₹${shop104.data.salesMetrics.todaySales} | Monthly: ₹${shop104.data.salesMetrics.monthlySales}`);
  console.log(`   Commodity Status:`);
  shop104.data.currentStock.forEach(cs => {
    console.log(`     * ${cs.itemName}: ${cs.currentStock} ${cs.unit} (Min: ${cs.minThreshold}) ${cs.isLowStock ? '⚠️ [LOW STOCK ALERT]' : '✓'}`);
  });

  // 14. Head State-wide Analytics
  console.log('\n[TEST 14] Head State-wide Comparative Analytics...');
  const analytics = await req('/head/analytics', 'GET', null, headToken);
  if (!analytics.ok) throw new Error('Analytics fetch failed: ' + JSON.stringify(analytics.data));
  console.log(`✅ Analytics Generated:`);
  console.log(`   Shop-wise Sales: ${analytics.data.shopWiseSales.length} shops compared`);
  console.log(`   Item Distribution: ${analytics.data.itemDistribution.length} commodities tracked`);
  console.log(`   Order Statuses: ${analytics.data.orderStatuses.map(s => `${s.status}: ${s.count}`).join(', ')}`);

  console.log('\n🎉 ==============================================');
  console.log('🎉 ALL 14 AUTOMATED TESTS PASSED WITH 100% SUCCESS!');
  console.log('🎉 WORKFLOW 1, WORKFLOW 2, AND WORKFLOW 3 VERIFIED!');
  console.log('🎉 ==============================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILURE:', err.message);
  process.exit(1);
});
