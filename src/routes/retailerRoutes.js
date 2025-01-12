import express from 'express';
import { createRatingAndFeedback } from '../controllers/feedbackController.js';
import { availableCategories, createNewRetailer, currentVersion, editRetailerDetails, getRetailer, getRetailerById, getRetailerHistory, getStoreCategoriesNearMe, getUniqueToken, logoutRetailer, nearBySellers, refreshAccessToken } from '../controllers/retailerController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.route('/').get(getRetailer);
router.route('/retailer-by-id').get(getRetailerById);

router.route('/').post(createNewRetailer);
router.route('/refresh-token').get(refreshAccessToken);
router.route('/logout').patch(protectRoute, logoutRetailer);
router.route('/editretailer').patch(protectRoute, editRetailerDetails);
router.route('/history').get(protectRoute, getRetailerHistory);
router.route('/unique-token').get(protectRoute, getUniqueToken);
router.route('/stores-near-me').get(getStoreCategoriesNearMe);
router.route('/available-categories').get(availableCategories);
router.route('/nearby-stores').get(nearBySellers);
router.route('/current-version').get(currentVersion);

export default router;
