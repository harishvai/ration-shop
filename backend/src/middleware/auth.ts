import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'smart-ration-super-secure-jwt-secret-2026';

export interface AuthUser {
  id: number;
  username: string;
  role: 'PUBLIC' | 'SALESMAN' | 'HEAD';
  shopId?: string;
  employeeId?: string;
  cardId?: number;
  cardNumber?: string;
  customerId?: number;
  fullName?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No authorization token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

export function requireRole(...allowedRoles: ('PUBLIC' | 'SALESMAN' | 'HEAD')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User session missing' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}

export function requireShopAccess(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // HEAD role has universal clearance to monitor and search all shops
  if (req.user.role === 'HEAD') {
    next();
    return;
  }

  // Determine the target shop from URL params, body, or query
  const targetShopId = req.params.shopId || req.body.shopId || (req.query.shopId as string);

  if (!targetShopId) {
    // If no target shop specified in URL, use the user's assigned shop
    next();
    return;
  }

  // Salesman can only access their assigned shop
  if (req.user.role === 'SALESMAN') {
    if (req.user.shopId !== targetShopId) {
      res.status(403).json({
        error: `Security Violation: Salesman is assigned to shop '${req.user.shopId}' and cannot access data for shop '${targetShopId}'.`
      });
      return;
    }
  }

  // Public can only access their assigned ration shop
  if (req.user.role === 'PUBLIC') {
    if (req.user.shopId && req.user.shopId !== targetShopId) {
      res.status(403).json({
        error: `Access Denied: Your ration card is registered with shop '${req.user.shopId}'.`
      });
      return;
    }
  }

  next();
}
