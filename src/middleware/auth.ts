import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    address: string;
    role: string;
  };
}

/**
 * Rate limiting middleware configuration
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

/**
 * Middleware to verify JWT tokens
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user as { id: string; address: string; role: string };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Generate JWT token
 */
export const generateToken = (user: { id: string; address: string; role: string }): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Middleware to verify Ethereum address ownership
 */
export const verifyAddressOwnership = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Ethereum address required' });
  }

  if (!req.user || req.user.address.toLowerCase() !== address.toLowerCase()) {
    return res.status(403).json({ error: 'Not authorized to perform actions for this address' });
  }

  next();
}; 