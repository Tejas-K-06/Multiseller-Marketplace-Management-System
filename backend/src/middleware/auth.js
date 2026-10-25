import jwt from 'jsonwebtoken';
import * as sellerModel from '../models/sellerModel.js';
import { httpError } from '../utils/httpError.js';

export function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return next(httpError(401, 'Authentication required'));

  try {
    const payload = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
    if (!payload.userId || !payload.role) throw new Error('Invalid token payload');
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch {
    return next(httpError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(httpError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) return next(httpError(403, 'Forbidden'));
    return next();
  };
}

export async function requireApprovedSeller(req, res, next) {
  try {
    if (req.user?.role !== 'SELLER') throw httpError(403, 'Forbidden');
    const approval = await sellerModel.getApproval(req.user.userId);
    const status = approval?.approvalStatus ?? approval?.approval_status ?? approval;
    if (status !== 'APPROVED') throw httpError(403, 'Seller account is not approved');
    return next();
  } catch (err) {
    return next(err);
  }
}
