import { Response } from 'express';
import { query } from '../db/index.js';
import { AuthRequest } from '../middleware/auth.js';

// 1. Head of Department Dashboard High-Level Metrics
export async function getHeadDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Total Shops
    const shopsCountRes = await query(`SELECT COUNT(*) as count FROM ration_shops`);
    const totalShops = parseInt(shopsCountRes.rows[0].count, 10);

    // Total Customers
    const custCountRes = await query(`SELECT COUNT(*) as count FROM customers`);
    const totalCustomers = parseInt(custCountRes.rows[0].count, 10);

    // Today's Orders & Sales
    const todayOrdersRes = await query(
      `SELECT COUNT(*) as today_orders,
              COALESCE(SUM(total_amount), 0) as today_sales,
              COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_today,
              COUNT(CASE WHEN order_status IN ('READY', 'PENDING') THEN 1 END) as pending_today
       FROM orders
       WHERE DATE(created_at) = CURRENT_DATE`
    );

    // All-time Orders & Delivered
    const allOrdersRes = await query(
      `SELECT COUNT(*) as total_orders,
              COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_orders,
              COUNT(CASE WHEN order_status IN ('READY', 'PENDING') THEN 1 END) as pending_orders,
              COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders`
    );

    // Total Stock across all shops & count of shops with low stock
    const stockRes = await query(
      `SELECT COALESCE(SUM(opening_stock + received_stock - distributed_stock), 0) as total_stock_kg,
              COUNT(DISTINCT CASE WHEN (opening_stock + received_stock - distributed_stock) < min_threshold THEN shop_id END) as low_stock_shops
       FROM shop_inventory`
    );

    const today = todayOrdersRes.rows[0];
    const allTime = allOrdersRes.rows[0];
    const stock = stockRes.rows[0];

    res.json({
      metrics: {
        totalShops,
        totalCustomers,
        todayOrders: parseInt(today.today_orders, 10),
        todaySales: parseFloat(today.today_sales),
        totalStockKg: parseFloat(stock.total_stock_kg),
        lowStockShopsCount: parseInt(stock.low_stock_shops, 10),
        pendingOrders: parseInt(allTime.pending_orders, 10),
        deliveredOrders: parseInt(allTime.delivered_orders, 10),
        totalRevenue: parseFloat(allTime.total_revenue)
      }
    });
  } catch (error) {
    console.error('Error in getHeadDashboard:', error);
    res.status(500).json({ error: 'Failed to retrieve Head dashboard statistics' });
  }
}

// 2. All Ration Shops Directory & Performance Summary
export async function getAllShops(req: AuthRequest, res: Response): Promise<void> {
  try {
    const sql = `
      SELECT rs.shop_id, rs.shop_name, rs.location, rs.district, rs.pincode, rs.contact_phone, rs.status,
             se.employee_id, se.full_name as salesman_name, se.phone as salesman_phone,
             COALESCE(inv.total_stock_kg, 0) as current_stock,
             COALESCE(inv.low_stock_items, 0) as low_stock_items,
             COALESCE(ord_today.today_sales, 0) as today_sales,
             COALESCE(ord_month.monthly_sales, 0) as monthly_sales,
             COALESCE(ord_pending.pending_orders, 0) as pending_orders,
             COALESCE(ord_delivered.delivered_orders, 0) as delivered_orders
      FROM ration_shops rs
      LEFT JOIN shop_employees se ON rs.shop_id = se.shop_id AND se.is_active = TRUE
      LEFT JOIN (
        SELECT shop_id,
               SUM(opening_stock + received_stock - distributed_stock) as total_stock_kg,
               COUNT(CASE WHEN (opening_stock + received_stock - distributed_stock) < min_threshold THEN 1 END) as low_stock_items
        FROM shop_inventory
        GROUP BY shop_id
      ) inv ON rs.shop_id = inv.shop_id
      LEFT JOIN (
        SELECT shop_id, SUM(total_amount) as today_sales
        FROM orders
        WHERE DATE(created_at) = CURRENT_DATE
        GROUP BY shop_id
      ) ord_today ON rs.shop_id = ord_today.shop_id
      LEFT JOIN (
        SELECT shop_id, SUM(total_amount) as monthly_sales
        FROM orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY shop_id
      ) ord_month ON rs.shop_id = ord_month.shop_id
      LEFT JOIN (
        SELECT shop_id, COUNT(*) as pending_orders
        FROM orders
        WHERE order_status IN ('READY', 'PENDING')
        GROUP BY shop_id
      ) ord_pending ON rs.shop_id = ord_pending.shop_id
      LEFT JOIN (
        SELECT shop_id, COUNT(*) as delivered_orders
        FROM orders
        WHERE order_status = 'DELIVERED'
        GROUP BY shop_id
      ) ord_delivered ON rs.shop_id = ord_delivered.shop_id
      ORDER BY rs.shop_id ASC
    `;

    const result = await query(sql);

    res.json({
      shops: result.rows.map(r => ({
        shopId: r.shop_id,
        shopName: r.shop_name,
        location: r.location,
        district: r.district,
        pincode: r.pincode,
        phone: r.contact_phone,
        status: r.status,
        salesman: {
          employeeId: r.employee_id,
          name: r.salesman_name || 'Unassigned',
          phone: r.salesman_phone
        },
        currentStockKg: parseFloat(r.current_stock),
        hasLowStock: parseInt(r.low_stock_items, 10) > 0,
        lowStockItemsCount: parseInt(r.low_stock_items, 10),
        todaySales: parseFloat(r.today_sales),
        monthlySales: parseFloat(r.monthly_sales),
        pendingOrders: parseInt(r.pending_orders, 10),
        deliveredOrders: parseInt(r.delivered_orders, 10)
      }))
    });
  } catch (error) {
    console.error('Error in getAllShops:', error);
    res.status(500).json({ error: 'Failed to retrieve all shops list' });
  }
}

