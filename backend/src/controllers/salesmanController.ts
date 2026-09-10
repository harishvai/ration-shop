import { Response } from 'express';
import { query, transaction } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper: Ensure shop authorization
function getAuthorizedShopId(req: AuthRequest, res: Response): string | null {
  const shopId = req.user?.shopId;
  if (!shopId) {
    res.status(403).json({ error: 'Salesman is not associated with any ration shop.' });
    return null;
  }
  return shopId;
}

// 1. Salesman Dashboard Overview
export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shopId = getAuthorizedShopId(req, res);
    if (!shopId) return;

    // Today's orders and sales (using CURRENT_DATE)
    const todayOrdersRes = await query(
      `SELECT COUNT(*) as total_orders,
              COUNT(CASE WHEN order_status = 'READY' THEN 1 END) as pending_tokens,
              COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_orders,
              COALESCE(SUM(total_amount), 0) as today_sales
       FROM orders
       WHERE shop_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [shopId]
    );

    // Total orders count all time
    const allTimeOrdersRes = await query(
      `SELECT COUNT(*) as total_all_time,
              COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_all_time,
              COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders
       WHERE shop_id = $1`,
      [shopId]
    );

    // Inventory status & total stock available in shop
    const inventoryRes = await query(
      `SELECT COALESCE(SUM(opening_stock + received_stock - distributed_stock), 0) as total_stock_kg,
              COUNT(CASE WHEN (opening_stock + received_stock - distributed_stock) < min_threshold THEN 1 END) as low_stock_items
       FROM shop_inventory
       WHERE shop_id = $1`,
      [shopId]
    );

    // Shop metadata
    const shopRes = await query(
      `SELECT shop_id, shop_name, location, district, pincode, contact_phone, status
       FROM ration_shops WHERE shop_id = $1`,
      [shopId]
    );

    const stats = todayOrdersRes.rows[0];
    const allTime = allTimeOrdersRes.rows[0];
    const inv = inventoryRes.rows[0];

    res.json({
      shop: shopRes.rows[0],
      stats: {
        todayOrders: parseInt(stats.total_orders, 10),
        pendingTokens: parseInt(stats.pending_tokens, 10),
        deliveredOrdersToday: parseInt(stats.delivered_orders, 10),
        todaySales: parseFloat(stats.today_sales),
        totalStockKg: parseFloat(inv.total_stock_kg),
        lowStockItemsCount: parseInt(inv.low_stock_items, 10),
        totalRevenue: parseFloat(allTime.total_revenue),
        deliveredAllTime: parseInt(allTime.delivered_all_time, 10)
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ error: 'Failed to retrieve salesman dashboard metrics' });
  }
}

// 2. Today's Tokens & Verification List
export async function getTokens(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shopId = getAuthorizedShopId(req, res);
    if (!shopId) return;

    const { status, search } = req.query;

    let sql = `
      SELECT t.token_id, t.token_number, t.status as token_status, t.generated_at,
             o.order_id, o.order_number, o.order_status, o.total_amount, o.created_at,
             c.full_name as customer_name, c.phone as customer_phone,
             rc.card_number, rc.card_type,
             p.payment_method, p.payment_status, p.transaction_ref,
             d.delivered_at, d.delivered_by_employee_id
      FROM tokens t
      JOIN orders o ON t.order_id = o.order_id
      JOIN ration_cards rc ON o.card_id = rc.card_id
      JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN payments p ON o.order_id = p.order_id
      LEFT JOIN deliveries d ON t.token_id = d.token_id
      WHERE t.shop_id = $1
    `;

    const params: any[] = [shopId];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (t.token_number ILIKE $${params.length} OR c.full_name ILIKE $${params.length} OR rc.card_number ILIKE $${params.length})`;
    }

    sql += ` ORDER BY t.generated_at DESC`;

    const result = await query(sql, params);

    // Fetch items for each token
    const enrichedTokens = [];
    for (const tok of result.rows) {
      const itemsRes = await query(
        `SELECT oi.quantity, oi.unit_price, oi.total_price, ri.item_id, ri.item_name, ri.unit
         FROM order_items oi
         JOIN ration_items ri ON oi.item_id = ri.item_id
         WHERE oi.order_id = $1`,
        [tok.order_id]
      );

      const itemsSummary = itemsRes.rows.map(i => `${i.item_name} (${parseFloat(i.quantity)} ${i.unit})`).join(', ');

      enrichedTokens.push({
        tokenId: tok.token_id,
        tokenNumber: tok.token_number,
        tokenStatus: tok.token_status,
        orderId: tok.order_id,
        orderNumber: tok.order_number,
        orderStatus: tok.order_status,
        customerName: tok.customer_name,
        customerPhone: tok.customer_phone,
        cardNumber: tok.card_number,
        cardType: tok.card_type,
        totalAmount: parseFloat(tok.total_amount),
        paymentMethod: tok.payment_method,
        paymentStatus: tok.payment_status,
        transactionRef: tok.transaction_ref,
        generatedAt: tok.generated_at,
        deliveredAt: tok.delivered_at,
        deliveredBy: tok.delivered_by_employee_id,
        itemsSummary,
        items: itemsRes.rows.map(i => ({
          itemId: i.item_id,
          itemName: i.item_name,
          quantity: parseFloat(i.quantity),
          unit: i.unit,
          unitPrice: parseFloat(i.unit_price),
          totalPrice: parseFloat(i.total_price)
        }))
      });
    }

    res.json({ tokens: enrichedTokens });
  } catch (error) {
    console.error('Error fetching salesman tokens:', error);
    res.status(500).json({ error: 'Failed to retrieve shop tokens' });
  }
}

