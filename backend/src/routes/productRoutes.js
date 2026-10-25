import { Router } from 'express';
import { detail, list, reviews } from '../controllers/productController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(list));
router.get('/:id/reviews', asyncHandler(reviews));
router.get('/:id', asyncHandler(detail));

export default router;
