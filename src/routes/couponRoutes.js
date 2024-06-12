import express from 'express';
import { createCouponCode, verifyCouponCode } from '../controllers/couponCodeController.js';

const router = express.Router();

router.route('/generate-coupon').post(createCouponCode);
router.route('/verify-coupon').get(verifyCouponCode);

export default router;