import * as adminModel from '../models/adminModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

const sellerStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

function positiveInteger(value, field) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    throw httpError(400, `${field} must be a positive integer`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw httpError(400, `${field} must be a positive integer`);
  return number;
}

export async function listSellers(req, res) {
  const status = req.query.status;
  if (status !== undefined && !sellerStatuses.includes(status)) throw httpError(400, 'status is invalid');
  return sendSuccess(res, await adminModel.listSellers(status));
}

export async function setSellerApproval(req, res) {
  const sellerId = positiveInteger(req.params.id, 'Seller ID');
  const { status } = req.body ?? {};
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw httpError(400, 'status must be APPROVED or REJECTED');
  }
  const sellers = await adminModel.listSellers();
  if (!sellers.some((seller) => Number(seller.userId ?? seller.user_id) === sellerId)) {
    throw httpError(404, 'Seller not found');
  }
  return sendSuccess(res, await adminModel.setSellerApproval(sellerId, status));
}

export async function listOrders(req, res) {
  return sendSuccess(res, await adminModel.listOrders());
}

export async function stats(req, res) {
  return sendSuccess(res, await adminModel.stats());
}
