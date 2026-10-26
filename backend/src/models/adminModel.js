import { pool } from '../config/db.js';

export async function listSellers(status) {
  let sql = `SELECT s.user_id AS userId,
                    s.store_name AS storeName,
                    u.email,
                    s.tax_id AS taxId,
                    s.approval_status AS approvalStatus
             FROM seller s
             JOIN users u ON u.user_id = s.user_id`;
  const params = [];

  if (status) {
    sql += ' WHERE s.approval_status = ?';
    params.push(status);
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function setSellerApproval(sellerId, status) {
  const [result] = await pool.execute(
    'UPDATE seller SET approval_status = ? WHERE user_id = ?',
    [status, sellerId]
  );
  if (!result.affectedRows) return null;
  return { userId: sellerId, approvalStatus: status };
}

export async function listOrders() {
  const [rows] = await pool.execute(
    `SELECT o.order_id AS orderId,
            u.full_name AS buyerName,
            DATE_FORMAT(o.order_date, '%Y-%m-%d') AS orderDate,
            o.status,
            t.total_amount AS totalAmount
     FROM orders o
     JOIN users u ON u.user_id = o.buyer_id
     JOIN v_order_totals t ON t.order_id = o.order_id
     ORDER BY o.order_id DESC`
  );
  return rows.map((r) => ({
    ...r,
    totalAmount: Number(r.totalAmount)
  }));
}

export async function stats() {
  const [usersCount] = await pool.execute('SELECT COUNT(*) AS count FROM users');
  const [sellersCount] = await pool.execute('SELECT COUNT(*) AS count FROM seller');
  const [productsCount] = await pool.execute('SELECT COUNT(*) AS count FROM product');
  const [ordersCount] = await pool.execute('SELECT COUNT(*) AS count FROM orders');

  const [revRows] = await pool.execute(
    `SELECT COALESCE(SUM(t.total_amount), 0) AS revenue
     FROM orders o
     JOIN v_order_totals t ON t.order_id = o.order_id
     WHERE o.status = 'DELIVERED'`
  );

  const [topRows] = await pool.execute(
    `SELECT s.store_name AS storeName,
            COALESCE(SUM(sp.seller_payable), 0) AS revenue
     FROM seller s
     LEFT JOIN sub_orders so ON so.seller_id = s.user_id AND so.status = 'DELIVERED'
     LEFT JOIN v_seller_payable sp ON sp.sub_order_id = so.sub_order_id
     GROUP BY s.user_id, s.store_name
     ORDER BY revenue DESC
     LIMIT 5`
  );

  return {
    users: usersCount[0].count,
    sellers: sellersCount[0].count,
    products: productsCount[0].count,
    orders: ordersCount[0].count,
    revenue: Number(revRows[0].revenue),
    topSellers: topRows.map((r) => ({
      storeName: r.storeName,
      revenue: Number(r.revenue)
    }))
  };
}
