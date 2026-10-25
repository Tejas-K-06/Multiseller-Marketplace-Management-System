import { Router } from 'express';
import authRoutes from './authRoutes.js';
import addressRoutes from './addressRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import cartRoutes from './cartRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import couponRoutes from './couponRoutes.js';
import adminRoutes from './adminRoutes.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.get('/health', (req, res) => sendSuccess(res, { status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/seller', sellerRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlists', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);

export default router;
