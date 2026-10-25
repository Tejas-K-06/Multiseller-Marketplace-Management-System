import { Router } from 'express';
import { create } from '../controllers/reviewController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', verifyToken, requireRole('BUYER'), asyncHandler(create));

export default router;
