import * as orderModel from '../models/orderModel.js';
import * as paymentModel from '../models/paymentModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

function positive(value, field) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw httpError(400, `${field} must be a positive integer`);
  return number;
}

export async function checkout(req, res) {
  const { addressId, couponCode, paymentMethod } = req.body ?? {};
  if (!['COD', 'UPI', 'CARD', 'NETBANKING'].includes(paymentMethod)) throw httpError(400, 'Invalid payment method');
  if (couponCode !== undefined && couponCode !== null && typeof couponCode !== 'string') throw httpError(400, 'couponCode must be a string');
  return sendSuccess(res, await orderModel.checkout({
    buyerId: req.user.userId,
    addressId: positive(addressId, 'addressId'),
    couponCode: couponCode?.trim().toUpperCase() || null,
    paymentMethod,
  }), 201);
}

export async function list(req, res) {
  return sendSuccess(res, await orderModel.listByBuyer(req.user.userId));
}

export async function detail(req, res) {
  const orderId = positive(req.params.id, 'Order ID');
  const order = await orderModel.getDetail(orderId);
  if (!order) throw httpError(404, 'Order not found');
  const owned = await orderModel.belongsToBuyer(orderId, req.user.userId);
  if (!owned) throw httpError(404, 'Order not found');
  return sendSuccess(res, order);
}

export async function cancel(req, res) {
  const orderId = positive(req.params.id, 'Order ID');
  return sendSuccess(res, await orderModel.cancel(orderId, req.user.userId));
}

export async function pay(req, res) {
  const orderId = positive(req.params.id, 'Order ID');
  const outcome = req.body?.outcome || 'SUCCESS';
  if (!['SUCCESS', 'FAIL'].includes(outcome)) throw httpError(400, 'Outcome must be SUCCESS or FAIL');
  return sendSuccess(res, await paymentModel.simulatePay(orderId, req.user.userId, outcome));
}
