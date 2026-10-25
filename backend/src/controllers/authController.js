import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withTransaction } from '../config/db.js';
import * as userModel from '../models/userModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

function publicUser(user) {
  const result = {
    userId: user.userId ?? user.user_id,
    fullName: user.fullName ?? user.full_name,
    email: user.email,
    role: user.role,
  };
  const approvalStatus = user.approvalStatus ?? user.approval_status;
  if (approvalStatus) result.approvalStatus = approvalStatus;
  return result;
}

export async function register(req, res) {
  const { email, password, fullName, phone, role, storeName, taxId } = req.body ?? {};

  if (typeof email !== 'string' || email.trim().length > 100
      || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email.trim())) {
    throw httpError(400, 'A valid email of at most 100 characters is required');
  }
  if (typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
    throw httpError(400, 'Password must be 6 to 72 bytes');
  }
  if (typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 100) {
    throw httpError(400, 'Full name is required and must be at most 100 characters');
  }
  if (phone !== undefined && phone !== null && phone !== ''
      && (typeof phone !== 'string' || !/^\d{10}$/.test(phone))) throw httpError(400, 'Phone must be 10 digits');
  if (!['BUYER', 'SELLER'].includes(role)) throw httpError(400, 'Role must be BUYER or SELLER');
  if (role === 'SELLER' && (typeof storeName !== 'string' || !storeName.trim())) {
    throw httpError(400, 'Store name is required for sellers');
  }
  if (role === 'SELLER' && storeName.trim().length > 100) throw httpError(400, 'Store name must be at most 100 characters');
  if (taxId !== undefined && taxId !== null && (typeof taxId !== 'string' || taxId.length > 20)) {
    throw httpError(400, 'taxId must be at most 20 characters');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await withTransaction((conn) => userModel.createUserWithRole(conn, {
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    phone: phone || null,
    passwordHash,
    role,
    ...(role === 'SELLER' ? { storeName: storeName.trim(), taxId: taxId || null } : {}),
  }));
  const userId = user.userId ?? user.user_id ?? user.insertId ?? user;

  return sendSuccess(res, { userId, role }, 201);
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || email.trim().length > 100
      || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email.trim())
      || typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
    throw httpError(400, 'A valid email and password are required');
  }

  const user = await userModel.findByEmail(email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash ?? user.password_hash))) {
    throw httpError(401, 'Invalid email or password');
  }
  if ((user.status ?? 'ACTIVE') === 'BLOCKED') throw httpError(403, 'Account is blocked');

  const userInfo = publicUser(user);
  const token = jwt.sign(
    { userId: userInfo.userId, role: userInfo.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );
  return sendSuccess(res, { token, user: userInfo });
}

export async function me(req, res) {
  const user = await userModel.findById(req.user.userId);
  if (!user) throw httpError(404, 'User not found');
  if ((user.status ?? 'ACTIVE') === 'BLOCKED') throw httpError(403, 'Account is blocked');
  return sendSuccess(res, publicUser(user));
}
