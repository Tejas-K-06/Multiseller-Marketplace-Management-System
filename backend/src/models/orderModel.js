import { pool, withTransaction } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function checkout({ buyerId, addressId, couponCode, paymentMethod }) {
  return withTransaction(async (conn) => {
    const [address] = await conn.execute(
      'SELECT 1 FROM address WHERE address_id = ? AND user_id = ?',
      [addressId, buyerId]
    );
    if (!address.length) {
      throw httpError(400, 'Address does not belong to buyer');
    }

    const [lines] = await conn.execute(
      `SELECT ci.offer_id AS offerId,
              ci.quantity,
              o.seller_id AS sellerId,
              o.price,
              o.stock_quantity AS stockQuantity,
              o.cod_eligible AS codEligible,
              p.title
       FROM cart c
       JOIN cart_item ci ON ci.cart_id = c.cart_id
       JOIN offer o ON o.offer_id = ci.offer_id
       JOIN product_variant v ON v.variant_id = o.variant_id
       JOIN product p ON p.product_id = v.product_id
       WHERE c.buyer_id = ?
       FOR UPDATE`,
      [buyerId]
    );

    if (!lines.length) {
      throw httpError(400, 'Cart is empty');
    }

    for (const item of lines) {
      if (item.quantity > item.stockQuantity) {
        throw httpError(409, `Insufficient stock for '${item.title}'`);
      }
    }

    if (paymentMethod === 'COD' && lines.some((item) => !item.codEligible)) {
      throw httpError(400, 'COD is not available for every item');
    }

    let coupon = null;
    if (couponCode) {
      const [r] = await conn.execute(
        'SELECT coupon_id AS couponId, discount_type AS discountType, discount_value AS discountValue FROM coupon WHERE code = ? AND valid_until >= CURRENT_DATE',
        [couponCode]
      );
      if (!r.length) {
        throw httpError(400, 'Coupon is invalid or expired');
      }
      coupon = r[0];
    }

    const subtotal = lines.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
    const discount = coupon
      ? coupon.discountType === 'PERCENT'
        ? Math.round(subtotal * Number(coupon.discountValue)) / 100
        : Number(coupon.discountValue)
      : 0;
    const total = Math.max(subtotal - discount, 0);

    const [order] = await conn.execute(
      'INSERT INTO orders (buyer_id, address_id, coupon_id) VALUES (?, ?, ?)',
      [buyerId, addressId, coupon?.couponId || null]
    );

    const sellerSubOrderMap = new Map();
    for (const item of lines) {
      if (!sellerSubOrderMap.has(item.sellerId)) {
        const [so] = await conn.execute(
          'INSERT INTO sub_orders (order_id, seller_id) VALUES (?, ?)',
          [order.insertId, item.sellerId]
        );
        sellerSubOrderMap.set(item.sellerId, so.insertId);
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const item = lines[i];
      await conn.execute(
        'INSERT INTO order_item (order_id, item_number, sub_order_id, offer_id, quantity, unit_price_snapshot) VALUES (?, ?, ?, ?, ?, ?)',
        [order.insertId, i + 1, sellerSubOrderMap.get(item.sellerId), item.offerId, item.quantity, item.price]
      );
      await conn.execute(
        'UPDATE offer SET stock_quantity = stock_quantity - ? WHERE offer_id = ?',
        [item.quantity, item.offerId]
      );
    }

    const [pay] = await conn.execute(
      'INSERT INTO payment (order_id, amount, method) VALUES (?, ?, ?)',
      [order.insertId, total, paymentMethod]
    );

    await conn.execute(
      'DELETE ci FROM cart_item ci JOIN cart c ON c.cart_id = ci.cart_id WHERE c.buyer_id = ?',
      [buyerId]
    );

    return {
      orderId: order.insertId,
      subtotal,
      discount,
      totalAmount: total,
      paymentId: pay.insertId,
      paymentStatus: 'PENDING'
    };
  });
}

export async function listByBuyer(buyerId) {
  const [rows] = await pool.execute(
    `SELECT o.order_id AS orderId,
            DATE_FORMAT(o.order_date, '%Y-%m-%d') AS orderDate,
            o.status,
            t.total_amount AS totalAmount,
            p.status AS paymentStatus,
            COUNT(oi.item_number) AS itemCount
     FROM orders o
     JOIN v_order_totals t ON t.order_id = o.order_id
     JOIN payment p ON p.order_id = o.order_id
     JOIN order_item oi ON oi.order_id = o.order_id
     WHERE o.buyer_id = ?
     GROUP BY o.order_id, o.order_date, o.status, t.total_amount, p.status
     ORDER BY o.order_id DESC`,
    [buyerId]
  );
  return rows.map((r) => ({
    ...r,
    totalAmount: Number(r.totalAmount)
  }));
}

export async function getDetail(orderId) {
  const [orders] = await pool.execute(
    `SELECT o.order_id AS orderId,
            DATE_FORMAT(o.order_date, '%Y-%m-%d') AS orderDate,
            o.status,
            a.line1,
            a.city,
            a.state,
            a.postal_code AS postalCode,
            t.subtotal,
            t.discount,
            t.total_amount AS totalAmount
     FROM orders o
     JOIN address a ON a.address_id = o.address_id
     JOIN v_order_totals t ON t.order_id = o.order_id
     WHERE o.order_id = ?`,
    [orderId]
  );

  if (!orders.length) return null;
  const order = orders[0];

  const [payments] = await pool.execute(
    `SELECT payment_id AS paymentId,
            method,
            status,
            paid_at AS paidAt
     FROM payment
     WHERE order_id = ?`,
    [orderId]
  );

  const [subOrders] = await pool.execute(
    `SELECT so.sub_order_id AS subOrderId,
            s.store_name AS storeName,
            so.status,
            sh.tracking_number AS trackingNumber
     FROM sub_orders so
     JOIN seller s ON s.user_id = so.seller_id
     LEFT JOIN shipment sh ON sh.sub_order_id = so.sub_order_id
     WHERE so.order_id = ?
     ORDER BY so.sub_order_id`,
    [orderId]
  );

  const [items] = await pool.execute(
    `SELECT oi.sub_order_id AS subOrderId,
            oi.item_number AS itemNumber,
            p.product_id AS productId,
            p.title,
            oi.quantity,
            oi.unit_price_snapshot AS unitPrice,
            (oi.quantity * oi.unit_price_snapshot) AS lineTotal,
            CASE WHEN r.review_id IS NOT NULL THEN TRUE ELSE FALSE END AS reviewed
     FROM order_item oi
     JOIN offer o ON o.offer_id = oi.offer_id
     JOIN product_variant v ON v.variant_id = o.variant_id
     JOIN product p ON p.product_id = v.product_id
     LEFT JOIN review r ON r.order_id = oi.order_id AND r.product_id = p.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.item_number`,
    [orderId]
  );

  const subOrderMap = new Map();
  for (const so of subOrders) {
    subOrderMap.set(so.subOrderId, {
      subOrderId: so.subOrderId,
      storeName: so.storeName,
      status: so.status,
      trackingNumber: so.trackingNumber || null,
      items: []
    });
  }

  for (const item of items) {
    const parentSo = subOrderMap.get(item.subOrderId);
    if (parentSo) {
      parentSo.items.push({
        itemNumber: item.itemNumber,
        productId: item.productId,
        title: item.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        reviewed: Boolean(item.reviewed)
      });
    }
  }

  const payment = payments[0]
    ? {
        paymentId: payments[0].paymentId,
        method: payments[0].method,
        status: payments[0].status,
        paidAt: payments[0].paidAt
      }
    : null;

  return {
    orderId: order.orderId,
    orderDate: order.orderDate,
    status: order.status,
    address: {
      line1: order.line1,
      city: order.city,
      state: order.state,
      postalCode: order.postalCode
    },
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    totalAmount: Number(order.totalAmount),
    payment,
    subOrders: Array.from(subOrderMap.values())
  };
}

export async function cancel(orderId, buyerId) {
  return withTransaction(async (conn) => {
    const [order] = await conn.execute(
      'SELECT 1 FROM orders WHERE order_id = ? AND buyer_id = ? FOR UPDATE',
      [orderId, buyerId]
    );
    if (!order.length) {
      throw httpError(404, 'Order not found');
    }

    const [bad] = await conn.execute(
      "SELECT 1 FROM sub_orders WHERE order_id = ? AND status <> 'PENDING' LIMIT 1",
      [orderId]
    );
    if (bad.length) {
      throw httpError(400, 'Order can no longer be cancelled');
    }

    const [items] = await conn.execute(
      'SELECT offer_id AS offerId, quantity FROM order_item WHERE order_id = ?',
      [orderId]
    );
    for (const item of items) {
      await conn.execute(
        'UPDATE offer SET stock_quantity = stock_quantity + ? WHERE offer_id = ?',
        [item.quantity, item.offerId]
      );
    }

    await conn.execute(
      "UPDATE sub_orders SET status = 'CANCELLED' WHERE order_id = ?",
      [orderId]
    );
    await conn.execute(
      "UPDATE orders SET status = 'CANCELLED' WHERE order_id = ?",
      [orderId]
    );
    await conn.execute(
      "UPDATE payment SET status = 'REFUNDED' WHERE order_id = ? AND method <> 'COD'",
      [orderId]
    );

    return { orderId, status: 'CANCELLED' };
  });
}
