import { Router } from 'express';
import { create, listAll, validate } from '../controllers/couponController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/validate', verifyToken, requireRole('BUYER'), asyncHandler(validate));
router.get('/', verifyToken, requireRole('ADMIN'), asyncHandler(listAll));
router.post('/', verifyToken, requireRole('ADMIN'), asyncHandler(create));

export default router;