// 3. Search Shop by Shop Number (Comprehensive Drill-Down)
export async function searchShop(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      res.status(400).json({ error: 'Shop ID is required' });
      return;
    }

    const trimmedShopId = shopId.trim().toUpperCase();

    // Fetch Shop Details
    const shopRes = await query(
      `SELECT shop_id, shop_name, location, district, pincode, contact_phone, status, created_at
       FROM ration_shops WHERE shop_id = $1`,
      [trimmedShopId]
    );

    if (shopRes.rows.length === 0) {
      res.status(404).json({ error: `Ration shop '${trimmedShopId}' not found.` });
      return;
    }

    const shop = shopRes.rows[0];

    // Salesman Details
    const salesmenRes = await query(
      `SELECT employee_id, full_name, phone, designation, is_active
       FROM shop_employees WHERE shop_id = $1`,
      [trimmedShopId]
    );

    // Current Stock Breakdown
    const stockRes = await query(
      `SELECT si.opening_stock, si.received_stock, si.distributed_stock,
              (si.opening_stock + si.received_stock - si.distributed_stock) as current_stock,
              si.min_threshold, si.last_updated,
              ri.item_id, ri.item_code, ri.item_name, ri.unit, ri.subsidized_price, ri.market_price
       FROM shop_inventory si
       JOIN ration_items ri ON si.item_id = ri.item_id
       WHERE si.shop_id = $1
       ORDER BY ri.item_id ASC`,
      [trimmedShopId]
    );

    // Stock History (Transactions)
    const historyRes = await query(
      `SELECT st.transaction_id, st.transaction_type, st.quantity, st.balance_after,
              st.reference_id, st.employee_id, st.created_at,
              ri.item_name, ri.unit
       FROM stock_transactions st
       JOIN ration_items ri ON st.item_id = ri.item_id
       WHERE st.shop_id = $1
       ORDER BY st.created_at DESC
       LIMIT 15`,
      [trimmedShopId]
    );

    // Sales Performance Figures (Today, Weekly, Monthly)
    const salesRes = await query(
      `SELECT 
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_orders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END), 0) as today_sales,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_orders,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN total_amount ELSE 0 END), 0) as weekly_sales,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as monthly_orders,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0) as monthly_sales,
        COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN order_status IN ('READY', 'PENDING') THEN 1 END) as pending_orders,
        COUNT(*) as total_orders
       FROM orders
       WHERE shop_id = $1`,
      [trimmedShopId]
    );

    // Recent Orders
    const ordersRes = await query(
      `SELECT o.order_id, o.order_number, o.order_status, o.total_amount, o.created_at,
              c.full_name as customer_name, rc.card_number, t.token_number
       FROM orders o
       JOIN customers c ON o.customer_id = c.customer_id
       JOIN ration_cards rc ON o.card_id = rc.card_id
       LEFT JOIN tokens t ON o.order_id = t.order_id
       WHERE o.shop_id = $1
       ORDER BY o.created_at DESC
       LIMIT 10`,
      [trimmedShopId]
    );

    // Item Distribution Breakdown
    const itemDistRes = await query(
      `SELECT ri.item_name, ri.unit,
              COALESCE(SUM(oi.quantity), 0) as total_distributed
       FROM order_items oi
       JOIN ration_items ri ON oi.item_id = ri.item_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.shop_id = $1 AND o.order_status = 'DELIVERED'
       GROUP BY ri.item_id, ri.item_name, ri.unit`,
      [trimmedShopId]
    );

    const sales = salesRes.rows[0];

    res.json({
      shopDetails: shop,
      salesmen: salesmenRes.rows,
      currentStock: stockRes.rows.map(s => ({
        itemId: s.item_id,
        itemCode: s.item_code,
        itemName: s.item_name,
        unit: s.unit,
        subsidizedPrice: parseFloat(s.subsidized_price),
        openingStock: parseFloat(s.opening_stock),
        receivedStock: parseFloat(s.received_stock),
        distributedStock: parseFloat(s.distributed_stock),
        currentStock: parseFloat(s.current_stock),
        minThreshold: parseFloat(s.min_threshold),
        isLowStock: parseFloat(s.current_stock) < parseFloat(s.min_threshold),
        lastUpdated: s.last_updated
      })),
      stockHistory: historyRes.rows.map(h => ({
        id: h.transaction_id,
        type: h.transaction_type,
        itemName: h.item_name,
        unit: h.unit,
        quantity: parseFloat(h.quantity),
        balanceAfter: parseFloat(h.balance_after),
        reference: h.reference_id,
        employeeId: h.employee_id,
        timestamp: h.created_at
      })),
      salesMetrics: {
        todayOrders: parseInt(sales.today_orders, 10),
        todaySales: parseFloat(sales.today_sales),
        weeklyOrders: parseInt(sales.weekly_orders, 10),
        weeklySales: parseFloat(sales.weekly_sales),
        monthlyOrders: parseInt(sales.monthly_orders, 10),
        monthlySales: parseFloat(sales.monthly_sales),
        totalOrders: parseInt(sales.total_orders, 10),
        deliveredOrders: parseInt(sales.delivered_orders, 10),
        pendingOrders: parseInt(sales.pending_orders, 10)
      },
      recentOrders: ordersRes.rows.map(o => ({
        orderId: o.order_id,
        orderNumber: o.order_number,
        tokenNumber: o.token_number,
        customerName: o.customer_name,
        cardNumber: o.card_number,
        totalAmount: parseFloat(o.total_amount),
        status: o.order_status,
        date: o.created_at
      })),
      itemDistribution: itemDistRes.rows.map(i => ({
        name: i.item_name,
        unit: i.unit,
        quantity: parseFloat(i.total_distributed)
      }))
    });
  } catch (error) {
    console.error('Error in searchShop:', error);
    res.status(500).json({ error: 'Failed to retrieve detailed shop information' });
  }
}

