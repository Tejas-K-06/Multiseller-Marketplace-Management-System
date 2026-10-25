import { pool } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function listByBuyer(buyerId) {
  const [lists] = await pool.execute(
    'SELECT wishlist_id AS wishlistId, name FROM wishlist WHERE buyer_id = ?',
    [buyerId]
  );

  for (const list of lists) {
    const [items] = await pool.execute(
      `SELECT wi.variant_id AS variantId,
              p.product_id AS productId,
              p.title,
              v.size,
              v.colour,
              MIN(o.price) AS fromPrice,
              wi.added_at AS addedAt
       FROM wishlist_item wi
       JOIN product_variant v ON v.variant_id = wi.variant_id
       JOIN product p ON p.product_id = v.product_id
       LEFT JOIN offer o ON o.variant_id = v.variant_id AND o.status = 'ACTIVE'
       WHERE wi.wishlist_id = ?
       GROUP BY wi.variant_id, p.product_id, p.title, v.size, v.colour, wi.added_at`,
      [list.wishlistId]
    );

    list.items = items.map((i) => ({
      ...i,
      fromPrice: i.fromPrice !== null ? Number(i.fromPrice) : null
    }));
  }

  return lists;
}

export async function create(buyerId, name) {
  const [result] = await pool.execute(
    'INSERT INTO wishlist (buyer_id, name) VALUES (?, ?)',
    [buyerId, name]
  );
  return { wishlistId: result.insertId };
}

export async function addItem(wishlistId, buyerId, variantId) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO wishlist_item (wishlist_id, variant_id)
       SELECT ?, ?
       FROM wishlist
       WHERE wishlist_id = ? AND buyer_id = ?`,
      [wishlistId, variantId, wishlistId, buyerId]
    );

    if (!result.affectedRows) {
      throw httpError(404, 'Wishlist not found');
    }

    return { added: true };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw httpError(409, 'Variant already in wishlist');
    }
    throw err;
  }
}

export async function removeItem(wishlistId, buyerId, variantId) {
  const [result] = await pool.execute(
    `DELETE wi
     FROM wishlist_item wi
     JOIN wishlist w ON w.wishlist_id = wi.wishlist_id
     WHERE wi.wishlist_id = ? AND w.buyer_id = ? AND wi.variant_id = ?`,
    [wishlistId, buyerId, variantId]
  );

  if (!result.affectedRows) {
    throw httpError(404, 'Wishlist item not found');
  }

  return { deleted: true };
}
