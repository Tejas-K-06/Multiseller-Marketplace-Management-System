import * as couponModel from '../models/couponModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';
import { validateDecimal } from '../middleware/validate.js';

export async function listAll(req, res) {
  return sendSuccess(res, await couponModel.listAll());
}

export async function create(req, res) {
  const body = req.body ?? {};
  if (typeof body.code !== 'string' || !body.code.trim() || body.code.trim().length > 30) {
    throw httpError(400, 'code is required and must be at most 30 characters');
  }
  if (!['PERCENT', 'FLAT'].includes(body.discountType)) {
    throw httpError(400, 'discountType must be PERCENT or FLAT');
  }
  if (typeof body.discountValue !== 'number' || !Number.isFinite(body.discountValue)
      || body.discountValue <= 0 || body.discountValue > 99999999.99) {
    throw httpError(400, 'discountValue must be a positive number');
  }
  validateDecimal(body.discountValue, 2, 'discountValue');
  if (typeof body.validUntil !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.validUntil)) {
    throw httpError(400, 'validUntil must be a date in YYYY-MM-DD format');
  }
  const validDate = new Date(`${body.validUntil}T00:00:00.000Z`);
  if (Number.isNaN(validDate.valueOf()) || validDate.toISOString().slice(0, 10) !== body.validUntil
      || body.validUntil <= new Date().toISOString().slice(0, 10)) {
    throw httpError(400, 'validUntil must be a future date');
  }
  try {
    return sendSuccess(res, await couponModel.create({
      code: body.code.trim(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      validUntil: body.validUntil,
    }), 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'Coupon code already exists');
    throw err;
  }
}

export async function validate(req, res) {
  const code = req.query.code;
  if (typeof code !== 'string' || !code.trim()) throw httpError(400, 'code is required');
  const coupon = await couponModel.findValidByCode(code.trim());
  const validUntil = coupon.validUntil instanceof Date
    ? coupon.validUntil.toISOString().slice(0, 10)
    : String(coupon.validUntil).slice(0, 10);
  return sendSuccess(res, {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    validUntil,
  });
}
