import express from 'express';
import { createRatingAndFeedback } from '../controllers/feedbackController.js';
import { createNewRetailer, editRetailerDetails, getRetailer, getRetailerHistory, getStoreCategoriesNearMe, getUniqueToken, logoutRetailer, refreshAccessToken } from '../controllers/retailerController.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.route('/').get(getRetailer);
router.route('/').post(createNewRetailer);
router.route('/refresh-token').get(refreshAccessToken);
router.route('/logout').patch(protectRoute, logoutRetailer);
router.route('/editretailer').patch(protectRoute, editRetailerDetails);
router.route('/history').get(protectRoute, getRetailerHistory);
router.route('/unique-token').get(protectRoute, getUniqueToken);
router.route('/stores-near-me').get(protectRoute, getStoreCategoriesNearMe);


export default router;
