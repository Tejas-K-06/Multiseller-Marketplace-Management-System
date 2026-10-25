import { Router } from 'express';
import { cancelOrder, checkout, getOrder, listOrders, pay } from '../controllers/orderController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/checkout', verifyToken, requireRole('BUYER'), asyncHandler(checkout));
router.get('/', verifyToken, requireRole('BUYER'), asyncHandler(listOrders));
router.get('/:id', verifyToken, requireRole('BUYER', 'ADMIN'), asyncHandler(getOrder));
router.put('/:id/cancel', verifyToken, requireRole('BUYER'), asyncHandler(cancelOrder));
router.post('/:id/pay', verifyToken, requireRole('BUYER'), asyncHandler(pay));

export default router;
