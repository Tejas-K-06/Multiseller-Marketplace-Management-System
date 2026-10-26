import * as reviewModel from '../models/reviewModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

export async function create(req, res) {
  const { orderId, productId, rating, comment } = req.body ?? {};
  if (!Number.isSafeInteger(Number(orderId)) || Number(orderId) < 1) throw httpError(400, 'orderId must be a positive integer');
  if (!Number.isSafeInteger(Number(productId)) || Number(productId) < 1) throw httpError(400, 'productId must be a positive integer');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw httpError(400, 'rating must be an integer from 1 to 5');
  if (comment !== undefined && comment !== null && typeof comment !== 'string') throw httpError(400, 'comment must be a string');
  return sendSuccess(res, await reviewModel.create({ orderId: Number(orderId), buyerId: req.user.userId, productId: Number(productId), rating, comment: comment?.trim() }), 201);
}