// 4. State-wide Analytics & Comparative Reports
export async function getAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { timeRange } = req.query; // 'today', '7days', 'month', 'all'

    // Shop-wise Sales Comparison (SHOP-101 to SHOP-105)
    const shopSalesRes = await query(
      `SELECT rs.shop_id, rs.shop_name,
              COALESCE(SUM(o.total_amount), 0) as total_sales,
              COUNT(o.order_id) as total_orders
       FROM ration_shops rs
       LEFT JOIN orders o ON rs.shop_id = o.shop_id
       GROUP BY rs.shop_id, rs.shop_name
       ORDER BY rs.shop_id ASC`
    );

    // Stock Analysis (Available commodities across shops)
    const stockMatrixRes = await query(
      `SELECT si.shop_id, rs.shop_name, ri.item_code, ri.item_name,
              (si.opening_stock + si.received_stock - si.distributed_stock) as current_stock,
              si.min_threshold
       FROM shop_inventory si
       JOIN ration_shops rs ON si.shop_id = rs.shop_id
       JOIN ration_items ri ON si.item_id = ri.item_id
       ORDER BY si.shop_id ASC, ri.item_id ASC`
    );

    // Aggregate Item Distribution (Total Rice, Wheat, Sugar, Dal distributed)
    const overallItemDistRes = await query(
      `SELECT ri.item_name, ri.unit,
              COALESCE(SUM(oi.quantity), 0) as total_quantity,
              COALESCE(SUM(oi.total_price), 0) as total_value
       FROM order_items oi
       JOIN ration_items ri ON oi.item_id = ri.item_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.order_status = 'DELIVERED'
       GROUP BY ri.item_id, ri.item_name, ri.unit
       ORDER BY total_quantity DESC`
    );

    // Order Status Breakdown (Pending, Ready, Delivered)
    const orderStatusRes = await query(
      `SELECT order_status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount
       FROM orders
       GROUP BY order_status`
    );

    // Timeline Trends (Daily sales over last 7 days)
    const dailyTrendRes = await query(
      `SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date_label,
              COUNT(*) as order_count,
              COALESCE(SUM(total_amount), 0) as sales_amount
       FROM orders
       WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`
    );

    res.json({
      shopWiseSales: shopSalesRes.rows.map(r => ({
        shopId: r.shop_id,
        shopName: r.shop_name,
        totalSales: parseFloat(r.total_sales),
        totalOrders: parseInt(r.total_orders, 10)
      })),
      stockMatrix: stockMatrixRes.rows.map(s => ({
        shopId: s.shop_id,
        shopName: s.shop_name,
        itemCode: s.item_code,
        itemName: s.item_name,
        currentStock: parseFloat(s.current_stock),
        minThreshold: parseFloat(s.min_threshold),
        isLow: parseFloat(s.current_stock) < parseFloat(s.min_threshold)
      })),
      itemDistribution: overallItemDistRes.rows.map(i => ({
        name: i.item_name,
        unit: i.unit,
        quantity: parseFloat(i.total_quantity),
        value: parseFloat(i.total_value)
      })),
      orderStatuses: orderStatusRes.rows.map(os => ({
        status: os.order_status,
        count: parseInt(os.count, 10),
        amount: parseFloat(os.amount)
      })),
      timeline: dailyTrendRes.rows.map(t => ({
        date: t.date_label,
        orders: parseInt(t.order_count, 10),
        sales: parseFloat(t.sales_amount)
      }))
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics data' });
  }
}
