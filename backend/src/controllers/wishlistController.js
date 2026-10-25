import * as wishlistModel from '../models/wishlistModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';
import { positiveInteger } from '../middleware/validate.js';

export async function list(req, res) {
  return sendSuccess(res, await wishlistModel.listByBuyer(req.user.userId));
}

export async function create(req, res) {
  const { name } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
    throw httpError(400, 'Wishlist name is required and must be at most 80 characters');
  }
  return sendSuccess(res, await wishlistModel.create(req.user.userId, name.trim()), 201);
}

export async function addItem(req, res) {
  const wishlistId = positiveInteger(req.params.id, 'Wishlist ID');
  const { variantId } = req.body ?? {};
  const id = positiveInteger(variantId, 'variantId');
  try {
    return sendSuccess(res, await wishlistModel.addItem(wishlistId, req.user.userId, id), 201);
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
      throw httpError(404, 'Product variant not found');
    }
    throw err;
  }
}

export async function removeItem(req, res) {
  const wishlistId = positiveInteger(req.params.id, 'Wishlist ID');
  const variantId = positiveInteger(req.params.variantId, 'Variant ID');
  return sendSuccess(res, await wishlistModel.removeItem(wishlistId, req.user.userId, variantId));
}
