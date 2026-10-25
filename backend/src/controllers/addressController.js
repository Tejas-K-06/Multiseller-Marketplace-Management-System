import * as addressModel from '../models/addressModel.js';
import { httpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  const addresses = await addressModel.listByUser(req.user.userId);
  return sendSuccess(res, addresses);
}

export async function create(req, res) {
  const { line1, city, state, postalCode, isDefault = false } = req.body ?? {};
  if ([line1, city, state, postalCode].some((value) => typeof value !== 'string' || !value.trim())) {
    throw httpError(400, 'Line 1, city, state, and postal code are required');
  }
  if (typeof isDefault !== 'boolean') throw httpError(400, 'isDefault must be a boolean');

  const address = await addressModel.create(req.user.userId, { line1, city, state, postalCode, isDefault });
  const addressId = address.addressId ?? address.address_id ?? address.insertId ?? address;
  return sendSuccess(res, { addressId }, 201);
}

export async function remove(req, res) {
  const addressId = Number(req.params.id);
  if (!Number.isInteger(addressId) || addressId < 1) throw httpError(400, 'Address ID must be a positive integer');

  try {
    const removed = await addressModel.remove(addressId, req.user.userId);
    if (!removed || removed.affectedRows === 0) throw httpError(404, 'Address not found');
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      throw httpError(409, 'Address is used by an order');
    }
    throw err;
  }
  return sendSuccess(res, { removed: true });
}
