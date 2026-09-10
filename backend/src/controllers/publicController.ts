import { Response } from 'express';
import { query, transaction } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

// 1. Get Monthly Entitlements for Authenticated Public User
export async function getEntitlements(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cardId = req.user?.cardId;
    if (!cardId) {
      res.status(400).json({ error: 'Ration card identity missing from token' });
      return;
    }

    const currentMonth = '2026-09';

    // Fetch entitlements along with items and shop inventory check
    const sql = `
      SELECT re.entitlement_id, re.card_id, re.month_year,
             re.allocated_qty, re.claimed_qty,
             (re.allocated_qty - re.claimed_qty) as remaining_qty,
             ri.item_id, ri.item_code, ri.item_name, ri.unit,
             ri.subsidized_price, ri.market_price, ri.image_icon,
             si.opening_stock + si.received_stock - si.distributed_stock as shop_stock
      FROM ration_entitlements re
      JOIN ration_items ri ON re.item_id = ri.item_id
      LEFT JOIN ration_cards rc ON re.card_id = rc.card_id
      LEFT JOIN shop_inventory si ON si.shop_id = rc.assigned_shop_id AND si.item_id = ri.item_id
      WHERE re.card_id = $1 AND re.month_year = $2 AND ri.is_active = TRUE
      ORDER BY ri.item_id ASC
    `;

    const result = await query(sql, [cardId, currentMonth]);

    // Also get card and shop profile
    const cardSql = `
      SELECT rc.card_number, rc.card_type, rc.family_members_count,
             c.full_name as customer_name, c.phone, c.address, c.aadhaar_last4,
             rs.shop_id, rs.shop_name, rs.location, rs.district, rs.pincode, rs.contact_phone
      FROM ration_cards rc
      JOIN customers c ON rc.customer_id = c.customer_id
      JOIN ration_shops rs ON rc.assigned_shop_id = rs.shop_id
      WHERE rc.card_id = $1
    `;
    const cardRes = await query(cardSql, [cardId]);

    res.json({
      card: cardRes.rows[0],
      month: currentMonth,
      entitlements: result.rows.map(row => ({
        entitlementId: row.entitlement_id,
        itemId: row.item_id,
        itemCode: row.item_code,
        itemName: row.item_name,
        unit: row.unit,
        subsidizedPrice: parseFloat(row.subsidized_price),
        marketPrice: parseFloat(row.market_price),
        imageIcon: row.image_icon,
        allocatedQty: parseFloat(row.allocated_qty),
        claimedQty: parseFloat(row.claimed_qty),
        remainingQty: Math.max(0, parseFloat(row.remaining_qty)),
        shopStock: parseFloat(row.shop_stock || '0')
      }))
    });
  } catch (error) {
    console.error('Error fetching entitlements:', error);
    res.status(500).json({ error: 'Failed to retrieve ration entitlements' });
  }
}

