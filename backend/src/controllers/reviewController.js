import * as productModel from '../models/productModel.js';
import * as reviewModel from '../models/reviewModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

function positiveInteger(value, field) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    throw httpError(400, `${field} must be a positive integer`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw httpError(400, `${field} must be a positive integer`);
  return number;
}

export async function create(req, res) {
  const body = req.body ?? {};
  const orderId = positiveInteger(body.orderId, 'orderId');
  const productId = positiveInteger(body.productId, 'productId');
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    throw httpError(400, 'rating must be an integer from 1 to 5');
  }
  if (body.comment !== undefined && body.comment !== null && typeof body.comment !== 'string') {
    throw httpError(400, 'comment must be a string');
  }

  if (!(await productModel.getDetail(productId))) throw httpError(404, 'Product not found');
  const review = await reviewModel.create({
    orderId,
    buyerId: req.user.userId,
    productId,
    rating: body.rating,
    comment: body.comment?.trim() || null,
  });
  return sendSuccess(res, review, 201);
}
