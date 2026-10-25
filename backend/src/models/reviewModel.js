import { pool } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function create({ orderId, buyerId, productId, rating, comment }) {
  const [ok] = await pool.execute(
    `SELECT 1
     FROM orders o
     JOIN order_item oi ON oi.order_id = o.order_id
     JOIN offer f ON f.offer_id = oi.offer_id
     JOIN product_variant v ON v.variant_id = f.variant_id
     WHERE o.order_id = ? AND o.buyer_id = ? AND o.status = 'DELIVERED' AND v.product_id = ?
     LIMIT 1`,
    [orderId, buyerId, productId]
  );

  if (!ok.length) {
    throw httpError(400, 'Product was not purchased in a delivered order');
  }

  const [exists] = await pool.execute(
    'SELECT 1 FROM review WHERE order_id = ? AND product_id = ?',
    [orderId, productId]
  );

  if (exists.length) {
    throw httpError(409, 'Product already reviewed for this order');
  }

  const [result] = await pool.execute(
    'INSERT INTO review (order_id, buyer_id, product_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [orderId, buyerId, productId, rating, comment || null]
  );
  return { reviewId: result.insertId };
}
