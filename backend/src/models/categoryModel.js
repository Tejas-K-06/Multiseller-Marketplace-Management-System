import { pool } from '../config/db.js';

export async function listAll() {
  const [rows] = await pool.execute(
    `SELECT category_id AS categoryId,
            name,
            parent_category_id AS parentId
     FROM category
     ORDER BY name`
  );
  return rows;
}

export async function create({ name, parentId }) {
  const [result] = await pool.execute(
    'INSERT INTO category (name, parent_category_id) VALUES (?, ?)',
    [name, parentId || null]
  );
  return { categoryId: result.insertId };
}
