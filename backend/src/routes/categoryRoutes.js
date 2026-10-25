import { Router } from 'express';
import { create, list } from '../controllers/categoryController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(list));
router.post('/', verifyToken, requireRole('ADMIN'), asyncHandler(create));

export default router;
