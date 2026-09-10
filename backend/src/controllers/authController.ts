import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/index.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';

// 1. Public Portal Login / Verification
export async function verifyPublicCard(req: Request, res: Response): Promise<void> {
  try {
    const { cardNumber } = req.body;

    if (!cardNumber || typeof cardNumber !== 'string') {
      res.status(400).json({ error: 'Ration card number is required.' });
      return;
    }

    const trimmedCard = cardNumber.trim().toUpperCase();

    // Query card details
    const result = await query(
      `SELECT rc.card_id, rc.card_number, rc.card_type, rc.family_members_count, rc.is_active,
              rc.assigned_shop_id, rs.shop_name, rs.location, rs.district, rs.pincode,
              c.customer_id, c.full_name, c.phone, c.address, c.aadhaar_last4,
              u.id as user_id
       FROM ration_cards rc
       JOIN customers c ON rc.customer_id = c.customer_id
       JOIN ration_shops rs ON rc.assigned_shop_id = rs.shop_id
       LEFT JOIN users u ON c.user_id = u.id
       WHERE rc.card_number = $1`,
      [trimmedCard]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: `Ration Card '${trimmedCard}' not found in the state registry. Please check your card number.`
      });
      return;
    }

    const card = result.rows[0];

    if (!card.is_active) {
      res.status(403).json({ error: 'This ration card is currently deactivated. Please contact your civil supplies office.' });
      return;
    }

    // Generate JWT for public user
    const token = generateToken({
      id: card.user_id || 0,
      username: card.card_number,
      role: 'PUBLIC',
      shopId: card.assigned_shop_id,
      cardId: card.card_id,
      cardNumber: card.card_number,
      customerId: card.customer_id,
      fullName: card.full_name,
    });

    res.json({
      message: 'Ration card verified successfully',
      token,
      user: {
        role: 'PUBLIC',
        cardNumber: card.card_number,
        cardType: card.card_type,
        customerName: card.full_name,
        phone: card.phone,
        address: card.address,
        aadhaarLast4: card.aadhaar_last4,
        familyMembersCount: card.family_members_count,
        shop: {
          shopId: card.assigned_shop_id,
          shopName: card.shop_name,
          location: card.location,
          district: card.district,
          pincode: card.pincode,
        }
      }
    });
  } catch (error) {
    console.error('Error verifying ration card:', error);
    res.status(500).json({ error: 'Internal server error while verifying ration card' });
  }
}

// 2. Salesman Portal Login
export async function loginSalesman(req: Request, res: Response): Promise<void> {
  try {
    const { shopNumber, employeeId, password } = req.body;

    if (!shopNumber || !employeeId || !password) {
      res.status(400).json({ error: 'Shop number, Employee ID, and Password are all required.' });
      return;
    }

    const trimmedShop = shopNumber.trim().toUpperCase();
    const trimmedEmp = employeeId.trim().toUpperCase();

    // Query employee and user record
    const result = await query(
      `SELECT se.employee_id, se.shop_id, se.full_name, se.phone, se.designation, se.is_active,
              rs.shop_name, rs.location, rs.status as shop_status,
              u.id as user_id, u.password_hash, u.role
       FROM shop_employees se
       JOIN users u ON se.user_id = u.id
       JOIN ration_shops rs ON se.shop_id = rs.shop_id
       WHERE se.employee_id = $1 AND se.shop_id = $2`,
      [trimmedEmp, trimmedShop]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        error: `Invalid credentials. No employee matching '${trimmedEmp}' found at Shop '${trimmedShop}'.`
      });
      return;
    }

    const employee = result.rows[0];

    if (!employee.is_active) {
      res.status(403).json({ error: 'Employee account is inactive. Please contact civil supplies administration.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, employee.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      return;
    }

    const token = generateToken({
      id: employee.user_id,
      username: employee.employee_id,
      role: 'SALESMAN',
      shopId: employee.shop_id,
      employeeId: employee.employee_id,
      fullName: employee.full_name,
    });

    res.json({
      message: 'Salesman authenticated successfully',
      token,
      user: {
        role: 'SALESMAN',
        employeeId: employee.employee_id,
        fullName: employee.full_name,
        designation: employee.designation,
        shop: {
          shopId: employee.shop_id,
          shopName: employee.shop_name,
          location: employee.location,
        }
      }
    });
  } catch (error) {
    console.error('Error in salesman login:', error);
    res.status(500).json({ error: 'Internal server error during salesman login' });
  }
}

// 3. Head of Department Login
export async function loginHead(req: Request, res: Response): Promise<void> {
  try {
    const { headId, password } = req.body;

    if (!headId || !password) {
      res.status(400).json({ error: 'Head ID and Password are required.' });
      return;
    }

    const trimmedHeadId = headId.trim().toUpperCase();

    const result = await query(
      `SELECT id, username, password_hash, role
       FROM users
       WHERE username = $1 AND role = 'HEAD'`,
      [trimmedHeadId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials. Head of Department account not found.' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid password. Please try again.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: 'HEAD',
      fullName: 'Chief Director (Civil Supplies & Consumer Protection)',
    });

    res.json({
      message: 'Head of Department authenticated successfully',
      token,
      user: {
        role: 'HEAD',
        headId: user.username,
        fullName: 'Chief Director (Civil Supplies & Consumer Protection)',
        department: 'Department of Food, Civil Supplies & Consumer Protection'
      }
    });
  } catch (error) {
    console.error('Error in head login:', error);
    res.status(500).json({ error: 'Internal server error during Head authentication' });
  }
}

// 4. Session Validation
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: req.user });
}