// 3. Mark Token / Order as DELIVERED
export async function markDelivered(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shopId = getAuthorizedShopId(req, res);
    if (!shopId) return;

    const { tokenId } = req.params;
    const employeeId = req.user?.employeeId || 'EMP-UNKNOWN';
    const remarks = req.body.remarks || 'Biometric and Token verified by salesman';

    if (!tokenId) {
      res.status(400).json({ error: 'Token ID parameter is required' });
      return;
    }

    const deliveryResult = await transaction(async (client) => {
      // 1. Verify token belongs to this shop
      const tokenRes = await client.query(
        `SELECT t.token_id, t.token_number, t.status, t.shop_id, t.order_id,
                o.order_status, o.customer_id, o.card_id
         FROM tokens t
         JOIN orders o ON t.order_id = o.order_id
         WHERE t.token_id = $1`,
        [tokenId]
      );

      if (tokenRes.rows.length === 0) {
        throw new Error('Token not found.');
      }

      const tok = tokenRes.rows[0];

      // Shop isolation check
      if (tok.shop_id !== shopId) {
        throw new Error(`Security Exception: Token does not belong to your shop (${shopId}).`);
      }

      // Prevent duplicate delivery
      if (tok.status === 'DELIVERED' || tok.order_status === 'DELIVERED') {
        throw new Error('This order has ALREADY been marked as delivered and stock has already been deducted.');
      }

      // 2. Fetch order items to deduct stock
      const itemsRes = await client.query(
        `SELECT item_id, quantity FROM order_items WHERE order_id = $1`,
        [tok.order_id]
      );

      // 3. Deduct stock and record stock transactions
      for (const item of itemsRes.rows) {
        const qty = parseFloat(item.quantity);

        // Update inventory distributed stock
        const invRes = await client.query(
          `UPDATE shop_inventory
           SET distributed_stock = distributed_stock + $1,
               last_updated = CURRENT_TIMESTAMP
           WHERE shop_id = $2 AND item_id = $3
           RETURNING opening_stock, received_stock, distributed_stock`,
          [qty, shopId, item.item_id]
        );

        if (invRes.rows.length > 0) {
          const inv = invRes.rows[0];
          const balanceAfter = parseFloat(inv.opening_stock) + parseFloat(inv.received_stock) - parseFloat(inv.distributed_stock);

          // Record Stock Transaction
          await client.query(
            `INSERT INTO stock_transactions 
             (shop_id, item_id, transaction_type, quantity, balance_after, reference_id, employee_id)
             VALUES ($1, $2, 'DISPATCH_DELIVERY', $3, $4, $5, $6)`,
            [shopId, item.item_id, qty, balanceAfter, `TOKEN-${tok.token_number}`, employeeId]
          );
        }
      }

      // 4. Update Token status
      await client.query(
        `UPDATE tokens SET status = 'DELIVERED' WHERE token_id = $1`,
        [tok.token_id]
      );

      // 5. Update Order status
      await client.query(
        `UPDATE orders SET order_status = 'DELIVERED', updated_at = CURRENT_TIMESTAMP WHERE order_id = $1`,
        [tok.order_id]
      );

      // 6. Insert Delivery Audit Record
      const delivRes = await client.query(
        `INSERT INTO deliveries (order_id, token_id, shop_id, delivered_by_employee_id, remarks)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING delivery_id, delivered_at`,
        [tok.order_id, tok.token_id, shopId, employeeId, remarks]
      );

      return {
        tokenNumber: tok.token_number,
        orderId: tok.order_id,
        status: 'DELIVERED',
        deliveredAt: delivRes.rows[0].delivered_at,
        deliveredBy: employeeId
      };
    });

    res.json({
      message: 'Order successfully marked as delivered! Inventory deducted and audit logged.',
      delivery: deliveryResult
    });
  } catch (error: any) {
    console.error('Error delivering order:', error);
    res.status(400).json({ error: error.message || 'Failed to complete delivery' });
  }
}

