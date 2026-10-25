import { pool } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

const userSelect = `SELECT u.user_id AS userId,
                           u.email,
                           u.full_name AS fullName,
                           u.phone,
                           u.password_hash AS passwordHash,
                           u.role,
                           u.status,
                           s.approval_status AS approvalStatus
                    FROM users u
                    LEFT JOIN seller s ON s.user_id = u.user_id`;

export async function createUserWithRole(conn, { email, fullName, phone, passwordHash, role, storeName, taxId }) {
  const [result] = await conn.execute(
    'INSERT INTO users (email, full_name, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [email, fullName, phone || null, passwordHash, role]
  );
  const userId = result.insertId;

  if (role === 'BUYER') {
    await conn.execute('INSERT INTO buyer (user_id) VALUES (?)', [userId]);
    await conn.execute('INSERT INTO cart (buyer_id) VALUES (?)', [userId]);
  } else if (role === 'SELLER') {
    await conn.execute(
      'INSERT INTO seller (user_id, store_name, tax_id) VALUES (?, ?, ?)',
      [userId, storeName, taxId || null]
    );
  } else {
    throw httpError(400, 'Role must be BUYER or SELLER');
  }

  return { userId, role };
}

export async function findByEmail(email) {
  const [rows] = await pool.execute(`${userSelect} WHERE u.email = ?`, [email]);
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.execute(`${userSelect} WHERE u.user_id = ?`, [id]);
  return rows[0] || null;
}
