import * as sellerModel from '../models/sellerModel.js';
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

function databaseError(err) {
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return httpError(400, 'Referenced category not found');
  }
  return err;
}

export async function listProducts(req, res) {
  return sendSuccess(res, await sellerModel.listProducts(req.user.userId));
}

export async function createProduct(req, res) {
  const { categoryId, title, description } = req.body ?? {};
  if (categoryId === undefined) throw httpError(400, 'categoryId is required');
  const id = positiveInteger(categoryId, 'categoryId');
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 150) {
    throw httpError(400, 'Title is required and must be at most 150 characters');
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    throw httpError(400, 'description must be a string');
  }

  try {
    const product = await sellerModel.createProduct(req.user.userId, {
      categoryId: id,
      title: title.trim(),
      description: description?.trim() || null,
    });
    return sendSuccess(res, product, 201);
  } catch (err) {
    throw databaseError(err);
  }
}

export async function updateProduct(req, res) {
  const productId = positiveInteger(req.params.id, 'Product ID');
  const body = req.body ?? {};
  const update = {};
  const fields = ['categoryId', 'title', 'description', 'status'];
  if (!fields.some((field) => Object.hasOwn(body, field))) throw httpError(400, 'No product fields supplied');

  if (Object.hasOwn(body, 'categoryId')) update.categoryId = positiveInteger(body.categoryId, 'categoryId');
  if (Object.hasOwn(body, 'title')) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 150) {
      throw httpError(400, 'Title must be non-empty and at most 150 characters');
    }
    update.title = body.title.trim();
  }
  if (Object.hasOwn(body, 'description')) {
    if (body.description !== null && typeof body.description !== 'string') {
      throw httpError(400, 'description must be a string');
    }
    update.description = body.description?.trim() ?? null;
  }
  if (Object.hasOwn(body, 'status')) {
    if (!['ACTIVE', 'INACTIVE'].includes(body.status)) throw httpError(400, 'status must be ACTIVE or INACTIVE');
    update.status = body.status;
  }

  const products = await sellerModel.listProducts(req.user.userId);
  if (!products.some((product) => Number(product.productId ?? product.product_id) === productId)) {
    throw httpError(404, 'Product not found');
  }
  try {
    await sellerModel.updateProduct(productId, req.user.userId, update);
    return sendSuccess(res, { updated: true });
  } catch (err) {
    throw databaseError(err);
  }
}

export async function addVariant(req, res) {
  const productId = positiveInteger(req.params.id, 'Product ID');
  const { sku, size, colour, weightKg } = req.body ?? {};
  if (typeof sku !== 'string' || !sku.trim() || sku.trim().length > 40) {
    throw httpError(400, 'SKU is required and must be at most 40 characters');
  }
  if (size != null && (typeof size !== 'string' || size.length > 20)) throw httpError(400, 'size must be at most 20 characters');
  if (colour != null && (typeof colour !== 'string' || colour.length > 30)) throw httpError(400, 'colour must be at most 30 characters');
  if (weightKg != null && (typeof weightKg !== 'number' || !Number.isFinite(weightKg) || weightKg < 0 || weightKg > 999.999)) {
    throw httpError(400, 'weightKg must be between 0 and 999.999');
  }

  try {
    const variant = await sellerModel.addVariant(productId, req.user.userId, {
      sku: sku.trim(), size: size?.trim() || null, colour: colour?.trim() || null, weightKg: weightKg ?? null,
    });
    return sendSuccess(res, variant, 201);
  } catch (err) {
    throw databaseError(err);
  }
}

export async function createOffer(req, res) {
  const variantId = positiveInteger(req.params.variantId, 'Variant ID');
  const { price, stockQuantity, codEligible = true } = req.body ?? {};
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0 || price > 99999999.99) {
    throw httpError(400, 'price must be a positive number');
  }
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw httpError(400, 'stockQuantity must be a non-negative integer');
  }
  if (typeof codEligible !== 'boolean') throw httpError(400, 'codEligible must be a boolean');

  try {
    const offer = await sellerModel.upsertOffer(variantId, req.user.userId, { price, stockQuantity, codEligible });
    return sendSuccess(res, offer, 201);
  } catch (err) {
    throw databaseError(err);
  }
}

export async function updateOffer(req, res) {
  const offerId = positiveInteger(req.params.offerId, 'Offer ID');
  const body = req.body ?? {};
  const update = {};
  const fields = ['price', 'stockQuantity', 'status', 'codEligible'];
  if (!fields.some((field) => Object.hasOwn(body, field))) throw httpError(400, 'No offer fields supplied');

  if (Object.hasOwn(body, 'price')) {
    if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0 || body.price > 99999999.99) {
      throw httpError(400, 'price must be a positive number');
    }
    update.price = body.price;
  }
  if (Object.hasOwn(body, 'stockQuantity')) {
    if (!Number.isInteger(body.stockQuantity) || body.stockQuantity < 0) {
      throw httpError(400, 'stockQuantity must be a non-negative integer');
    }
    update.stock = body.stockQuantity;
  }
  if (Object.hasOwn(body, 'status')) {
    if (!['ACTIVE', 'INACTIVE'].includes(body.status)) throw httpError(400, 'status must be ACTIVE or INACTIVE');
    update.status = body.status;
  }
  if (Object.hasOwn(body, 'codEligible')) {
    if (typeof body.codEligible !== 'boolean') throw httpError(400, 'codEligible must be a boolean');
    update.codEligible = body.codEligible;
  }

  const result = await sellerModel.updateOffer(offerId, req.user.userId, update);
  if (!result.updated) throw httpError(404, 'Offer not found');
  return sendSuccess(res, { updated: true });
}
