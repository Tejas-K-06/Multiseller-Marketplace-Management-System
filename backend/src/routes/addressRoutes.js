import { Router } from 'express';
import { create, list, remove } from '../controllers/addressController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(verifyToken, requireRole('BUYER'));
router.get('/', asyncHandler(list));
router.post('/', asyncHandler(create));
router.delete('/:id', asyncHandler(remove));

export default router;
