import { Router } from 'express';
import { cancel, checkout, detail, list, pay } from '../controllers/orderController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(verifyToken, requireRole('BUYER'));
router.post('/checkout', asyncHandler(checkout));
router.get('/', asyncHandler(list));
router.get('/:id', asyncHandler(detail));
router.put('/:id/cancel', asyncHandler(cancel));
router.post('/:id/pay', asyncHandler(pay));

export default router;