// 2. Create Order, Process Payment, and Generate Token
export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cardId = req.user?.cardId;
    const customerId = req.user?.customerId;
    const shopId = req.user?.shopId;

    if (!cardId || !customerId || !shopId) {
      res.status(400).json({ error: 'Incomplete user authorization context' });
      return;
    }

    const { items, paymentMethod } = req.body;
    // items: [{ itemId: number, quantity: number }]
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    const validPaymentMethods = ['UPI', 'CARD', 'PAY_AT_SHOP'];
    const chosenMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'UPI';

    const currentMonth = '2026-09';

    // Run order, payment, token creation, and entitlement claiming in an atomic transaction
    const orderResult = await transaction(async (client) => {
      // 1. Validate each item against remaining quota
      let totalAmount = 0;
      const orderItemsToInsert = [];

      for (const reqItem of items) {
        if (!reqItem.itemId || reqItem.quantity <= 0) continue;

        // Check entitlement
        const entRes = await client.query(
          `SELECT re.allocated_qty, re.claimed_qty, ri.subsidized_price, ri.item_name, ri.unit
           FROM ration_entitlements re
           JOIN ration_items ri ON re.item_id = ri.item_id
           WHERE re.card_id = $1 AND re.item_id = $2 AND re.month_year = $3`,
          [cardId, reqItem.itemId, currentMonth]
        );

        if (entRes.rows.length === 0) {
          throw new Error(`Item ID ${reqItem.itemId} is not in your monthly quota allocation.`);
        }

        const ent = entRes.rows[0];
        const remaining = parseFloat(ent.allocated_qty) - parseFloat(ent.claimed_qty);

        if (reqItem.quantity > remaining) {
          throw new Error(
            `Requested quantity (${reqItem.quantity} ${ent.unit}) exceeds your remaining entitlement (${remaining} ${ent.unit}) for ${ent.item_name}.`
          );
        }

        const unitPrice = parseFloat(ent.subsidized_price);
        const itemTotal = unitPrice * reqItem.quantity;
        totalAmount += itemTotal;

        orderItemsToInsert.push({
          itemId: reqItem.itemId,
          name: ent.item_name,
          unit: ent.unit,
          quantity: reqItem.quantity,
          unitPrice,
          totalPrice: itemTotal
        });
      }

      if (orderItemsToInsert.length === 0) {
        throw new Error('No valid items selected for order.');
      }

      // Generate Order Number
      const randomOrderNum = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `ORD-2026-${randomOrderNum}`;

      // Insert Order (Status is READY for collection)
      const orderInsert = await client.query(
        `INSERT INTO orders (order_number, shop_id, customer_id, card_id, order_status, total_amount)
         VALUES ($1, $2, $3, $4, 'READY', $5)
         RETURNING order_id, order_number, order_status, total_amount, created_at`,
        [orderNumber, shopId, customerId, cardId, totalAmount]
      );
      const newOrder = orderInsert.rows[0];

      // Insert Order Items
      for (const item of orderItemsToInsert) {
        await client.query(
          `INSERT INTO order_items (order_id, shop_id, item_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newOrder.order_id, shopId, item.itemId, item.quantity, item.unitPrice, item.totalPrice]
        );

        // Update Claimed Quantity in Entitlements
        await client.query(
          `UPDATE ration_entitlements
           SET claimed_qty = claimed_qty + $1
           WHERE card_id = $2 AND item_id = $3 AND month_year = $4`,
          [item.quantity, cardId, item.itemId, currentMonth]
        );
      }

      // Insert Mock Payment Record
      const txnRef = chosenMethod === 'UPI'
        ? `UPI-REF-${Date.now().toString().slice(-8)}`
        : chosenMethod === 'CARD'
        ? `MOCK-CARD-${Date.now().toString().slice(-8)}`
        : `COUNTER-CASH-${Date.now().toString().slice(-8)}`;

      await client.query(
        `INSERT INTO payments (order_id, shop_id, amount, payment_method, payment_status, transaction_ref)
         VALUES ($1, $2, $3, $4, 'COMPLETED', $5)`,
        [newOrder.order_id, shopId, totalAmount, chosenMethod, txnRef]
      );

      // Generate Unique Token (e.g. RS-2026-XXXXXX)
      const tokenNumber = `RS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const tokenInsert = await client.query(
        `INSERT INTO tokens (token_number, order_id, shop_id, status)
         VALUES ($1, $2, $3, 'READY')
         RETURNING token_id, token_number, status, generated_at`,
        [tokenNumber, newOrder.order_id, shopId]
      );
      const newToken = tokenInsert.rows[0];

      return {
        tokenNumber: newToken.token_number,
        shopNumber: shopId,
        orderId: newOrder.order_id,
        orderNumber: newOrder.order_number,
        orderStatus: newOrder.order_status,
        paymentStatus: 'PAID',
        paymentMethod: chosenMethod,
        transactionRef: txnRef,
        totalAmount,
        items: orderItemsToInsert,
        generatedAt: newToken.generated_at
      };
    });

    res.status(201).json({
      message: 'Order created and token generated successfully',
      data: orderResult
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(400).json({ error: error.message || 'Failed to place ration order' });
  }
}

// 3. Get Public User's Tokens / Orders
export async function getMyTokens(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cardId = req.user?.cardId;
    if (!cardId) {
      res.status(400).json({ error: 'Ration card identity missing from token' });
      return;
    }

    const sql = `
      SELECT t.token_id, t.token_number, t.status as token_status, t.generated_at,
             o.order_id, o.order_number, o.order_status, o.total_amount, o.created_at,
             o.shop_id, rs.shop_name, rs.location,
             p.payment_method, p.payment_status, p.transaction_ref,
             d.delivered_at, d.delivered_by_employee_id, d.remarks as delivery_remarks
      FROM tokens t
      JOIN orders o ON t.order_id = o.order_id
      JOIN ration_shops rs ON o.shop_id = rs.shop_id
      LEFT JOIN payments p ON o.order_id = p.order_id
      LEFT JOIN deliveries d ON t.token_id = d.token_id
      WHERE o.card_id = $1
      ORDER BY t.generated_at DESC
    `;

    const tokensRes = await query(sql, [cardId]);

    // Fetch items for each token/order
    const fullTokens = [];
    for (const tok of tokensRes.rows) {
      const itemsRes = await query(
        `SELECT oi.quantity, oi.unit_price, oi.total_price, ri.item_name, ri.unit, ri.image_icon
         FROM order_items oi
         JOIN ration_items ri ON oi.item_id = ri.item_id
         WHERE oi.order_id = $1`,
        [tok.order_id]
      );

      fullTokens.push({
        tokenId: tok.token_id,
        tokenNumber: tok.token_number,
        tokenStatus: tok.token_status,
        orderStatus: tok.order_status,
        generatedAt: tok.generated_at,
        shopId: tok.shop_id,
        shopName: tok.shop_name,
        shopLocation: tok.location,
        totalAmount: parseFloat(tok.total_amount),
        paymentMethod: tok.payment_method,
        paymentStatus: tok.payment_status,
        deliveredAt: tok.delivered_at,
        deliveredBy: tok.delivered_by_employee_id,
        remarks: tok.delivery_remarks,
        items: itemsRes.rows.map(i => ({
          name: i.item_name,
          quantity: parseFloat(i.quantity),
          unit: i.unit,
          unitPrice: parseFloat(i.unit_price),
          totalPrice: parseFloat(i.total_price),
          icon: i.image_icon
        }))
      });
    }

    res.json({ tokens: fullTokens });
  } catch (error) {
    console.error('Error fetching customer tokens:', error);
    res.status(500).json({ error: 'Failed to retrieve your tokens' });
  }
}
