import { Router } from 'express';
import { validate } from '../controllers/couponController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/validate', verifyToken, requireRole('BUYER'), asyncHandler(validate));

export default router;
