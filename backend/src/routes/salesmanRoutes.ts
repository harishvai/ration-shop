import { Router } from 'express';
import {
  getDashboardStats,
  getTokens,
  markDelivered,
  getShopStock,
  restockCommodity,
  getSalesStats
} from '../controllers/salesmanController.js';
import { authenticateUser, requireRole, requireShopAccess } from '../middleware/auth.js';

const router = Router();

// Protect all salesman routes to SALESMAN role
router.use(authenticateUser);
router.use(requireRole('SALESMAN'));

router.get('/dashboard', getDashboardStats);
router.get('/tokens', getTokens);
router.post('/tokens/:tokenId/deliver', markDelivered);
router.get('/stock', getShopStock);
router.post('/stock/restock', restockCommodity);
router.get('/sales', getSalesStats);

// Explicit shop-isolated route to enforce and test shop boundary security
router.get('/shops/:shopId/stock', requireShopAccess, getShopStock);

export default router;
