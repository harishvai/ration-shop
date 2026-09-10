import { Router } from 'express';
import { verifyPublicCard, loginSalesman, loginHead, getCurrentUser } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Public login (Ration Card verification)
router.post('/public/verify', verifyPublicCard);

// Salesman login (Shop Number + Employee ID + Password)
router.post('/salesman/login', loginSalesman);

// Head login (Head ID + Password)
router.post('/head/login', loginHead);

// Current Session Info
router.get('/me', authenticateUser, getCurrentUser);

export default router;
