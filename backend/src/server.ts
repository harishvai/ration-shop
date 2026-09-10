import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import { getDb, query } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import salesmanRoutes from './routes/salesmanRoutes.js';
import headRoutes from './routes/headRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health Check API
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const shopCount = await query('SELECT COUNT(*) as count FROM ration_shops');
    res.json({
      status: 'ONLINE',
      app: 'Smart Ration API',
      version: '1.0.0',
      database: 'PostgreSQL Active',
      shopsCount: parseInt(shopCount.rows[0].count, 10),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: (err as Error).message });
  }
});

// Demo Helper API (To display interactive demo credentials in the UI)
app.get('/api/demo-data', async (_req: Request, res: Response) => {
  try {
    const cards = await query(
      `SELECT rc.card_number, rc.card_type, rc.assigned_shop_id, c.full_name
       FROM ration_cards rc
       JOIN customers c ON rc.customer_id = c.customer_id
       ORDER BY rc.card_id ASC LIMIT 6`
    );

    const salesmen = await query(
      `SELECT se.employee_id, se.shop_id, se.full_name, rs.shop_name
       FROM shop_employees se
       JOIN ration_shops rs ON se.shop_id = rs.shop_id
       ORDER BY se.shop_id ASC LIMIT 5`
    );

    res.json({
      publicCards: cards.rows.map(c => ({
        cardNumber: c.card_number,
        cardType: c.card_type,
        shopId: c.assigned_shop_id,
        name: c.full_name
      })),
      salesmen: salesmen.rows.map(s => ({
        employeeId: s.employee_id,
        shopId: s.shop_id,
        name: s.full_name,
        shopName: s.shop_name,
        password: 'salesman123'
      })),
      head: {
        headId: 'HEAD-001',
        password: 'head123',
        designation: 'Chief Director (Civil Supplies)'
      }
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/salesman', salesmanRoutes);
app.use('/api/head', headRoutes);

// Serve Frontend Static in Production if built
const frontendDist = path.resolve(process.cwd(), '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'API route not found. Frontend not yet built.' });
    }
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Bootstrap Database and Start Server
async function startServer() {
  try {
    console.log('Initializing Smart Ration Database Engine...');
    await getDb();

    // Check if tables exist and are populated
    try {
      const checkRes = await query('SELECT COUNT(*) as count FROM ration_shops');
      if (parseInt(checkRes.rows[0].count, 10) === 0) {
        console.log('Empty database detected. Running seed...');
        await seedDatabase();
      } else {
        console.log(`Database already seeded with ${checkRes.rows[0].count} ration shops.`);
      }
    } catch (e) {
      console.log('Database tables missing. Running initial migration & seed...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  🌾 Smart Ration Management System API Server 🌾  `);
      console.log(`  Running on: http://localhost:${PORT}             `);
      console.log(`  Health:     http://localhost:${PORT}/api/health  `);
      console.log(`  Demo Data:  http://localhost:${PORT}/api/demo-data`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
}

startServer();
