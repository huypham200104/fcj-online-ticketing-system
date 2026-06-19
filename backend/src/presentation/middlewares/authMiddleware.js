import { AppError } from '../../domain/errors/AppError.js';
import { getAuthTokenFromRequest, verifyAccessToken } from '../../infrastructure/security/authToken.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      throw new AppError('Unauthorized: Token missing', 401);
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      throw new AppError('Unauthorized: Invalid token', 401);
    }

    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized: Token missing', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Bạn không có quyền thực hiện thao tác này', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};
