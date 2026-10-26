import { Router } from 'express';
import { listOrders, listSellers, setSellerApproval, stats } from '../controllers/adminController.js';
import { requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(verifyToken, requireRole('ADMIN'));
router.get('/sellers', asyncHandler(listSellers));
router.put('/sellers/:sellerId/approval', asyncHandler(setSellerApproval));
router.get('/orders', asyncHandler(listOrders));
router.get('/stats', asyncHandler(stats));

export default router;
