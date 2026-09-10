import { Router } from 'express';
import {
  getHeadDashboard,
  getAllShops,
  searchShop,
  getAnalytics
} from '../controllers/headController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all head routes to HEAD role
router.use(authenticateUser);
router.use(requireRole('HEAD'));

router.get('/dashboard', getHeadDashboard);
router.get('/shops', getAllShops);
router.get('/shops/:shopId', searchShop);
router.get('/analytics', getAnalytics);

export default router;
