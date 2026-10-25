import { pool } from '../config/db.js';
export async function listAll(){const [r]=await pool.execute('SELECT category_id AS categoryId,name,parent_category_id AS parentId FROM category ORDER BY name');return r;}
export async function create({name,parentId}){const [r]=await pool.execute('INSERT INTO category (name,parent_category_id) VALUES (?,?)',[name,parentId||null]);return {categoryId:r.insertId};}