// 4. My Shop Stock
export async function getShopStock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shopId = getAuthorizedShopId(req, res);
    if (!shopId) return;

    const sql = `
      SELECT si.inventory_id, si.shop_id, si.item_id,
             si.opening_stock, si.received_stock, si.distributed_stock,
             (si.opening_stock + si.received_stock - si.distributed_stock) as current_stock,
             si.min_threshold, si.last_updated,
             ri.item_code, ri.item_name, ri.unit, ri.subsidized_price, ri.market_price, ri.image_icon
      FROM shop_inventory si
      JOIN ration_items ri ON si.item_id = ri.item_id
      WHERE si.shop_id = $1
      ORDER BY ri.item_id ASC
    `;

    const result = await query(sql, [shopId]);

    const stockItems = result.rows.map(row => {
      const opening = parseFloat(row.opening_stock);
      const received = parseFloat(row.received_stock);
      const distributed = parseFloat(row.distributed_stock);
      const current = opening + received - distributed;
      const minThreshold = parseFloat(row.min_threshold);

      return {
        inventoryId: row.inventory_id,
        shopId: row.shop_id,
        itemId: row.item_id,
        itemCode: row.item_code,
        itemName: row.item_name,
        unit: row.unit,
        subsidizedPrice: parseFloat(row.subsidized_price),
        marketPrice: parseFloat(row.market_price),
        imageIcon: row.image_icon,
        openingStock: opening,
        receivedStock: received,
        distributedStock: distributed,
        currentStock: current,
        minThreshold: minThreshold,
        isLowStock: current < minThreshold,
        lastUpdated: row.last_updated
      };
    });

    // Recent stock transactions
    const transRes = await query(
      `SELECT st.transaction_id, st.transaction_type, st.quantity, st.balance_after,
              st.reference_id, st.employee_id, st.created_at,
              ri.item_name, ri.unit
       FROM stock_transactions st
       JOIN ration_items ri ON st.item_id = ri.item_id
       WHERE st.shop_id = $1
       ORDER BY st.created_at DESC
       LIMIT 10`,
      [shopId]
    );

    res.json({
      shopId,
      items: stockItems,
      recentTransactions: transRes.rows.map(t => ({
        id: t.transaction_id,
        type: t.transaction_type,
        itemName: t.item_name,
        unit: t.unit,
        quantity: parseFloat(t.quantity),
        balanceAfter: parseFloat(t.balance_after),
        reference: t.reference_id,
        employeeId: t.employee_id,
        timestamp: t.created_at
      }))
    });
  } catch (error) {
    console.error('Error in getShopStock:', error);
    res.status(500).json({ error: 'Failed to retrieve shop stock' });
  }
}

