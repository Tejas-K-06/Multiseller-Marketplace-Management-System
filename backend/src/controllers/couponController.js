import * as couponModel from '../models/couponModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

function validateInput(data) {
  const { code, discountType, discountValue, validUntil } = data ?? {};
  if (typeof code !== 'string' || !/^[A-Z0-9_-]{1,30}$/.test(code)) throw httpError(400, 'Code must contain 1-30 uppercase letters, numbers, _ or -');
  if (!['PERCENT', 'FLAT'].includes(discountType)) throw httpError(400, 'Discount type must be PERCENT or FLAT');
  if (typeof discountValue !== 'number' || !Number.isFinite(discountValue) || discountValue <= 0) throw httpError(400, 'Discount value must be positive');
  if (discountType === 'PERCENT' && discountValue > 100) throw httpError(400, 'Percentage discount cannot exceed 100');
  if (typeof validUntil !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) throw httpError(400, 'validUntil must be YYYY-MM-DD');
  return { code, discountType, discountValue, validUntil };
}

export async function list(req, res) {
  return sendSuccess(res, await couponModel.listAll());
}

export async function validate(req, res) {
  const code = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : '';
  if (!code) throw httpError(400, 'Coupon code is required');
  return sendSuccess(res, await couponModel.findValidByCode(code));
}

export async function create(req, res) {
  try {
    return sendSuccess(res, await couponModel.create(validateInput({ ...req.body, code: req.body?.code?.trim().toUpperCase() })), 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'Coupon code already exists');
    throw err;
  }
}
