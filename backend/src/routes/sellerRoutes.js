import { Router } from 'express';
import {
  addVariant,
  createOffer,
  createProduct,
  listProducts,
  updateOffer,
  updateProduct,
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

export default router;
