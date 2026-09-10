import bcrypt from 'bcryptjs';
import { query, transaction } from './index.js';
import { initDatabase } from './init.js';

export async function seedDatabase() {
  console.log('--- Starting Smart Ration Database Seed ---');
  await initDatabase();

  const passwordHashSalesman = await bcrypt.hash('salesman123', 10);
  const passwordHashHead = await bcrypt.hash('head123', 10);
  const passwordHashPublic = await bcrypt.hash('public123', 10);

  // 1. Seed Head User
  console.log('Seeding Head user...');
  await query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['HEAD-001', passwordHashHead, 'HEAD']
  );

  // 2. Seed 5 Ration Shops
  console.log('Seeding 5 Ration Shops...');
  const shops = [
    {
      id: 'SHOP-101',
      name: 'Fair Price Shop 101 - Anna Nagar Central',
      location: '12th Main Road, Anna Nagar',
      district: 'Chennai Central',
      pincode: '600040',
      phone: '+91 98401 23456',
      status: 'ACTIVE'
    },
    {
      id: 'SHOP-102',
      name: 'Fair Price Shop 102 - T. Nagar West',
      location: 'Usman Road, T. Nagar',
      district: 'Chennai South',
      pincode: '600017',
      phone: '+91 98401 23457',
      status: 'ACTIVE'
    },
    {
      id: 'SHOP-103',
      name: 'Fair Price Shop 103 - Adyar South',
      location: 'Lattice Bridge Road, Adyar',
      district: 'Chennai South',
      pincode: '600020',
      phone: '+91 98401 23458',
      status: 'ACTIVE'
    },
    {
      id: 'SHOP-104',
      name: 'Fair Price Shop 104 - Mylapore North',
      location: 'Kutchery Road, Mylapore',
      district: 'Chennai Central',
      pincode: '600004',
      phone: '+91 98401 23459',
      status: 'ACTIVE'
    },
    {
      id: 'SHOP-105',
      name: 'Fair Price Shop 105 - Velachery Hub',
      location: '100 Feet Bypass Road, Velachery',
      district: 'Chennai South',
      pincode: '600042',
      phone: '+91 98401 23460',
      status: 'ACTIVE'
    }
  ];

  for (const shop of shops) {
    await query(
      `INSERT INTO ration_shops (shop_id, shop_name, location, district, pincode, contact_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (shop_id) DO UPDATE 
       SET shop_name = EXCLUDED.shop_name, location = EXCLUDED.location, status = EXCLUDED.status`,
      [shop.id, shop.name, shop.location, shop.district, shop.pincode, shop.phone, shop.status]
    );
  }

  // 3. Seed Salesmen Users & Employee Records
  console.log('Seeding Salesmen for all 5 shops...');
  const salesmen = [
    { empId: 'EMP-101', shopId: 'SHOP-101', name: 'S. Ramanathan', phone: '9840011101' },
    { empId: 'EMP-102', shopId: 'SHOP-102', name: 'M. Selvam', phone: '9840011102' },
    { empId: 'EMP-103', shopId: 'SHOP-103', name: 'K. Balaji', phone: '9840011103' },
    { empId: 'EMP-104', shopId: 'SHOP-104', name: 'V. Sundaram', phone: '9840011104' },
    { empId: 'EMP-105', shopId: 'SHOP-105', name: 'R. Ganesan', phone: '9840011105' }
  ];

  for (const sm of salesmen) {
    // Insert or get user
    const userRes = await query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [sm.empId, passwordHashSalesman, 'SALESMAN']
    );
    const userId = userRes.rows[0].id;

    await query(
      `INSERT INTO shop_employees (employee_id, shop_id, user_id, full_name, phone, designation)
       VALUES ($1, $2, $3, $4, $5, 'Senior Distribution Officer')
       ON CONFLICT (employee_id) DO UPDATE 
       SET shop_id = EXCLUDED.shop_id, full_name = EXCLUDED.full_name`,
      [sm.empId, sm.shopId, userId, sm.name, sm.phone]
    );
  }

  // 4. Seed Ration Items
  console.log('Seeding Standard Ration Commodities...');
  const items = [
    { code: 'RICE', name: 'Raw Rice (Fine Quality)', unit: 'kg', subPrice: 0.00, mktPrice: 42.00, icon: 'Wheat' },
    { code: 'WHEAT', name: 'Whole Wheat Grain', unit: 'kg', subPrice: 5.00, mktPrice: 38.00, icon: 'Sprout' },
    { code: 'SUGAR', name: 'Refined White Sugar', unit: 'kg', subPrice: 25.00, mktPrice: 45.00, icon: 'Cookie' },
    { code: 'DAL', name: 'Toor Dal (Split Pulses)', unit: 'kg', subPrice: 30.00, mktPrice: 160.00, icon: 'Package' },
    { code: 'OIL', name: 'Fortified Cooking Oil', unit: 'L', subPrice: 25.00, mktPrice: 140.00, icon: 'Droplets' }
  ];

  for (const item of items) {
    await query(
      `INSERT INTO ration_items (item_code, item_name, unit, subsidized_price, market_price, image_icon)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (item_code) DO UPDATE 
       SET item_name = EXCLUDED.item_name, subsidized_price = EXCLUDED.subsidized_price, market_price = EXCLUDED.market_price`,
      [item.code, item.name, item.unit, item.subPrice, item.mktPrice, item.icon]
    );
  }

  // Fetch item IDs
  const itemRows = (await query('SELECT item_id, item_code FROM ration_items')).rows;
  const itemMap: Record<string, number> = {};
  itemRows.forEach(row => { itemMap[row.item_code] = row.item_id; });

  // 5. Seed Inventory for All 5 Shops
  console.log('Seeding Shop Inventories...');
  // SHOP-104 will have intentionally low sugar and dal to test low stock alerts
  const inventoryData = [
    // SHOP-101 (Healthy stock)
    { shopId: 'SHOP-101', code: 'RICE', open: 2500, rec: 1000, dist: 650, min: 400 },
    { shopId: 'SHOP-101', code: 'WHEAT', open: 1200, rec: 500, dist: 280, min: 250 },
    { shopId: 'SHOP-101', code: 'SUGAR', open: 600, rec: 200, dist: 160, min: 150 },
    { shopId: 'SHOP-101', code: 'DAL', open: 500, rec: 200, dist: 140, min: 100 },
    { shopId: 'SHOP-101', code: 'OIL', open: 400, rec: 200, dist: 90, min: 80 },

    // SHOP-102
    { shopId: 'SHOP-102', code: 'RICE', open: 2200, rec: 800, dist: 500, min: 400 },
    { shopId: 'SHOP-102', code: 'WHEAT', open: 1000, rec: 400, dist: 250, min: 250 },
    { shopId: 'SHOP-102', code: 'SUGAR', open: 500, rec: 200, dist: 180, min: 150 },
    { shopId: 'SHOP-102', code: 'DAL', open: 450, rec: 150, dist: 120, min: 100 },
    { shopId: 'SHOP-102', code: 'OIL', open: 350, rec: 150, dist: 80, min: 80 },

    // SHOP-103
    { shopId: 'SHOP-103', code: 'RICE', open: 2000, rec: 600, dist: 450, min: 400 },
    { shopId: 'SHOP-103', code: 'WHEAT', open: 900, rec: 300, dist: 200, min: 250 },
    { shopId: 'SHOP-103', code: 'SUGAR', open: 400, rec: 150, dist: 120, min: 150 },
    { shopId: 'SHOP-103', code: 'DAL', open: 380, rec: 120, dist: 110, min: 100 },
    { shopId: 'SHOP-103', code: 'OIL', open: 300, rec: 100, dist: 70, min: 80 },

    // SHOP-104 (Low Stock Warning for Sugar & Dal)
    { shopId: 'SHOP-104', code: 'RICE', open: 1500, rec: 400, dist: 500, min: 400 },
    { shopId: 'SHOP-104', code: 'WHEAT', open: 600, rec: 200, dist: 210, min: 250 },
    { shopId: 'SHOP-104', code: 'SUGAR', open: 180, rec: 0, dist: 155, min: 150 }, // Remaining = 25kg (below 150!)
    { shopId: 'SHOP-104', code: 'DAL', open: 120, rec: 0, dist: 95, min: 100 },    // Remaining = 25kg (below 100!)
    { shopId: 'SHOP-104', code: 'OIL', open: 250, rec: 50, dist: 120, min: 80 },

    // SHOP-105
    { shopId: 'SHOP-105', code: 'RICE', open: 2800, rec: 1200, dist: 700, min: 400 },
    { shopId: 'SHOP-105', code: 'WHEAT', open: 1400, rec: 600, dist: 350, min: 250 },
    { shopId: 'SHOP-105', code: 'SUGAR', open: 700, rec: 300, dist: 220, min: 150 },
    { shopId: 'SHOP-105', code: 'DAL', open: 600, rec: 250, dist: 190, min: 100 },
    { shopId: 'SHOP-105', code: 'OIL', open: 450, rec: 200, dist: 130, min: 80 }
  ];

  for (const inv of inventoryData) {
    const itemId = itemMap[inv.code];
    await query(
      `INSERT INTO shop_inventory (shop_id, item_id, opening_stock, received_stock, distributed_stock, min_threshold)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (shop_id, item_id) DO UPDATE
       SET opening_stock = EXCLUDED.opening_stock,
           received_stock = EXCLUDED.received_stock,
           distributed_stock = EXCLUDED.distributed_stock,
           min_threshold = EXCLUDED.min_threshold,
           last_updated = CURRENT_TIMESTAMP`,
      [inv.shopId, itemId, inv.open, inv.rec, inv.dist, inv.min]
    );

    // Record initial stock transaction
    await query(
      `INSERT INTO stock_transactions (shop_id, item_id, transaction_type, quantity, balance_after, reference_id, employee_id)
       VALUES ($1, $2, 'OPENING_BALANCE', $3, $4, 'INITIAL_SETUP', 'SYSTEM')`,
      [inv.shopId, itemId, inv.open, inv.open]
    );
  }

  // 6. Seed Customers & Ration Cards
  console.log('Seeding Customers and Ration Cards...');
  const customers = [
    {
      name: 'Rajesh Kumar',
      phone: '9841022001',
      address: 'Plot 45, 3rd Cross St, Anna Nagar, Chennai',
      aadhaar: '4821',
      cardNumber: 'RC-TN-2024-1001',
      shopId: 'SHOP-101',
      cardType: 'PHH',
      family: 4
    },
    {
      name: 'Priya Sharma',
      phone: '9841022002',
      address: 'Flat 2B, Sunshine Apts, Anna Nagar East, Chennai',
      aadhaar: '7193',
      cardNumber: 'RC-TN-2024-1002',
      shopId: 'SHOP-101',
      cardType: 'AAY',
      family: 5
    },
    {
      name: 'Murugan S',
      phone: '9841022003',
      address: '15 Mangesh Street, T. Nagar, Chennai',
      aadhaar: '3205',
      cardNumber: 'RC-TN-2024-1003',
      shopId: 'SHOP-102',
      cardType: 'PHH',
      family: 3
    },
    {
      name: 'Anitha Devi',
      phone: '9841022004',
      address: '8 Gandhi Nagar 2nd Main Rd, Adyar, Chennai',
      aadhaar: '8834',
      cardNumber: 'RC-TN-2024-1004',
      shopId: 'SHOP-103',
      cardType: 'PHH',
      family: 4
    },
    {
      name: 'Karthik V',
      phone: '9841022005',
      address: '22 South Mada Street, Mylapore, Chennai',
      aadhaar: '1947',
      cardNumber: 'RC-TN-2024-1005',
      shopId: 'SHOP-104',
      cardType: 'NPHH',
      family: 2
    },
    {
      name: 'Lakshmi Narayanan',
      phone: '9841022006',
      address: '14/3 Dhandeeswaram Main Rd, Velachery, Chennai',
      aadhaar: '6219',
      cardNumber: 'RC-TN-2024-1006',
      shopId: 'SHOP-105',
      cardType: 'AAY',
      family: 5
    }
  ];

  const currentMonth = '2026-09';

  for (const c of customers) {
    // Create customer user
    const userRes = await query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [c.cardNumber, passwordHashPublic, 'PUBLIC']
    );
    const userId = userRes.rows[0].id;

    // Create customer
    const custRes = await query(
      `INSERT INTO customers (user_id, full_name, phone, address, aadhaar_last4)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING customer_id`,
      [userId, c.name, c.phone, c.address, c.aadhaar]
    );
    const customerId = custRes.rows[0].customer_id;

    // Create ration card
    const cardRes = await query(
      `INSERT INTO ration_cards (card_number, customer_id, assigned_shop_id, card_type, family_members_count)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (card_number) DO UPDATE
       SET assigned_shop_id = EXCLUDED.assigned_shop_id
       RETURNING card_id`,
      [c.cardNumber, customerId, c.shopId, c.cardType, c.family]
    );
    const cardId = cardRes.rows[0].card_id;

    // Assign Entitlements based on card type
    // AAY gets 35kg rice, PHH gets 20kg rice (or 5kg per member)
    const riceQty = c.cardType === 'AAY' ? 35 : (c.family * 5);
    const wheatQty = 5;
    const sugarQty = 2;
    const dalQty = 2;
    const oilQty = 1;

    const allocations = [
      { code: 'RICE', qty: riceQty },
      { code: 'WHEAT', qty: wheatQty },
      { code: 'SUGAR', qty: sugarQty },
      { code: 'DAL', qty: dalQty },
      { code: 'OIL', qty: oilQty }
    ];

    for (const alloc of allocations) {
      const itemId = itemMap[alloc.code];
      await query(
        `INSERT INTO ration_entitlements (card_id, item_id, month_year, allocated_qty, claimed_qty)
         VALUES ($1, $2, $3, $4, 0.00)
         ON CONFLICT (card_id, item_id, month_year) DO UPDATE
         SET allocated_qty = EXCLUDED.allocated_qty`,
        [cardId, itemId, currentMonth, alloc.qty]
      );
    }
  }

  // 7. Seed Initial Demo Orders, Tokens, and Deliveries
  console.log('Seeding Sample Live Tokens for demonstration...');

  // Get Card 1 (Rajesh Kumar, SHOP-101) & Card 2 (Priya Sharma, SHOP-101)
  const card1 = (await query(`SELECT c.customer_id, rc.card_id FROM ration_cards rc JOIN customers c ON rc.customer_id = c.customer_id WHERE rc.card_number = 'RC-TN-2024-1001'`)).rows[0];
  const card2 = (await query(`SELECT c.customer_id, rc.card_id FROM ration_cards rc JOIN customers c ON rc.customer_id = c.customer_id WHERE rc.card_number = 'RC-TN-2024-1002'`)).rows[0];

  // Token 1: Already READY for SHOP-101 (Waiting for Salesman to verify/deliver)
  const order1Res = await query(
    `INSERT INTO orders (order_number, shop_id, customer_id, card_id, order_status, total_amount)
     VALUES ('ORD-2026-00101', 'SHOP-101', $1, $2, 'READY', 85.00)
     RETURNING order_id`,
    [card1.customer_id, card1.card_id]
  );
  const order1Id = order1Res.rows[0].order_id;

  // Items for Order 1: Rice 10kg, Sugar 1kg, Dal 1kg
  await query(
    `INSERT INTO order_items (order_id, shop_id, item_id, quantity, unit_price, total_price)
     VALUES ($1, 'SHOP-101', $2, 10, 0.00, 0.00),
            ($1, 'SHOP-101', $3, 1, 25.00, 25.00),
            ($1, 'SHOP-101', $4, 2, 30.00, 60.00)`,
    [order1Id, itemMap['RICE'], itemMap['SUGAR'], itemMap['DAL']]
  );

  // Payment for Order 1
  await query(
    `INSERT INTO payments (order_id, shop_id, amount, payment_method, payment_status, transaction_ref)
     VALUES ($1, 'SHOP-101', 85.00, 'UPI', 'COMPLETED', 'UPI-REF-984102941')`,
    [order1Id]
  );

  // Token for Order 1: RS-2026-001245 (Matches exact user prompt example!)
  await query(
    `INSERT INTO tokens (token_number, order_id, shop_id, status)
     VALUES ('RS-2026-001245', $1, 'SHOP-101', 'READY')`,
    [order1Id]
  );

  // Update claimed quantity for Rajesh's entitlement
  await query(
    `UPDATE ration_entitlements SET claimed_qty = claimed_qty + 10 WHERE card_id = $1 AND item_id = $2`,
    [card1.card_id, itemMap['RICE']]
  );
  await query(
    `UPDATE ration_entitlements SET claimed_qty = claimed_qty + 1 WHERE card_id = $1 AND item_id = $2`,
    [card1.card_id, itemMap['SUGAR']]
  );
  await query(
    `UPDATE ration_entitlements SET claimed_qty = claimed_qty + 2 WHERE card_id = $1 AND item_id = $2`,
    [card1.card_id, itemMap['DAL']]
  );

  // Token 2: Already DELIVERED for Priya Sharma (SHOP-101) to show completed workflow history
  const order2Res = await query(
    `INSERT INTO orders (order_number, shop_id, customer_id, card_id, order_status, total_amount)
     VALUES ('ORD-2026-00102', 'SHOP-101', $1, $2, 'DELIVERED', 55.00)
     RETURNING order_id`,
    [card2.customer_id, card2.card_id]
  );
  const order2Id = order2Res.rows[0].order_id;

  await query(
    `INSERT INTO order_items (order_id, shop_id, item_id, quantity, unit_price, total_price)
     VALUES ($1, 'SHOP-101', $2, 20, 0.00, 0.00),
            ($1, 'SHOP-101', $3, 1, 25.00, 25.00),
            ($1, 'SHOP-101', $4, 1, 30.00, 30.00)`,
    [order2Id, itemMap['RICE'], itemMap['SUGAR'], itemMap['DAL']]
  );

  await query(
    `INSERT INTO payments (order_id, shop_id, amount, payment_method, payment_status, transaction_ref)
     VALUES ($1, 'SHOP-101', 55.00, 'CARD', 'COMPLETED', 'MOCK-CARD-TXN-552')`,
    [order2Id]
  );

  const token2Res = await query(
    `INSERT INTO tokens (token_number, order_id, shop_id, status)
     VALUES ('RS-2026-001099', $1, 'SHOP-101', 'DELIVERED')
     RETURNING token_id`,
    [order2Id]
  );
  const token2Id = token2Res.rows[0].token_id;

  // Delivery record for Token 2
  await query(
    `INSERT INTO deliveries (order_id, token_id, shop_id, delivered_by_employee_id, remarks)
     VALUES ($1, $2, 'SHOP-101', 'EMP-101', 'Biometric verified at shop counter')`,
    [order2Id, token2Id]
  );

  console.log('--- Smart Ration Database Seeding Completed Successfully! ---');
}

const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('seed');
if (isDirectRun) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

