import { Router } from 'express';
import { getEntitlements, createOrder, getMyTokens } from '../controllers/publicController.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all public routes to PUBLIC role only
router.use(authenticateUser);
router.use(requireRole('PUBLIC'));

router.get('/entitlements', getEntitlements);
router.post('/orders', createOrder);
router.get('/tokens', getMyTokens);

export default router;
