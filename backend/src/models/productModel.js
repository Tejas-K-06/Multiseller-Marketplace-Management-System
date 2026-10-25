import { pool } from '../config/db.js';

const n = (v) => (v === null ? null : Number(v));

export async function search({ q, categoryId, limit = 12, offset = 0 } = {}) {
  const params = [];
  let categoryCte = '';

  if (categoryId) {
    categoryCte = `WITH RECURSIVE descendants AS (
      SELECT category_id FROM category WHERE category_id = ?
      UNION ALL
      SELECT c.category_id FROM category c JOIN descendants d ON c.parent_category_id = d.category_id
    )`;
    params.push(categoryId);
  }

  let where = `p.status = 'ACTIVE' AND EXISTS (
    SELECT 1 FROM product_variant pv
    JOIN offer ao ON ao.variant_id = pv.variant_id
    WHERE pv.product_id = p.product_id AND ao.status = 'ACTIVE'
  )`;

  if (categoryId) {
    where += ' AND p.category_id IN (SELECT category_id FROM descendants)';
  }

  if (q) {
    where += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  const from = ` FROM product p
                 JOIN category c ON c.category_id = p.category_id
                 JOIN seller s ON s.user_id = p.seller_id
                 WHERE ${where}`;

  const [count] = await pool.execute(`${categoryCte} SELECT COUNT(*) AS total ${from}`, params);

  const [rows] = await pool.execute(
    `${categoryCte}
     SELECT p.product_id AS productId,
            p.title,
            c.name AS categoryName,
            s.store_name AS storeName,
            MIN(o.price) AS fromPrice,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS avgRating,
            COUNT(DISTINCT r.review_id) AS reviewCount
     FROM product p
     JOIN category c ON c.category_id = p.category_id
     JOIN seller s ON s.user_id = p.seller_id
     JOIN product_variant v ON v.product_id = p.product_id
     JOIN offer o ON o.variant_id = v.variant_id AND o.status = 'ACTIVE'
     LEFT JOIN review r ON r.product_id = p.product_id
     WHERE ${where}
     GROUP BY p.product_id, p.title, c.name, s.store_name
     ORDER BY p.product_id
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return {
    items: rows.map((x) => ({
      ...x,
      fromPrice: n(x.fromPrice),
      avgRating: n(x.avgRating),
      reviewCount: n(x.reviewCount)
    })),
    page: Math.floor(offset / limit) + 1,
    total: count[0].total
  };
}

export async function getDetail(productId) {
  const [products] = await pool.execute(
    `SELECT p.product_id AS productId,
            p.title,
            p.description,
            c.name AS categoryName,
            s.store_name AS storeName,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS avgRating,
            COUNT(r.review_id) AS reviewCount
     FROM product p
     JOIN category c ON c.category_id = p.category_id
     JOIN seller s ON s.user_id = p.seller_id
     LEFT JOIN review r ON r.product_id = p.product_id
     WHERE p.product_id = ?
     GROUP BY p.product_id, p.title, p.description, c.name, s.store_name`,
    [productId]
  );

  if (!products.length) return null;

  const [variants] = await pool.execute(
    'SELECT variant_id AS variantId, sku, size, colour FROM product_variant WHERE product_id = ?',
    [productId]
  );

  for (const variant of variants) {
    const [offers] = await pool.execute(
      `SELECT offer_id AS offerId,
              seller_id AS sellerId,
              price,
              stock_quantity AS stockQuantity,
              cod_eligible AS codEligible
       FROM offer
       WHERE variant_id = ? AND status = 'ACTIVE'`,
      [variant.variantId]
    );

    variant.offers = offers.map((o) => ({
      ...o,
      price: n(o.price),
      codEligible: Boolean(o.codEligible)
    }));
  }

  return {
    ...products[0],
    avgRating: n(products[0].avgRating),
    reviewCount: n(products[0].reviewCount),
    variants
  };
}

export async function listReviews(productId) {
  const [rows] = await pool.execute(
    `SELECT rv.review_id AS reviewId,
            u.full_name AS buyerName,
            rv.rating,
            rv.comment,
            v.is_verified_purchase AS isVerifiedPurchase
     FROM review rv
     JOIN users u ON u.user_id = rv.buyer_id
     JOIN v_review_verified v ON v.review_id = rv.review_id
     WHERE rv.product_id = ?
     ORDER BY rv.review_id DESC`,
    [productId]
  );

  return rows.map((x) => ({
    ...x,
    isVerifiedPurchase: Boolean(x.isVerifiedPurchase)
  }));
}