// 5. Restock / Receive Commodity Shipment
export async function restockCommodity(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shopId = getAuthorizedShopId(req, res);
    if (!shopId) return;

    const { itemId, quantity, shipmentRef } = req.body;
    const employeeId = req.user?.employeeId || 'EMP-UNKNOWN';

    if (!itemId || !quantity || quantity <= 0) {
      res.status(400).json({ error: 'Valid item and positive quantity required for restocking.' });
      return;
    }

    const restockResult = await transaction(async (client) => {
      // Update inventory received stock
      const invRes = await client.query(
        `UPDATE shop_inventory
         SET received_stock = received_stock + $1,
             last_updated = CURRENT_TIMESTAMP
         WHERE shop_id = $2 AND item_id = $3
         RETURNING opening_stock, received_stock, distributed_stock`,
        [quantity, shopId, itemId]
      );

      if (invRes.rows.length === 0) {
        throw new Error('Item not found in this shop inventory.');
      }

      const inv = invRes.rows[0];
      const balanceAfter = parseFloat(inv.opening_stock) + parseFloat(inv.received_stock) - parseFloat(inv.distributed_stock);

      // Record transaction
      await client.query(
        `INSERT INTO stock_transactions 
         (shop_id, item_id, transaction_type, quantity, balance_after, reference_id, employee_id)
         VALUES ($1, $2, 'RESTOCK_RECEIVED', $3, $4, $5, $6)`,
        [shopId, itemId, quantity, balanceAfter, shipmentRef || `RESTOCK-${Date.now()}`, employeeId]
      );

      return {
        shopId,
        itemId,
        restockedQty: quantity,
        newBalance: balanceAfter
      };
    });

    res.json({
      message: 'Stock updated successfully',
      data: restockResult
    });
  } catch (error: any) {
    console.error('Error restocking:', error);
    res.status(400).json({ error: error.message || 'Restocking failed' });
  }
}

// 6. Sales & Distribution Reports
export async function getSalesStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const shopId = getAuthorizedShopId(req, res);
    if (!shopId) return;

    // Today's Sales
    const todayRes = await query(
      `SELECT COUNT(*) as total_orders,
              COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_orders,
              COALESCE(SUM(total_amount), 0) as total_amount
       FROM orders
       WHERE shop_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [shopId]
    );

    // Weekly Sales (last 7 days)
    const weeklyRes = await query(
      `SELECT COUNT(*) as total_orders,
              COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_orders,
              COALESCE(SUM(total_amount), 0) as total_amount
       FROM orders
       WHERE shop_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [shopId]
    );

    // Monthly Sales (current month)
    const monthlyRes = await query(
      `SELECT COUNT(*) as total_orders,
              COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_orders,
              COALESCE(SUM(total_amount), 0) as total_amount
       FROM orders
       WHERE shop_id = $1 AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [shopId]
    );

    // Item-wise distribution totals for this shop
    const itemDistRes = await query(
      `SELECT ri.item_name, ri.unit, COALESCE(SUM(oi.quantity), 0) as total_quantity,
              COALESCE(SUM(oi.total_price), 0) as total_revenue
       FROM order_items oi
       JOIN ration_items ri ON oi.item_id = ri.item_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.shop_id = $1 AND o.order_status = 'DELIVERED'
       GROUP BY ri.item_id, ri.item_name, ri.unit
       ORDER BY total_quantity DESC`,
      [shopId]
    );

    // Daily breakdown for the last 7 days chart
    const dailyTrendRes = await query(
      `SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date_label,
              COUNT(*) as order_count,
              COALESCE(SUM(total_amount), 0) as revenue
       FROM orders
       WHERE shop_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [shopId]
    );

    res.json({
      shopId,
      today: {
        totalOrders: parseInt(todayRes.rows[0].total_orders, 10),
        deliveredOrders: parseInt(todayRes.rows[0].delivered_orders, 10),
        totalAmount: parseFloat(todayRes.rows[0].total_amount)
      },
      weekly: {
        totalOrders: parseInt(weeklyRes.rows[0].total_orders, 10),
        deliveredOrders: parseInt(weeklyRes.rows[0].delivered_orders, 10),
        totalAmount: parseFloat(weeklyRes.rows[0].total_amount)
      },
      monthly: {
        totalOrders: parseInt(monthlyRes.rows[0].total_orders, 10),
        deliveredOrders: parseInt(monthlyRes.rows[0].delivered_orders, 10),
        totalAmount: parseFloat(monthlyRes.rows[0].total_amount)
      },
      itemDistribution: itemDistRes.rows.map(row => ({
        name: row.item_name,
        unit: row.unit,
        quantity: parseFloat(row.total_quantity),
        revenue: parseFloat(row.total_revenue)
      })),
      dailyTrend: dailyTrendRes.rows.map(row => ({
        date: row.date_label,
        orders: parseInt(row.order_count, 10),
        revenue: parseFloat(row.revenue)
      }))
    });
  } catch (error) {
    console.error('Error in getSalesStats:', error);
    res.status(500).json({ error: 'Failed to retrieve shop sales statistics' });
  }
}
