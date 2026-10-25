import { httpError } from '../utils/httpError.js';

export function positiveInteger(value, field) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    throw httpError(400, `${field} must be a positive integer`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > 2147483647) {
    throw httpError(400, `${field} must be a positive integer`);
  }
  return number;
}

export function validateDecimal(value, places, field) {
  if (typeof value !== 'number' || !Number.isFinite(value)
      || Math.round(value * (10 ** places)) / (10 ** places) !== value) {
    throw httpError(400, `${field} must have at most ${places} decimal places`);
  }
  return value;
}

export function validateBodyShape(req, res, next) {
  if (req.body !== undefined && (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return next(httpError(400, 'Request body must be a JSON object'));
  }
  return next();
}
