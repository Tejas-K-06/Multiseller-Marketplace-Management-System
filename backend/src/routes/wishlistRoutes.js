import { Router } from 'express';
import { addItem, create, list, removeItem } from '../controllers/wishlistController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(verifyToken, requireRole('BUYER'));
router.get('/', asyncHandler(list));
router.post('/', asyncHandler(create));
router.post('/:id/items', asyncHandler(addItem));
router.delete('/:id/items/:variantId', asyncHandler(removeItem));

export default router;
