import { Router } from 'express';
import { create, list, validate } from '../controllers/couponController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', verifyToken, requireRole('ADMIN'), asyncHandler(list));
router.get('/validate', verifyToken, requireRole('BUYER'), asyncHandler(validate));
router.post('/', verifyToken, requireRole('ADMIN'), asyncHandler(create));

export default router;
