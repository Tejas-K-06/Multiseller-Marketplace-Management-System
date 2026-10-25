import * as productModel from '../models/productModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';
import { positiveInteger } from '../middleware/validate.js';

export async function list(req, res) {
  const { q } = req.query;
  if (q !== undefined && typeof q !== 'string') throw httpError(400, 'q must be a string');

  const page = req.query.page === undefined ? 1 : positiveInteger(req.query.page, 'page');
  const limit = req.query.limit === undefined ? 12 : positiveInteger(req.query.limit, 'limit');
  if (limit > 100) throw httpError(400, 'limit cannot be greater than 100');
  const offset = (page - 1) * limit;
  if (!Number.isSafeInteger(offset)) throw httpError(400, 'page is too large');
  const categoryId = req.query.categoryId === undefined
    ? undefined
    : positiveInteger(req.query.categoryId, 'categoryId');

  const products = await productModel.search({
    q: q?.trim() || undefined,
    categoryId,
    limit,
    offset,
  });
  return sendSuccess(res, products);
}

export async function detail(req, res) {
  const productId = positiveInteger(req.params.id, 'Product ID');
  const product = await productModel.getDetail(productId);
  if (!product) throw httpError(404, 'Product not found');
  return sendSuccess(res, product);
}

export async function reviews(req, res) {
  const productId = positiveInteger(req.params.id, 'Product ID');
  if (!(await productModel.getDetail(productId))) throw httpError(404, 'Product not found');
  return sendSuccess(res, await productModel.listReviews(productId));
}
