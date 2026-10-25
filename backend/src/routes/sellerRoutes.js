import { Router } from 'express';
import {
  addVariant,
  createOffer,
  createProduct,
  listProducts,
  listSubOrders,
  updateOffer,
  updateProduct,
  updateSubOrderStatus,
} from '../controllers/sellerController.js';
import { requireApprovedSeller, requireRole, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(verifyToken, requireRole('SELLER'), requireApprovedSeller);
router.get('/products', asyncHandler(listProducts));
router.post('/products', asyncHandler(createProduct));
router.put('/products/:id', asyncHandler(updateProduct));
router.post('/products/:id/variants', asyncHandler(addVariant));
router.post('/variants/:variantId/offers', asyncHandler(createOffer));
router.put('/offers/:offerId', asyncHandler(updateOffer));
router.get('/sub-orders', asyncHandler(listSubOrders));
router.put('/sub-orders/:id/status', asyncHandler(updateSubOrderStatus));

export default router;
