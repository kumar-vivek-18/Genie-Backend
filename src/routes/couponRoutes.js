import express from 'express';
import { createCouponCode, verifyCouponCode } from '../controllers/couponCodeController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protectRoute);

router.route('/generate-coupon').post(createCouponCode);
router.route('/verify-coupon').get(verifyCouponCode);

export default router;