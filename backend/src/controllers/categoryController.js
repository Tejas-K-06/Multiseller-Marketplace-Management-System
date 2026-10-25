import * as categoryModel from '../models/categoryModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';
import { positiveInteger } from '../middleware/validate.js';

export async function list(req, res) {
  return sendSuccess(res, await categoryModel.listAll());
}

export async function create(req, res) {
  const { name, parentId } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
    throw httpError(400, 'Category name is required and must be at most 80 characters');
  }
  if (parentId !== undefined && parentId !== null && parentId !== '') {
    positiveInteger(parentId, 'parentId');
  } else if (parentId === '') {
    throw httpError(400, 'parentId must be a positive integer');
  }

  try {
    const category = await categoryModel.create({
      name: name.trim(),
      parentId: parentId == null ? null : Number(parentId),
    });
    return sendSuccess(res, category, 201);
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
      throw httpError(400, 'Parent category not found');
    }
    throw err;
  }
}
