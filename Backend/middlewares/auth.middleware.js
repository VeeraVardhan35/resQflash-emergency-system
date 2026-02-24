import { verifyAccessToken } from '../services/token.service.js';
import logger from '../config/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion,
    };

    next();
  } catch (err) {
    logger.error('Authentication middleware error', { error: err.message });
    next(err);
  }
};

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        required: allowedRoles,
      });
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};