import { pool } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function simulatePay(orderId, buyerId, outcome = 'SUCCESS') {
  const [rows] = await pool.execute(
    `SELECT p.payment_id AS paymentId,
            p.method,
            p.status
     FROM payment p
     JOIN orders o ON o.order_id = p.order_id
     WHERE p.order_id = ? AND o.buyer_id = ?`,
    [orderId, buyerId]
  );

  if (!rows.length) {
    throw httpError(404, 'Payment not found');
  }

  const payment = rows[0];
  if (payment.method === 'COD' || payment.status === 'SUCCESS' || payment.status === 'REFUNDED') {
    throw httpError(400, 'Payment cannot be processed');
  }

  const status = outcome === 'FAIL' ? 'FAILED' : 'SUCCESS';
  await pool.execute(
    `UPDATE payment
     SET status = ?,
         paid_at = CASE WHEN ? = 'SUCCESS' THEN CURRENT_TIMESTAMP ELSE NULL END
     WHERE payment_id = ?`,
    [status, status, payment.paymentId]
  );

  const [updated] = await pool.execute(
    'SELECT payment_id AS paymentId, status, paid_at AS paidAt FROM payment WHERE payment_id = ?',
    [payment.paymentId]
  );
  return updated[0];
}
