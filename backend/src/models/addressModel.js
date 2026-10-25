import { pool } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function listByUser(userId) {
  const [rows] = await pool.execute(
    `SELECT address_id AS addressId,
            line1,
            city,
            state,
            postal_code AS postalCode,
            is_default AS isDefault
     FROM address
     WHERE user_id = ?
     ORDER BY address_id`,
    [userId]
  );
  return rows.map((r) => ({
    ...r,
    isDefault: Boolean(r.isDefault)
  }));
}

export async function create(userId, data) {
  if (data.isDefault) {
    await pool.execute(
      'UPDATE address SET is_default = FALSE WHERE user_id = ?',
      [userId]
    );
  }

  const [result] = await pool.execute(
    `INSERT INTO address (user_id, line1, city, state, postal_code, is_default)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.line1,
      data.city,
      data.state,
      data.postalCode,
      Boolean(data.isDefault)
    ]
  );
  return { addressId: result.insertId };
}

export async function remove(addressId, userId) {
  const [used] = await pool.execute(
    'SELECT 1 FROM orders WHERE address_id = ? LIMIT 1',
    [addressId]
  );
  if (used.length) {
    throw httpError(409, 'Address is used by an order');
  }

  const [result] = await pool.execute(
    'DELETE FROM address WHERE address_id = ? AND user_id = ?',
    [addressId, userId]
  );
  if (!result.affectedRows) {
    throw httpError(404, 'Address not found');
  }
  return { deleted: true };
}

export async function findForUser(addressId, userId) {
  const [rows] = await pool.execute(
    `SELECT address_id AS addressId,
            line1,
            city,
            state,
            postal_code AS postalCode,
            is_default AS isDefault
     FROM address
     WHERE address_id = ? AND user_id = ?`,
    [addressId, userId]
  );

  if (!rows.length) return null;
  return {
    ...rows[0],
    isDefault: Boolean(rows[0].isDefault)
  };
}
