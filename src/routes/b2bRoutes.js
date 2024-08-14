import express from 'express';
import { allApprovedRetailers, blockRetailers, getUnApprovedRetailers, rejectRetailers, verifyDocument, approveRetailers } from '../controllers/b2bController.js';

const router = express.Router();

router.route('/unapproved-retailers').get(getUnApprovedRetailers);
router.route('/approved-retailers').get(allApprovedRetailers);
router.route('/approve-retailer').patch(approveRetailers);
router.route('/reject-retailer').patch(rejectRetailers);
router.route('/block-retailer').patch(blockRetailers);
router.route('/verify-retailer-document').patch(verifyDocument);

export default router;