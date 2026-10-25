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

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) throw httpError(400, 'A valid email is required');
  if (typeof password !== 'string' || password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (typeof fullName !== 'string' || !fullName.trim()) throw httpError(400, 'Full name is required');
  if (phone && (typeof phone !== 'string' || !/^\d{10}$/.test(phone))) throw httpError(400, 'Phone must be 10 digits');
  if (!['BUYER', 'SELLER'].includes(role)) throw httpError(400, 'Role must be BUYER or SELLER');
  if (role === 'SELLER' && (typeof storeName !== 'string' || !storeName.trim())) {
    throw httpError(400, 'Store name is required for sellers');
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
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    throw httpError(400, 'Email and password are required');
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
