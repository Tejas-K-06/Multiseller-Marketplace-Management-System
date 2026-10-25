import * as cartModel from '../models/cartModel.js';
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

export async function getCart(req, res) {
  return sendSuccess(res, await cartModel.getCart(req.user.userId));
}

export async function addItem(req, res) {
  const { offerId, quantity } = req.body ?? {};
  const id = positiveInteger(offerId, 'offerId');
  const qty = positiveInteger(quantity, 'quantity');
  const cart = await cartModel.addItem(req.user.userId, id, qty);
  return sendSuccess(res, cart, 201);
}

export async function setQuantity(req, res) {
  const lineNo = positiveInteger(req.params.lineNo, 'lineNo');
  const quantity = positiveInteger(req.body?.quantity, 'quantity');
  const buyerId = req.user.userId;
  const cart = await cartModel.getCart(buyerId);
  const item = cart.items.find((entry) => Number(entry.lineNo) === lineNo);
  if (!item) throw httpError(404, 'Cart item not found');
  if (quantity > Number(item.stockQuantity)) throw httpError(400, 'Quantity exceeds stock');
  if (quantity === Number(item.quantity)) return sendSuccess(res, cart);

  return sendSuccess(res, await cartModel.setQuantity(buyerId, lineNo, quantity));
}

export async function removeItem(req, res) {
  const lineNo = positiveInteger(req.params.lineNo, 'lineNo');
  return sendSuccess(res, await cartModel.removeItem(req.user.userId, lineNo));
}
