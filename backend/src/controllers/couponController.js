import * as couponModel from '../models/couponModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

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
