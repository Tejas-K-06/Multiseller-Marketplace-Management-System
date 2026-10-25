import { pool } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function findValidByCode(code) {
  const [rows] = await pool.execute(
    `SELECT coupon_id AS couponId,
            code,
            discount_type AS discountType,
            discount_value AS discountValue,
            DATE_FORMAT(valid_until, '%Y-%m-%d') AS validUntil
     FROM coupon
     WHERE code = ?`,
    [code]
  );

  if (!rows.length) {
    throw httpError(404, 'Coupon not found');
  }

  const coupon = rows[0];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (new Date(coupon.validUntil) < now) {
    throw httpError(400, 'Coupon has expired');
  }

  return {
    ...coupon,
    discountValue: Number(coupon.discountValue)
  };
}

export async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO coupon (code, discount_type, discount_value, valid_until)
     VALUES (?, ?, ?, ?)`,
    [data.code, data.discountType, data.discountValue, data.validUntil]
  );
  return { couponId: result.insertId };
}

export async function listAll() {
  const [rows] = await pool.execute(
    `SELECT coupon_id AS couponId,
            code,
            discount_type AS discountType,
            discount_value AS discountValue,
            DATE_FORMAT(valid_until, '%Y-%m-%d') AS validUntil
     FROM coupon
     ORDER BY coupon_id`
  );
  return rows.map((r) => ({
    ...r,
    discountValue: Number(r.discountValue)
  }));
}
