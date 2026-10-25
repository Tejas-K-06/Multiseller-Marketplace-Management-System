import { Router } from 'express';
import { addItem, getCart, removeItem, setQuantity } from '../controllers/cartController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(verifyToken, requireRole('BUYER'));
router.get('/', asyncHandler(getCart));
router.post('/items', asyncHandler(addItem));
router.put('/items/:lineNo', asyncHandler(setQuantity));
router.delete('/items/:lineNo', asyncHandler(removeItem));

export default router;
