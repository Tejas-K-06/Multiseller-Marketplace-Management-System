import * as orderModel from '../models/orderModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

const paymentMethods = ['COD', 'UPI', 'CARD', 'NETBANKING'];

function positiveInteger(value, field) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    throw httpError(400, `${field} must be a positive integer`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw httpError(400, `${field} must be a positive integer`);
  return number;
}

export async function checkout(req, res) {
  const body = req.body ?? {};
  const addressId = positiveInteger(body.addressId, 'addressId');
  if (!paymentMethods.includes(body.paymentMethod)) throw httpError(400, 'paymentMethod is invalid');
  let couponCode;
  if (body.couponCode !== undefined) {
    if (typeof body.couponCode !== 'string' || !body.couponCode.trim() || body.couponCode.trim().length > 30) {
      throw httpError(400, 'couponCode must be a non-empty string of at most 30 characters');
    }
    couponCode = body.couponCode.trim();
  }

  const result = await orderModel.checkout({
    buyerId: req.user.userId,
    addressId,
    couponCode,
    paymentMethod: body.paymentMethod,
  });
  return sendSuccess(res, result, 201);
}

export async function listOrders(req, res) {
  return sendSuccess(res, await orderModel.listByBuyer(req.user.userId));
}

export async function getOrder(req, res) {
  const orderId = positiveInteger(req.params.id, 'Order ID');
  if (req.user.role !== 'ADMIN') {
    const orders = await orderModel.listByBuyer(req.user.userId);
    if (!orders.some((order) => Number(order.orderId ?? order.order_id) === orderId)) {
      throw httpError(404, 'Order not found');
    }
  }
  const order = await orderModel.getDetail(orderId);
  if (!order) throw httpError(404, 'Order not found');
  return sendSuccess(res, order);
}

export async function cancelOrder(req, res) {
  const orderId = positiveInteger(req.params.id, 'Order ID');
  return sendSuccess(res, await orderModel.cancel(orderId, req.user.userId));
}
