import * as adminModel from '../models/adminModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

function id(value, field) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw httpError(400, `${field} must be a positive integer`);
  return number;
}

export async function listSellers(req, res) {
  const status = req.query.status || undefined;
  if (status && !statuses.includes(status)) throw httpError(400, 'Invalid seller approval status');
  return sendSuccess(res, await adminModel.listSellers(status));
}

export async function setSellerApproval(req, res) {
  const sellerId = id(req.params.sellerId, 'Seller ID');
  const { status } = req.body ?? {};
  if (!statuses.includes(status)) throw httpError(400, 'Status must be PENDING, APPROVED, or REJECTED');
  const result = await adminModel.setSellerApproval(sellerId, status);
  if (!result) throw httpError(404, 'Seller not found');
  return sendSuccess(res, result);
}

export async function listOrders(req, res) {
  return sendSuccess(res, await adminModel.listOrders());
}

export async function stats(req, res) {
  return sendSuccess(res, await adminModel.stats());
}
