import { pool, withTransaction } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function getCart(buyerId) {
  const [carts] = await pool.execute(
    'SELECT cart_id AS cartId FROM cart WHERE buyer_id = ?',
    [buyerId]
  );
  if (!carts.length) {
    throw httpError(404, 'Cart not found');
  }

  const cartId = carts[0].cartId;
  const [items] = await pool.execute(
    `SELECT ci.line_no AS lineNo,
            ci.offer_id AS offerId,
            p.title,
            v.size,
            v.colour,
            s.store_name AS storeName,
            o.price,
            ci.quantity,
            o.stock_quantity AS stockQuantity,
            (ci.quantity * o.price) AS lineTotal
     FROM cart_item ci
     JOIN offer o ON o.offer_id = ci.offer_id
     JOIN product_variant v ON v.variant_id = o.variant_id
     JOIN product p ON p.product_id = v.product_id
     JOIN seller s ON s.user_id = o.seller_id
     WHERE ci.cart_id = ?
     ORDER BY ci.line_no`,
    [cartId]
  );

  const [totals] = await pool.execute(
    'SELECT estimated_total AS estimatedTotal FROM v_cart_total WHERE cart_id = ?',
    [cartId]
  );

  return {
    cartId,
    items: items.map((i) => ({
      ...i,
      price: Number(i.price),
      lineTotal: Number(i.lineTotal)
    })),
    estimatedTotal: Number(totals[0]?.estimatedTotal || 0)
  };
}

export async function addItem(buyerId, offerId, qty) {
  await withTransaction(async (conn) => {
    const [cart] = await conn.execute(
      'SELECT cart_id AS cartId FROM cart WHERE buyer_id = ? FOR UPDATE',
      [buyerId]
    );
    if (!cart.length) {
      throw httpError(404, 'Cart not found');
    }

    const [offer] = await conn.execute(
      "SELECT stock_quantity AS stockQuantity, status FROM offer WHERE offer_id = ? FOR UPDATE",
      [offerId]
    );

    if (!offer.length || offer[0].status !== 'ACTIVE' || offer[0].stockQuantity < qty) {
      throw httpError(400, 'Offer is unavailable or has insufficient stock');
    }

    const [existing] = await conn.execute(
      'SELECT quantity, line_no AS lineNo FROM cart_item WHERE cart_id = ? AND offer_id = ?',
      [cart[0].cartId, offerId]
    );

    if (existing.length) {
      if (existing[0].quantity + qty > offer[0].stockQuantity) {
        throw httpError(400, 'Quantity exceeds stock');
      }
      await conn.execute(
        'UPDATE cart_item SET quantity = quantity + ? WHERE cart_id = ? AND line_no = ?',
        [qty, cart[0].cartId, existing[0].lineNo]
      );
    } else {
      const [line] = await conn.execute(
        'SELECT COALESCE(MAX(line_no), 0) + 1 AS lineNo FROM cart_item WHERE cart_id = ?',
        [cart[0].cartId]
      );
      await conn.execute(
        'INSERT INTO cart_item (cart_id, line_no, offer_id, quantity) VALUES (?, ?, ?, ?)',
        [cart[0].cartId, line[0].lineNo, offerId, qty]
      );
    }
  });

  return getCart(buyerId);
}

export async function setQuantity(buyerId, lineNo, qty) {
  const [result] = await pool.execute(
    `UPDATE cart_item ci
     JOIN cart c ON c.cart_id = ci.cart_id
     JOIN offer o ON o.offer_id = ci.offer_id
     SET ci.quantity = ?
     WHERE c.buyer_id = ? AND ci.line_no = ? AND ? <= o.stock_quantity`,
    [qty, buyerId, lineNo, qty]
  );

  if (!result.affectedRows) {
    throw httpError(400, 'Cart line not found or quantity exceeds stock');
  }

  return getCart(buyerId);
}

export async function removeItem(buyerId, lineNo) {
  const [result] = await pool.execute(
    `DELETE ci
     FROM cart_item ci
     JOIN cart c ON c.cart_id = ci.cart_id
     WHERE c.buyer_id = ? AND ci.line_no = ?`,
    [buyerId, lineNo]
  );

  if (!result.affectedRows) {
    throw httpError(404, 'Cart item not found');
  }

  return getCart(buyerId);
}
